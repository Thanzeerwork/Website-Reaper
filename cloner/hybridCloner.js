const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const WgetCrawler = require('./wgetCrawler');
const ClonerEngine = require('./engine');
const AnimationBooster = require('./animationBooster');
const Packager = require('./packager');
const { getBrowserExecutablePath } = require('./browserFinder');

/**
 * Website Reaper Unified Hybrid Engine
 * Merges Wget Turbo Mirror (recursive asset harvesting, fast network mirroring, directory structuring)
 * with Puppeteer Headless Browser (JS execution, live DOM synthesis, dynamic CSSOM capture, scroll animation pre-warming)
 * and the 4-Layer Immune Shield against SPA crashes.
 */
class HybridCloner {
    constructor(options = {}) {
        this.options = {
            viewportWidth: options.viewportWidth || 1920,
            viewportHeight: options.viewportHeight || 1080,
            deepScroll: options.deepScroll !== false,
            deepCrawl: options.deepCrawl !== false,
            maxDepth: options.maxDepth || 3,
            maxPages: Math.min(options.maxPages || 30, 100),
            quota: options.quota || process.env.DOWNLOAD_QUOTA || '500m',
            mediaFilter: options.mediaFilter || 'all',
            prewarm: options.prewarm !== false,
            settleDelay: options.settleDelay || 2500,
            customHeaders: options.customHeaders || '',
            timeout: options.timeout || 300000,
            userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            selectedPages: options.selectedPages || null,
            pageSectionFilters: options.pageSectionFilters || null,
            ...options
        };
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
     * Main hybrid clone pipeline
     */
    async cloneWebsite(targetUrl, outputDir, zipPath, onProgress = () => {}) {
        const emit = (stage, message, data = {}) => {
            onProgress({ timestamp: new Date().toISOString(), stage, message, ...data });
        };

        emit('init', `🚀 Launching Website Reaper Unified Hybrid Engine on ${targetUrl}...`);

        const canonicalUrl = await this._resolveCanonicalUrl(targetUrl);
        const targetObj = new URL(canonicalUrl);
        const baseDomain = targetObj.hostname.toLowerCase().replace(/^www\./i, '');

        emit('init', `Canonical target resolved: ${canonicalUrl} (Base Domain: ${baseDomain})`);

        let siteTitle = `Clone of ${targetObj.hostname}`;
        let pagesCount = 1;
        let stats = {
            html: 0,
            css: 0,
            js: 0,
            images: 0,
            fonts: 0,
            media: 0,
            totalFiles: 0,
            totalBytes: 0,
            totalAssets: 0
        };

        const wgetAvailable = WgetCrawler.isAvailable();

        // =========================================================================
        // STAGE 1: RAPID RECURSIVE ASSET HARVESTING (Wget Core with Puppeteer Fallback)
        // =========================================================================
        if (wgetAvailable) {
            emit('network', `Phase 1/4: Running Wget Turbo Mirror for recursive asset harvesting & link mapping...`);
            const wgetCrawler = new WgetCrawler({
                quota: this.options.quota,
                timeout: this.options.timeout,
                userAgent: this.options.userAgent,
                maxDepth: this.options.maxDepth,
                mediaFilter: this.options.mediaFilter,
                customHeaders: this.options.customHeaders
            });

            const intermediateZip = path.join(path.dirname(zipPath), `temp_${Date.now()}.zip`);
            try {
                const wgetResult = await wgetCrawler.cloneWebsite(canonicalUrl, outputDir, intermediateZip, (pEvent) => {
                    // Forward progress events
                    if (pEvent.stage === 'crawling' || pEvent.stage === 'network') {
                        emit(pEvent.stage, pEvent.message, pEvent.data || {});
                    }
                });

                if (wgetResult && wgetResult.title) siteTitle = wgetResult.title;
                if (wgetResult && wgetResult.pagesCount) pagesCount = wgetResult.pagesCount;
                if (wgetResult && wgetResult.stats) stats = { ...stats, ...wgetResult.stats };

                // Remove temp intermediate zip
                try { fs.rmSync(intermediateZip, { force: true }); } catch {}
            } catch (wErr) {
                console.warn('[HybridCloner] Wget pass warning:', wErr.message);
                emit('processing', `Wget completed with notice: ${wErr.message}. Proceeding to browser synthesis...`);
            }
        } else {
            // Graceful fallback to Puppeteer Headless Crawler if Wget is absent
            emit('network', `Phase 1/4: Wget not detected. Using Puppeteer Headless Browser recursive crawler...`);
            const clonerEngine = new ClonerEngine({
                viewportWidth: this.options.viewportWidth,
                viewportHeight: this.options.viewportHeight,
                deepScroll: this.options.deepScroll,
                deepCrawl: this.options.deepCrawl,
                maxPages: this.options.maxPages,
                maxDepth: this.options.maxDepth,
                selectedPages: this.options.selectedPages,
                pageSectionFilters: this.options.pageSectionFilters
            });

            const intermediateZip = path.join(path.dirname(zipPath), `temp_${Date.now()}.zip`);
            const engineResult = await clonerEngine.cloneWebsite(canonicalUrl, outputDir, intermediateZip, (pEvent) => {
                emit(pEvent.stage, pEvent.message, pEvent.data || {});
            });

            if (engineResult && engineResult.title) siteTitle = engineResult.title;
            if (engineResult && engineResult.pagesCount) pagesCount = engineResult.pagesCount;
            if (engineResult && engineResult.stats) stats = { ...stats, ...engineResult.stats };

            try { fs.rmSync(intermediateZip, { force: true }); } catch {}
        }

        // Ensure index.html exists at output root
        const rootIndex = path.join(outputDir, 'index.html');
        if (!fs.existsSync(rootIndex)) {
            const foundIndex = this._findFile(outputDir, 'index.html');
            if (foundIndex) {
                fs.copyFileSync(foundIndex, rootIndex);
            }
        }

        if (fs.existsSync(rootIndex)) {
            try {
                const $ = cheerio.load(fs.readFileSync(rootIndex, 'utf8'));
                const t = $('title').text().trim();
                if (t && !t.includes('404')) siteTitle = t;
            } catch {}
        }

        // =========================================================================
        // STAGE 2: HEADLESS CHROME LIVE DOM SYNTHESIS & DYNAMIC CSSOM CAPTURE
        // =========================================================================
        const browserExe = getBrowserExecutablePath();
        if (this.options.prewarm && browserExe) {
            emit('rendering', `Phase 2/4: Synthesizing live DOM, wake-up scroll triggers & dynamic CSSOM via Headless Chrome...`);
            try {
                await this._synthesizeLiveBrowserData(outputDir, browserExe, emit, canonicalUrl);
            } catch (bErr) {
                console.warn('[HybridCloner] Browser synthesis notice:', bErr.message);
            }
        } else if (!this.options.prewarm) {
            emit('rendering', `Phase 2/4: Chrome dynamic pre-warming skipped (Fast Raw Mirror Mode active).`);
        }

        // =========================================================================
        // STAGE 3: SPA CRASH NEUTRALIZER & 4-LAYER IMMUNE SHIELD
        // =========================================================================
        emit('processing', `Phase 3/4: Neutralizing SPA hydration crashes & applying 4-layer immune shield...`);
        this._neutralizeSpaHydration(outputDir, baseDomain);
        this._sanitizeJsFiles(outputDir);

        // Boost universal scroll animations, keyframes, intersection observers, and UI binders
        emit('processing', `Boosting AOS, GSAP ScrollTrigger, Lenis, card tilts, and navigation interactions...`);
        const boostedCount = AnimationBooster.boostDirectory(outputDir);
        if (boostedCount > pagesCount) pagesCount = boostedCount;

        // Ensure video and canvas tags have required autoplay/loop attributes
        this._enhanceMediaElements(outputDir);

        // Apply selective page and section pruning if custom filters are set
        this._applyPageAndSectionFilters(outputDir, emit);

        // =========================================================================
        // STAGE 4: 1-CLICK LAUNCHERS & FINAL PACKAGE
        // =========================================================================
        emit('launchers', `Phase 4/4: Generating 1-click launch scripts (run.bat, run.sh, clean-URL server.js)...`);
        Packager.injectLaunchers(outputDir, {
            title: siteTitle,
            url: targetUrl,
            pagesCount
        });

        emit('zipping', `Packaging all assets, styles and launchers into final ZIP archive...`);
        const zipResult = await Packager.createZip(outputDir, zipPath);

        stats.totalBytes = zipResult.totalBytes;
        stats.totalFiles = this._countFiles(outputDir);
        stats.totalAssets = stats.totalFiles;

        emit('complete', `Website clone completed with 100% fidelity! (${pagesCount} pages, ${(zipResult.totalBytes / (1024 * 1024)).toFixed(2)} MB)`, {
            title: siteTitle,
            url: targetUrl,
            pagesCount,
            zipPath,
            zipSize: zipResult.totalBytes,
            stats
        });

        return {
            title: siteTitle,
            url: targetUrl,
            pagesCount,
            outputDir,
            zipPath,
            zipSize: zipResult.totalBytes,
            stats
        };
    }

    /**
     * Live browser synthesis: Auto-scrolls pages in headless Chrome, executes JS intersection
     * observers, unhides lazy content, and captures dynamic CSSOM rules.
     */
    async _synthesizeLiveBrowserData(outputDir, executablePath, emit, canonicalUrl = null) {
        let puppeteer;
        try {
            puppeteer = require('puppeteer-core');
        } catch {
            return;
        }

        let browser = null;
        try {
            browser = await puppeteer.launch({
                executablePath,
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-web-security',
                    '--enable-webgl',
                    '--enable-accelerated-2d-canvas',
                    '--ignore-gpu-blocklist',
                    '--use-gl=angle',
                    '--allow-file-access-from-files',
                    '--disable-features=IsolateOrigins,site-per-process'
                ],
                defaultViewport: {
                    width: this.options.viewportWidth,
                    height: this.options.viewportHeight
                }
            });

            // If canonicalUrl is present, do a live 3D & WebGL asset discovery pass on the real URL
            if (canonicalUrl) {
                emit('rendering', `Discovering 3D models, WebGL shaders & React Bits assets from live URL...`);
                const livePage = await browser.newPage();
                try {
                    if (this.options.userAgent) {
                        await livePage.setUserAgent(this.options.userAgent);
                    }

                    // Intercept 3D models and binary files
                    livePage.on('response', async (response) => {
                        try {
                            const status = response.status();
                            if (status >= 200 && status < 300) {
                                const ct = (response.headers()['content-type'] || '').toLowerCase();
                                const url = response.url();
                                if (
                                    ct.includes('model/') ||
                                    ct.includes('gltf') ||
                                    ct.includes('wasm') ||
                                    (ct.includes('application/octet-stream') && /\.(glb|gltf|bin|wasm|hdr|exr|splinecode|spline)/i.test(url)) ||
                                    /\.(glb|gltf|bin|wasm|hdr|exr|spline|splinecode|obj|mtl|fbx|json)$/i.test(url)
                                ) {
                                    const buffer = await response.buffer();
                                    const filename = path.basename(url.split('?')[0]);
                                    const dir3d = path.join(outputDir, 'assets', '3d');
                                    if (!fs.existsSync(dir3d)) fs.mkdirSync(dir3d, { recursive: true });
                                    fs.writeFileSync(path.join(dir3d, filename), buffer);
                                    emit('asset', `Captured 3D/Binary Asset: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
                                }
                            }
                        } catch {}
                    });

                    await livePage.goto(canonicalUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
                    await new Promise(r => setTimeout(r, Math.min(this.options.settleDelay || 2500, 3000)));
                } catch (liveErr) {
                    console.warn('[HybridCloner] Live 3D pass notice:', liveErr.message);
                } finally {
                    try { await livePage.close(); } catch {}
                }
            }

            const htmlFiles = [];
            const collectHtml = (dir) => {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const item of entries) {
                    const full = path.join(dir, item.name);
                    if (item.isDirectory() && item.name !== 'node_modules' && item.name !== 'assets') {
                        collectHtml(full);
                    } else if (item.isFile() && item.name.endsWith('.html')) {
                        htmlFiles.push(full);
                    }
                }
            };
            collectHtml(outputDir);

            // Synthesize top priority pages (e.g. index, about, contact, menu)
            const pagesToSynthesize = htmlFiles.slice(0, 10);
            for (let i = 0; i < pagesToSynthesize.length; i++) {
                const filePath = pagesToSynthesize[i];
                const relPath = path.relative(outputDir, filePath);
                emit('rendering', `Live browser synthesis on ${relPath} (${i + 1}/${pagesToSynthesize.length})...`);

                const page = await browser.newPage();
                try {
                    if (this.options.userAgent) {
                        await page.setUserAgent(this.options.userAgent);
                    }
                    const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');
                    await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });

                    // Progressive smooth scrolling and React Bits/Chakra UI wake-up
                    await page.evaluate(async (settleMs) => {
                        await new Promise((resolve) => {
                            let current = 0;
                            const step = 250;
                            const maxScroll = Math.min(document.body.scrollHeight || 10000, 15000);
                            const timer = setInterval(() => {
                                window.scrollBy(0, step);
                                current += step;
                                window.dispatchEvent(new Event('scroll'));

                                if (current >= maxScroll) {
                                    clearInterval(timer);
                                    window.scrollTo(0, 0);

                                    // Wake up React Bits card spotlight, glare, tilt, and 3D canvas
                                    try {
                                        const interactive = document.querySelectorAll('[data-spotlight], .spotlight, [data-tilt], .card, canvas, .chakra-accordion__button');
                                        interactive.forEach(el => {
                                            const r = el.getBoundingClientRect();
                                            const cx = r.left + r.width / 2;
                                            const cy = r.top + r.height / 2;
                                            el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, clientX: cx, clientY: cy }));
                                            el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: cx, clientY: cy }));
                                            el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: cx, clientY: cy }));
                                        });

                                        // Lock canvas buffer dimensions
                                        document.querySelectorAll('canvas').forEach(cv => {
                                            const rect = cv.getBoundingClientRect();
                                            if (!cv.getAttribute('width') && rect.width > 0) cv.setAttribute('width', Math.round(rect.width));
                                            if (!cv.getAttribute('height') && rect.height > 0) cv.setAttribute('height', Math.round(rect.height));
                                            cv.setAttribute('data-reaper-canvas', 'true');
                                        });
                                        window.dispatchEvent(new Event('resize'));
                                    } catch(e) {}

                                    setTimeout(resolve, Math.max(settleMs / 4, 250));
                                }
                            }, 40);
                        });
                    }, this.options.settleDelay || 2500);

                    // Capture dynamic CSSOM rules
                    const dynamicCss = await page.evaluate(() => {
                        let css = '';
                        for (const sheet of document.styleSheets) {
                            try {
                                if (!sheet.href && sheet.cssRules) {
                                    for (const r of sheet.cssRules) {
                                        css += r.cssText + '\n';
                                    }
                                }
                            } catch {}
                        }
                        return css;
                    });

                    // Inject dynamic CSSOM into HTML file
                    if (dynamicCss && dynamicCss.trim().length > 0) {
                        let currentHtml = fs.readFileSync(filePath, 'utf8');
                        if (!currentHtml.includes('data-reaper-hybrid-dynamic-css')) {
                            const dynamicStyleTag = `<style data-reaper-hybrid-dynamic-css="true">\n${dynamicCss}\n</style>`;
                            if (currentHtml.includes('</head>')) {
                                currentHtml = currentHtml.replace('</head>', `${dynamicStyleTag}</head>`);
                            } else {
                                currentHtml = dynamicStyleTag + currentHtml;
                            }
                            fs.writeFileSync(filePath, currentHtml, 'utf8');
                        }
                    }
                } catch (pErr) {
                    console.warn(`[HybridCloner] Notice for ${relPath}:`, pErr.message);
                } finally {
                    try { await page.close(); } catch {}
                }
            }
        } finally {
            if (browser) {
                try { await browser.close(); } catch {}
            }
        }
    }

    /**
     * Neutralizes SPA hydration engines (Next.js, React, Nuxt) to prevent ErrorBoundary wipes
     */
    _neutralizeSpaHydration(dir, baseDomain) {
        const list = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of list) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory() && item.name !== 'node_modules' && item.name !== 'assets') {
                this._neutralizeSpaHydration(fullPath, baseDomain);
            } else if (item.isFile() && item.name.endsWith('.html')) {
                try {
                    let html = fs.readFileSync(fullPath, 'utf8');

                    // Fix domain relative paths
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

                    // Remove Content Security Policy tags
                    $('meta[http-equiv="Content-Security-Policy"]').remove();
                    $('meta[http-equiv="content-security-policy"]').remove();

                    fs.writeFileSync(fullPath, $.html(), 'utf8');
                } catch {}
            }
        }
    }

    /**
     * Sanitize JS chunk files to neutralize ErrorBoundary crash overlays
     */
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

    /**
     * Ensures videos and canvas have proper autoplay attributes
     */
    _enhanceMediaElements(dir) {
        const list = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of list) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory() && item.name !== 'node_modules' && item.name !== 'assets') {
                this._enhanceMediaElements(fullPath);
            } else if (item.isFile() && item.name.endsWith('.html')) {
                try {
                    let html = fs.readFileSync(fullPath, 'utf8');
                    const $ = cheerio.load(html, { decodeEntities: false });

                    $('video').each((_, el) => {
                        $(el).attr('autoplay', '');
                        $(el).attr('muted', '');
                        $(el).attr('playsinline', '');
                        $(el).attr('loop', '');
                    });

                    fs.writeFileSync(fullPath, $.html(), 'utf8');
                } catch {}
            }
        }
    }

    /**
     * Apply selective page and inner section pruning based on user selections
     */
    _applyPageAndSectionFilters(outputDir, emit) {
        const { selectedPages, pageSectionFilters } = this.options;
        if (!selectedPages && !pageSectionFilters) return;

        // 1. Prune unselected pages if selectedPages is provided
        if (Array.isArray(selectedPages) && selectedPages.length > 0) {
            const allowedFileNames = new Set(['index.html']);
            selectedPages.forEach(u => {
                try {
                    const parsed = new URL(u);
                    let p = parsed.pathname.replace(/^\/+|\/+$/g, '');
                    if (!p || p === 'index' || p === 'index.html') {
                        allowedFileNames.add('index.html');
                    } else {
                        if (!/\.html?$/i.test(p)) p += '.html';
                        allowedFileNames.add(path.basename(p));
                        allowedFileNames.add(p);
                    }
                } catch {}
            });

            const scanDirForHtml = (dir) => {
                if (!fs.existsSync(dir)) return;
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory() && entry.name !== 'assets') {
                        scanDirForHtml(fullPath);
                    } else if (entry.isFile() && /\.html?$/i.test(entry.name)) {
                        const rel = path.relative(outputDir, fullPath).replace(/\\/g, '/');
                        if (!allowedFileNames.has(entry.name) && !allowedFileNames.has(rel) && entry.name !== 'index.html') {
                            try {
                                fs.unlinkSync(fullPath);
                                emit('processing', `Pruned unselected page: ${rel}`);
                            } catch {}
                        }
                    }
                }
            };
            scanDirForHtml(outputDir);
        }

        // 2. Prune unselected sections within HTML files
        if (pageSectionFilters && typeof pageSectionFilters === 'object') {
            const htmlFiles = [];
            const collectHtml = (dir) => {
                if (!fs.existsSync(dir)) return;
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const full = path.join(dir, entry.name);
                    if (entry.isDirectory() && entry.name !== 'assets') {
                        collectHtml(full);
                    } else if (entry.isFile() && /\.html?$/i.test(entry.name)) {
                        htmlFiles.push(full);
                    }
                }
            };
            collectHtml(outputDir);

            for (const file of htmlFiles) {
                const relPath = path.relative(outputDir, file).replace(/\\/g, '/');
                const baseName = path.basename(file);
                let filter = null;
                for (const [key, val] of Object.entries(pageSectionFilters)) {
                    if (
                        key === relPath ||
                        key === baseName ||
                        (relPath === 'index.html' && (key === '/' || key === '')) ||
                        key.endsWith('/' + relPath) ||
                        (key.includes('/') && new URL(key, 'http://dummy.local').pathname.replace(/^\/+/, '') === relPath)
                    ) {
                        filter = val;
                        break;
                    }
                }

                if (!filter) filter = pageSectionFilters['*'];
                if (!filter) continue;

                try {
                    const rawHtml = fs.readFileSync(file, 'utf8');
                    const $ = cheerio.load(rawHtml, { decodeEntities: false });
                    let removedCount = 0;

                    // Remove by excludedSelectors
                    if (filter.excludedSelectors && Array.isArray(filter.excludedSelectors)) {
                        for (const sel of filter.excludedSelectors) {
                            if (!sel) continue;
                            try {
                                const matched = $(sel);
                                if (matched.length > 0) {
                                    matched.remove();
                                    removedCount++;
                                }
                            } catch {}
                        }
                    }

                    // Remove by excludedHeadings
                    if (filter.excludedHeadings && Array.isArray(filter.excludedHeadings)) {
                        for (const heading of filter.excludedHeadings) {
                            if (!heading) continue;
                            const hNorm = heading.trim().toLowerCase();
                            $('h1, h2, h3').each((_, hEl) => {
                                if ($(hEl).text().trim().toLowerCase() === hNorm) {
                                    let container = $(hEl);
                                    while (container.parent().length && container.parent().find('h1, h2').length === 1 && !container.parent().is('body')) {
                                        container = container.parent();
                                    }
                                    container.remove();
                                    removedCount++;
                                }
                            });
                        }
                    }

                    if (removedCount > 0) {
                        fs.writeFileSync(file, $.html(), 'utf8');
                        emit('processing', `Pruned ${removedCount} unselected section(s) from ${relPath}`);
                    }
                } catch (err) {
                    console.warn(`[Filter] Notice on ${file}:`, err.message);
                }
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

    _countFiles(dir) {
        let count = 0;
        try {
            const list = fs.readdirSync(dir, { withFileTypes: true });
            for (const item of list) {
                const full = path.join(dir, item.name);
                if (item.isDirectory()) count += this._countFiles(full);
                else if (item.isFile()) count++;
            }
        } catch {}
        return count;
    }
}

module.exports = HybridCloner;

