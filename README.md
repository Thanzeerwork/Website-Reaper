# ⚡ Website Reaper

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Chromium-Headless-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome" />
  <img src="https://img.shields.io/badge/WebGL-3D%20Ready-990000?style=for-the-badge&logo=webgl&logoColor=white" alt="WebGL 3D" />
  <img src="https://img.shields.io/badge/React%20Bits-Interactive-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Bits" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />
</p>

<h3 align="center">Autonomous Full-Fidelity Website Cloner & Offline Package Generator</h3>

<p align="center">
  Mirror modern web applications with 100% fidelity: dynamic DOM hydration, CSSOM animations, WebGL & 3D models, React Bits shaders, Chakra UI components, web fonts, and assets — packed into a 1-click standalone offline bundle.
</p>

---

## 🌟 Key Highlights

### 🚀 Unified Ultra Hybrid Engine
Merges high-speed multi-threaded network mirroring (Wget Turbo) with headless Chromium dynamic browser rendering. Executes client-side JavaScript, waits for full network idle, and captures runtime-injected DOM nodes.

### 🗺️ Interactive Site Architecture & Inner Section Selector
Inspects the entire target website before downloading, revealing all discovered pages and their granular inner sections (`<header>`, `#hero`, `#features`, `#pricing`, `<footer>`):
- **Granular Selection**: Check or uncheck individual subpages or individual inner UI components.
- **Search & Filter**: Real-time keyword filtering to locate specific modules (e.g., `pricing`, `faq`, `hero`).
- **DOM Pruning Engine**: Automatically excises unselected sections from the rendered HTML while keeping global styles, CSS animations, and layout flow 100% intact.
- **Quick Modes**: 1-click presets for *Select All*, *Deselect All*, and *Landing Page Only*.

### 🎮 WebGL & 3D Asset Harvesting
Autonomous discovery and binary extraction of 3D models and runtime dependencies:
- **Formats**: `.glb`, `.gltf`, `.bin`, `.wasm`, `.hdr`, `.exr`, `.spline`, `.splinecode`, `.obj`.
- **Engines**: Three.js, React Three Fiber (R3F), Spline 3D embeds, and WebAssembly decoders.
- **Smart 3D Fetch Interceptor**: Rewrites dynamic client-side `fetch()` and `XMLHttpRequest` calls to serve binary models offline with accurate MIME types (`model/gltf-binary`, `application/wasm`).

### ✨ React Bits & Front-End Animation Engine
Captures and restores reactive client-side animation libraries offline without unhydrated React state crashes:
- **React Bits**: Real-time cursor tracking for Spotlight Cards (`--mouse-x`, `--mouse-y`), 3D Tilt Cards, Glare Cards, and Magnetic Buttons.
- **Canvas Shaders**: Locks WebGL and 2D canvas buffer dimensions (Aurora, Particles, Waves) to prevent 0×0 collapse.
- **CSSOM Keyframes**: Reconstructs dynamic CSS animation rules directly from browser memory (`document.styleSheets`).

### 🛡️ 4-Layer SPA Immune Shield
Neutralizes Next.js, React, and Nuxt hydration crashes (*"Application error: a client-side exception has occurred"*):
- Intercepts uncaught runtime rejections and React ErrorBoundaries.
- Prevents white-screen DOM tearing.
- Replaces dead external tracking/analytics API calls with safe offline mock responses.

### 🌓 Universal Dark / Light Mode Switcher
Preserves dynamic theme toggles offline:
- Supports Chakra UI color modes (`chakra-ui-dark`, `chakra-ui-light`), Tailwind dark classes, and `data-theme` attributes.
- Auto-detects on-page theme toggle buttons and provides an offline `<head>` bootstrapper plus a global `Alt + T` keyboard shortcut.

### 📦 1-Click Standalone Bundling
Every export includes native offline launchers:
- `run.bat` for Windows (automatic port negotiation).
- `run.sh` for macOS / Linux.
- Zero-dependency built-in Node.js HTTP static server (`server.js`).

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18.0 or higher
- **Google Chrome** or **Microsoft Edge** (automatically discovered)
- *(Optional)* **Wget** (for multi-threaded Turbo Mirroring)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/Thanzeerwork/Website-Reaper.git
cd Website-Reaper

# Install dependencies
npm install

# Start the application
npm start
```

> **Windows Users**: You can also double-click `start.bat` in the project root.

The dashboard will open automatically in your default browser at:  
👉 **`http://localhost:5050`**

---

## ☁️ Cloud Deployment

### Option A: Render.com (Recommended — Full Headless Browser Power)
Because Website Reaper performs deep browser automation (Chromium), multi-threaded downloading (Wget), and real-time SSE streaming, it thrives on persistent cloud hosts like **Render** or **Railway**:
1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Select your repository `Thanzeerwork/Website-Reaper`.
4. Render will automatically detect the included **`Dockerfile`**.
5. Select the **Free** tier and click **Deploy Web Service**!
   *(The Docker image automatically bundles Linux Chromium, Wget, fonts, and sets all flags for 100% full-fidelity harvesting without serverless timeouts).*

### Option B: Vercel Deployment
The repository includes `vercel.json` and `api/index.js` for Vercel Serverless deployments:
> ⚠️ **Note on Vercel Serverless Limits**: Vercel functions run in ephemeral serverless lambdas with a strict **10-second timeout** on the Hobby tier and lack pre-installed Chrome/Wget binaries. While the UI and architecture scanner load on Vercel, deep multi-page crawling and heavy 3D asset harvesting should be run on **Render** (via Docker) or **locally on your machine**.

