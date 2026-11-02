const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

/**
 * Website Reaper Site Scanner
 * Discovers website pages, internal site maps, and granular inner sections
 * enabling selective downloading of specific pages and UI components.
 */
class SiteScanner {
    constructor(options = {}) {
        this.options = {
            userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            timeout: options.timeout || 12000,
            maxPages: Math.min(options.maxPages || 20, 50),
            concurrency: options.concurrency || 4,
            ...options
        };
    }

    /**
     * Normalize URL (remove hash, tracking parameters, normalize protocol & slashes)
     */
    _normalizeUrl(rawUrl, baseUrl) {
        try {
            const u = new URL(rawUrl, baseUrl);
            if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;

            // Strip tracking query parameters
            const stripParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref'];
            stripParams.forEach(p => u.searchParams.delete(p));

            u.hash = '';
            let pathname = u.pathname.replace(/\/+$/, '') || '/';
            u.pathname = pathname;

            // Strip www for consistent comparison
            u.hostname = u.hostname.toLowerCase().replace(/^www\./, '');

            // Ignore static binary files (images, pdfs, archives)
            if (/\.(png|jpe?g|gif|svg|webp|avif|ico|pdf|zip|rar|tar|gz|mp4|webm|mp3|wav|ogg|exe|apk|dmg)$/i.test(pathname)) {
                return null;
            }

            return u.href;
        } catch {
            return null;
        }
    }

    /**
     * Follow redirects to determine canonical URL
     */
    async _resolveCanonical(targetUrl) {
        try {
            const res = await axios.get(targetUrl, {
                maxRedirects: 5,
                timeout: this.options.timeout,
                headers: { 'User-Agent': this.options.userAgent }
            });
            if (res.request && res.request.res && res.request.res.responseUrl) {
                return { url: res.request.res.responseUrl, initialHtml: res.data };
            }
            return { url: targetUrl, initialHtml: res.data };
        } catch (err) {
            return { url: targetUrl, initialHtml: null };
        }
    }

