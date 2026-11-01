const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { getBrowserExecutablePath } = require('./browserFinder');
const AssetManager = require('./assetManager');
const CssProcessor = require('./cssProcessor');
const HtmlProcessor = require('./htmlProcessor');
const Packager = require('./packager');
const AnimationBooster = require('./animationBooster');

class ClonerEngine {
    constructor(options = {}) {
        this.options = {
            viewportWidth: options.viewportWidth || 1920,
            viewportHeight: options.viewportHeight || 1080,
            scrollDelay: options.scrollDelay || 120,
            postLoadDelay: options.postLoadDelay || 2500,
            deepScroll: options.deepScroll !== false,
            deepCrawl: options.deepCrawl !== false,
            maxPages: options.maxPages || 20,
            maxDepth: options.maxDepth || 3,
            timeout: options.timeout || 45000,
            userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            ...options
        };
    }

    /**
     * Normalize URL for canonical deduplication (strips hashes, tracking params, trailing slashes)
     */
    _normalizeUrl(rawUrl, baseUrl) {
        try {
            const u = new URL(rawUrl, baseUrl);
            if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;

            // Strip tracking query parameters
            const paramsToStrip = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref'];
            paramsToStrip.forEach(p => u.searchParams.delete(p));

            let pathname = u.pathname.replace(/\/+$/, '') || '/';
            u.pathname = pathname;
            u.hash = '';

            // Normalize www prefix to prevent www vs non-www mismatches
            u.hostname = u.hostname.toLowerCase().replace(/^www\./, '');

            return u.href;
        } catch {
            return null;
        }
    }

    /**
     * Maps an absolute URL to a clean local file path (e.g. index.html, about-us.html, blog/post.html)
     */
    _urlToLocalPath(urlString, rootUrl) {
        try {
            const u = new URL(urlString);
            let pathname = u.pathname;

            if (!pathname || pathname === '/' || pathname === '/index' || pathname === '/index.html') {
                return 'index.html';
            }

            // Strip leading/trailing slashes
            pathname = pathname.replace(/^\/+|\/+$/g, '');
            if (!pathname) return 'index.html';

            if (/\.html?$/i.test(pathname)) {
                return pathname;
            }

            // Don't treat files like .pdf as html
            if (/\.[a-zA-Z0-9]{2,5}$/.test(pathname)) {
                return pathname;
            }

            // Clean segments
            const segments = pathname.split('/').map(s => s.replace(/[^a-zA-Z0-9._-]/g, '_'));
            return segments.join('/') + '.html';
        } catch {
            return 'page_' + Math.random().toString(36).substring(2, 8) + '.html';
        }
    }

