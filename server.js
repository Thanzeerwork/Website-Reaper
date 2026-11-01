const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const ClonerEngine = require('./cloner/engine');
const WgetCrawler = require('./cloner/wgetCrawler');
const HybridCloner = require('./cloner/hybridCloner');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Storage directories
const STORAGE_DIR = path.join(__dirname, 'storage');
const CLONES_DIR = path.join(STORAGE_DIR, 'clones');
const ZIPS_DIR = path.join(STORAGE_DIR, 'zips');
const DB_FILE = path.join(STORAGE_DIR, 'history.json');

[STORAGE_DIR, CLONES_DIR, ZIPS_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Database helpers for persistent history
function loadHistory() {
    try {
        if (fs.existsSync(DB_FILE)) {
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        }
    } catch {}
    return [];
}

function saveHistory(history) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(history, null, 2), 'utf8');
    } catch {}
}

// Active jobs and SSE subscribers in-memory
const activeJobs = new Map(); // id -> { id, url, status, logs: [], sseClients: [], result: null }

/**
 * Check which cloning engines are available on the host system
 */
app.get('/api/engine-status', (req, res) => {
    res.json({
        wgetAvailable: WgetCrawler.isAvailable(),
        defaultEngine: 'hybrid'
    });
});

/**
 * Start a new cloning job
 */
app.post('/api/clone', async (req, res) => {
    let {
        url,
        engineMode = 'hybrid',
        viewport = 'desktop',
        deepScroll = true,
        deepCrawl = true,
        maxPages = 20,
        maxDepth = 3,
        delay = 2500,
        mediaFilter = 'all',
        quota = '500m',
        userAgentPreset = 'desktop-win',
        customUserAgent = '',
        prewarm = true,
        customHeaders = ''
    } = req.body;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
    }

    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    try {
        new URL(url);
    } catch {
        return res.status(400).json({ error: 'Invalid URL provided' });
    }

    // Viewport presets
    const viewports = {
        desktop: { width: 1920, height: 1080 },
        laptop: { width: 1440, height: 900 },
        tablet: { width: 768, height: 1024 },
        mobile: { width: 375, height: 812 }
    };
    const selectedViewport = viewports[viewport] || viewports.desktop;

    // User-Agent presets
    const USER_AGENTS = {
        'desktop-win': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'mac-safari': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
        'googlebot': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'mobile-android': 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36'
    };
    const resolvedUserAgent = (customUserAgent && customUserAgent.trim()) ? customUserAgent.trim() : (USER_AGENTS[userAgentPreset] || USER_AGENTS['desktop-win']);

    const id = 'clone_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex');
    const outputDir = path.join(CLONES_DIR, id);
    const zipPath = path.join(ZIPS_DIR, `${id}.zip`);

    const job = {
        id,
        url,
        engineMode,
        status: 'cloning',
        createdAt: new Date().toISOString(),
        logs: [],
        sseClients: [],
        result: null,
        error: null
    };

    activeJobs.set(id, job);

    // Broadcast log helper
    const broadcastEvent = (eventData) => {
        job.logs.push(eventData);
        const payload = `data: ${JSON.stringify(eventData)}\n\n`;
        job.sseClients.forEach((client) => {
            try {
                client.write(payload);
            } catch {}
        });
    };

    // Run async in background
    (async () => {
        try {
            let result = null;

            // Choose engine: Unified Ultra Hybrid, Wget Turbo Mirror, or Puppeteer Headless Browser
            if (engineMode === 'hybrid' || !engineMode) {
                const hybrid = new HybridCloner({
                    viewportWidth: selectedViewport.width,
                    viewportHeight: selectedViewport.height,
                    deepScroll: Boolean(deepScroll),
                    deepCrawl: Boolean(deepCrawl),
                    maxPages: Math.min(parseInt(maxPages, 10) || 30, 100),
                    maxDepth: parseInt(maxDepth, 10) || 3,
                    quota,
                    mediaFilter,
                    prewarm: Boolean(prewarm),
                    settleDelay: parseInt(delay, 10) || 2500,
                    userAgent: resolvedUserAgent,
                    customHeaders
                });
                result = await hybrid.cloneWebsite(url, outputDir, zipPath, (progressEvent) => {
                    broadcastEvent(progressEvent);
                });
            } else if (engineMode === 'wget' && WgetCrawler.isAvailable()) {
                const crawler = new WgetCrawler({
                    maxDepth: deepCrawl ? parseInt(maxDepth, 10) || 3 : 1,
                    quota,
                    mediaFilter,
                    userAgent: resolvedUserAgent,
                    customHeaders
                });
                result = await crawler.cloneWebsite(url, outputDir, zipPath, (progressEvent) => {
                    broadcastEvent(progressEvent);
                });
            } else {
                const engine = new ClonerEngine({
                    viewportWidth: selectedViewport.width,
                    viewportHeight: selectedViewport.height,
                    deepScroll: Boolean(deepScroll),
                    deepCrawl: Boolean(deepCrawl),
                    maxPages: Math.min(parseInt(maxPages, 10) || 20, 100),
                    maxDepth: parseInt(maxDepth, 10) || 3,
                    postLoadDelay: parseInt(delay, 10) || 2500,
                    userAgent: resolvedUserAgent
                });

                result = await engine.cloneWebsite(url, outputDir, zipPath, (progressEvent) => {
                    broadcastEvent(progressEvent);
                });
            }

            job.status = 'completed';
            job.result = {
                id,
                title: result.title,
                url: result.url,
                pagesCount: result.pagesCount || 1,
                zipSize: result.zipSize,
                stats: result.stats,
                downloadUrl: `/api/clone/${id}/download`,
                previewUrl: `/preview/${id}/index.html`,
                createdAt: job.createdAt
            };

            // Save to persistent history
            const history = loadHistory();
            history.unshift(job.result);
            // Keep last 30
            if (history.length > 30) history.pop();
            saveHistory(history);

            broadcastEvent({
                stage: 'done',
                message: 'All tasks finished! Ready for download and preview.',
                result: job.result
            });
        } catch (err) {
            console.error(`[Clone ${id}] Error:`, err);
            job.status = 'error';
            job.error = err.message || 'Cloning failed';
            broadcastEvent({
                stage: 'error',
                message: `Failed: ${job.error}`
            });
        }
    })();

    res.json({
        success: true,
        id,
        url
    });
});

