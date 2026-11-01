const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

class Packager {
    /**
     * Injects launch scripts and documentation into the cloned site directory
     */
    static injectLaunchers(outputDir, siteMetadata = {}) {
        // 1. Windows run.bat
        const batContent = `@echo off
title Website Reaper - Local Server
echo ========================================================
echo   Website Reaper - Cloned Site Launcher
echo   Site: ${siteMetadata.url || 'Cloned Website'}
echo   Cloned: ${new Date().toLocaleString()}
echo ========================================================
echo.

:: Check for Node.js (Recommended for full clean URL & CORS font support)
where node >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Launching with Node.js local server on http://localhost:3000 ...
    start http://localhost:3000
    node server.js
    goto :done
)

:: Check for Python fallback
where python >nul 2>&1
if %errorlevel% == 0 (
    echo [OK] Launching with Python local server on http://localhost:3000 ...
    start http://localhost:3000
    python -m http.server 3000
    goto :done
)

:: Fallback direct open
echo [!] Python or Node not found. Opening index.html directly...
start index.html

:done
pause
`;
        fs.writeFileSync(path.join(outputDir, 'run.bat'), batContent, 'utf8');

        // 2. Linux / macOS run.sh
        const shContent = `#!/usr/bin/env bash
echo "========================================================"
echo "  Website Reaper - Cloned Site Launcher"
echo "  Site: ${siteMetadata.url || 'Cloned Website'}"
echo "========================================================"
echo ""

PORT=3000

if command -v node &>/dev/null; then
    echo "[OK] Launching with Node.js on http://localhost:$PORT ..."
    (sleep 1 && (open "http://localhost:$PORT" 2>/dev/null || xdg-open "http://localhost:$PORT" 2>/dev/null)) &
    node server.js
elif command -v python3 &>/dev/null; then
    echo "[OK] Launching with Python 3 on http://localhost:$PORT ..."
    (sleep 1 && (open "http://localhost:$PORT" 2>/dev/null || xdg-open "http://localhost:$PORT" 2>/dev/null)) &
    python3 -m http.server $PORT
else
    echo "[!] Opening index.html directly..."
    open index.html 2>/dev/null || xdg-open index.html 2>/dev/null
fi
`;
        fs.writeFileSync(path.join(outputDir, 'run.sh'), shContent, 'utf8');

        // 3. Standalone Zero-Dependency Node.js server.js
        const serverJsContent = `const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.avif': 'image/avif',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json',
    '.bin': 'application/octet-stream',
    '.wasm': 'application/wasm',
    '.hdr': 'image/vnd.radiance',
    '.spline': 'application/octet-stream',
    '.splinecode': 'application/octet-stream',
    '.obj': 'text/plain',
    '.mtl': 'text/plain'
};

const server = http.createServer((req, res) => {
    let safePath = decodeURIComponent(req.url.split('?')[0]);
    if (safePath === '/' || safePath === '') safePath = '/index.html';

    let filePath = path.join(__dirname, safePath);
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    // 1. Clean URL resolution: if /about requested, try /about.html or /about/index.html
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        if (fs.existsSync(filePath + '.html')) {
            filePath = filePath + '.html';
        } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
            filePath = path.join(filePath, 'index.html');
        }
    }

    // 2. Smart Asset Fallback: resolves root-relative assets (e.g. /images/... or /_astro/...) directly from assets/
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        const baseName = path.basename(safePath);
        const nameWithoutExt = path.basename(baseName, path.extname(baseName));
        const ext = path.extname(baseName).toLowerCase();

        const assetSubdirs = ['images', 'media', 'fonts', 'css', 'js', 'misc'];
        for (const sub of assetSubdirs) {
            const subDir = path.join(__dirname, 'assets', sub);
            if (fs.existsSync(subDir)) {
                // Exact file match in assets subfolder
                const directMatch = path.join(subDir, baseName);
                if (fs.existsSync(directMatch) && fs.statSync(directMatch).isFile()) {
                    filePath = directMatch;
                    break;
                }
                // Hashed match: e.g. Main-BG_73a1730a.webp matching Main-BG.webp
                try {
                    const files = fs.readdirSync(subDir);
                    const matched = files.find(f => (f.startsWith(nameWithoutExt) || f.includes(nameWithoutExt)) && path.extname(f).toLowerCase() === ext);
                    if (matched) {
                        filePath = path.join(subDir, matched);
                        break;
                    }
                } catch {}
            }
        }
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            if (safePath.startsWith('/api/') || safePath.endsWith('.json') || (req.headers['accept'] && req.headers['accept'].includes('application/json'))) {
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ status: 'ok', mocked: true }));
                return;
            }
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

let currentPort = PORT;
function startListening(port) {
    server.listen(port, () => {
        console.log(\`Website Reaper server running at http://localhost:\${port}/\`);
        console.log('Press Ctrl+C to stop.');
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(\`Port \${port} is in use, trying http://localhost:\${port + 1}/ ...\`);
            startListening(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
}
startListening(currentPort);
`;
        fs.writeFileSync(path.join(outputDir, 'server.js'), serverJsContent, 'utf8');

        // 4. README.md
        const readmeContent = `# ${siteMetadata.title || 'Cloned Website'}

> Cloned with **Website Reaper** on ${new Date().toLocaleString()}  
> Original URL: [${siteMetadata.url}](${siteMetadata.url})

---

## 🚀 How to Run this Cloned Website

This package is completely self-contained with all CSS stylesheets, animations, web fonts, JavaScript libraries, and images downloaded locally.

### Option 1: 1-Click Launch (Recommended)
- **Windows**: Double-click **\`run.bat\`**
- **Mac / Linux**: Open Terminal in this folder and run:
  \`\`\`bash
  chmod +x run.sh && ./run.sh
  \`\`\`
*This starts a fast local HTTP server at \`http://localhost:3000\` and opens your browser.*

---

### Option 2: Run with Node.js
If you have Node.js installed:
\`\`\`bash
node server.js
\`\`\`
Then visit [http://localhost:3000](http://localhost:3000).

---

### Option 3: Run with Python
\`\`\`bash
python -m http.server 3000
\`\`\`
Then visit [http://localhost:3000](http://localhost:3000).

---

### Option 4: Direct Double-Click
You can double-click **\`index.html\`** directly in File Explorer / Finder.  
*(Note: Some modern dynamic web features or font formats prefer an HTTP server like Option 1).*

---

### Option 5: Host or Deploy Online
You can drag and drop this entire unzipped folder straight into:
- [Vercel](https://vercel.com)
- [Netlify Drop](https://app.netlify.com/drop)
- [GitHub Pages](https://pages.github.com)
- Any Apache / Nginx / Caddy web server!
`;
        fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent, 'utf8');
    }

    /**
     * Zip output directory into destination zip file
     */
    static createZip(sourceDir, zipFilePath) {
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(zipFilePath);
            
            let archive;
            if (typeof archiver === 'function') {
                archive = archiver('zip', { zlib: { level: 9 } });
            } else if (archiver.ZipArchive) {
                archive = new archiver.ZipArchive({ zlib: { level: 9 } });
            } else if (archiver.default && typeof archiver.default === 'function') {
                archive = archiver.default('zip', { zlib: { level: 9 } });
            } else {
                return reject(new Error('Compatible archiver engine not found'));
            }

            output.on('close', () => {
                resolve({
                    zipPath: zipFilePath,
                    totalBytes: archive.pointer()
                });
            });

            archive.on('error', (err) => {
                reject(err);
            });

            archive.pipe(output);
            archive.directory(sourceDir, false);
            archive.finalize();
        });
    }
}

module.exports = Packager;
