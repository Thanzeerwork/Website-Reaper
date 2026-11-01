# ⚡ Website Reaper

> **Autonomous Full-Fidelity Website Cloner & Offline Package Generator**  
> Mirror full-fidelity web apps, reconstruct dynamic CSSOM animations, salvage runtime keyframes, neutralize client SPA crashes, and bundle 100% offline-runnable archives with native local servers.

---

## 🌟 Highlights

- **🚀 Unified Ultra Hybrid Engine**: Merges Wget's recursive multi-threaded asset mirror with Chrome's live DOM synthesis and dynamic CSSOM `@keyframes` extraction.
- **🛡️ 4-Layer SPA Immune Shield**: Neutralizes client-side Next.js, React, and Nuxt hydration crashes (*"Application error: a client-side exception has occurred"*), preserving rendered DOM.
- **🌓 Universal Dark / Light Mode Switcher**: Automatically discovers and hooks theme toggle buttons and provides an offline `<head>` bootstrapper plus global `Alt+T` shortcut.
- **⚡ 1-Click Embedded Local Launchers**: Every downloaded ZIP includes `run.bat` (Windows), `run.sh` (macOS/Linux), and a zero-dependency `server.js` (Node HTTP).
- **🎨 Modern Developer UI**: Designed with a clean, high-performance developer aesthetic inspired by Linear and Vercel.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18.0 or higher
- **Google Chrome** or **Microsoft Edge** (automatically detected)
- *(Optional)* **Wget** (for multi-threaded Turbo Mirroring)

### 2. Installation & Launch

```bash
# Clone repository
git clone https://github.com/Thanzeerwork/Website-Reaper.git
cd Website-Reaper

# Install dependencies
npm install

# Start the Website Reaper server
npm start
```

*On Windows, you can also simply double-click `start.bat`.*

The dashboard will open automatically at:  
👉 **`http://localhost:5050`**

---

## 🕹️ How to Use

1. **Enter Website URL**: Paste any target URL (e.g. `tailwindcss.com`, `vite.dev`, `linear.app`).
2. **Configure Settings (Optional)**: Click **Advanced Engine Settings** to configure crawl depth, asset filters, device viewport, and quotas.
3. **Click "Reap Website"**: Watch live real-time streaming progress in the developer terminal.
4. **Preview & Download**:
   - Click **Download ZIP Archive** to save the standalone package.
   - Click **Live Preview** to inspect the cloned site in an embedded sandbox.
   - Extract the ZIP and double-click `run.bat` (Windows) or `./run.sh` (Mac/Linux) to run offline anytime.

---

## ⚙️ Advanced Engine Settings

| Setting | Options | Description |
| :--- | :--- | :--- |
| **Cloning Core Engine** | `Unified Hybrid` *(Recommended)*, `Wget Turbo`, `Puppeteer DOM` | Select between hybrid browser+HTTP mirroring or pure headless browser scraping. |
| **Crawl Depth Scope** | `Entire Website`, `Single Page Only` | Automatically rewrites internal navigation links to local relative paths (`./about.html`). |
| **Page Cap Limit** | `10`, `20`, `35`, `50`, `100+` | Sets maximum internal subpages to harvest on the target domain. |
| **Target Viewport** | `Desktop 1080p`, `MacBook 14"`, `iPad`, `iPhone` | Emulates target device resolution for responsive media queries and navigation drawers. |
| **Asset Harvest Filter** | `All Assets`, `Web Assets Only`, `Lightweight Core` | Filter heavy 4K videos or streaming audio to produce compact bundles. |
| **Download Quota Limit** | `150 MB`, `500 MB`, `1.5 GB`, `Unlimited` | Caps downloaded storage bandwidth to protect host disk space. |
| **Dynamic Pre-Warming** | `Enabled` *(Toggle)* | Human scroll velocity simulation waking up `IntersectionObserver` & scroll-triggered animations. |
| **Settle Latency** | `1.0s`, `2.5s`, `4.0s` | Time allocated for GSAP, Framer Motion, and Webflow entrance transitions. |
| **User-Agent Profile** | `Chrome Win11`, `Safari macOS`, `Googlebot`, `Mobile Android` | Configurable identity profile to bypass client device gating. |
| **Custom Auth / Cookies** | Free-form text input | Pass session cookies (`Cookie: session=...`) or bearer tokens for private portals. |

---

## 🏗️ Architecture & Pipeline

```
Target URL ──► Canonical Resolver (Follows 301/302 Redirects)
                     │
       ┌─────────────┴─────────────┐
       ▼                           ▼
[Wget Turbo Mirror]       [Headless Chromium]
 • Multi-threaded GET      • JS Hydration
 • Relative link rewrite   • Scroll velocity pre-warm
 • Font & SVG harvesting   • Dynamic CSSOM keyframes
       │                           │
       └─────────────┬─────────────┘
                     ▼
           [4-Layer Immune Shield]
            • Neutralizes Next.js ErrorBoundary
            • Patches runtime DOM replacement
            • Injects Universal Theme Switcher
                     ▼
           [Standalone Packager]
            • Generates run.bat (Windows)
            • Generates run.sh (macOS/Linux)
            • Generates zero-dependency server.js
            • Compresses standalone .ZIP bundle
```

---

## 📦 What's Inside Cloned Packages?

Every downloaded ZIP archive is **100% self-contained**:

```
cloned-website/
├── index.html              # Cleaned HTML with localized assets
├── about.html              # Fully linked subpages
├── assets/                 # Re-mapped stylesheets, fonts, scripts, and images
├── reaper-engine.js        # Universal animation runtime & SPA immune shield
├── reaper-keyframes.css    # Synthesized dynamic CSSOM animations
├── run.bat                 # 1-Click Windows launcher (Auto port finder)
├── run.sh                  # 1-Click macOS/Linux launcher
└── server.js               # Zero-dependency local Node.js server
```

---

## 🛠️ Tech Stack

- **Runtime**: Node.js & Express
- **Automation Engine**: Puppeteer-Core with dynamic browser executable auto-discovery
- **Network Mirroring**: Wget CLI with fallback to custom asynchronous crawler
- **DOM & AST Processing**: Cheerio & PostCSS
- **Streaming Telemetry**: Server-Sent Events (SSE)
- **Frontend**: Tailwind CSS, Inter, JetBrains Mono

---

