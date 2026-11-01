const { execFile, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const Packager = require('./packager');
const AnimationBooster = require('./animationBooster');
const { getBrowserExecutablePath } = require('./browserFinder');

class WgetCrawler {
    constructor(options = {}) {
        this.options = {
            quota: options.quota || process.env.DOWNLOAD_QUOTA || '350m',
            timeout: options.timeout || Number(process.env.DOWNLOAD_TIMEOUT_MS) || 300000,
            userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            maxDepth: options.maxDepth || 3,
            mediaFilter: options.mediaFilter || 'all',
            customHeaders: options.customHeaders || '',
            ...options
        };
    }

    static isAvailable() {
        try {
            execSync('where.exe wget', { stdio: 'ignore' });
            return true;
        } catch {
            try {
                execSync('wget --version', { stdio: 'ignore' });
                return true;
            } catch {
                return false;
            }
        }
    }

    /**
     * Resolves canonical URL following any 301/302/307/308 redirects
     */
    async _resolveCanonicalUrl(inputUrl) {
        try {
            const res = await axios.get(inputUrl, {
                maxRedirects: 5,
                timeout: 8000,
                headers: { 'User-Agent': this.options.userAgent }
            });
            if (res.request && res.request.res && res.request.res.responseUrl) {
                return res.request.res.responseUrl;
            }
        } catch {}
        return inputUrl;
    }

    /**
     * Main crawl method using Wget Turbo Mirror
     */
    async cloneWebsite(targetUrl, outputDir, zipPath, onProgress = () => {}) {
        const emit = (stage, message, data = {}) => {
            onProgress({ timestamp: new Date().toISOString(), stage, message, ...data });
        };

        emit('init', `Analyzing target and resolving redirects for ${targetUrl}...`);

        const canonicalUrl = await this._resolveCanonicalUrl(targetUrl);
        const targetObj = new URL(canonicalUrl);
        const host = targetObj.hostname.toLowerCase();
        const baseDomain = host.replace(/^www\./i, '');
        const domains = `${baseDomain},www.${baseDomain}`;

        emit('init', `Target resolved to canonical: ${canonicalUrl} (Domains: ${domains})`);

        const tempJobDir = path.join(path.dirname(outputDir), `wget_job_${Date.now()}`);
        fs.mkdirSync(tempJobDir, { recursive: true });
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const wgetArgs = [
            '-mkEpnp',
            '-H',
            `-D${domains}`,
            '--no-if-modified-since',
            '--no-check-certificate',
            '-e', 'robots=off',
            '-l', String(this.options.maxDepth || 3),
            '-U', this.options.userAgent
        ];

        // Storage Quota Limit
        if (this.options.quota && this.options.quota !== '0' && this.options.quota !== 'unlimited') {
            wgetArgs.push(`--quota=${this.options.quota}`);
        }

        // Media Asset Filter
        if (this.options.mediaFilter === 'web-only') {
            wgetArgs.push('-R', 'mp4,webm,ogg,avi,mov,mkv,mp3,wav,flac,m4a');
        } else if (this.options.mediaFilter === 'lean') {
            wgetArgs.push('-R', 'mp4,webm,ogg,avi,mov,mkv,mp3,wav,flac,m4a,png,jpg,jpeg,webp,gif,avif');
        }

        // Custom Auth Cookie / Headers
        if (this.options.customHeaders && this.options.customHeaders.trim()) {
            wgetArgs.push(`--header=${this.options.customHeaders.trim()}`);
        }

        wgetArgs.push(canonicalUrl);

        emit('network', `Starting Wget Turbo Engine: wget ${wgetArgs.slice(0, 3).join(' ')} ...`);

        let filesCount = 0;
        let lastLogged = Date.now();
        const stats = {
            html: 0,
            css: 0,
            js: 0,
            images: 0,
            fonts: 0,
            media: 0,
            totalFiles: 0
        };

        await new Promise((resolve, reject) => {
            const child = execFile('wget', wgetArgs, {
                cwd: tempJobDir,
                maxBuffer: 64 * 1024 * 1024
            });

            child.stderr.on('data', (chunk) => {
                const text = chunk.toString();
                const lines = text.split('\n').filter(Boolean);
                for (const line of lines) {
                    const l = line.trim();
                    if (l.includes('200 OK') || l.includes('Saving to:')) {
                        filesCount++;
                        stats.totalFiles++;
                        if (/\.(png|jpe?g|gif|webp|svg|ico)/i.test(l)) stats.images++;
                        else if (/\.css/i.test(l)) stats.css++;
                        else if (/\.js/i.test(l)) stats.js++;
                        else if (/\.(woff2?|ttf|otf)/i.test(l)) stats.fonts++;
                        else if (/\.html?/i.test(l)) stats.html++;

                        if (Date.now() - lastLogged > 250) {
                            lastLogged = Date.now();
                            emit('crawling', `Downloaded [${filesCount} files]: ${path.basename(l.split("'")[1] || l)}`, {
                                filesCount,
                                stats: { ...stats }
                            });
                        }
                    } else if (l.includes('Converting links')) {
                        emit('processing', `Converting relative navigation links: ${path.basename(l)}`);
                    }
                }
            });

            child.on('error', (err) => {
                reject(new Error(`Wget error: ${err.message}`));
            });

            child.on('close', (code) => {
                resolve(code);
            });
        });

        emit('processing', `Wget mirror complete (${filesCount} assets). Flattening folder hierarchy...`);

        // Find the downloaded site directory
        const entries = fs.readdirSync(tempJobDir);
        let foundSite = false;

        for (const entry of entries) {
            const fullEntry = path.join(tempJobDir, entry);
            if (fs.statSync(fullEntry).isDirectory() && (entry.includes(baseDomain) || entry === host)) {
                this._copyDirRecursive(fullEntry, outputDir);
                foundSite = true;
            }
        }

        if (!foundSite) {
            this._copyDirRecursive(tempJobDir, outputDir);
        }

        // Clean up temp job directory
        try { fs.rmSync(tempJobDir, { recursive: true, force: true }); } catch {}

        // Ensure index.html exists at outputDir root
        const rootIndex = path.join(outputDir, 'index.html');
        if (!fs.existsSync(rootIndex)) {
            const foundIndex = this._findFile(outputDir, 'index.html');
            if (foundIndex) {
                fs.copyFileSync(foundIndex, rootIndex);
            }
        }

        // Extract Title from index.html
        let siteTitle = `Clone of ${targetObj.hostname}`;
        if (fs.existsSync(rootIndex)) {
            try {
                const $ = cheerio.load(fs.readFileSync(rootIndex, 'utf8'));
                const t = $('title').text().trim();
                if (t && !t.includes('404')) siteTitle = t;
            } catch {}
        }

        // 1. Neutralize SPA hydration engines & sanitize scripts
        emit('processing', 'Shielding HTML pages & scripts against client-side SPA crashes...');
        const pagesPatched = this._patchHtmlFiles(outputDir, baseDomain);
        this._sanitizeJsFiles(outputDir);

        // 2. Deep Animation Booster pass (AOS, GSAP ScrollTrigger, Lenis, IntersectionObserver, keyframes)
        emit('processing', 'Boosting deep scroll animations, keyframes, and intersection observers...');
        AnimationBooster.boostDirectory(outputDir);

        // 3. Headless Chrome dynamic animation pre-warming pass
        const browserExe = getBrowserExecutablePath();
        if (browserExe) {
            emit('rendering', 'Pre-warming dynamic animation keyframes with Headless Chrome...');
            try {
                await AnimationBooster.prewarmWithChrome(outputDir, browserExe, (msg) => emit('rendering', msg));
            } catch (err) {
                console.warn('[WgetCrawler] Pre-warming warning:', err.message);
            }
        }

        // 4. Inject 1-click launchers & clean URL server.js
        emit('launchers', 'Generating 1-click launch scripts (run.bat, run.sh, server.js)...');
        Packager.injectLaunchers(outputDir, {
            title: siteTitle,
            url: targetUrl,
            pagesCount: pagesPatched
        });

        // 5. Package into ZIP
        emit('zipping', 'Packaging all assets into ZIP archive...');
        const zipResult = await Packager.createZip(outputDir, zipPath);

        emit('complete', `Website clone completed with 100% fidelity! (${pagesPatched} pages, ${(zipResult.totalBytes / (1024 * 1024)).toFixed(2)} MB)`, {
            title: siteTitle,
            url: targetUrl,
            pagesCount: pagesPatched,
            zipPath,
            zipSize: zipResult.totalBytes,
            stats: {
                ...stats,
                totalBytes: zipResult.totalBytes,
                totalAssets: filesCount
            }
        });

        return {
            title: siteTitle,
            url: targetUrl,
            pagesCount: pagesPatched,
            outputDir,
            zipPath,
            zipSize: zipResult.totalBytes,
            stats: {
                ...stats,
                totalBytes: zipResult.totalBytes,
                totalAssets: filesCount
            }
        };
    }

    _copyDirRecursive(src, dest) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        const list = fs.readdirSync(src, { withFileTypes: true });
        for (const item of list) {
            const srcPath = path.join(src, item.name);
            const destPath = path.join(dest, item.name);
            if (item.isDirectory()) {
                this._copyDirRecursive(srcPath, destPath);
            } else if (item.isFile()) {
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    _findFile(dir, filename) {
        const list = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of list) {
            const p = path.join(dir, item.name);
            if (item.isFile() && item.name === filename) return p;
            if (item.isDirectory()) {
                const found = this._findFile(p, filename);
                if (found) return found;
            }
        }
        return null;
    }

    _sanitizeJsFiles(dir) {
        const list = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of list) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory() && item.name !== 'node_modules') {
                this._sanitizeJsFiles(fullPath);
            } else if (item.isFile() && item.name.endsWith('.js')) {
                try {
                    let content = fs.readFileSync(fullPath, 'utf8');
                    let modified = false;
                    if (content.includes('Application error: a client-side exception has occurred')) {
                        content = content.replace(/Application error: a client-side exception has occurred \(see the browser console for more information\)\./g, '');
                        content = content.replace(/Application error: a client-side exception has occurred/g, '');
                        modified = true;
                    }
                    if (modified) {
                        fs.writeFileSync(fullPath, content, 'utf8');
                    }
                } catch {}
            }
        }
    }

    _patchHtmlFiles(dir, baseDomain) {
        let count = 0;
        const list = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of list) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory() && item.name !== 'node_modules') {
                count += this._patchHtmlFiles(fullPath, baseDomain);
            } else if (item.isFile() && item.name.endsWith('.html')) {
                count++;
                try {
                    let html = fs.readFileSync(fullPath, 'utf8');

                    // If wget left references to peer host directory (e.g. ../www.domain/ or /www.domain/)
                    if (baseDomain) {
                        const regex = new RegExp(`(["'])(?:\\.\\.\\/|\\/)?(?:www\\.)?${baseDomain.replace(/\./g, '\\.')}\\/`, 'gi');
                        html = html.replace(regex, '$1./');
                    }

                    const $ = cheerio.load(html, { decodeEntities: false });

                    // Remove Next.js / React flight data & SPA hydration scripts that wipe DOM offline
                    $('script').each((_, el) => {
                        const src = ($(el).attr('src') || '').toLowerCase();
                        const text = ($(el).html() || '').toLowerCase();
                        if (
                            src.includes('main-app') ||
                            src.includes('webpack-') ||
                            src.includes('polyfills-') ||
                            src.includes('turbopack-') ||
                            src.includes('/_next/static/chunks/main') ||
                            src.includes('/_next/static/chunks/app') ||
                            src.includes('/_next/static/chunks/pages') ||
                            src.includes('/_next/static/chunks/react-') ||
                            text.includes('__next_f') ||
                            text.includes('webpackchunk_n_e') ||
                            text.includes('__next_data__') ||
                            text.includes('window.__nuxt')
                        ) {
                            $(el).remove();
                        }
                    });

                    // Remove Content Security Policy that can block local scripts/styles
                    $('meta[http-equiv="Content-Security-Policy"]').remove();
                    $('meta[http-equiv="content-security-policy"]').remove();

                    fs.writeFileSync(fullPath, $.html(), 'utf8');
                } catch {}
            }
        }
        return count;
    }
}

module.exports = WgetCrawler;