/**
 * REST status endpoint for job checking
 */
app.get('/api/clone/:id/status', (req, res) => {
    const { id } = req.params;
    const job = activeJobs.get(id);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
        id: job.id,
        url: job.url,
        status: job.status,
        result: job.result,
        error: job.error,
        logs: job.logs
    });
});

/**
 * SSE stream for real-time progress
 */
app.get('/api/clone/:id/stream', (req, res) => {
    const { id } = req.params;
    const job = activeJobs.get(id);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    res.write('\n');

    // Send buffered previous logs
    job.logs.forEach((log) => {
        res.write(`data: ${JSON.stringify(log)}\n\n`);
    });

    if (job.status === 'completed') {
        res.write(`data: ${JSON.stringify({ stage: 'done', result: job.result })}\n\n`);
        return res.end();
    } else if (job.status === 'error') {
        res.write(`data: ${JSON.stringify({ stage: 'error', message: job.error })}\n\n`);
        return res.end();
    }

    job.sseClients.push(res);

    req.on('close', () => {
        job.sseClients = job.sseClients.filter((client) => client !== res);
    });
});

/**
 * Download the packaged zip
 */
app.get('/api/clone/:id/download', (req, res) => {
    const { id } = req.params;
    const zipPath = path.join(ZIPS_DIR, `${id}.zip`);

    if (!fs.existsSync(zipPath)) {
        return res.status(404).send('Clone package not found or still processing.');
    }

    // Attempt to get friendly filename from title or host
    const history = loadHistory();
    const item = history.find((h) => h.id === id);
    let downloadFilename = 'website-clone.zip';

    if (item && item.url) {
        try {
            const host = new URL(item.url).hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
            downloadFilename = `${host}_clone.zip`;
        } catch {}
    }

    res.download(zipPath, downloadFilename);
});

