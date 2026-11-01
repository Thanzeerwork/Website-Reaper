const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

class AnimationBooster {
    /**
     * Instant Head-Level Theme Bootstrapper
     * Prevents white flash and ensures instant theme restoration across all cloned subpages.
     */
    static getThemeBootstrapperScript() {
        return `
<script id="reaper-theme-bootstrapper">
/**
 * Website Reaper Universal Theme Bootstrapper (Zero-Flash)
 */
(function() {
    try {
        const read = function(k) { try { return localStorage.getItem(k); } catch(e) { return null; } };
        const saved = read('pg-theme') || read('theme') || read('color-theme') || read('theme-preference') || read('next-themes-theme') || read('theme_mode');
        const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved || (systemDark ? 'dark' : 'light');
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark', 'theme-dark');
            root.classList.remove('light', 'theme-light');
            root.setAttribute('data-theme', 'dark');
            root.dataset.theme = 'dark';
            root.setAttribute('data-mode', 'dark');
            root.setAttribute('data-bs-theme', 'dark');
            root.style.colorScheme = 'dark';
        } else if (theme === 'light') {
            root.classList.remove('dark', 'theme-dark');
            root.classList.add('light', 'theme-light');
            root.setAttribute('data-theme', 'light');
            root.dataset.theme = 'light';
            root.setAttribute('data-mode', 'light');
            root.setAttribute('data-bs-theme', 'light');
            root.style.colorScheme = 'light';
        }
    } catch(e) {}
})();
</script>
`;
    }

    /**
     * Universal CSS for scroll animations (AOS, WOW, GSAP, Reveal, Keyframes)
     */
    static getAnimationCss() {
        return `
<style id="reaper-animation-styles">
/* Website Reaper Universal Animation & Layout Restoration Engine */
[data-aos] {
    pointer-events: auto !important;
}
[data-aos].aos-animate {
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
}
[data-aos="fade-up"] {
    transition: opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
}
[data-aos="fade-up"]:not(.aos-animate) {
    opacity: 0;
    transform: translateY(35px);
}
[data-aos="fade-down"]:not(.aos-animate) {
    opacity: 0;
    transform: translateY(-35px);
}
[data-aos="fade-left"]:not(.aos-animate) {
    opacity: 0;
    transform: translateX(35px);
}
[data-aos="fade-right"]:not(.aos-animate) {
    opacity: 0;
    transform: translateX(-35px);
}
[data-aos="zoom-in"]:not(.aos-animate) {
    opacity: 0;
    transform: scale(0.88);
}
[data-aos="zoom-out"]:not(.aos-animate) {
    opacity: 0;
    transform: scale(1.12);
}

/* Fallback reveal classes for custom scroll animations */
.is-revealed, .in-view, .is-visible, .animated, .reveal-active {
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
}

/* Ensure smooth native scrolling */
html {
    scroll-behavior: smooth;
}

/* Prevent accidental layout shifts or hidden overflow on body */
body {
    overflow-x: hidden !important;
}

/* Theme toggle transition smoothness */
html, body {
    transition: background-color 0.25s ease, color 0.25s ease;
}
</style>
`;
    }

