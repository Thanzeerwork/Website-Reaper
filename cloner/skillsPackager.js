const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * Creates an archiver instance compatible with both CJS and ESM interop
 */
function createZipArchive() {
    if (typeof archiver === 'function') {
        return archiver('zip', { zlib: { level: 9 } });
    } else if (archiver.ZipArchive) {
        return new archiver.ZipArchive({ zlib: { level: 9 } });
    } else if (archiver.default && typeof archiver.default === 'function') {
        return archiver.default('zip', { zlib: { level: 9 } });
    }
    throw new Error('Compatible archiver engine not found');
}

/**
 * Generates setup guides tailored to the requested agent
 */
function generateGuideContent(agent) {
    if (agent === 'cursor') {
        return `# ⚡ Web Clone Architect for Cursor IDE

## Installation in Cursor
1. Extract this ZIP archive into your project's root folder.
2. The rules are located in:
   - \`.cursorrules\` (legacy & global root instruction)
   - \`.cursor/rules/web-clone-architect.mdc\` (modern Cursor rule format)
   - \`references/\` and \`scripts/\`
3. Restart or reload Cursor IDE.

## How to Use
In Cursor Composer or Chat (\`Ctrl + L\` / \`Ctrl + I\`), invoke:
> "Convert the cloned website in ./cloned-site into a modern Next.js 15 App Router application with Tailwind CSS and Framer Motion using the web-clone-architect rule."

Cursor will initiate the 6-Phase user-driven interactive protocol!
`;
    }

    if (agent === 'claude') {
        return `# ⚡ Web Clone Architect for Claude Code

## Installation in Claude Code
1. Extract this ZIP archive into your project root.
2. The configuration is present in:
   - \`CLAUDE.md\` (project instructions for Claude Code)
   - \`.claude/skills/web-clone-architect/SKILL.md\`
   - \`references/\` and \`scripts/\`
3. Launch Claude Code in your terminal:
   \`\`\`bash
   claude
   \`\`\`

## How to Use
In Claude Code, prompt:
> "Read CLAUDE.md and convert the downloaded website in ./cloned-site into a modern Vite + React TypeScript project. Follow the 6 interactive decision gates."
`;
    }

    if (agent === 'codex') {
        return `# ⚡ Web Clone Architect for Codex / OpenAI Agents

## Installation in Codex
1. Extract this ZIP archive into your repository.
2. The instructions are placed in:
   - \`AGENTS.md\` (Standard agent guideline file for Codex and universal LLM agents)
   - \`references/\` and \`scripts/\`

## How to Use
Prompt Codex / ChatGPT:
> "Follow the guidelines in AGENTS.md to deconstruct the cloned website and convert it to a modern Svelte 5 / SvelteKit or Next.js 15 application step-by-step."
`;
    }

    if (agent === 'antigravity') {
        return `# ⚡ Web Clone Architect for Google Antigravity (AGY)

## Installation in Google Antigravity
To make this skill available across all your Antigravity workspaces globally:
1. Extract this archive into your Antigravity skills directory:
   - **Windows**: \`C:\\Users\\<Username>\\.gemini\\config\\skills\\web-clone-architect\\\`
   - **macOS / Linux**: \`~/.gemini/config/skills/web-clone-architect/\`
2. Ensure the folder contains:
   - \`SKILL.md\`
   - \`references/framework-templates.md\`
   - \`references/animation-conversion.md\`
   - \`scripts/html-to-jsx.js\`
   - \`scripts/token-extractor.js\`

## How to Use
In any Antigravity conversation or pair programming session, prompt:
> "Use the web-clone-architect skill to inspect this cloned website and migrate it to Next.js 15 with Tailwind CSS and Framer Motion."

Antigravity will automatically activate the skill and guide you step-by-step through the 6 Interactive Decision Gates.
`;
    }

    // Default / 'all' agents
    return `# ⚡ Web Clone Architect — Universal AI Agent Skills Bundle

Autonomous, user-driven website cloner and modern framework conversion architect for:
- 🔵 **Google Antigravity (AGY)**
- ⚡ **Cursor IDE**
- 🟣 **Anthropic Claude Code**
- 🟢 **OpenAI Codex / ChatGPT**

---

## 📂 Bundle Contents
This archive contains pre-configured integration files for all major AI coding agents:

\`\`\`text
web-clone-architect-skills/
├── SKILL.md                                     # Google Antigravity & Universal Skill
├── .cursorrules                                 # Cursor Root Rule
├── .cursor/rules/web-clone-architect.mdc        # Cursor Modern Rule Format
├── CLAUDE.md                                    # Claude Code Root Guidelines
├── .claude/skills/web-clone-architect/SKILL.md  # Claude Code Skill Folder
├── AGENTS.md                                    # OpenAI Codex / Universal Agent Rules
├── references/
│   ├── framework-templates.md                   # Next.js 15, Vite React, Nuxt 3, Svelte 5, Astro 5
│   └── animation-conversion.md                  # Framer Motion, React Bits & 3D WebGL / Spline
└── scripts/
    ├── html-to-jsx.js                           # AST HTML to clean JSX / TSX converter
    └── token-extractor.js                       # CSS to Tailwind theme extension generator
\`\`\`

---

## 🚀 1-Minute Setup Guide by Agent

### 1. Google Antigravity (AGY)
Copy the \`SKILL.md\`, \`references/\`, and \`scripts/\` folders into:
- **Windows**: \`%USERPROFILE%\\.gemini\\config\\skills\\web-clone-architect\\\`
- **macOS / Linux**: \`~/.gemini/config/skills/web-clone-architect/\`

### 2. Cursor IDE
Extract the files into your project root so that \`.cursorrules\` and \`.cursor/rules/web-clone-architect.mdc\` are at the top level. Cursor will auto-load them.

### 3. Claude Code
Copy \`CLAUDE.md\` and \`.claude/skills/web-clone-architect/\` into your project root. Claude Code will automatically reference them on launch.

### 4. OpenAI Codex / AGENTS.md
Place \`AGENTS.md\` in your workspace root. Compatible with Codex, Cursor, and any tool adhering to AGENTS.md standards.

---

## ⚡ The 6-Phase User-Driven Interactive Workflow
Unlike naive AI converters that dump broken monolithic code, the **Web Clone Architect** enforces a 6-step interactive decision process:

1. **Gate 1: Ingestion & Inspection** — Analyzes pages, discovers sections (\`<header>\`, \`#hero\`, \`#pricing\`, \`<footer>\`), extracts design tokens, and asks which to convert.
2. **Gate 2: Target Framework Selection** — Asks user: Next.js 15 (App Router), Vite + React (TS), Nuxt 3 (Vue 3), Svelte 5 / SvelteKit, or Astro 5.
3. **Gate 3: Component Granularity Strategy** — Asks user: Atomic UI primitives (\`Button\`, \`Card\`, \`Badge\`) vs Section-level files.
4. **Gate 4: Asset, SVG & 3D Strategy** — Asks user: Map inline SVGs to Lucide Icons? Configure React Three Fiber / Spline for WebGL 3D models?
5. **Gate 5: Animation & Interactive State** — Asks user: Framer Motion declarative scroll reveals? Wires up live interactive states (mobile drawer, pricing monthly/annual toggle, accordions, theme toggle).
6. **Gate 6: Incremental Code Generation & Verification** — Generates code module-by-module with build checks (\`npm run build\` / \`npm run dev\`).

---

## 💡 Example Prompt to Your Agent
> *"Use the web-clone-architect skill to inspect the cloned website in ./cloned-site and convert it to Next.js 15 App Router with Tailwind CSS and Framer Motion. Guide me step-by-step through each decision."*
`;
}

