const path = require('path');
const { URL } = require('url');

/**
 * Parses CSS text, extracts referenced asset URLs (fonts, background images, imports),
 * and replaces them with relative local paths.
 */
class CssProcessor {
    constructor(assetManager) {
        this.assetManager = assetManager;
    }

    /**
     * Process CSS string and rewrite all url(...) and @import references
     * @param {string} cssContent - Raw CSS text
     * @param {string} cssUrl - The URL from which this CSS was loaded
     * @param {string} relativeToDir - Directory relative to which paths should be generated (e.g. 'assets/css')
     * @returns {Promise<string>} - Processed CSS with local relative paths
     */
    async processCss(cssContent, cssUrl, relativeToDir = 'assets/css') {
        if (!cssContent || typeof cssContent !== 'string') return '';

        // Regex for url(...) declarations: handles url('...'), url("..."), and url(...)
        const urlRegex = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;
        // Regex for @import "..." or @import '...' (not inside url())
        const importRegex = /@import\s+(['"])(.*?)\1/gi;

        let processedCss = cssContent;
        const matches = [];

        // Collect all url(...) targets
        let match;
        while ((match = urlRegex.exec(cssContent)) !== null) {
            const rawUrl = match[2].trim();
            if (rawUrl && !rawUrl.startsWith('data:') && !rawUrl.startsWith('#')) {
                matches.push({
                    fullMatch: match[0],
                    rawUrl: rawUrl,
                    quote: match[1] || ''
                });
            }
        }

        // Collect all @import targets
        while ((match = importRegex.exec(cssContent)) !== null) {
            const rawUrl = match[2].trim();
            if (rawUrl && !rawUrl.startsWith('data:') && !rawUrl.startsWith('url(')) {
                matches.push({
                    fullMatch: match[0],
                    rawUrl: rawUrl,
                    quote: match[1] || '"',
                    isImport: true
                });
            }
        }

        // Process all matches
        for (const item of matches) {
            try {
                // Resolve absolute URL
                const absoluteUrl = new URL(item.rawUrl, cssUrl).href;

                // Download asset via assetManager
                const localRelativePath = await this.assetManager.queueAssetDownload(absoluteUrl, {
                    referrer: cssUrl,
                    hint: this._guessHint(item.rawUrl)
                });

                if (localRelativePath) {
                    // Calculate path from relativeToDir to localRelativePath
                    // e.g. from 'assets/css' to 'assets/fonts/inter.woff2' => '../fonts/inter.woff2'
                    const relativePath = path.relative(relativeToDir, localRelativePath).replace(/\\/g, '/');

                    if (item.isImport) {
                        const replacement = `@import ${item.quote}${relativePath}${item.quote}`;
                        processedCss = processedCss.split(item.fullMatch).join(replacement);
                    } else {
                        const replacement = `url(${item.quote}${relativePath}${item.quote})`;
                        processedCss = processedCss.split(item.fullMatch).join(replacement);
                    }
                }
            } catch (err) {
                // Keep original if invalid URL or resolution fails
            }
        }

        return processedCss;
    }

    _guessHint(urlStr) {
        const clean = urlStr.split('?')[0].split('#')[0].toLowerCase();
        if (/\.(woff2|woff|ttf|otf|eot)$/i.test(clean)) return 'font';
        if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/i.test(clean)) return 'image';
        if (/\.css$/i.test(clean)) return 'css';
        return 'unknown';
    }
}

module.exports = CssProcessor;