    /**
     * Universal Client-Side Shield, Animation & Interaction Controller
     */
    static getAnimationScript() {
        return `
<script id="reaper-animation-engine">
/**
 * Website Reaper Deep Animation, Theme & Runtime Compatibility Engine
 * 1. Permanently shields against Next.js / React "Application error: a client-side exception has occurred"
 * 2. Restores and drives AOS, GSAP ScrollTrigger, Lenis smooth scrolling, and scroll keyframes offline.
 * 3. Restores mobile hamburger menus, navigation dropdowns, and interactive card tilt effects.
 * 4. Autonomous Universal Dark/Light Mode Switcher with zero-flash persistence.
 */
(function() {
    'use strict';

    // ==========================================
    // LAYER 1: IMMUNE SYSTEM AGAINST SPA CRASHES
    // ==========================================
    
    // Suppress unhandled errors and ResizeObserver loop limits
    window.addEventListener('error', function(e) {
        if (e && e.message && (e.message.includes('ResizeObserver') || e.message.includes('Script error'))) {
            return;
        }
        console.warn('[Website Reaper] Shielded client error:', (e && e.message) || e);
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        return true;
    }, true);

    window.addEventListener('unhandledrejection', function(e) {
        console.warn('[Website Reaper] Shielded unhandled rejection:', e && e.reason);
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    });

    // Intercept DOM mutations that attempt to inject Next.js Error Boundary overlays
    try {
        const errorPattern = /Application error: a client-side exception|next-error-h1|__next-build-watcher/i;

        const originalSetInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;
        Object.defineProperty(Element.prototype, 'innerHTML', {
            set: function(val) {
                if (typeof val === 'string' && errorPattern.test(val)) {
                    console.warn('[Website Reaper] Intercepted and blocked ErrorBoundary innerHTML wipe.');
                    return;
                }
                return originalSetInnerHTML.call(this, val);
            }
        });

        const originalAppendChild = Node.prototype.appendChild;
        Node.prototype.appendChild = function(child) {
            if (child && child.textContent && errorPattern.test(child.textContent)) {
                console.warn('[Website Reaper] Intercepted and blocked ErrorBoundary appendChild.');
                return child;
            }
            return originalAppendChild.call(this, child);
        };

        const originalReplaceChild = Node.prototype.replaceChild;
        Node.prototype.replaceChild = function(newChild, oldChild) {
            if (newChild && newChild.textContent && errorPattern.test(newChild.textContent)) {
                console.warn('[Website Reaper] Intercepted and blocked ErrorBoundary replaceChild.');
                return oldChild;
            }
            return originalReplaceChild.call(this, newChild, oldChild);
        };

        if (Element.prototype.replaceChildren) {
            const originalReplaceChildren = Element.prototype.replaceChildren;
            Element.prototype.replaceChildren = function(...nodes) {
                for (const n of nodes) {
                    if (n && n.textContent && errorPattern.test(n.textContent)) {
                        console.warn('[Website Reaper] Intercepted and blocked ErrorBoundary replaceChildren.');
                        return;
                    }
                }
                return originalReplaceChildren.apply(this, nodes);
            };
        }

        // Active MutationObserver to instantly remove any error overlay if mounted
        const errObserver = new MutationObserver(function(mutations) {
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (node.nodeType === 1) {
                        const txt = node.textContent || '';
                        if (errorPattern.test(txt)) {
                            console.warn('[Website Reaper] Removed mounted error overlay.');
                            node.remove();
                        }
                    }
                }
            }
        });
        if (document.documentElement) {
            errObserver.observe(document.documentElement, { childList: true, subtree: true });
        }
    } catch(err) {}

    // Mock broken analytics & API fetches to prevent uncaught network rejections
    const originalFetch = window.fetch;
    if (originalFetch) {
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).catch(() => {
                return new Response(JSON.stringify({ status: 'ok', mocked: true }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            });
        };
    }

    // ==========================================
    // LAYER 2: DEEP ANIMATION & INTERACTION CONTROLLER
    // ==========================================

    function initDeepAnimations() {
        // 1. Wake up AOS (Animate On Scroll)
        if (window.AOS && typeof window.AOS.init === 'function') {
            try {
                window.AOS.init({
                    once: false,
                    mirror: true,
                    offset: 40,
                    duration: 750,
                    easing: 'ease-out-cubic'
                });
                window.AOS.refresh();
            } catch(e) {}
        }

        // 2. Wake up GSAP ScrollTrigger
        if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
            try { window.ScrollTrigger.refresh(); } catch(e) {}
        }

        // 3. Fallback IntersectionObserver for all animated elements
        const animSelectors = [
            '[data-aos]',
            '[data-animation]',
            '[data-scroll]',
            '[data-reveal]',
            '.animate-on-scroll',
            '.reveal-on-scroll',
            '.fade-in',
            '.scroll-trigger',
            '.wow',
            '.motion-div',
            '[data-biryani-content]'
        ].join(', ');

        const elements = document.querySelectorAll(animSelectors);
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        target.classList.add('aos-animate', 'is-visible', 'in-view', 'animated', 'is-revealed');
                        if (target.style && target.style.opacity === '0') {
                            target.style.opacity = '1';
                        }
                    }
                });
            }, {
                root: null,
                rootMargin: '0px 0px -40px 0px',
                threshold: 0.1
            });

            elements.forEach(el => observer.observe(el));
        } else {
            elements.forEach(el => {
                el.classList.add('aos-animate', 'is-visible', 'in-view', 'animated');
            });
        }

        // 4. Progressive scroll & resize triggers to wake up lazy-load and viewport watchers
        const triggerEvents = () => {
            window.dispatchEvent(new Event('scroll'));
            window.dispatchEvent(new Event('resize'));
        };
        [50, 150, 400, 1000, 2000].forEach(delay => setTimeout(triggerEvents, delay));

        // 5. Safety Net: Reveal any elements that remained stuck invisible
        setTimeout(() => {
            document.querySelectorAll('[data-aos]:not(.aos-animate), .opacity-0').forEach(el => {
                el.classList.add('aos-animate', 'is-visible');
                if (el.style && el.style.opacity === '0') {
                    el.style.opacity = '1';
                }
            });
        }, 2200);

        // 6. Interactive Card Tilt Effects ([data-tilt])
        document.querySelectorAll('[data-tilt]').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                card.style.transform = 'perspective(1000px) rotateX(' + (-y / 20) + 'deg) rotateY(' + (x / 20) + 'deg)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            });
        });

        // 7. Auto-bind Mobile Hamburger Menus & Navigation Dropdowns
        document.querySelectorAll('.ToggleMenu_menuWrap__TTX8G, .hamburger, [data-mobile-menu-toggle]').forEach(btn => {
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const menu = document.querySelector('.mobile-menu, [data-mobile-menu], nav ul');
                if (menu) {
                    menu.classList.toggle('hidden');
                    menu.classList.toggle('flex');
                    menu.classList.toggle('open');
                }
            });
        });

        // Auto-bind navigation dropdown hover/click
        document.querySelectorAll('[data-dropdown-container], .dropdown').forEach(container => {
            const dropdownMenu = container.querySelector('.absolute, .dropdown-menu');
            if (dropdownMenu) {
                container.addEventListener('mouseenter', () => {
                    dropdownMenu.classList.remove('invisible', 'opacity-0', 'pointer-events-none');
                    dropdownMenu.classList.add('visible', 'opacity-100');
                    dropdownMenu.style.pointerEvents = 'auto';
                });
                container.addEventListener('mouseleave', () => {
                    dropdownMenu.classList.add('invisible', 'opacity-0', 'pointer-events-none');
                    dropdownMenu.classList.remove('visible', 'opacity-100');
                    dropdownMenu.style.pointerEvents = 'none';
                });
            }
        });

        // ==========================================
        // LAYER 3: UNIVERSAL DARK / LIGHT MODE CONTROLLER
        // ==========================================
        initThemeController();
    }

    function initThemeController() {
        const root = document.documentElement;
        const body = document.body;

        function getActiveTheme() {
            const read = function(k) { try { return localStorage.getItem(k); } catch(e) { return null; } };
            const saved = read('pg-theme') || read('theme') || read('color-theme') || read('theme-preference') || read('next-themes-theme') || read('theme_mode');
            if (saved === 'dark' || saved === 'light') return saved;
            if (root.classList.contains('dark') || root.dataset.theme === 'dark' || root.getAttribute('data-theme') === 'dark' || root.getAttribute('data-mode') === 'dark' || root.getAttribute('data-bs-theme') === 'dark') {
                return 'dark';
            }
            if (root.classList.contains('light') || root.dataset.theme === 'light' || root.getAttribute('data-theme') === 'light') {
                return 'light';
            }
            return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
        }

        function applyTheme(targetTheme) {
            const isDark = targetTheme === 'dark';
            console.log('[Website Reaper] Applying theme:', targetTheme);

            // 1. Classes on <html> and <body> (Tailwind & CSS frameworks)
            root.classList.toggle('dark', isDark);
            root.classList.toggle('theme-dark', isDark);
            root.classList.toggle('light', !isDark);
            root.classList.toggle('theme-light', !isDark);

            if (body) {
                body.classList.toggle('dark', isDark);
                body.classList.toggle('theme-dark', isDark);
                body.classList.toggle('light', !isDark);
                body.classList.toggle('theme-light', !isDark);
            }

            // 2. Data Attributes (Astro, DaisyUI, Bootstrap 5.3, Next themes)
            root.setAttribute('data-theme', targetTheme);
            root.dataset.theme = targetTheme;
            root.setAttribute('data-mode', targetTheme);
            root.setAttribute('data-bs-theme', targetTheme);
            root.style.colorScheme = targetTheme;
            if (body) body.style.colorScheme = targetTheme;

            // 3. Persistent Storage & Cookies across all cloned pages
            const keys = ['pg-theme', 'theme', 'color-theme', 'theme-preference', 'next-themes-theme', 'theme_mode', 'chakra-ui-color-mode', 'mantine-color-scheme', 'starlight-theme'];
            keys.forEach(k => {
                try { localStorage.setItem(k, targetTheme); } catch(e) {}
            });
            try {
                document.cookie = 'theme=' + targetTheme + '; path=/; max-age=31536000';
                document.cookie = 'next-themes-theme=' + targetTheme + '; path=/; max-age=31536000';
            } catch(e) {}

            // 4. Update Switches and Icons in the DOM
            document.querySelectorAll('[role="switch"]').forEach(sw => {
                sw.setAttribute('aria-checked', isDark ? 'true' : 'false');
            });

            // Update icon elements that have class or attribute indicating sun/moon
            document.querySelectorAll('.sun-icon, .moon-icon, [data-icon="sun"], [data-icon="moon"], .lucide-sun, .lucide-moon, .feather-sun, .feather-moon').forEach(el => {
                const isSun = el.classList.contains('sun-icon') || el.classList.contains('lucide-sun') || el.classList.contains('feather-sun') || el.getAttribute('data-icon') === 'sun';
                if (isSun) {
                    el.style.display = isDark ? 'none' : '';
                } else {
                    el.style.display = isDark ? '' : 'none';
                }
            });

            // Update floating pill if present
            const pillIcon = document.getElementById('reaper-floating-theme-icon');
            if (pillIcon) {
                pillIcon.innerHTML = isDark 
                    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
            }

            window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: targetTheme } }));
        }

        function toggleTheme() {
            const current = getActiveTheme();
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            return next;
        }

        window.__reaperToggleTheme = toggleTheme;
        window.__reaperApplyTheme = applyTheme;

        // Apply theme immediately
        const initialTheme = getActiveTheme();
        applyTheme(initialTheme);

        // Discover and bind all theme buttons in the page
        const THEME_SELECTORS = [
            '[aria-label*="theme" i]',
            '[aria-label*="dark" i]',
            '[aria-label*="light" i]',
            '[aria-label*="mode" i]',
            '[title*="theme" i]',
            '[title*="dark" i]',
            '[title*="light" i]',
            '[data-theme-toggle]',
            '[data-toggle-theme]',
            '[data-theme-switcher]',
            '#theme-toggle',
            '#theme-switcher',
            '#dark-mode-toggle',
            '#darkModeToggle',
            '#themeToggle',
            '.theme-toggle',
            '.theme-switcher',
            '.dark-mode-toggle',
            '.darkModeToggle',
            '.themeToggle',
            '.toggle-theme',
            '.color-mode-toggle'
        ];

        let foundThemeButton = false;
        const boundButtons = new Set();

        function bindButton(btn) {
            if (!btn || boundButtons.has(btn)) return;
            boundButtons.add(btn);
            foundThemeButton = true;
            btn.style.cursor = 'pointer';
            btn.setAttribute('data-reaper-bound', 'theme');
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
            }, true);
        }

        // 1. Bind via explicit CSS selectors
        document.querySelectorAll(THEME_SELECTORS.join(', ')).forEach(bindButton);

        // 2. Discover buttons containing SVG icons for Sun or Moon
        document.querySelectorAll('button, [role="button"], a.tool, .nav-item').forEach(el => {
            if (boundButtons.has(el)) return;
            const html = el.innerHTML.toLowerCase();
            const text = el.textContent.toLowerCase().trim();
            const isThemeButton = (
                html.includes('sun') || 
                html.includes('moon') || 
                html.includes('7.25') || // SVG circle/path for dark/light in thanzeer-j site
                html.includes('21 12.79') || // Crescent moon path
                text === 'dark' || 
                text === 'light' || 
                text === 'theme' ||
                text === 'dark mode' ||
                text === 'light mode'
            );
            if (isThemeButton) {
                bindButton(el);
            }
        });

        // 3. Bind dropdown theme choices (e.g. Light / Dark / System menu items)
        document.querySelectorAll('[role="menuitem"], .dropdown-item, [data-theme-value]').forEach(item => {
            const txt = (item.getAttribute('data-theme-value') || item.textContent || '').toLowerCase().trim();
            if (txt === 'dark' || txt === 'dark mode') {
                item.addEventListener('click', (e) => { e.preventDefault(); applyTheme('dark'); }, true);
            } else if (txt === 'light' || txt === 'light mode') {
                item.addEventListener('click', (e) => { e.preventDefault(); applyTheme('light'); }, true);
            } else if (txt === 'system') {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    applyTheme(sysDark ? 'dark' : 'light');
                }, true);
            }
        });

        // 4. Keyboard Shortcuts: Alt + T or Ctrl + Shift + D
        window.addEventListener('keydown', (e) => {
            if ((e.altKey && (e.key === 't' || e.key === 'T')) ||
                (e.ctrlKey && e.shiftKey && (e.key === 'd' || e.key === 'D'))) {
                e.preventDefault();
                toggleTheme();
            }
        });

        // 5. If site supports dark mode via CSS but no theme button was found in DOM,
        // provide a floating fallback toggle button
        if (!foundThemeButton) {
            let hasDarkStyles = false;
            try {
                for (const s of document.styleSheets) {
                    try {
                        if (s.cssRules) {
                            for (const r of s.cssRules) {
                                if (r.selectorText && (r.selectorText.includes('.dark') || r.selectorText.includes('data-theme="dark"'))) {
                                    hasDarkStyles = true;
                                    break;
                                }
                            }
                        }
                    } catch(e) {}
                    if (hasDarkStyles) break;
                }
            } catch(e) {}

            if (hasDarkStyles) {
                const floatingBtn = document.createElement('button');
                floatingBtn.id = 'reaper-floating-theme-toggle';
                floatingBtn.setAttribute('aria-label', 'Toggle Dark / Light Theme (Alt+T)');
                floatingBtn.title = 'Toggle Dark / Light Theme (Alt+T)';
                floatingBtn.style.cssText = 'position:fixed;bottom:24px;left:24px;z-index:999999;width:44px;height:44px;border-radius:50%;background:rgba(20,20,28,0.85);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.2);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.3);transition:transform 0.2s ease;';
                floatingBtn.innerHTML = '<span id="reaper-floating-theme-icon"></span>';
                floatingBtn.addEventListener('click', toggleTheme);
                floatingBtn.addEventListener('mouseenter', () => floatingBtn.style.transform = 'scale(1.1)');
                floatingBtn.addEventListener('mouseleave', () => floatingBtn.style.transform = 'scale(1)');
                document.body.appendChild(floatingBtn);
                applyTheme(initialTheme);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDeepAnimations);
    } else {
        initDeepAnimations();
    }
})();
</script>
`;
    }

