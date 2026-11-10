const fs = require('fs');
const path = require('path');
const os = require('os');

function getBrowserExecutablePath() {
    if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
        return process.env.CHROME_PATH;
    }

    const platform = os.platform();

    if (platform === 'win32') {
        const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
        const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
        const localAppData = process.env.LOCALAPPDATA || '';

        const candidates = [
            path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
            path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
            path.join(localAppData, 'Google', 'Chrome', 'Application', 'chrome.exe'),
            path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
            path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
            path.join(localAppData, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
            path.join(programFiles, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
            path.join(localAppData, 'Programs', 'Opera', 'opera.exe')
        ];

        for (const candidate of candidates) {
            if (candidate && fs.existsSync(candidate)) {
                return candidate;
            }
        }
    } else if (platform === 'darwin') {
        const candidates = [
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
            '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
            '/Applications/Chromium.app/Contents/MacOS/Chromium'
        ];
        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) return candidate;
        }
    } else {
        // Linux
        const candidates = [
            '/usr/bin/google-chrome',
            '/usr/bin/google-chrome-stable',
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
            '/usr/bin/microsoft-edge',
            '/snap/bin/chromium'
        ];
        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) return candidate;
        }
    }

    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
        throw new Error('No Chromium binary found in this serverless environment (Vercel Lambda). Headless browser automation requires a persistent Linux host or Docker container (e.g. Render, Railway, or local execution via start.bat).');
    }

    throw new Error('No compatible Chromium browser found (Chrome or Edge). Please install Google Chrome or Microsoft Edge.');
}

module.exports = {
    getBrowserExecutablePath
};

