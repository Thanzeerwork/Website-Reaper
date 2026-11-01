const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { URL } = require('url');

class HtmlProcessor {
    constructor(assetManager, cssProcessor, baseUrl, options = {}) {
        this.assetManager = assetManager;
        this.cssProcessor = cssProcessor;
        this.baseUrl = baseUrl;
        this.options = options;
        this.currentLocalPath = options.currentLocalPath || 'index.html';
        this.urlToLocalPathMap = options.urlToLocalPathMap || new Map();
    }

    _getRelativePath(targetPath) {
        if (!targetPath) return '';
        const fromDir = path.dirname(this.currentLocalPath);
        let rel = path.relative(fromDir, targetPath).replace(/\\/g, '/');
        if (!rel.startsWith('.') && !rel.startsWith('/')) {
            rel = './' + rel;
        }
        return rel;
    }

    /**
     * Process HTML string, download and localize all assets & cross-page links
     */
    async processHtml(rawHtml) {
        const $ = cheerio.load(rawHtml, { decodeEntities: false });

        // 1. Remove or neutralize <base> tag to avoid breaking relative paths
        $('base').remove();

        // 2. Remove Content-Security-Policy (CSP) meta tags that might block local file execution
        $('meta[http-equiv="Content-Security-Policy"]').remove();
        $('meta[http-equiv="content-security-policy"]').remove();

        // 3. Process <link rel="stylesheet">
        const styleLinks = $('link[rel*="stylesheet"], link[as="style"]').toArray();
        for (const el of styleLinks) {
            const href = $(el).attr('href');
            if (href) {
                try {
                    const absUrl = new URL(href, this.baseUrl).href;
                    // First download raw CSS asset
                    const localPath = await this.assetManager.queueAssetDownload(absUrl, {
                        referrer: this.baseUrl,
                        hint: 'css'
                    });

                    if (localPath) {
                        // Read downloaded CSS, process its internal url(...) and @import references
                        const fullCssPath = path.join(this.assetManager.outputDir, localPath);
                        if (fs.existsSync(fullCssPath)) {
                            const rawCss = fs.readFileSync(fullCssPath, 'utf8');
                            const processedCss = await this.cssProcessor.processCss(rawCss, absUrl, 'assets/css');
                            fs.writeFileSync(fullCssPath, processedCss, 'utf8');
                        }

                        $(el).attr('href', this._getRelativePath(localPath));
                        $(el).removeAttr('integrity');
                        $(el).removeAttr('crossorigin');
                    }
                } catch {
                    // Ignore errors
                }
            }
        }

        // 4. Process all <link> icons, fonts, preloaded images, videos, and modulepreloads
        const otherLinks = $('link[rel*="icon"], link[rel*="apple-touch-icon"], link[rel*="preload"], link[rel="modulepreload"]').toArray();
        for (const el of otherLinks) {
            const href = $(el).attr('href');
            const asType = ($(el).attr('as') || '').toLowerCase();
            const rel = ($(el).attr('rel') || '').toLowerCase();

            // Skip hydration scripts that we will neutralize anyway
            if (asType === 'script' || rel === 'modulepreload') {
                if (href && (href.includes('main-app') || href.includes('webpack-') || href.includes('turbopack-'))) {
                    $(el).remove();
                    continue;
                }
            }

            if (href) {
                try {
                    const absUrl = new URL(href, this.baseUrl).href;
                    let hint = 'misc';
                    if (asType === 'font' || /\.(woff2?|ttf|otf|eot)/i.test(href)) hint = 'fonts';
                    else if (asType === 'image' || rel.includes('icon') || /\.(png|jpe?g|gif|svg|webp|avif|ico)/i.test(href)) hint = 'images';
                    else if (asType === 'script' || rel === 'modulepreload' || /\.m?js/i.test(href)) hint = 'js';
                    else if (asType === 'video' || asType === 'audio') hint = 'media';
                    else if (asType === 'style' || /\.css/i.test(href)) hint = 'css';

                    const localPath = await this.assetManager.queueAssetDownload(absUrl, {
                        referrer: this.baseUrl,
                        hint
                    });
                    if (localPath) {
                        $(el).attr('href', this._getRelativePath(localPath));
                        $(el).removeAttr('integrity');
                    }
                } catch {}
            }

            // Handle imagesrcset on preloaded responsive images
            const imagesrcset = $(el).attr('imagesrcset');
            if (imagesrcset) {
                try {
                    const newImagesrcset = await this._processSrcset(imagesrcset);
                    if (newImagesrcset) $(el).attr('imagesrcset', newImagesrcset);
                } catch {}
            }
        }

        // 5. Process inline <style> tags
        const inlineStyles = $('style').toArray();
        const fromDir = path.dirname(this.currentLocalPath);
        for (const el of inlineStyles) {
            const styleText = $(el).html();
            if (styleText) {
                try {
                    const processed = await this.cssProcessor.processCss(styleText, this.baseUrl, fromDir);
                    $(el).html(processed);
                } catch {}
            }
        }

        // 6. Process style="..." attributes on all elements
        const elementsWithStyle = $('[style]').toArray();
        for (const el of elementsWithStyle) {
            const styleAttr = $(el).attr('style');
            if (styleAttr && styleAttr.includes('url(')) {
                try {
                    const processed = await this.cssProcessor.processCss(styleAttr, this.baseUrl, fromDir);
                    $(el).attr('style', processed);
                } catch {}
            }
        }

        // 7. Process <img> tags (src & srcset)
        const images = $('img').toArray();
        for (const el of images) {
            const src = $(el).attr('src');
            if (src) {
                const localPath = await this._processUrl(src, 'images');
                if (localPath) $(el).attr('src', localPath);
            }

            // Handle lazy-loaded attributes (data-src, data-original, data-lazy-src)
            const dataSrc = $(el).attr('data-src') || $(el).attr('data-original') || $(el).attr('data-lazy-src');
            if (dataSrc) {
                const localPath = await this._processUrl(dataSrc, 'images');
                if (localPath) {
                    if (!src || src.startsWith('data:')) {
                        $(el).attr('src', localPath);
                    }
                    $(el).attr('data-src', localPath);
                }
            }

            const srcset = $(el).attr('srcset');
            if (srcset) {
                const newSrcset = await this._processSrcset(srcset);
                if (newSrcset) $(el).attr('srcset', newSrcset);
            }
        }

        // 8. Process <picture> <source> tags
        const sources = $('source').toArray();
        for (const el of sources) {
            const src = $(el).attr('src');
            if (src) {
                const localPath = await this._processUrl(src, 'images');
                if (localPath) $(el).attr('src', localPath);
            }
            const srcset = $(el).attr('srcset');
            if (srcset) {
                const newSrcset = await this._processSrcset(srcset);
                if (newSrcset) $(el).attr('srcset', newSrcset);
            }
        }

        // 9. Process <video> & <audio>
        const mediaElements = $('video, audio').toArray();
        for (const el of mediaElements) {
            const src = $(el).attr('src');
            if (src) {
                const localPath = await this._processUrl(src, 'media');
                if (localPath) $(el).attr('src', localPath);
            }
            const poster = $(el).attr('poster');
            if (poster) {
                const localPoster = await this._processUrl(poster, 'images');
                if (localPoster) $(el).attr('poster', localPoster);
            }
        }

        // 10. Process <script> tags: neutralise SPA framework hydration engines that cause client-side crash
        $('script').each((_, el) => {
            const src = $(el).attr('src') || '';
            const text = $(el).html() || '';

            // Check for trackers or framework hydration engines that crash offline (Next.js, Nuxt, Remix)
            if (this._isTracker(src) || this._isFrameworkHydration(src, text)) {
                $(el).remove();
            }
        });

        // 10b. Clean up obsolete framework script preload tags
        $('link[rel="preload"]').each((_, el) => {
            const href = $(el).attr('href') || '';
            const asType = ($(el).attr('as') || '').toLowerCase();
            if (asType === 'script' && (href.includes('/_next/') || href.includes('main-app') || href.includes('webpack-') || href.includes('turbopack-'))) {
                $(el).remove();
            }
        });

        // 10c. Process remaining valid <script src="...">
        const scripts = $('script[src]').toArray();
        for (const el of scripts) {
            const src = $(el).attr('src');
            if (src) {
                const localPath = await this._processUrl(src, 'js');
                if (localPath) {
                    $(el).attr('src', localPath);
                    $(el).removeAttr('integrity');
                    $(el).removeAttr('crossorigin');
                }
            }
        }

        // 11. Process SVG <image> tags
        const svgImages = $('image').toArray();
        for (const el of svgImages) {
            const href = $(el).attr('href') || $(el).attr('xlink:href');
            if (href) {
                const localPath = await this._processUrl(href, 'images');
                if (localPath) {
                    $(el).attr('href', localPath);
                    if ($(el).attr('xlink:href')) $(el).attr('xlink:href', localPath);
                }
            }
        }

        // 12. Fix navigation links: rewrite internal links to other cloned pages, external links open in new tab
        $('a[href]').each((_, el) => {
            const rawHref = $(el).attr('href');
            if (!rawHref || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
                return;
            }

            if (rawHref.startsWith('#')) {
                // Keep in-page anchor intact
                return;
            }

            try {
                const targetUrlObj = new URL(rawHref, this.baseUrl);
                const hash = targetUrlObj.hash || '';

                const baseHost = new URL(this.baseUrl).hostname.toLowerCase().replace(/^www\./, '');
                const linkHost = targetUrlObj.hostname.toLowerCase().replace(/^www\./, '');

                // Check if target link is on the same website/domain (handles both www and non-www)
                if (linkHost === baseHost) {
                    let cleanPath = targetUrlObj.pathname.replace(/\/+$/, '') || '/';
                    const canonicalUrl = `${targetUrlObj.protocol}//${linkHost}${cleanPath}`;

                    // 1. Check if target is explicitly in our multi-page clone map
                    let matchedLocal = null;
                    if (this.urlToLocalPathMap) {
                        matchedLocal = this.urlToLocalPathMap.get(canonicalUrl) ||
                                       this.urlToLocalPathMap.get(canonicalUrl + '/') ||
                                       this.urlToLocalPathMap.get(targetUrlObj.href) ||
                                       this.urlToLocalPathMap.get(`${targetUrlObj.protocol}//www.${linkHost}${cleanPath}`);
                    }

                    // 2. If not found in map, infer local path: e.g. /about -> about.html
                    if (!matchedLocal) {
                        if (cleanPath === '/' || cleanPath === '') {
                            matchedLocal = 'index.html';
                        } else {
                            const trimmedPath = cleanPath.replace(/^\/+|\/+$/g, '');
                            const segments = trimmedPath.split('/').map(s => s.replace(/[^a-zA-Z0-9._-]/g, '_'));
                            matchedLocal = segments.join('/') + '.html';
                        }
                    }

                    const relLink = this._getRelativePath(matchedLocal) + hash;
                    $(el).attr('href', relLink);
                    $(el).removeAttr('target');
                    $(el).removeAttr('rel');
                } else {
                    // Truly external link (e.g. social media, external vendor)
                    $(el).attr('target', '_blank');
                    $(el).attr('rel', 'noopener noreferrer');
                }
            } catch {}
        });

        // 13. Inject Offline Runtime Compatibility & Animation Helper into <head>
        const runtimeHelperScript = `
<script>
/**
 * Website Reaper Runtime Compatibility Layer
 * Ensures seamless local execution of multi-page navigation, animations, font-rendering, and avoids broken analytics/hydration errors.
 */
(function() {
    window.__WEBSITE_REAPER__ = {
        clonedAt: "${new Date().toISOString()}",
        originalUrl: "${this.baseUrl}",
        page: "${this.currentLocalPath}"
    };

    // 1. Intercept innerHTML replacement to prevent SPA ErrorBoundaries from wiping the rendered DOM
    try {
        const originalSetInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;
        Object.defineProperty(Element.prototype, 'innerHTML', {
            set: function(val) {
                if (typeof val === 'string' && val.includes('Application error: a client-side exception')) {
                    console.warn('[Website Reaper] Blocked SPA ErrorBoundary from wiping the rendered page.');
                    return;
                }
                return originalSetInnerHTML.call(this, val);
            }
        });
    } catch(e) {}

    // 2. Global error suppressors to prevent script crashes
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('ResizeObserver')) return;
        console.warn('[Website Reaper] Suppressed client error:', e.message);
        e.preventDefault();
        e.stopPropagation();
        return true;
    }, true);

    window.addEventListener('unhandledrejection', function(e) {
        console.warn('[Website Reaper] Suppressed rejection:', e.reason);
        e.preventDefault();
        e.stopPropagation();
    });

    // 3. Prevent uncaught errors from broken analytics or external API fetches
    const originalFetch = window.fetch;
    if (originalFetch) {
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).catch(err => {
                console.warn('[Website Reaper] Mocking local fetch for:', args[0]);
                return new Response(JSON.stringify({ status: 'ok', mocked: true }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            });
        };
    }

    // 4. Trigger animations and reveal lazy elements
    document.addEventListener('DOMContentLoaded', function() {
        function triggerAnimations() {
            window.dispatchEvent(new Event('resize'));
            window.dispatchEvent(new Event('scroll'));
            if (window.AOS && typeof window.AOS.init === 'function') {
                try { window.AOS.init({ once: true }); } catch(e) {}
            }
            if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
                try { window.ScrollTrigger.refresh(); } catch(e) {}
            }
        }
        setTimeout(triggerAnimations, 100);
        setTimeout(triggerAnimations, 500);
        setTimeout(triggerAnimations, 1500);

        // Ensure elements with opacity:0 that were waiting for animation classes are revealed
        setTimeout(function() {
            document.querySelectorAll('[data-aos], .animate-on-scroll, .scroll-trigger').forEach(function(el) {
                el.classList.add('aos-animate', 'is-visible', 'animated');
            });
        }, 1000);
    });
})();
</script>
`;
        if ($('head').length) {
            $('head').prepend(runtimeHelperScript);
        } else {
            $.root().prepend(runtimeHelperScript);
        }

        return $.html();
    }