    /**
     * Inject universal animation styles, theme bootstrapper, and runtime engine into all HTML files in a directory
     */
    static boostDirectory(outputDir) {
        let count = 0;
        const list = fs.readdirSync(outputDir, { withFileTypes: true });
        for (const item of list) {
            const fullPath = path.join(outputDir, item.name);
            if (item.isDirectory() && item.name !== 'node_modules' && item.name !== 'assets') {
                count += this.boostDirectory(fullPath);
            } else if (item.isFile() && item.name.endsWith('.html')) {
                try {
                    let html = fs.readFileSync(fullPath, 'utf8');
                    const $ = cheerio.load(html, { decodeEntities: false });

                    // 1. Remove any outdated reaper scripts/styles so latest engine is always injected
                    $('#reaper-theme-bootstrapper').remove();
                    $('#reaper-animation-styles').remove();
                    $('#reaper-animation-engine').remove();

                    // 2. Prepend Theme Bootstrapper into <head> (Zero-flash theme persistence)
                    if ($('head').length) {
                        $('head').prepend(this.getThemeBootstrapperScript());
                    } else {
                        $.root().prepend(this.getThemeBootstrapperScript());
                    }

                    // 3. Add animation CSS to <head>
                    if ($('head').length) {
                        $('head').append(this.getAnimationCss());
                    } else {
                        $.root().prepend(this.getAnimationCss());
                    }

                    // 4. Add animation & theme script before </body>
                    if ($('body').length) {
                        $('body').append(this.getAnimationScript());
                    } else {
                        $.root().append(this.getAnimationScript());
                    }

                    fs.writeFileSync(fullPath, $.html(), 'utf8');
                    count++;
                } catch {}
            }
        }
        return count;
    }