    /**
     * Deep Multi-Page Website Cloning
     */
    async cloneWebsite(targetUrl, outputDir, zipPath, onProgress = () => {}) {
        const emit = (stage, message, data = {}) => {
            onProgress({
                timestamp: new Date().toISOString(),
                stage,
                message,
                ...data
            });
        };

        const targetUrlObj = new URL(targetUrl);
        const rootHostname = targetUrlObj.hostname.toLowerCase().replace(/^www\./, '');
        const normalizedStartUrl = this._normalizeUrl(targetUrl);

        emit('init', `Initializing Deep Cloner for ${targetUrl} (Max Pages: ${this.options.maxPages})...`);

        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
        const zipDir = path.dirname(zipPath);
        if (!fs.existsSync(zipDir)) fs.mkdirSync(zipDir, { recursive: true });

        const executablePath = getBrowserExecutablePath();
        emit('browser', `Launching browser engine (${path.basename(executablePath)})...`);

        let browser = null;
        try {
            browser = await puppeteer.launch({
                executablePath,
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-web-security',
                    '--disable-gpu',
                    '--disable-features=IsolateOrigins,site-per-process',
                    '--allow-running-insecure-content',
                    '--disable-blink-features=AutomationControlled',
                    `--window-size=${this.options.viewportWidth},${this.options.viewportHeight}`
                ]
            });

            const page = await browser.newPage();
            await page.setViewport({
                width: this.options.viewportWidth,
                height: this.options.viewportHeight,
                deviceScaleFactor: 1
            });
            await page.setUserAgent(this.options.userAgent);

            // Centralized asset manager shared across all crawled pages
            const assetManager = new AssetManager(outputDir, targetUrl, {
                userAgent: this.options.userAgent,
                onProgress: (p) => {
                    emit('asset', `Downloaded ${p.category}: ${p.filename} (${(p.size / 1024).toFixed(1)} KB)`, {
                        stats: p.stats
                    });
                }
            });

            // Dynamic browser response caching
            page.on('response', async (response) => {
                try {
                    const status = response.status();
                    if (status >= 200 && status < 300) {
                        const ct = (response.headers()['content-type'] || '').toLowerCase();
                        const url = response.url();
                        if (
                            ct.includes('text/css') ||
                            ct.includes('javascript') ||
                            ct.includes('font') ||
                            ct.includes('image') ||
                            /\.(woff2|woff|ttf|otf|eot|css|js|png|jpe?g|svg|webp|avif|ico)$/i.test(url)
                        ) {
                            const buffer = await response.buffer();
                            assetManager.addInterceptedResponse(url, buffer, ct);
                        }
                    }
                } catch {}
            });

            // Crawl queue setup
            const queue = [{ url: normalizedStartUrl, depth: 0 }];
            const visited = new Set();
            const urlToPathMap = new Map();
            
            // Support both with and without www prefix for start page
            const nonWwwStart = targetUrl.replace(/^(https?:\/\/)www\./i, '$1');
            const wwwStart = targetUrl.replace(/^(https?:\/\/)(?!www\.)/i, '$1www.');

            [
                targetUrl,
                normalizedStartUrl,
                normalizedStartUrl + '/',
                nonWwwStart,
                nonWwwStart + '/',
                nonWwwStart + '/index',
                nonWwwStart + '/index.html',
                wwwStart,
                wwwStart + '/',
                wwwStart + '/index',
                wwwStart + '/index.html'
            ].forEach(u => {
                try {
                    urlToPathMap.set(u, 'index.html');
                    const obj = new URL(u);
                    urlToPathMap.set(obj.origin, 'index.html');
                    urlToPathMap.set(obj.origin + '/', 'index.html');
                } catch {}
            });

            const capturedPages = []; // [{ url, rawHtml, localPath, title }]
            let mainTitle = '';

            emit('network', 'Starting deep crawl & animation hydration...');

            // Crawl Loop
            while (queue.length > 0 && visited.size < this.options.maxPages) {
                const current = queue.shift();
                if (visited.has(current.url)) continue;
                visited.add(current.url);

                let currentLocalPath = urlToPathMap.get(current.url) || this._urlToLocalPath(current.url, targetUrl);
                
                // If index.html has already been captured, any subsequent URL that resolves to index.html must be skipped
                if (currentLocalPath === 'index.html' && capturedPages.some(p => p.localPath === 'index.html')) {
                    continue;
                }

                urlToPathMap.set(current.url, currentLocalPath);

                emit('crawling', `Crawling page (${visited.size}/${Math.min(visited.size + queue.length, this.options.maxPages)}): ${current.url}`, {
                    pageUrl: current.url,
                    localPath: currentLocalPath,
                    pagesCrawled: visited.size
                });

                let pageResponse = null;
                try {
                    pageResponse = await page.goto(current.url, {
                        waitUntil: 'domcontentloaded',
                        timeout: 15000
                    });
                    // Brief settling wait for dynamic scripts
                    await new Promise(r => setTimeout(r, 1200));
                } catch (navErr) {
                    emit('warning', `Proceeding with available DOM on ${current.url}: ${navErr.message}`);
                }

                // Check HTTP status code
                const httpStatus = pageResponse ? pageResponse.status() : 200;
                if (httpStatus >= 400) {
                    emit('warning', `Skipping error page (HTTP ${httpStatus}) on ${current.url}`);
                    continue;
                }

                // Check title for 404 error page (e.g. Next.js / Astro client 404s)
                let pageTitle = '';
                try {
                    pageTitle = await page.title();
                } catch {}

                if (current.depth > 0 && /^(404|not found|page not found)/i.test(pageTitle.trim())) {
                    emit('warning', `Skipping 404 page "${pageTitle}" on ${current.url}`);
                    continue;
                }

                // Wait for web fonts
                try {
                    await page.evaluate(() => document.fonts.ready);
                } catch {}

                // Deep animation triggering auto-scroll
                if (this.options.deepScroll) {
                    emit('scrolling', `Triggering dynamic scroll animations & intersection observers on ${currentLocalPath}...`);
                    await this._deepAutoScroll(page, this.options.scrollDelay);
                }

                // Settle delay for entrance transitions & keyframe transforms
                if (this.options.postLoadDelay > 0) {
                    await new Promise((resolve) => setTimeout(resolve, this.options.postLoadDelay));
                }

                // Extract page title, DOM snapshot and discovered internal links
                const pageSnapshot = await page.evaluate(() => {
                    // Extract all internal links
                    const rawLinks = [];
                    document.querySelectorAll('a[href]').forEach((a) => {
                        const href = a.getAttribute('href');
                        if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                            rawLinks.push(a.href);
                        }
                    });

                    // Also extract any dynamically injected CSS stylesheets
                    let dynamicCss = '';
                    for (const sheet of document.styleSheets) {
                        try {
                            if (!sheet.href && sheet.cssRules) {
                                for (const rule of sheet.cssRules) {
                                    dynamicCss += rule.cssText + '\n';
                                }
                            }
                        } catch {}
                    }

                    return {
                        title: document.title || 'Cloned Page',
                        html: document.documentElement.outerHTML,
                        links: rawLinks,
                        dynamicCss
                    };
                });

                if (!mainTitle) mainTitle = pageSnapshot.title;

                // Ensure no duplicate localPath in capturedPages
                if (!capturedPages.some(p => p.localPath === currentLocalPath)) {
                    capturedPages.push({
                        url: current.url,
                        rawHtml: pageSnapshot.html,
                        localPath: currentLocalPath,
                        title: pageSnapshot.title,
                        dynamicCss: pageSnapshot.dynamicCss
                    });
                }

                // If Deep Crawl is enabled, discover and enqueue internal pages
                if (this.options.deepCrawl && current.depth + 1 <= this.options.maxDepth) {
                    for (const link of pageSnapshot.links) {
                        try {
                            const linkObj = new URL(link);
                            const linkHost = linkObj.hostname.toLowerCase().replace(/^www\./, '');
                            // Only crawl same domain/hostname (handles www vs non-www seamlessly)
                            if (linkHost === rootHostname) {
                                const normalizedLink = this._normalizeUrl(link, current.url);
                                if (normalizedLink && !visited.has(normalizedLink)) {
                                    // Check if not already in queue
                                    const inQueue = queue.some(item => item.url === normalizedLink);
                                    if (!inQueue && (visited.size + queue.length) < this.options.maxPages) {
                                        const localPath = this._urlToLocalPath(normalizedLink, targetUrl);
                                        urlToPathMap.set(normalizedLink, localPath);
                                        urlToPathMap.set(link, localPath);
                                        urlToPathMap.set(linkObj.href, localPath);
                                        urlToPathMap.set(linkObj.origin + linkObj.pathname, localPath);
                                        queue.push({ url: normalizedLink, depth: current.depth + 1 });
                                    }
                                }
                            }
                        } catch {}
                    }
                }

                // If deepCrawl is false, only crawl 1 page
                if (!this.options.deepCrawl) {
                    break;
                }
            }