    async _processUrl(urlStr, categoryHint) {
        if (!urlStr) return null;
        try {
            const absUrl = new URL(urlStr, this.baseUrl).href;
            const localPath = await this.assetManager.queueAssetDownload(absUrl, {
                referrer: this.baseUrl,
                hint: categoryHint
            });
            if (!localPath) return null;
            return this._getRelativePath(localPath);
        } catch {
            return null;
        }
    }

    async _processSrcset(srcsetStr) {
        if (!srcsetStr || typeof srcsetStr !== 'string') return null;

        const parts = srcsetStr.split(',').map(s => s.trim()).filter(Boolean);
        const resolvedParts = [];

        for (const part of parts) {
            const tokens = part.split(/\s+/);
            const urlToken = tokens[0];
            const descriptor = tokens.slice(1).join(' ');

            if (urlToken) {
                const localRelPath = await this._processUrl(urlToken, 'images');
                if (localRelPath) {
                    resolvedParts.push(`${localRelPath} ${descriptor}`.trim());
                } else {
                    resolvedParts.push(part);
                }
            }
        }

        return resolvedParts.join(', ');
    }

    _isTracker(urlStr) {
        const u = urlStr.toLowerCase();
        return (
            u.includes('google-analytics.com') ||
            u.includes('googletagmanager.com/gtm.js') ||
            u.includes('analytics.js') ||
            u.includes('hotjar.com') ||
            u.includes('clarity.ms') ||
            u.includes('facebook.net/en_us/fbevents.js') ||
            u.includes('segment.com/analytics.js')
        );
    }

    _isFrameworkHydration(src, text) {
        const s = (src || '').toLowerCase();
        const t = (text || '').toLowerCase();

        // Next.js chunks that attempt React hydration on client
        if (
            s.includes('main-app') ||
            s.includes('webpack-') ||
            s.includes('polyfills-') ||
            s.includes('/_next/static/chunks/main') ||
            s.includes('/_next/static/chunks/app') ||
            s.includes('/_next/static/chunks/framework')
        ) {
            return true;
        }

        // Inline framework state & RSC hydration streams
        if (
            t.includes('__next_f') ||
            t.includes('webpackchunk_n_e') ||
            t.includes('__next_data__') ||
            t.includes('self.__next') ||
            t.includes('window.__nuxt') ||
            t.includes('window.__remixcontext')
        ) {
            return true;
        }

        return false;
    }
}

module.exports = HtmlProcessor;
