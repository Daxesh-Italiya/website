const fs = require('fs');
const path = require('path');

// Configuration
const BASE_DIR = '/Users/dax/TST-Project/Deambuilder-website/website';
const PAGE_NAME = '14-passenger-sprinter-limousine';
const HTML_PATH = path.join(BASE_DIR, PAGE_NAME, 'index.html');
const MD_PATH = path.join(BASE_DIR, 'pagewise-doc', '14 Passenger Sprinter Limousine.md');
const ASSETS_DIR = path.join(BASE_DIR, 'assets');

// Read files
console.log('[INFO] Reading HTML file...');
let html = fs.readFileSync(HTML_PATH, 'utf-8');

console.log('[INFO] Reading Markdown file...');
const mdContent = fs.readFileSync(MD_PATH, 'utf-8');

// Parse markdown for YAML frontmatter
let frontmatter = {};
let content = mdContent;

if (mdContent.startsWith('---')) {
    const parts = mdContent.split('---');
    if (parts.length >= 3) {
        const yamlLines = parts[1].trim().split('\\n');
        yamlLines.forEach(line => {
            const match = line.match(/^([^:]+):\\s*(.+)$/);
            if (match) {
                frontmatter[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
            }
        });
        content = parts.slice(2).join('---').trim();
    }
}

console.log('[INFO] Frontmatter variables found:', Object.keys(frontmatter).length);

// Extract markdown sections
const sections = {};
const headingRegex = /^#{1,6}\\s+(.+)$/gm;
let lastHeading = null;
const lines = content.split('\\n');
let currentSection = [];

for (const line of lines) {
    const headingMatch = line.match(/^#{1,6}\\s+(.+)$/);
    if (headingMatch) {
        if (lastHeading) {
            sections[lastHeading] = currentSection.join('\\n').trim();
        }
        lastHeading = headingMatch[1].replace(/\\*\\*/g, '').trim();
        currentSection = [];
    } else {
        currentSection.push(line);
    }
}
if (lastHeading) {
    sections[lastHeading] = currentSection.join('\\n').trim();
}

console.log('[INFO] Markdown sections extracted:', Object.keys(sections).length);

// Find all placeholders in HTML
const placeholders = new Set();
const regex = /\\$\\{([^}]+)\\}/g;
let match;
while ((match = regex.exec(html)) !== null) {
    placeholders.add(match[1]);
}

console.log('[INFO] Found', placeholders.size, 'unique placeholders');

// Variable resolution
const variables = {};

// Priority 1: YAML frontmatter
Object.assign(variables, frontmatter);

// Priority 2: Markdown sections (add full content as main_content)
variables.main_content = content;
Object.assign(variables, sections);

// Priority 3: Asset references
const assetFiles = fs.readdirSync(ASSETS_DIR);
assetFiles.forEach(file => {
    const assetKey = '_img-' + path.basename(file, path.extname(file));
    variables[assetKey] = `/assets/${file}`;
});

console.log('[INFO] Total variables available:', Object.keys(variables).length);

// Replace placeholders
let replacedCount = 0;
let skippedCount = 0;
const warnings = [];

placeholders.forEach(placeholder => {
    const regex = new RegExp('\\\\$\\\\{' + placeholder.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '\\\\}', 'g');

    if (variables[placeholder]) {
        html = html.replace(regex, variables[placeholder]);
        replacedCount++;
        console.log('[REPLACED]', placeholder);
    } else {
        skippedCount++;
        warnings.push(`[WARNING] Variable not found: \${${placeholder}}`);
    }
});

// Log warnings
console.log('\\n=== SUMMARY ===');
console.log('Replaced:', replacedCount);
console.log('Skipped (kept as-is):', skippedCount);

if (warnings.length > 0) {
    console.log('\\n=== WARNINGS ===');
    warnings.forEach(w => console.log(w));
}

// Write updated HTML
console.log('\\n[INFO] Writing updated HTML file...');
fs.writeFileSync(HTML_PATH, html, 'utf-8');
console.log('[SUCCESS] HTML file updated successfully!');
console.log('[INFO] Output file:', HTML_PATH);