    /**
     * High-Precision Inner Section Extraction from HTML
     */
    extractSections(html, pageUrl) {
        const sections = [];
        if (!html) return sections;

        const $ = cheerio.load(html, { decodeEntities: false });

        // 1. Check for semantic <header>
        const header = $('header').first();
        if (header.length > 0) {
            const heading = header.find('h1, h2, h3, h4').first().text().trim();
            const preview = header.text().replace(/\s+/g, ' ').trim().slice(0, 100);
            sections.push({
                id: 'sec_header',
                selector: 'header',
                tag: 'header',
                elementId: header.attr('id') || '',
                classes: header.attr('class') || '',
                name: heading ? `Header: ${heading}` : 'Header & Navigation',
                heading,
                preview: preview || 'Site branding and navigation links',
                selected: true
            });
        }

        // 2. First attempt: scan semantic <section>, <article>, or prominent identified <div> elements
        const seenContainers = new Set();
        let sectionOrdinal = 0;

        const semanticElements = $('main > section, main > article, main > div[id], body > section, section[id], section');
        
        if (semanticElements.length >= 2) {
            semanticElements.each((_, el) => {
                const $el = $(el);

                // Avoid duplicate children or header/footer elements
                if ($el.is('header') || $el.is('footer') || $el.parents('header').length > 0 || $el.parents('footer').length > 0) {
                    return;
                }
                if ($el.parents('section').length > 0 && !$el.attr('id')) {
                    return;
                }

                if (seenContainers.has(el)) return;
                seenContainers.add(el);

                const tag = (el.tagName || 'div').toLowerCase();
                const idAttr = ($el.attr('id') || '').trim();
                const classAttr = ($el.attr('class') || '').trim();
                const ariaLabel = ($el.attr('aria-label') || '').trim();

                const headingEl = $el.find('h1, h2, h3, h4').first();
                const headingText = headingEl.text().replace(/\s+/g, ' ').trim();
                const fullText = $el.text().replace(/\s+/g, ' ').trim();
                const preview = fullText.slice(0, 120);

                const hasMedia = $el.find('img, svg, video, canvas, iframe, form').length > 0;
                if (!headingText && fullText.length < 25 && !hasMedia && !idAttr) {
                    return;
                }

                sectionOrdinal++;

                let name = headingText;
                if (!name && ariaLabel) name = ariaLabel;
                if (!name && idAttr) {
                    name = idAttr.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                }
                if (!name && classAttr) {
                    const keywords = ['hero', 'feature', 'pricing', 'about', 'team', 'faq', 'testimonial', 'contact', 'cta', 'banner'];
                    for (const kw of keywords) {
                        if (classAttr.toLowerCase().includes(kw)) {
                            name = kw.charAt(0).toUpperCase() + kw.slice(1) + ' Section';
                            break;
                        }
                    }
                }
                if (!name) name = `Section ${sectionOrdinal} (${tag})`;

                let selector = '';
                if (idAttr) {
                    selector = `#${idAttr}`;
                } else if (tag === 'section') {
                    const secIdx = $('section').index(el) + 1;
                    selector = `section:nth-of-type(${secIdx})`;
                } else {
                    selector = `${tag}[data-reaper-section="sec_${sectionOrdinal}"]`;
                }

                sections.push({
                    id: idAttr ? `#${idAttr}` : `sec_${sectionOrdinal}`,
                    selector,
                    tag,
                    elementId: idAttr,
                    classes: classAttr,
                    name,
                    heading: headingText,
                    preview: preview + (fullText.length > 120 ? '...' : ''),
                    hasMedia,
                    selected: true
                });
            });
        }

        // 3. If semantic section count is low, extract logical sections by heading blocks (h1, h2)
        if (sections.filter(s => s.tag !== 'header' && s.tag !== 'footer').length < 2) {
            const headings = $('h1, h2');
            headings.each((i, h) => {
                // Find nearest container whose parent contains multiple headings
                let curr = $(h);
                while (curr.parent().length && curr.parent().find('h1, h2').length === 1 && !curr.parent().is('body')) {
                    curr = curr.parent();
                }
                const container = curr[0];
                if (!container || seenContainers.has(container)) return;
                seenContainers.add(container);

                const headingText = $(h).text().trim().replace(/\s+/g, ' ');
                if (!headingText) return;

                const idAttr = $(curr).attr('id') || '';
                const tag = (container.tagName || 'div').toLowerCase();
                const preview = $(curr).text().replace(/\s+/g, ' ').trim().slice(0, 120);

                sectionOrdinal++;
                let selector = idAttr ? `#${idAttr}` : `${tag}[data-reaper-section="sec_${sectionOrdinal}"]`;

                sections.push({
                    id: idAttr ? `#${idAttr}` : `sec_${sectionOrdinal}`,
                    selector,
                    tag,
                    elementId: idAttr,
                    classes: $(curr).attr('class') || '',
                    name: headingText,
                    heading: headingText,
                    preview: preview + (preview.length >= 120 ? '...' : ''),
                    hasMedia: $(curr).find('img, svg, video, canvas, iframe, form').length > 0,
                    selected: true
                });
            });
        }

        // 4. Check for semantic <footer>
        const footer = $('footer').first();
        if (footer.length > 0) {
            const heading = footer.find('h1, h2, h3, h4').first().text().trim();
            const preview = footer.text().replace(/\s+/g, ' ').trim().slice(0, 100);
            sections.push({
                id: 'sec_footer',
                selector: 'footer',
                tag: 'footer',
                elementId: footer.attr('id') || '',
                classes: footer.attr('class') || '',
                name: heading ? `Footer: ${heading}` : 'Footer & Legal Links',
                heading,
                preview: preview || 'Copyright, links, and footer navigation',
                selected: true
            });
        }

        return sections;
    }