---

## 🕹️ Usage Guide

1. **Enter Target URL**: Paste the URL of the website you want to clone (e.g., `https://tailwindcss.com`, `https://spline.design`, or any React Bits demo).
2. **Configure Engine Settings** *(Optional)*: Click **Advanced Engine Settings** to customize crawl depth, viewport, and quotas.
3. **Click "Reap Website"**: Monitor live real-time terminal output via Server-Sent Events (SSE).
4. **Inspect & Run**:
   - **Live Preview**: Test the cloned website immediately inside the embedded sandbox viewer.
   - **Download ZIP**: Save the standalone self-contained archive to your machine.
   - **Run Offline**: Extract the ZIP and double-click `run.bat` (Windows) or execute `./run.sh` (macOS/Linux).

---

## ⚙️ Advanced Engine Settings

| Setting | Default | Options | Description |
| :--- | :--- | :--- | :--- |
| **Cloning Core** | `Unified Hybrid` | `Unified Hybrid`, `Wget Turbo`, `Puppeteer DOM` | Select between hybrid browser+HTTP mirroring or pure headless browser scraping. |
| **Crawl Scope** | `Entire Website` | `Entire Website`, `Single Page Only` | Automatically rewrites internal navigation links to local relative paths (`./about.html`). |
| **Page Cap Limit** | `20 Pages` | `10`, `20`, `35`, `50`, `100+` | Sets maximum internal subpages to harvest on the target domain. |
| **Target Viewport** | `Desktop 1080p` | `Desktop 1080p`, `MacBook 14"`, `iPad`, `iPhone` | Emulates target device resolution for responsive media queries and mobile drawers. |
| **Asset Harvest Filter** | `All Assets` | `All Assets`, `Web Assets Only`, `Lightweight Core` | Filter heavy 4K videos or streaming audio to produce compact bundles. |
| **Download Quota** | `500 MB` | `150 MB`, `500 MB`, `1.5 GB`, `Unlimited` | Caps downloaded storage bandwidth to protect host disk space. |
| **Dynamic Pre-Warming** | `Enabled` | `Enabled`, `Disabled` | Human scroll velocity simulation waking up `IntersectionObserver` & scroll animations. |
| **Settle Latency** | `2.5s` | `1.0s`, `2.5s`, `4.0s` | Time allocated for GSAP, Framer Motion, and Webflow entrance transitions. |
| **User-Agent Profile** | `Chrome Win11` | `Chrome Win11`, `Safari macOS`, `Googlebot`, `Mobile` | Configurable identity profile to bypass client device gating. |
| **Custom Auth / Cookies** | *None* | `Cookie: ...` / Header string | Pass session cookies or bearer tokens for authenticated portals. |

---

## 🏗️ Architecture Pipeline

```text
Target URL ──► Canonical Resolver (Follows 301/302 Redirects)
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
[Wget Turbo Mirror]       [Headless Chromium]
 • Multi-threaded GET      • JS Hydration & Execution
 • Recursive asset scan    • WebGL / 3D Model Interceptor
 • Font & SVG harvesting   • Dynamic CSSOM @keyframes extraction
       │                   • React Bits & Shader Pre-Warming
       │                           │
       └─────────────┬─────────────┘
                     ▼
           [Asset Normalizer]
            • Re-maps URLs to local relative paths (./assets/...)
            • Organizes 3D models into ./assets/3d/ (.glb, .wasm, .spline)
                     ▼
           [4-Layer SPA Immune Shield]
            • Neutralizes Next.js ErrorBoundaries & client crashes
            • Universal Theme Switcher (Chakra UI, Tailwind, data-theme)
            • Offline Binary 3D Fetch Proxy
                     ▼
           [Standalone Packager]
            • Generates run.bat (Windows)
            • Generates run.sh (macOS/Linux)
            • Bundles zero-dependency server.js
            • Compresses standalone .ZIP package
```

---

## 📦 What's Inside a Cloned Package?

Every downloaded ZIP archive is **100% self-contained** and runs without internet access:

```text
cloned-website/
├── index.html              # Cleaned HTML with localized assets
├── about.html              # Fully linked subpages
├── assets/
│   ├── css/                # Extracted stylesheets
│   ├── js/                 # Localized JavaScript bundles
│   ├── images/             # Responsive images, WebP, SVGs
│   ├── fonts/              # WOFF2, WOFF, TTF web fonts
│   └── 3d/                 # GLB, GLTF, WASM decoders, Spline scenes
├── reaper-engine.js        # Universal animation runtime & SPA immune shield
├── reaper-keyframes.css    # Synthesized dynamic CSSOM animations
├── run.bat                 # 1-Click Windows launcher (Auto port negotiation)
├── run.sh                  # 1-Click macOS/Linux launcher
└── server.js               # Zero-dependency local Node.js HTTP server
```

---

## 🛠️ Tech Stack

- **Runtime Environment**: Node.js & Express
- **Browser Automation**: Puppeteer-Core with dynamic browser executable auto-detection
- **Network Mirroring**: Wget CLI with asynchronous fallback crawler
- **3D & Asset Processing**: WebGL Network Interceptor, ArrayBuffer binary stream handler
- **DOM & AST Processing**: Cheerio & PostCSS
- **Real-Time Telemetry**: Server-Sent Events (SSE)
- **Developer UI**: Tailwind CSS, Inter, JetBrains Mono

---

