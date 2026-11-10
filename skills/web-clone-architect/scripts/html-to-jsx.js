#!/usr/bin/env node
/**
 * HTML to JSX/TSX Transformer
 * Converts raw HTML, Webflow exports, and SVGs into clean, typed React/Next.js JSX
 */

const fs = require('fs');
const path = require('path');

function styleStringToJsxObject(styleStr) {
    if (!styleStr || typeof styleStr !== 'string') return null;
    const styles = {};
    styleStr.split(';').forEach(rule => {
        const [prop, val] = rule.split(':').map(s => s && s.trim());
        if (prop && val) {
            // camelCase property name
            const camelProp = prop.startsWith('--') 
                ? prop 
                : prop.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
            styles[camelProp] = val;
        }
    });
    return JSON.stringify(styles).replace(/"([^"]+)":/g, '$1:');
}

function convertHtmlToJsx(htmlContent) {
    if (!htmlContent) return '';

    let jsx = htmlContent;

    // 1. Convert HTML comments <!-- ... --> to JSX {/* ... */}
    jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');

    // 2. Convert class="..." to className="..."
    jsx = jsx.replace(/\bclass=(["'][^"']*["'])/g, 'className=$1');

    // 3. Convert for="..." on labels to htmlFor="..."
    jsx = jsx.replace(/\bfor=(["'][^"']*["'])/g, 'htmlFor=$1');

    // 4. Convert tabindex to tabIndex
    jsx = jsx.replace(/\btabindex=(["'][^"']*["'])/gi, 'tabIndex=$1');

    // 5. Convert autocomplete to autoComplete
    jsx = jsx.replace(/\bautocomplete=(["'][^"']*["'])/gi, 'autoComplete=$1');

    // 6. Convert style="..." strings into style={{ ... }} objects
    jsx = jsx.replace(/\bstyle=["']([^"']*)["']/g, (match, styleString) => {
        const jsxStyle = styleStringToJsxObject(styleString);
        return jsxStyle ? `style={${jsxStyle}}` : '';
    });

    // 7. Fix standard SVG attributes to camelCase
    const svgAttrMap = {
        'stroke-width': 'strokeWidth',
        'stroke-linecap': 'strokeLinecap',
        'stroke-linejoin': 'strokeLinejoin',
        'stroke-miterlimit': 'strokeMiterlimit',
        'stroke-dasharray': 'strokeDasharray',
        'stroke-dashoffset': 'strokeDashoffset',
        'stroke-opacity': 'strokeOpacity',
        'fill-rule': 'fillRule',
        'clip-rule': 'clipRule',
        'clip-path': 'clipPath',
        'stop-color': 'stopColor',
        'stop-opacity': 'stopOpacity',
        'fill-opacity': 'fillOpacity',
        'font-family': 'fontFamily',
        'font-size': 'fontSize',
        'font-weight': 'fontWeight',
        'text-anchor': 'textAnchor',
        'dominant-baseline': 'dominantBaseline',
        'xmlns:xlink': 'xmlnsXlink',
        'xlink:href': 'xlinkHref',
        'color-interpolation-filters': 'colorInterpolationFilters'
    };

    for (const [kebab, camel] of Object.entries(svgAttrMap)) {
        const regex = new RegExp(`\\b${kebab}=`, 'g');
        jsx = jsx.replace(regex, `${camel}=`);
    }

    // Fix viewBox case
    jsx = jsx.replace(/\bviewbox=/gi, 'viewBox=');

    // 8. Self-close void elements if unclosed: img, input, br, hr, meta, link, source
    const voidTags = ['img', 'input', 'br', 'hr', 'source', 'link', 'meta'];
    voidTags.forEach(tag => {
        const regex = new RegExp(`<(${tag})((?:[^>](?!\\/))*?)>`, 'gi');
        jsx = jsx.replace(regex, '<$1$2 />');
    });

    // 9. Self-close empty SVG tags if not self-closed: path, circle, rect, line, polygon, polyline
    const svgVoidTags = ['path', 'circle', 'rect', 'line', 'polygon', 'polyline', 'stop'];
    svgVoidTags.forEach(tag => {
        const regex = new RegExp(`<(${tag})((?:[^>](?!\\/))*?)><\\/\\1>`, 'gi');
        jsx = jsx.replace(regex, '<$1$2 />');
    });

    // 10. Replace href="javascript:..." or href="#" with safe equivalents
    jsx = jsx.replace(/href=["']javascript:void\(0\)["']/gi, 'href="#"');

    return jsx.trim();
}

// CLI usage support: node html-to-jsx.js [input-file] [output-file]
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('Usage: node html-to-jsx.js <input.html> [output.tsx]');
        process.exit(0);
    }
    const inputFile = args[0];
    const outputFile = args[1] || inputFile.replace(/\.html?$/i, '.tsx');

    if (fs.existsSync(inputFile)) {
        const raw = fs.readFileSync(inputFile, 'utf8');
        const converted = convertHtmlToJsx(raw);
        fs.writeFileSync(outputFile, converted, 'utf8');
        console.log(`[Success] Converted ${inputFile} -> ${outputFile}`);
    } else {
        console.error(`File not found: ${inputFile}`);
        process.exit(1);
    }
}

module.exports = {
    convertHtmlToJsx,
    styleStringToJsxObject
};