    /**
     * Discover internal pages linked from the home page or navigation menus
     */
    _discoverPageLinks($, baseUrl, targetHostname) {
        const pageLinks = new Set();
        const navLinks = new Set();

        // 1. Give priority to links inside navigation containers
        $('header a[href], nav a[href], [role="navigation"] a[href], .menu a[href], .nav a[href]').each((_, el) => {
            const href = $(el).attr('href');
            const normalized = this._normalizeUrl(href, baseUrl);
            if (!normalized) return;

            try {
                const u = new URL(normalized);
                if (u.hostname.toLowerCase().replace(/^www\./, '') === targetHostname) {
                    navLinks.add(normalized);
                }
            } catch {}
        });

        // 2. Discover other body links
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            const normalized = this._normalizeUrl(href, baseUrl);
            if (!normalized) return;

            try {
                const u = new URL(normalized);
                if (u.hostname.toLowerCase().replace(/^www\./, '') === targetHostname) {
                    pageLinks.add(normalized);
                }
            } catch {}
        });

        // Prioritize navigation links, then standard page links
        const ordered = [...navLinks, ...[...pageLinks].filter(l => !navLinks.has(l))];
        return ordered;
    }

    /**
     * Full scan and mapping of website pages and their inner sections
     */
    async scanWebsite(targetUrl, onProgress = () => {}) {
        const emit = (message) => {
            onProgress({ timestamp: new Date().toISOString(), message });
        };

        emit(`Analyzing architecture for ${targetUrl}...`);

        let { url: canonicalUrl, initialHtml } = await this._resolveCanonical(targetUrl);
        const targetObj = new URL(canonicalUrl);
        const targetHostname = targetObj.hostname.toLowerCase().replace(/^www\./, '');

        if (!initialHtml) {
            try {
                const res = await axios.get(canonicalUrl, {
                    timeout: this.options.timeout,
                    headers: { 'User-Agent': this.options.userAgent }
                });
                initialHtml = res.data;
            } catch (err) {
                throw new Error(`Failed to access ${canonicalUrl}: ${err.message}`);
            }
        }

        const $home = cheerio.load(initialHtml, { decodeEntities: false });
        let siteTitle = $home('title').text().trim() || targetObj.hostname;
        siteTitle = siteTitle.replace(/\s+/g, ' ');

        emit(`Discovered landing page: ${siteTitle}`);

        // Extract sections for Home Page
        const homeSections = this.extractSections(initialHtml, canonicalUrl);
        const homePageEntry = {
            url: canonicalUrl,
            path: targetObj.pathname || '/',
            title: siteTitle || 'Home',
            isHome: true,
            sectionsCount: homeSections.length,
            sections: homeSections,
            selected: true
        };

        const pages = [homePageEntry];
        const visitedUrls = new Set([this._normalizeUrl(canonicalUrl, canonicalUrl)]);

        // Discover internal page URLs
        const discoveredUrls = this._discoverPageLinks($home, canonicalUrl, targetHostname);
        const urlsToScan = [];

        for (const link of discoveredUrls) {
            const norm = this._normalizeUrl(link, canonicalUrl);
            if (!norm || visitedUrls.has(norm)) continue;
            visitedUrls.add(norm);
            urlsToScan.push(link);
            if (urlsToScan.length >= this.options.maxPages - 1) break;
        }

        emit(`Identified ${urlsToScan.length} subpages to inspect...`);

        // Concurrent fetching of subpages
        const chunks = [];
        const chunkSize = this.options.concurrency;
        for (let i = 0; i < urlsToScan.length; i += chunkSize) {
            chunks.push(urlsToScan.slice(i, i + chunkSize));
        }

        for (const chunk of chunks) {
            await Promise.all(chunk.map(async (pageUrl) => {
                try {
                    const res = await axios.get(pageUrl, {
                        timeout: 8000,
                        headers: { 'User-Agent': this.options.userAgent }
                    });

                    if (typeof res.data === 'string' && res.data.includes('<html')) {
                        const $page = cheerio.load(res.data, { decodeEntities: false });
                        let pageTitle = $page('title').text().trim() || new URL(pageUrl).pathname;
                        pageTitle = pageTitle.replace(/\s+/g, ' ');

                        const sections = this.extractSections(res.data, pageUrl);
                        const pathName = new URL(pageUrl).pathname;

                        pages.push({
                            url: pageUrl,
                            path: pathName,
                            title: pageTitle,
                            isHome: false,
                            sectionsCount: sections.length,
                            sections,
                            selected: true
                        });

                        emit(`Mapped page: ${pathName} (${sections.length} sections)`);
                    }
                } catch {
                    // Silently ignore unreachable subpages
                }
            }));
        }

        const totalSections = pages.reduce((acc, p) => acc + (p.sections ? p.sections.length : 0), 0);

        emit(`Architecture mapped! Discovered ${pages.length} pages and ${totalSections} interactive sections.`);

        return {
            success: true,
            url: canonicalUrl,
            domain: targetHostname,
            siteTitle,
            totalPages: pages.length,
            totalSections,
            pages
        };
    }
}

module.exports = SiteScanner;
