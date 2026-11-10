#!/usr/bin/env node
/**
 * Design Token Extractor
 * Inspects CSS files and HTML DOM to automatically generate Tailwind theme tokens and CSS variables
 */

const fs = require('fs');

function extractTokensFromCss(cssText) {
    const tokens = {
        colors: new Set(),
        fonts: new Set(),
        cssVars: {},
        radii: new Set(),
        shadows: new Set()
    };

    if (!cssText) return tokens;

    // 1. Extract CSS Custom Properties (:root { --primary: #...; })
    const varRegex = /--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
    let match;
    while ((match = varRegex.exec(cssText)) !== null) {
        const prop = match[1].trim();
        const val = match[2].trim();
        tokens.cssVars[`--${prop}`] = val;

        // If value is color-like
        if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(val) || /^rgb|hsl/i.test(val)) {
            tokens.colors.add(val);
        }
    }

    // 2. Extract Color codes (#fff, rgb(...), hsl(...))
    const hexRegex = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;
    const hexes = cssText.match(hexRegex) || [];
    hexes.forEach(h => tokens.colors.add(h.toLowerCase()));

    // 3. Extract Font Families (font-family: 'Inter', sans-serif)
    const fontRegex = /font-family\s*:\s*([^;]+);/gi;
    let fontMatch;
    while ((fontMatch = fontRegex.exec(cssText)) !== null) {
        const rawFont = fontMatch[1].split(',')[0].replace(/['"]/g, '').trim();
        if (rawFont && !['inherit', 'initial', 'sans-serif', 'serif', 'monospace'].includes(rawFont.toLowerCase())) {
            tokens.fonts.add(rawFont);
        }
    }

    // 4. Extract Border Radius (border-radius: 12px)
    const radiusRegex = /border-radius\s*:\s*([^;]+);/gi;
    let radiusMatch;
    while ((radiusMatch = radiusRegex.exec(cssText)) !== null) {
        tokens.radii.add(radiusMatch[1].trim());
    }

    return {
        colors: Array.from(tokens.colors).slice(0, 16),
        fonts: Array.from(tokens.fonts).slice(0, 5),
        cssVars: tokens.cssVars,
        radii: Array.from(tokens.radii).slice(0, 6)
    };
}

function generateTailwindConfigExtension(tokens) {
    const config = {
        theme: {
            extend: {
                colors: {},
                fontFamily: {}
            }
        }
    };

    tokens.fonts.forEach((font, idx) => {
        const key = idx === 0 ? 'sans' : idx === 1 ? 'display' : `font${idx}`;
        config.theme.extend.fontFamily[key] = [`'${font}'`, 'sans-serif'];
    });

    return `// tailwind.config.ts\nimport type { Config } from 'tailwindcss';\n\nconst config: Config = {\n  content: [\n    './pages/**/*.{js,ts,jsx,tsx,mdx}',\n    './components/**/*.{js,ts,jsx,tsx,mdx}',\n    './app/**/*.{js,ts,jsx,tsx,mdx}',\n  ],\n  theme: {\n    extend: {\n      fontFamily: ${JSON.stringify(config.theme.extend.fontFamily, null, 8)}\n    }\n  },\n  plugins: []\n};\nexport default config;`;
}

module.exports = {
    extractTokensFromCss,
    generateTailwindConfigExtension
};