            // Close browser
            await browser.close();
            browser = null;

            emit('crawled_all', `Finished crawling ${capturedPages.length} pages. Starting deep localization and link cross-wiring...`);

            // Phase 2: Localize Assets and Cross-Link all pages
            const cssProcessor = new CssProcessor(assetManager);

            for (let i = 0; i < capturedPages.length; i++) {
                const pageItem = capturedPages[i];
                emit('processing', `Localizing assets & navigation links for [${i + 1}/${capturedPages.length}] ${pageItem.localPath}...`);

                const htmlProcessor = new HtmlProcessor(assetManager, cssProcessor, pageItem.url, {
                    currentLocalPath: pageItem.localPath,
                    urlToLocalPathMap: urlToPathMap
                });

                let rawHtml = pageItem.rawHtml || '';
                // Inject any dynamic styles captured from CSSOM (styled-jsx, emotion, styled-components)
                if (pageItem.dynamicCss && pageItem.dynamicCss.trim().length > 0) {
                    if (rawHtml.includes('</head>')) {
                        rawHtml = rawHtml.replace('</head>', `<style data-reaper-dynamic="true">\n${pageItem.dynamicCss}\n</style></head>`);
                    } else {
                        rawHtml = `<style data-reaper-dynamic="true">\n${pageItem.dynamicCss}\n</style>` + rawHtml;
                    }
                }

                const localizedHtml = await htmlProcessor.processHtml(rawHtml);

                const destPath = path.join(outputDir, pageItem.localPath);
                fs.mkdirSync(path.dirname(destPath), { recursive: true });
                fs.writeFileSync(destPath, localizedHtml, 'utf8');

                emit('dom_saved', `Saved ${pageItem.localPath}`);
            }

