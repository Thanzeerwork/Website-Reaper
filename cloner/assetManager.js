const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const mime = require('mime-types');

class AssetManager {
    constructor(outputDir, baseUrl, options = {}) {
        this.outputDir = outputDir;
        this.baseUrl = baseUrl;
        this.options = options; // { onProgress, logger, userAgent }

        // Local paths structure
        this.assetsDir = path.join(outputDir, 'assets');
        this.dirs = {
            css: path.join(this.assetsDir, 'css'),
            js: path.join(this.assetsDir, 'js'),
            images: path.join(this.assetsDir, 'images'),
            fonts: path.join(this.assetsDir, 'fonts'),
            media: path.join(this.assetsDir, 'media'),
            misc: path.join(this.assetsDir, 'misc')
        };

        // Cache of url -> local relative path
        this.downloaded = new Map();
        // In-flight download promises
        this.pending = new Map();
        // Pre-cached buffers from browser network interception (URL -> Buffer)
        this.interceptedBuffers = new Map();

        // Statistics
        this.stats = {
            css: 0,
            js: 0,
            images: 0,
            fonts: 0,
            media: 0,
            misc: 0,
            totalBytes: 0,
            totalAssets: 0
        };

        this._ensureDirectories();
    }

    _ensureDirectories() {
        for (const dir of Object.values(this.dirs)) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        }
    }

    /**
     * Store a buffer intercepted during Puppeteer page load
     */
    addInterceptedResponse(url, buffer, contentType) {
        if (!url || !buffer) return;
        this.interceptedBuffers.set(url, { buffer, contentType });
    }

    /**
     * Queue and download an asset from URL, returning relative local path (e.g. assets/images/hero.png)
     */
    async queueAssetDownload(assetUrl, meta = {}) {
        if (!assetUrl || typeof assetUrl !== 'string') return null;

        // Skip non-http(s) protocols and inline data
        if (assetUrl.startsWith('data:') || assetUrl.startsWith('blob:') || assetUrl.startsWith('javascript:')) {
            return assetUrl;
        }

        let cleanUrl;
        try {
            cleanUrl = new URL(assetUrl, meta.referrer || this.baseUrl).href;
        } catch {
            return null;
        }

        // Check if already downloaded or in-flight
        if (this.downloaded.has(cleanUrl)) {
            return this.downloaded.get(cleanUrl);
        }

        if (this.pending.has(cleanUrl)) {
            return await this.pending.get(cleanUrl);
        }

        const downloadPromise = this._downloadAsset(cleanUrl, meta);
        this.pending.set(cleanUrl, downloadPromise);

        try {
            const result = await downloadPromise;
            this.downloaded.set(cleanUrl, result);
            return result;
        } catch (err) {
            if (this.options.logger) {
                this.options.logger.warn(`Failed downloading asset: ${cleanUrl} (${err.message})`);
            }
            return null;
        } finally {
            this.pending.delete(cleanUrl);
        }
    }

    async _downloadAsset(url, meta) {
        let buffer = null;
        let contentType = null;

        // 1. Check if we already have it in intercepted browser responses
        if (this.interceptedBuffers.has(url)) {
            const cached = this.interceptedBuffers.get(url);
            buffer = cached.buffer;
            contentType = cached.contentType;
        }

        // 2. Fetch over network if not intercepted
        if (!buffer) {
            try {
                const response = await axios.get(url, {
                    responseType: 'arraybuffer',
                    timeout: 15000,
                    headers: {
                        'User-Agent': this.options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                        'Referer': meta.referrer || this.baseUrl,
                        'Accept': '*/*'
                    },
                    maxRedirects: 5,
                    validateStatus: (status) => status >= 200 && status < 400
                });

                buffer = Buffer.from(response.data);
                contentType = response.headers['content-type'];
            } catch (err) {
                // Secondary fallback attempt without referer if referer was blocked
                try {
                    const fallback = await axios.get(url, {
                        responseType: 'arraybuffer',
                        timeout: 10000,
                        headers: {
                            'User-Agent': this.options.userAgent || 'Mozilla/5.0'
                        }
                    });
                    buffer = Buffer.from(fallback.data);
                    contentType = fallback.headers['content-type'];
                } catch {
                    throw err;
                }
            }
        }

        if (!buffer || buffer.length === 0) {
            return null;
        }

        // Determine category and filename
        const category = this._categorizeAsset(url, contentType, meta.hint);
        const filename = this._generateFilename(url, contentType, category);
        const targetDir = this.dirs[category] || this.dirs.misc;
        const filePath = path.join(targetDir, filename);

        // Write to disk
        fs.writeFileSync(filePath, buffer);

        // Update stats
        this.stats[category] = (this.stats[category] || 0) + 1;
        this.stats.totalAssets++;
        this.stats.totalBytes += buffer.length;

        const relativePath = `assets/${category}/${filename}`.replace(/\\/g, '/');

        if (this.options.onProgress) {
            this.options.onProgress({
                type: 'asset_downloaded',
                category,
                url,
                filename,
                size: buffer.length,
                stats: { ...this.stats }
            });
        }

        return relativePath;
    }

    _categorizeAsset(urlStr, contentType, hint) {
        if (hint && this.dirs[hint]) return hint;

        const urlPath = urlStr.split('?')[0].split('#')[0].toLowerCase();
        const ct = (contentType || '').toLowerCase();

        if (ct.includes('text/css') || urlPath.endsWith('.css')) return 'css';
        if (ct.includes('javascript') || ct.includes('ecmascript') || urlPath.endsWith('.js') || urlPath.endsWith('.mjs')) return 'js';
        if (ct.includes('font') || /\.(woff2|woff|ttf|otf|eot)$/i.test(urlPath)) return 'fonts';
        if (ct.includes('image') || /\.(png|jpe?g|gif|svg|webp|avif|ico|bmp|tiff)$/i.test(urlPath)) return 'images';
        if (ct.includes('video') || ct.includes('audio') || /\.(mp4|webm|ogg|mp3|wav|m4a|aac)$/i.test(urlPath)) return 'media';

        return 'misc';
    }

    _generateFilename(urlStr, contentType, category) {
        try {
            const urlObj = new URL(urlStr);
            const pathname = urlObj.pathname;
            const originalName = path.basename(pathname);

            // Clean name from non-alphanumeric except dots, dashes, underscores
            let baseName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
            let ext = path.extname(baseName);

            // If no extension or suspicious, infer from content-type or category
            if (!ext || ext.length > 5) {
                if (contentType) {
                    const inferredExt = mime.extension(contentType.split(';')[0]);
                    if (inferredExt) {
                        ext = `.${inferredExt}`;
                    }
                }
                if (!ext) {
                    const extMap = {
                        css: '.css',
                        js: '.js',
                        fonts: '.woff2',
                        images: '.png',
                        media: '.mp4',
                        misc: '.bin'
                    };
                    ext = extMap[category] || '.bin';
                }
            }

            // Create a short hash of the URL to prevent collisions
            const hash = crypto.createHash('md5').update(urlStr).digest('hex').substring(0, 8);
            let nameWithoutExt = path.basename(baseName, ext).substring(0, 30) || 'asset';

            return `${nameWithoutExt}_${hash}${ext}`;
        } catch {
            const hash = crypto.createHash('md5').update(urlStr).digest('hex').substring(0, 10);
            return `file_${hash}.bin`;
        }
    }
}

module.exports = AssetManager;

