// Website Reaper — Frontend Application Controller
// Modern Minimalist Developer Experience

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // Element References
    // ----------------------------------------------------
    const cloneForm = document.getElementById('cloneForm');
    const urlInput = document.getElementById('urlInput');
    const submitBtn = document.getElementById('submitBtn');
    const btnClearUrl = document.getElementById('btnClearUrl');

    // Advanced Engine Settings
    const optionsToggle = document.getElementById('optionsToggle');
    const optionsBody = document.getElementById('optionsBody');
    const optionsSummary = document.getElementById('optionsSummary');
    const optionsChevron = document.getElementById('optionsChevron');

    const engineModeSelect = document.getElementById('engineModeSelect');
    const viewportSelect = document.getElementById('viewportSelect');
    const crawlMode = document.getElementById('crawlMode');
    const maxPagesSelect = document.getElementById('maxPagesSelect');
    const mediaFilterSelect = document.getElementById('mediaFilterSelect');
    const quotaSelect = document.getElementById('quotaSelect');
    const prewarmCheckbox = document.getElementById('prewarmCheckbox');
    const settleDelay = document.getElementById('settleDelay');
    const userAgentSelect = document.getElementById('userAgentSelect');
    const customHeadersInput = document.getElementById('customHeadersInput');

    // Interactive Site Map & Section Selector Elements
    const selectiveModeToggle = document.getElementById('selectiveModeToggle');
    const siteSelectorSection = document.getElementById('siteSelectorSection');
    const scannerLoadingState = document.getElementById('scannerLoadingState');
    const scannerStatusTitle = document.getElementById('scannerStatusTitle');
    const scannerStatusText = document.getElementById('scannerStatusText');
    const scannerContent = document.getElementById('scannerContent');
    const siteScanTitle = document.getElementById('siteScanTitle');
    const siteScanUrl = document.getElementById('siteScanUrl');
    const siteScanBadge = document.getElementById('siteScanBadge');
    const selectorSearchInput = document.getElementById('selectorSearchInput');
    const btnSelectAll = document.getElementById('btnSelectAll');
    const btnDeselectAll = document.getElementById('btnDeselectAll');
    const btnLandingOnly = document.getElementById('btnLandingOnly');
    const selectionSummaryPill = document.getElementById('selectionSummaryPill');
    const pagesTreeList = document.getElementById('pagesTreeList');
    const btnCancelSelection = document.getElementById('btnCancelSelection');
    const btnProceedDownload = document.getElementById('btnProceedDownload');
    const btnProceedText = document.getElementById('btnProceedText');

    // Progress & Terminal
    const progressSection = document.getElementById('progressSection');
    const activeUrlText = document.getElementById('activeUrlText');
    const progressPercent = document.getElementById('progressPercent');
    const progressBarFill = document.getElementById('progressBarFill');
    const terminalLogs = document.getElementById('terminalLogs');

    // Telemetry Stats
    const statPages = document.getElementById('statPages');
    const statCss = document.getElementById('statCss');
    const statJs = document.getElementById('statJs');
    const statImages = document.getElementById('statImages');
    const statFonts = document.getElementById('statFonts');
    const statSize = document.getElementById('statSize');

    // Stepper
    const steps = [
        document.getElementById('step1'),
        document.getElementById('step2'),
        document.getElementById('step3'),
        document.getElementById('step4'),
        document.getElementById('step5')
    ];

    // Result Section
    const resultSection = document.getElementById('resultSection');
    const resultTitle = document.getElementById('resultTitle');
    const resultUrl = document.getElementById('resultUrl');
    const resPagesCount = document.getElementById('resPagesCount');
    const resStylesheets = document.getElementById('resStylesheets');
    const resImages = document.getElementById('resImages');
    const resWebFonts = document.getElementById('resWebFonts');
    const resTotalAssets = document.getElementById('resTotalAssets');
    const resArchiveSize = document.getElementById('resArchiveSize');

    const btnDownload = document.getElementById('btnDownload');
    const btnOpenPreview = document.getElementById('btnOpenPreview');
    const btnNewTab = document.getElementById('btnNewTab');

    // Sandbox Preview
    const previewContainer = document.getElementById('previewContainer');
    const previewFrame = document.getElementById('previewFrame');
    const btnReloadPreview = document.getElementById('btnReloadPreview');
    const btnClosePreview = document.getElementById('btnClosePreview');

    // History & Modals
    const historyGrid = document.getElementById('historyGrid');
    const btnRefreshHistory = document.getElementById('btnRefreshHistory');
    const btnHowToRun = document.getElementById('btnHowToRun');
    const howToRunModal = document.getElementById('howToRunModal');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnGotItModal = document.getElementById('btnGotItModal');

    // Theme Switcher
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIconDark = document.getElementById('themeIconDark');
    const themeIconLight = document.getElementById('themeIconLight');

    // State variables
    let currentEventSource = null;
    let currentPreviewUrl = '';
    let currentCloneId = '';
    let currentScannedData = null;
    let selectedPageUrls = new Set();
    let excludedSectionIds = new Map(); // pageUrl -> Set of excluded section IDs

    // ----------------------------------------------------
    // Theme Mode Controller
    // ----------------------------------------------------
    function initTheme() {
        const savedTheme = localStorage.getItem('reaper-theme') || 'dark';
        applyTheme(savedTheme);
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
            if (themeIconDark) themeIconDark.classList.add('hidden');
            if (themeIconLight) themeIconLight.classList.remove('hidden');
        } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            if (themeIconDark) themeIconDark.classList.remove('hidden');
            if (themeIconLight) themeIconLight.classList.add('hidden');
        }
    }

    function toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';
        localStorage.setItem('reaper-theme', newTheme);
        applyTheme(newTheme);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    window.addEventListener('keydown', (e) => {
        if (e.altKey && e.key.toLowerCase() === 't') {
            toggleTheme();
        }
    });

    initTheme();

    // ----------------------------------------------------
    // Load History & Check Engine Availability
    // ----------------------------------------------------
    loadHistory();

    fetch('/api/engine-status')
        .then(r => r.json())
        .then(data => {
            if (data.isServerless) {
                const badgeText = document.getElementById('engineStatusBadgeText');
                const badgeDot = document.getElementById('engineStatusDot');
                const banner = document.getElementById('serverlessBanner');
                if (badgeText) badgeText.textContent = 'Serverless (Vercel)';
                if (badgeDot) {
                    badgeDot.classList.remove('bg-emerald-500');
                    badgeDot.classList.add('bg-amber-400');
                }
                if (banner) banner.classList.remove('hidden');
            }

            if (engineModeSelect) {
                engineModeSelect.value = 'hybrid';
                if (!data.wgetAvailable) {
                    const wgetOpt = engineModeSelect.querySelector('option[value="wget"]');
                    if (wgetOpt) wgetOpt.text += ' (CLI not detected)';
                }
                updateOptionsSummary();
            }
        })
        .catch(() => {});

    // ----------------------------------------------------
    // Advanced Settings Drawer Accordion
    // ----------------------------------------------------
    if (optionsToggle) {
        optionsToggle.addEventListener('click', () => {
            const isHidden = optionsBody.classList.contains('hidden');
            if (isHidden) {
                optionsBody.classList.remove('hidden');
                optionsChevron.classList.add('rotate-180');
            } else {
                optionsBody.classList.add('hidden');
                optionsChevron.classList.remove('rotate-180');
            }
            updateOptionsSummary();
        });
    }

    const optionInputs = [
        engineModeSelect, viewportSelect, crawlMode, maxPagesSelect,
        mediaFilterSelect, quotaSelect, prewarmCheckbox, settleDelay, userAgentSelect
    ].filter(Boolean);

    optionInputs.forEach(el => {
        el.addEventListener('change', updateOptionsSummary);
    });

    function updateOptionsSummary() {
        if (!optionsSummary) return;
        let eng = 'Unified Hybrid';
        if (engineModeSelect && engineModeSelect.value === 'wget') eng = 'Wget Turbo';
        else if (engineModeSelect && engineModeSelect.value === 'puppeteer') eng = 'Puppeteer';

        const crawl = crawlMode && crawlMode.value === 'true' ? `Entire Site (${maxPagesSelect.value}p)` : 'Single Page';
        const vp = viewportSelect ? viewportSelect.options[viewportSelect.selectedIndex].text.split('(')[0].trim() : 'Desktop';
        const media = mediaFilterSelect ? (mediaFilterSelect.value === 'all' ? 'All Media' : mediaFilterSelect.value === 'web-only' ? 'Web Only' : 'Lean') : 'All Media';
        const q = quotaSelect ? quotaSelect.value.toUpperCase() : '500M';

        optionsSummary.textContent = `(${eng} • ${crawl} • ${vp} • ${media} • ${q})`;
    }

    // Clear URL input
    if (btnClearUrl) {
        btnClearUrl.addEventListener('click', () => {
            urlInput.value = '';
            urlInput.focus();
        });
    }

    // Quick Sample Chips
    document.querySelectorAll('.sample-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            urlInput.value = chip.dataset.url;
            urlInput.focus();
        });
    });

    // ----------------------------------------------------
    // How to Run Modal Handlers
    // ----------------------------------------------------
    if (btnHowToRun && howToRunModal) {
        btnHowToRun.addEventListener('click', () => howToRunModal.classList.remove('hidden'));
        if (btnCloseModal) btnCloseModal.addEventListener('click', () => howToRunModal.classList.add('hidden'));
        if (btnGotItModal) btnGotItModal.addEventListener('click', () => howToRunModal.classList.add('hidden'));
        howToRunModal.addEventListener('click', (e) => {
            if (e.target === howToRunModal) howToRunModal.classList.add('hidden');
        });
    }

    // ----------------------------------------------------
    // Form Submit: Selective Scan vs Direct Reap
    // ----------------------------------------------------
    cloneForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        let rawUrl = urlInput.value.trim();
        if (!rawUrl) return;

        if (!/^https?:\/\//i.test(rawUrl)) {
            rawUrl = 'https://' + rawUrl;
            urlInput.value = rawUrl;
        }

        // Close prior SSE connection if any
        if (currentEventSource) {
            currentEventSource.close();
            currentEventSource = null;
        }

        const isSelective = selectiveModeToggle ? selectiveModeToggle.checked : true;
        if (isSelective) {
            await scanWebsiteStructure(rawUrl);
        } else {
            const payload = buildClonePayload(rawUrl);
            await startCloneJob(payload);
        }
    });

    function buildClonePayload(rawUrl, selectedPages = null, pageSectionFilters = null) {
        return {
            url: rawUrl,
            engineMode: engineModeSelect ? engineModeSelect.value : 'hybrid',
            viewport: viewportSelect ? viewportSelect.value : 'desktop',
            deepCrawl: crawlMode ? crawlMode.value === 'true' : true,
            maxPages: maxPagesSelect ? parseInt(maxPagesSelect.value, 10) : 20,
            mediaFilter: mediaFilterSelect ? mediaFilterSelect.value : 'all',
            quota: quotaSelect ? quotaSelect.value : '500m',
            prewarm: prewarmCheckbox ? prewarmCheckbox.checked : true,
            delay: settleDelay ? parseInt(settleDelay.value, 10) : 2500,
            userAgentPreset: userAgentSelect ? userAgentSelect.value : 'desktop-win',
            customHeaders: customHeadersInput ? customHeadersInput.value.trim() : '',
            selectedPages,
            pageSectionFilters
        };
    }

    /**
     * Phase 1: Interactive Site Architecture & Section Scanning
     */
    async function scanWebsiteStructure(rawUrl) {
        setLoadingState(true);
        if (siteSelectorSection) {
            siteSelectorSection.classList.remove('hidden');
            if (scannerLoadingState) scannerLoadingState.classList.remove('hidden');
            if (scannerContent) scannerContent.classList.add('hidden');
            siteSelectorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (progressSection) progressSection.classList.add('hidden');
        if (resultSection) resultSection.classList.add('hidden');
        if (previewContainer) previewContainer.classList.add('hidden');

        try {
            const scanResponse = await fetch('/api/scan-site', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: rawUrl,
                    maxPages: maxPagesSelect ? parseInt(maxPagesSelect.value, 10) : 20,
                    userAgentPreset: userAgentSelect ? userAgentSelect.value : 'desktop-win'
                })
            });

            const data = await scanResponse.json();
            if (!scanResponse.ok || !data.success) {
                throw new Error(data.error || 'Failed to scan website structure');
            }

            currentScannedData = data;
            renderSiteArchitectureTree(data);

            if (scannerLoadingState) scannerLoadingState.classList.add('hidden');
            if (scannerContent) scannerContent.classList.remove('hidden');
            setLoadingState(false);
        } catch (err) {
            setLoadingState(false);
            if (siteSelectorSection) siteSelectorSection.classList.add('hidden');
            alert(`Unable to map website structure: ${err.message}. You can uncheck "Inspect & Select" to run a direct full-site clone.`);
        }
    }

    /**
     * Render the visual pages and inner sections hierarchy
     */
    function renderSiteArchitectureTree(data) {
        if (!pagesTreeList) return;

        if (siteScanTitle) siteScanTitle.textContent = data.siteTitle || data.domain;
        if (siteScanUrl) siteScanUrl.textContent = data.url;
        if (siteScanBadge) siteScanBadge.textContent = `${data.totalPages} Pages • ${data.totalSections} Sections`;

        selectedPageUrls.clear();
        excludedSectionIds.clear();

        data.pages.forEach(p => {
            selectedPageUrls.add(p.url);
            excludedSectionIds.set(p.url, new Set());
        });

        pagesTreeList.innerHTML = '';

        data.pages.forEach((page, pIdx) => {
            const pageCard = document.createElement('div');
            pageCard.className = 'page-card-node p-3.5 space-y-2.5 transition-all';
            pageCard.dataset.pageUrl = page.url;
            pageCard.dataset.pagePath = page.path;

            const sectionsCount = page.sections ? page.sections.length : 0;

            // Page Header Bar
            const headerRow = document.createElement('div');
            headerRow.className = 'flex items-center justify-between gap-3 select-none';
            headerRow.innerHTML = `
                <div class="flex items-center gap-2.5 min-w-0">
                    <input 
                        type="checkbox" 
                        class="page-checkbox rounded bg-black/40 border-white/20 text-blue-500 focus:ring-0 cursor-pointer h-4 w-4" 
                        data-page-url="${page.url}" 
                        checked
                    />
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="font-medium text-xs text-white truncate">${escapeHtml(page.title || page.path)}</span>
                            ${page.isHome ? '<span class="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">Landing</span>' : ''}
                        </div>
                        <div class="text-[11px] text-zinc-500 font-mono truncate">${escapeHtml(page.path)}</div>
                    </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                    <span class="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-400 font-mono">
                        ${sectionsCount} ${sectionsCount === 1 ? 'Section' : 'Sections'}
                    </span>
                    <button type="button" class="btn-toggle-drawer p-1 rounded hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-transform duration-200">
                        <svg class="chevron-icon transform transition-transform" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>
            `;

            // Sections Container Drawer
            const sectionsDrawer = document.createElement('div');
            sectionsDrawer.className = 'sections-drawer pt-2 border-t border-white/[0.06] space-y-1.5';

            if (page.sections && page.sections.length > 0) {
                page.sections.forEach((sec, sIdx) => {
                    const secRow = document.createElement('div');
                    secRow.className = 'section-item-row flex items-start gap-2.5 text-xs';
                    secRow.dataset.secId = sec.id;
                    secRow.dataset.pageUrl = page.url;

                    secRow.innerHTML = `
                        <input 
                            type="checkbox" 
                            class="section-checkbox rounded bg-black/40 border-white/20 text-blue-500 focus:ring-0 cursor-pointer h-3.5 w-3.5 mt-0.5 shrink-0" 
                            data-page-url="${page.url}" 
                            data-sec-id="${sec.id}"
                            data-sec-selector="${escapeHtml(sec.selector)}"
                            data-sec-heading="${escapeHtml(sec.heading || '')}"
                            checked
                        />
                        <div class="flex-1 min-w-0 space-y-0.5">
                            <div class="flex flex-wrap items-center gap-1.5">
                                <span class="section-tag-badge ${sec.tag}">${sec.tag}</span>
                                <span class="font-medium text-zinc-200 truncate">${escapeHtml(sec.name)}</span>
                                ${sec.selector ? `<span class="text-[10px] text-zinc-500 font-mono">(${escapeHtml(sec.selector)})</span>` : ''}
                            </div>
                            <p class="text-[11px] text-zinc-400 line-clamp-1 font-normal">${escapeHtml(sec.preview || '')}</p>
                        </div>
                    `;

                    // Checkbox change inside section
                    const secCheck = secRow.querySelector('.section-checkbox');
                    secCheck.addEventListener('change', () => {
                        const excludedSet = excludedSectionIds.get(page.url);
                        if (secCheck.checked) {
                            excludedSet.delete(sec.id);
                            secRow.classList.remove('is-excluded');
                        } else {
                            excludedSet.add(sec.id);
                            secRow.classList.add('is-excluded');
                        }

                        // Synchronize parent page checkbox
                        const pageCheck = headerRow.querySelector('.page-checkbox');
                        const totalSecs = page.sections.length;
                        const excludedCount = excludedSet.size;

                        if (excludedCount === totalSecs) {
                            pageCheck.checked = false;
                            selectedPageUrls.delete(page.url);
                        } else {
                            pageCheck.checked = true;
                            selectedPageUrls.add(page.url);
                        }
                        updateSelectionSummary();
                    });

                    sectionsDrawer.appendChild(secRow);
                });
            } else {
                sectionsDrawer.innerHTML = '<div class="text-[11px] text-zinc-500 italic p-1">No individual inner section tags detected (full page will be captured).</div>';
            }

            // Event listener for parent page checkbox
            const pageCheck = headerRow.querySelector('.page-checkbox');
            pageCheck.addEventListener('change', () => {
                const isChecked = pageCheck.checked;
                const excludedSet = excludedSectionIds.get(page.url);

                if (isChecked) {
                    selectedPageUrls.add(page.url);
                    excludedSet.clear();
                } else {
                    selectedPageUrls.delete(page.url);
                    if (page.sections) {
                        page.sections.forEach(s => excludedSet.add(s.id));
                    }
                }

                // Update all inner section checkboxes visually
                sectionsDrawer.querySelectorAll('.section-checkbox').forEach(cb => {
                    cb.checked = isChecked;
                });
                sectionsDrawer.querySelectorAll('.section-item-row').forEach(row => {
                    if (isChecked) row.classList.remove('is-excluded');
                    else row.classList.add('is-excluded');
                });

                updateSelectionSummary();
            });

            // Chevron toggle drawer
            const btnToggle = headerRow.querySelector('.btn-toggle-drawer');
            const chevron = headerRow.querySelector('.chevron-icon');
            btnToggle.addEventListener('click', () => {
                const isHidden = sectionsDrawer.classList.contains('hidden');
                if (isHidden) {
                    sectionsDrawer.classList.remove('hidden');
                    chevron.classList.remove('rotate-180');
                } else {
                    sectionsDrawer.classList.add('hidden');
                    chevron.classList.add('rotate-180');
                }
            });

            pageCard.appendChild(headerRow);
            pageCard.appendChild(sectionsDrawer);
            pagesTreeList.appendChild(pageCard);
        });

        updateSelectionSummary();
        bindBatchActionButtons();
    }

    function updateSelectionSummary() {
        if (!currentScannedData || !currentScannedData.pages) return;

        let totalSelectedPages = selectedPageUrls.size;
        let totalSelectedSections = 0;

        currentScannedData.pages.forEach(p => {
            if (selectedPageUrls.has(p.url)) {
                const totalInPage = p.sections ? p.sections.length : 1;
                const excludedSet = excludedSectionIds.get(p.url) || new Set();
                const active = Math.max(0, totalInPage - excludedSet.size);
                totalSelectedSections += active;
            }
        });

        if (selectionSummaryPill) {
            selectionSummaryPill.textContent = `${totalSelectedPages} Pages • ${totalSelectedSections} Sections`;
        }
        if (btnProceedText) {
            btnProceedText.textContent = `Download Selected (${totalSelectedPages} Pages, ${totalSelectedSections} Sections)`;
        }
    }

    function bindBatchActionButtons() {
        if (btnSelectAll) {
            btnSelectAll.onclick = () => {
                if (!currentScannedData) return;
                currentScannedData.pages.forEach(p => {
                    selectedPageUrls.add(p.url);
                    const exc = excludedSectionIds.get(p.url);
                    if (exc) exc.clear();
                });
                document.querySelectorAll('#pagesTreeList .page-checkbox, #pagesTreeList .section-checkbox').forEach(cb => {
                    cb.checked = true;
                });
                document.querySelectorAll('#pagesTreeList .section-item-row').forEach(r => {
                    r.classList.remove('is-excluded');
                });
                updateSelectionSummary();
            };
        }

        if (btnDeselectAll) {
            btnDeselectAll.onclick = () => {
                if (!currentScannedData) return;
                selectedPageUrls.clear();
                currentScannedData.pages.forEach(p => {
                    const exc = excludedSectionIds.get(p.url);
                    if (exc && p.sections) {
                        p.sections.forEach(s => exc.add(s.id));
                    }
                });
                document.querySelectorAll('#pagesTreeList .page-checkbox, #pagesTreeList .section-checkbox').forEach(cb => {
                    cb.checked = false;
                });
                document.querySelectorAll('#pagesTreeList .section-item-row').forEach(r => {
                    r.classList.add('is-excluded');
                });
                updateSelectionSummary();
            };
        }

        if (btnLandingOnly) {
            btnLandingOnly.onclick = () => {
                if (!currentScannedData) return;
                selectedPageUrls.clear();
                currentScannedData.pages.forEach(p => {
                    const exc = excludedSectionIds.get(p.url);
                    if (p.isHome) {
                        selectedPageUrls.add(p.url);
                        if (exc) exc.clear();
                    } else {
                        if (exc && p.sections) {
                            p.sections.forEach(s => exc.add(s.id));
                        }
                    }
                });
                document.querySelectorAll('#pagesTreeList .page-card-node').forEach(card => {
                    const isHome = card.querySelector('.page-checkbox').dataset.pageUrl === currentScannedData.url;
                    const pageCb = card.querySelector('.page-checkbox');
                    pageCb.checked = isHome;
                    card.querySelectorAll('.section-checkbox').forEach(sc => sc.checked = isHome);
                    card.querySelectorAll('.section-item-row').forEach(r => {
                        if (isHome) r.classList.remove('is-excluded');
                        else r.classList.add('is-excluded');
                    });
                });
                updateSelectionSummary();
            };
        }

        if (selectorSearchInput) {
            selectorSearchInput.oninput = (e) => {
                const query = e.target.value.toLowerCase().trim();
                document.querySelectorAll('#pagesTreeList .page-card-node').forEach(card => {
                    const pageTitle = (card.querySelector('.page-checkbox').parentElement.textContent || '').toLowerCase();
                    const sectionRows = card.querySelectorAll('.section-item-row');
                    let anySectionMatches = false;

                    sectionRows.forEach(row => {
                        const rowText = (row.textContent || '').toLowerCase();
                        if (!query || rowText.includes(query) || pageTitle.includes(query)) {
                            row.classList.remove('hidden');
                            anySectionMatches = true;
                        } else {
                            row.classList.add('hidden');
                        }
                    });

                    if (!query || anySectionMatches || pageTitle.includes(query)) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                });
            };
        }

        if (btnCancelSelection) {
            btnCancelSelection.onclick = () => {
                if (siteSelectorSection) siteSelectorSection.classList.add('hidden');
                if (urlInput) urlInput.focus();
            };
        }

        if (btnProceedDownload) {
            btnProceedDownload.onclick = async () => {
                if (selectedPageUrls.size === 0) {
                    alert('Please select at least 1 page or section to download.');
                    return;
                }

                // Compile selected pages array
                const selectedPages = Array.from(selectedPageUrls);

                // Compile section pruning filters
                const pageSectionFilters = {};
                currentScannedData.pages.forEach(p => {
                    const excludedSet = excludedSectionIds.get(p.url);
                    if (excludedSet && excludedSet.size > 0 && p.sections) {
                        const excludedSelectors = [];
                        const excludedHeadings = [];

                        p.sections.forEach(s => {
                            if (excludedSet.has(s.id)) {
                                if (s.selector) excludedSelectors.push(s.selector);
                                if (s.heading) excludedHeadings.push(s.heading);
                            }
                        });

                        const filterObj = { excludedSelectors, excludedHeadings };
                        pageSectionFilters[p.path] = filterObj;
                        pageSectionFilters[p.url] = filterObj;
                    }
                });

                if (siteSelectorSection) siteSelectorSection.classList.add('hidden');

                const rawUrl = urlInput.value.trim();
                const payload = buildClonePayload(rawUrl, selectedPages, pageSectionFilters);
                await startCloneJob(payload);
            };
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Start the execution of the cloning job with SSE streaming
     */
    async function startCloneJob(payload) {
        setLoadingState(true);
        resetProgressUI(payload.url);

        try {
            const response = await fetch('/api/clone', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to initialize clone job');
            }

            currentCloneId = data.id;
            connectJobStream(data.id);
        } catch (err) {
            setLoadingState(false);
            appendLog('error', err.message);
            alert(`Error initializing clone: ${err.message}`);
        }
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="animate-spin-fast" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"></path>
                </svg>
                <span class="btn-text">Reaping Website...</span>
            `;
            submitBtn.classList.add('opacity-75');
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <span class="btn-text">Reap Website</span>
                <svg class="btn-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            `;
            submitBtn.classList.remove('opacity-75');
        }
    }

    function resetProgressUI(url) {
        progressSection.classList.remove('hidden');
        resultSection.classList.add('hidden');
        previewContainer.classList.add('hidden');

        activeUrlText.textContent = `Reaping: ${url}`;
        progressPercent.textContent = '5%';
        progressBarFill.style.width = '5%';
        terminalLogs.innerHTML = '';

        statPages.textContent = '1';
        statCss.textContent = '0';
        statJs.textContent = '0';
        statImages.textContent = '0';
        statFonts.textContent = '0';
        statSize.textContent = '0 KB';

        updateStepper(0, 5);
        progressSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function connectJobStream(jobId) {
        currentEventSource = new EventSource(`/api/clone/${jobId}/stream`);

        currentEventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleStreamEvent(data);
            } catch (err) {
                console.error('Failed to parse SSE payload:', err);
            }
        };

        currentEventSource.onerror = () => {
            if (currentEventSource) {
                currentEventSource.close();
                currentEventSource = null;
            }
            setLoadingState(false);
        };
    }

    function handleStreamEvent(data) {
        const { stage, message, stats, result } = data;

        if (message) {
            appendLog(stage, message);
        }

        if (data.filesCount) {
            statPages.textContent = data.filesCount;
        } else if (data.pagesCrawled) {
            statPages.textContent = data.pagesCrawled;
        }

        if (stats) {
            if (stats.css !== undefined) statCss.textContent = stats.css;
            if (stats.js !== undefined) statJs.textContent = stats.js;
            if (stats.images !== undefined) statImages.textContent = stats.images;
            if (stats.fonts !== undefined) statFonts.textContent = stats.fonts;
            if (stats.totalBytes !== undefined) {
                const kb = (stats.totalBytes / 1024);
                statSize.textContent = kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(0)} KB`;
            }
        }

        // Stepper updates
        switch (stage) {
            case 'init':
                updateStepper(0, 15);
                break;
            case 'network':
            case 'crawling':
            case 'navigation':
                updateStepper(1, 40);
                break;
            case 'rendering':
            case 'scrolling':
            case 'delay':
            case 'crawled_all':
                updateStepper(2, 65);
                break;
            case 'processing':
            case 'dom':
            case 'asset':
            case 'dom_saved':
                updateStepper(3, 85);
                break;
            case 'launchers':
            case 'zipping':
                updateStepper(4, 95);
                break;
            case 'done':
            case 'complete':
                updateStepper(4, 100);
                if (result) {
                    showCompletion(result);
                }
                break;
            case 'error':
                appendLog('error', `ABORT: ${message}`);
                progressBarFill.style.background = '#ef4444';
                setLoadingState(false);
                break;
        }
    }

    function updateStepper(stepIndex, percent) {
        progressBarFill.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;

        steps.forEach((step, idx) => {
            if (!step) return;
            const circle = step.querySelector('.stepper-circle');
            if (idx < stepIndex) {
                step.className = 'stepper-item completed';
                if (circle) circle.innerHTML = '✓';
            } else if (idx === stepIndex) {
                step.className = 'stepper-item active';
                if (circle) circle.innerHTML = `${idx + 1}`;
            } else {
                step.className = 'stepper-item';
                if (circle) circle.innerHTML = `${idx + 1}`;
            }
        });
    }

    function appendLog(stage, message) {
        const line = document.createElement('div');
        line.className = 'flex items-start gap-2 py-0.5 font-mono text-[11px] leading-relaxed';

        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

        let tagColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        if (stage === 'crawling' || stage === 'network') tagColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
        else if (stage === 'rendering') tagColor = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
        else if (stage === 'processing') tagColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
        else if (stage === 'done') tagColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        else if (stage === 'error') tagColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';

        line.innerHTML = `
            <span class="text-zinc-600 select-none">${timeStr}</span>
            <span class="px-1.5 py-0.2 rounded border uppercase font-semibold text-[9px] shrink-0 ${tagColor}">${stage || 'log'}</span>
            <span class="text-zinc-300 break-all">${escapeHtml(message)}</span>
        `;

        terminalLogs.appendChild(line);
        terminalLogs.scrollTop = terminalLogs.scrollHeight;
    }

    function showCompletion(result) {
        setLoadingState(false);

        resultTitle.textContent = result.title || result.url;
        resultUrl.textContent = result.url;
        resultUrl.href = result.url;

        resPagesCount.textContent = result.pagesCount || '1';
        resTotalAssets.textContent = result.stats ? result.stats.totalAssets : '0';
        resStylesheets.textContent = result.stats ? result.stats.css : '0';
        resWebFonts.textContent = result.stats ? result.stats.fonts : '0';
        resImages.textContent = result.stats ? result.stats.images : '0';

        const mb = (result.zipSize / (1024 * 1024)).toFixed(2);
        resArchiveSize.textContent = `${mb} MB`;

        btnDownload.href = result.downloadUrl;
        currentPreviewUrl = result.previewUrl;
        btnNewTab.href = currentPreviewUrl;

        window.selectLauncher('win');

        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        loadHistory();
    }

    // ----------------------------------------------------
    // Embedded Launcher Switcher & Copy Command
    // ----------------------------------------------------
    window.selectLauncher = function(type) {
        const cmdEl = document.getElementById('launcher-cmd-text');
        const cmds = {
            win: 'run.bat',
            mac: 'chmod +x run.sh && ./run.sh',
            node: 'node server.js'
        };

        if (cmdEl) cmdEl.textContent = cmds[type] || 'run.bat';

        ['win', 'mac', 'node'].forEach(t => {
            const btn = document.getElementById('tab-' + t);
            if (btn) {
                if (t === type) {
                    btn.className = 'px-2.5 py-1 rounded bg-white/10 text-white font-medium';
                } else {
                    btn.className = 'px-2.5 py-1 rounded text-zinc-400 hover:text-white';
                }
            }
        });
    };

    window.copyLauncherCommand = function() {
        const cmdEl = document.getElementById('launcher-cmd-text');
        if (!cmdEl) return;
        navigator.clipboard.writeText(cmdEl.textContent);

        const copyLabel = document.getElementById('copy-label');
        if (copyLabel) copyLabel.textContent = 'Copied!';

        setTimeout(() => {
            if (copyLabel) copyLabel.textContent = 'Copy';
        }, 2000);
    };

    // ----------------------------------------------------
    // Live Preview Sandbox Handlers
    // ----------------------------------------------------
    btnOpenPreview.addEventListener('click', () => {
        if (!currentPreviewUrl) return;
        previewFrame.src = currentPreviewUrl;
        previewContainer.classList.remove('hidden');
        previewContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    btnReloadPreview.addEventListener('click', () => {
        if (previewFrame.src) {
            previewFrame.src = previewFrame.src;
        }
    });

    btnClosePreview.addEventListener('click', () => {
        previewContainer.classList.add('hidden');
        previewFrame.src = 'about:blank';
    });

    window.setPreviewWidth = function(width) {
        const canvasContainer = document.getElementById('preview-canvas-container');
        if (canvasContainer) {
            canvasContainer.style.maxWidth = width;
        }

        const buttons = [
            { id: 'vp-desktop', val: '100%' },
            { id: 'vp-tablet', val: '768px' },
            { id: 'vp-mobile', val: '375px' }
        ];

        buttons.forEach(btn => {
            const el = document.getElementById(btn.id);
            if (el) {
                if (btn.val === width) {
                    el.className = 'px-2 py-0.5 rounded bg-white/10 text-white font-medium';
                } else {
                    el.className = 'px-2 py-0.5 rounded text-zinc-400 hover:text-white';
                }
            }
        });
    };

    // ----------------------------------------------------
    // History Library
    // ----------------------------------------------------
    async function loadHistory() {
        try {
            const res = await fetch('/api/clones');
            const items = await res.json();
            renderHistory(items);
        } catch (err) {
            console.error('Failed to load history:', err);
        }
    }

    if (btnRefreshHistory) {
        btnRefreshHistory.addEventListener('click', loadHistory);
    }

    function renderHistory(items) {
        if (!historyGrid) return;

        if (!items || items.length === 0) {
            historyGrid.innerHTML = `
                <div class="surface-card p-8 text-center col-span-full">
                    <p class="text-zinc-500 text-xs">No recent clones found. Enter a website URL above to clone your first site!</p>
                </div>
            `;
            return;
        }

        historyGrid.innerHTML = items.map((item) => {
            const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently';
            const sizeMb = (item.zipSize / (1024 * 1024)).toFixed(2);
            const totalAssets = item.stats ? item.stats.totalAssets : 0;

            return `
                <div class="surface-card p-3.5 flex flex-col justify-between space-y-3">
                    <div>
                        <div class="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-1">
                            <span class="text-emerald-400 font-medium">Ready</span>
                            <span>${dateStr}</span>
                        </div>
                        <h4 class="text-xs font-semibold text-white truncate" title="${escapeHtml(item.title || item.url)}">
                            ${escapeHtml(item.title || 'Cloned Website')}
                        </h4>
                        <a href="${item.url}" target="_blank" rel="noopener" class="text-[11px] text-zinc-500 hover:text-zinc-300 truncate block mt-0.5" title="${item.url}">
                            ${escapeHtml(item.url)}
                        </a>
                        <div class="text-[11px] text-zinc-400 font-mono mt-2 flex items-center gap-2">
                            <span>${sizeMb} MB</span>
                            <span>•</span>
                            <span>${item.pagesCount || 1} pages</span>
                            <span>•</span>
                            <span>${totalAssets} assets</span>
                        </div>
                    </div>

                    <div class="flex items-center gap-1.5 pt-2 border-t border-white/[0.06]">
                        <button class="btn-secondary-action py-1 px-2.5 text-xs flex-1 btn-history-preview" data-preview="${item.previewUrl}">
                            Preview
                        </button>
                        <a href="${item.downloadUrl}" class="btn-ghost-action py-1 px-2 text-xs text-white" title="Download ZIP">
                            ZIP
                        </a>
                        <button class="btn-ghost-action py-1 px-2 text-xs text-zinc-500 hover:text-rose-400 btn-history-delete" data-id="${item.id}" title="Delete clone">
                            ✕
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Wire history preview buttons
        document.querySelectorAll('.btn-history-preview').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.dataset.preview;
                currentPreviewUrl = url;
                previewFrame.src = url;
                previewContainer.classList.remove('hidden');
                btnNewTab.href = url;
                previewContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });

        // Wire history delete buttons
        document.querySelectorAll('.btn-history-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if (confirm('Delete this clone archive from history?')) {
                    await fetch(`/api/clones/${id}`, { method: 'DELETE' });
                    loadHistory();
                }
            });
        });
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