            // Phase 3: Deep Animation Boost & Error Shield
            emit('processing', 'Applying deep animation booster and SPA crash immune shield...');
            AnimationBooster.boostDirectory(outputDir);

            // Phase 4: Inject 1-click launchers & multi-page server.js
            emit('launchers', 'Generating 1-click launch scripts (run.bat, run.sh, multi-page server.js)...');
            Packager.injectLaunchers(outputDir, {
                title: mainTitle,
                url: targetUrl,
                pagesCount: capturedPages.length
            });

            // Phase 4: Create standalone ZIP
            emit('zipping', 'Packaging all pages, animations and assets into ZIP file...');
            const zipResult = await Packager.createZip(outputDir, zipPath);

            emit('complete', `Deep website clone completed! (${capturedPages.length} pages, ${(zipResult.totalBytes / (1024 * 1024)).toFixed(2)} MB)`, {
                title: mainTitle,
                url: targetUrl,
                pagesCount: capturedPages.length,
                zipPath,
                zipSize: zipResult.totalBytes,
                stats: assetManager.stats
            });

            return {
                title: mainTitle,
                url: targetUrl,
                pagesCount: capturedPages.length,
                outputDir,
                zipPath,
                zipSize: zipResult.totalBytes,
                stats: assetManager.stats
            };
        } finally {
            if (browser) {
                try {
                    await browser.close();
                } catch {}
            }
        }
    }

    /**
     * Deep auto-scroll that triggers scroll animations, intersection observers, and lazy assets
     */
    async _deepAutoScroll(page, delay) {
        await page.evaluate(async (stepDelay) => {
            await new Promise((resolve) => {
                let currentY = 0;
                const distance = 250;
                const maxScrolls = 200;
                let scrolls = 0;

                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
                    window.scrollBy(0, distance);
                    currentY += distance;
                    scrolls++;

                    // Dispatch scroll events to trigger AOS and GSAP ScrollTrigger
                    window.dispatchEvent(new Event('scroll'));

                    if (currentY >= scrollHeight || scrolls >= maxScrolls) {
                        clearInterval(timer);
                        // Smoothly scroll back to top to let entrance animations re-align
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setTimeout(resolve, 400);
                    }
                }, stepDelay);
            });
        }, delay);
    }
}

module.exports = ClonerEngine;