/**
 * Live preview of cloned site inside the app
 */
app.use('/preview/:id', (req, res, next) => {
    const { id } = req.params;
    const cloneDir = path.join(CLONES_DIR, id);

    if (!fs.existsSync(cloneDir)) {
        return res.status(404).send('Preview not found for this clone.');
    }

    let safePath = decodeURIComponent(req.path);
    if (safePath === '/' || safePath === '') safePath = '/index.html';
    let filePath = path.join(cloneDir, safePath);

    // If file directly exists, pass to express.static
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        return express.static(cloneDir, { extensions: ['html', 'htm'] })(req, res, next);
    }

    // Smart fallback for assets: check assets/ subdirectories
    const baseName = path.basename(safePath);
    const nameWithoutExt = path.basename(baseName, path.extname(baseName));
    const ext = path.extname(baseName).toLowerCase();

    const assetSubdirs = ['3d', 'images', 'media', 'fonts', 'css', 'js', 'misc'];
    for (const sub of assetSubdirs) {
        const subDir = path.join(cloneDir, 'assets', sub);
        if (fs.existsSync(subDir)) {
            const directMatch = path.join(subDir, baseName);
            if (fs.existsSync(directMatch) && fs.statSync(directMatch).isFile()) {
                if (directMatch.endsWith('.glb')) res.setHeader('Content-Type', 'model/gltf-binary');
                else if (directMatch.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm');
                return res.sendFile(directMatch);
            }
            try {
                const files = fs.readdirSync(subDir);
                const matched = files.find(f => (f.startsWith(nameWithoutExt) || f.includes(nameWithoutExt)) && path.extname(f).toLowerCase() === ext);
                if (matched) {
                    const matchPath = path.join(subDir, matched);
                    if (matchPath.endsWith('.glb')) res.setHeader('Content-Type', 'model/gltf-binary');
                    else if (matchPath.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm');
                    return res.sendFile(matchPath);
                }
            } catch {}
        }
    }

    express.static(cloneDir, {
        extensions: ['html', 'htm'],
        setHeaders: (res, p) => {
            if (p.endsWith('.glb')) res.setHeader('Content-Type', 'model/gltf-binary');
            else if (p.endsWith('.gltf')) res.setHeader('Content-Type', 'model/gltf+json');
            else if (p.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm');
            else if (p.endsWith('.hdr')) res.setHeader('Content-Type', 'image/vnd.radiance');
            else if (p.endsWith('.bin')) res.setHeader('Content-Type', 'application/octet-stream');
            else if (p.endsWith('.spline') || p.endsWith('.splinecode')) res.setHeader('Content-Type', 'application/octet-stream');
        }
    })(req, res, next);
});

/**
 * Get history of previous clones
 */
app.get('/api/clones', (req, res) => {
    const history = loadHistory();
    res.json(history);
});

/**
 * Delete a clone from history & disk
 */
app.delete('/api/clones/:id', (req, res) => {
    const { id } = req.params;
    const cloneDir = path.join(CLONES_DIR, id);
    const zipPath = path.join(ZIPS_DIR, `${id}.zip`);

    try {
        if (fs.existsSync(cloneDir)) {
            fs.rmSync(cloneDir, { recursive: true, force: true });
        }
        if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
        }

        let history = loadHistory();
        history = history.filter((h) => h.id !== id);
        saveHistory(history);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Website Reaper server listening at http://localhost:${PORT}`);
    console.log(` Ready to clone any website with animations & assets!`);
    console.log(`====================================================`);
});