    /**
     * Chrome Animation Pre-Warming pass:
     * Visits downloaded pages locally in headless browser to auto-scroll and wake up all animations,
     * then extracts and preserves computed animation states and dynamic CSSOM rules.
     */
    static async prewarmWithChrome(outputDir, executablePath, onProgress = () => {}) {
        if (!executablePath) return;
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
                    '--allow-file-access-from-files'
                ],
                defaultViewport: { width: 1440, height: 900 }
            });

            const htmlFiles = [];
            const findHtml = (dir) => {
                const list = fs.readdirSync(dir, { withFileTypes: true });
                for (const item of list) {
                    const full = path.join(dir, item.name);
                    if (item.isDirectory() && item.name !== 'node_modules' && item.name !== 'assets') {
                        findHtml(full);
                    } else if (item.isFile() && item.name.endsWith('.html')) {
                        htmlFiles.push(full);
                    }
                }
            };
            findHtml(outputDir);

            // Prewarm up to 5 main pages
            const pagesToWarm = htmlFiles.slice(0, 5);
            for (let i = 0; i < pagesToWarm.length; i++) {
                const filePath = pagesToWarm[i];
                const rel = path.relative(outputDir, filePath);
                onProgress(`Deep animation pre-warming on ${rel}...`);

                const page = await browser.newPage();
                try {
                    const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');
                    await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 8000 });

                    // Auto-scroll through page to trigger all scroll listeners
                    await page.evaluate(async () => {
                        await new Promise((resolve) => {
                            let totalHeight = 0;
                            const distance = 300;
                            const timer = setInterval(() => {
                                const scrollHeight = document.body.scrollHeight;
                                window.scrollBy(0, distance);
                                totalHeight += distance;
                                window.dispatchEvent(new Event('scroll'));

                                if (totalHeight >= scrollHeight || totalHeight > 10000) {
                                    clearInterval(timer);
                                    window.scrollTo(0, 0);
                                    setTimeout(resolve, 200);
                                }
                            }, 50);
                        });
                    });

                    // Capture dynamic CSS rules from CSSOM
                    const dynamicCss = await page.evaluate(() => {
                        let css = '';
                        for (const sheet of document.styleSheets) {
                            try {
                                if (!sheet.href && sheet.cssRules) {
                                    for (const r of sheet.cssRules) css += r.cssText + '\n';
                                }
                            } catch {}
                        }
                        return css;
                    });

                    // Read HTML and inject dynamic CSS if not present
                    if (dynamicCss && dynamicCss.trim().length > 0) {
                        let currentHtml = fs.readFileSync(filePath, 'utf8');
                        if (!currentHtml.includes('data-reaper-prewarmed-css')) {
                            const injected = `<style data-reaper-prewarmed-css="true">\n${dynamicCss}\n</style>`;
                            if (currentHtml.includes('</head>')) {
                                currentHtml = currentHtml.replace('</head>', `${injected}</head>`);
                            } else {
                                currentHtml = injected + currentHtml;
                            }
                            fs.writeFileSync(filePath, currentHtml, 'utf8');
                        }
                    }
                } catch {} finally {
                    await page.close();
                }
            }
        } catch (err) {
            console.warn('[AnimationBooster] Prewarm skipped:', err.message);
        } finally {
            if (browser) {
                try { await browser.close(); } catch {}
            }
        }
    }
}

module.exports = AnimationBooster;