/**
 * Packages and streams the requested skill ZIP archive
 */
async function packageSkillZip(agent, res) {
    const rootDir = path.resolve(__dirname, '..');
    const skillDir = path.join(rootDir, 'skills', 'web-clone-architect');

    const cleanAgent = (agent || 'all').toLowerCase().trim();
    let zipFilename = 'web-clone-architect-skills.zip';
    if (cleanAgent === 'antigravity') zipFilename = 'antigravity-web-clone-architect.zip';
    else if (cleanAgent === 'cursor') zipFilename = 'cursor-web-clone-architect.zip';
    else if (cleanAgent === 'claude') zipFilename = 'claude-web-clone-architect.zip';
    else if (cleanAgent === 'codex') zipFilename = 'codex-web-clone-architect.zip';

    if (typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    const archive = createZipArchive();

    archive.on('error', (err) => {
        console.error('[SkillsPackager] Error during archiving:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to create skill package: ' + err.message });
        }
    });

    archive.pipe(res);

    // 1. Add customized README / SETUP_GUIDE.md
    const guideText = generateGuideContent(cleanAgent);
    archive.append(guideText, { name: 'SETUP_GUIDE.md' });
    archive.append(guideText, { name: 'README.md' });

    // 2. Add References (Framework templates & Animation conversion guides)
    const refDir = path.join(skillDir, 'references');
    if (fs.existsSync(refDir)) {
        const refFiles = fs.readdirSync(refDir);
        for (const file of refFiles) {
            const filePath = path.join(refDir, file);
            if (fs.statSync(filePath).isFile()) {
                archive.file(filePath, { name: `references/${file}` });
            }
        }
    }

    // 3. Add Scripts (html-to-jsx.js & token-extractor.js)
    const scriptDir = path.join(skillDir, 'scripts');
    if (fs.existsSync(scriptDir)) {
        const scriptFiles = fs.readdirSync(scriptDir);
        for (const file of scriptFiles) {
            const filePath = path.join(scriptDir, file);
            if (fs.statSync(filePath).isFile()) {
                archive.file(filePath, { name: `scripts/${file}` });
            }
        }
    }

    // 4. Add Agent-Specific Configuration Files
    const skillMdPath = path.join(skillDir, 'SKILL.md');
    const cursorRulesPath = path.join(rootDir, '.cursorrules');
    const cursorMdcPath = path.join(rootDir, '.cursor', 'rules', 'web-clone-architect.mdc');
    const claudeMdPath = path.join(rootDir, 'CLAUDE.md');
    const claudeSkillPath = path.join(rootDir, '.claude', 'skills', 'web-clone-architect', 'SKILL.md');
    const agentsMdPath = path.join(rootDir, 'AGENTS.md');

    if (cleanAgent === 'antigravity' || cleanAgent === 'all') {
        if (fs.existsSync(skillMdPath)) {
            archive.file(skillMdPath, { name: 'SKILL.md' });
        }
    }

    if (cleanAgent === 'cursor' || cleanAgent === 'all') {
        if (fs.existsSync(cursorRulesPath)) {
            archive.file(cursorRulesPath, { name: '.cursorrules' });
        }
        if (fs.existsSync(cursorMdcPath)) {
            archive.file(cursorMdcPath, { name: '.cursor/rules/web-clone-architect.mdc' });
        }
    }

    if (cleanAgent === 'claude' || cleanAgent === 'all') {
        if (fs.existsSync(claudeMdPath)) {
            archive.file(claudeMdPath, { name: 'CLAUDE.md' });
        }
        if (fs.existsSync(claudeSkillPath)) {
            archive.file(claudeSkillPath, { name: '.claude/skills/web-clone-architect/SKILL.md' });
        }
    }

    if (cleanAgent === 'codex' || cleanAgent === 'all') {
        if (fs.existsSync(agentsMdPath)) {
            archive.file(agentsMdPath, { name: 'AGENTS.md' });
        }
    }

    await archive.finalize();
}

module.exports = {
    packageSkillZip,
    generateGuideContent
};
