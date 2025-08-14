#!/usr/bin/env node
/**
 * Documentation Index & Summary Generator
 *
 * Scans all markdown files across the repository (except node_modules, coverage, playwright-report)
 * Generates/updates:
 *  - docs/INDEX.md (categorized, deduplicated listing)
 *  - docs/SUMMARIES.md (short AI-style human summaries; non-destructive)
 *  - Adds front-matter (title) to documents missing a first-level heading (optional)
 * Validation rules:
 *  - Ensures each file has a top-level H1 or adds one based on filename
 *  - Detects near-duplicate filenames differing only by minor typos (Levenshtein distance <=2)
 *  - Reports duplicate semantic titles
 */
import fs from 'fs';
import path from 'path';

const REPO_ROOT = process.cwd();
const DOCS_DIR = path.join(REPO_ROOT, 'docs');

/** Utility helpers **/
const walk = (dir, acc=[]) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (/node_modules|coverage|playwright-report|\.git/.test(full)) continue;
      walk(full, acc);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      acc.push(full);
    }
  }
  return acc;
};

const rel = p => path.relative(REPO_ROOT, p).replace(/\\/g,'/');

const ensureDir = d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); };
ensureDir(DOCS_DIR);

function readFileSafe(f){
  try { return fs.readFileSync(f,'utf8'); } catch { return ''; }
}

function extractTitle(content, file){
  const m = content.match(/^#\s+(.+?)$/m);
  if (m) return m[1].trim();
  return beautifyFilename(path.basename(file, '.md'));
}

function beautifyFilename(name){
  return name
    .replace(/[-_]+/g,' ')
    .replace(/\b([A-Z]+)\b/g, s => s) // keep acronyms
    .replace(/\s+/g,' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function levenshtein(a,b){
  const m=a.length, n=b.length;
  const dp=Array.from({length:m+1},()=>Array(n+1).fill(0));
  for (let i=0;i<=m;i++) dp[i][0]=i;
  for (let j=0;j<=n;j++) dp[0][j]=j;
  for (let i=1;i<=m;i++){
    for (let j=1;j<=n;j++){
      const cost = a[i-1]===b[j-1]?0:1;
      dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
    }
  }
  return dp[m][n];
}

function categorize(file){
  const r = rel(file);
  if (r.startsWith('web/')) return 'Web App';
  if (r.startsWith('src/')) return 'Source Module';
  if (r.startsWith('docs/architecture')) return 'Architecture';
  if (r.startsWith('docs/testing')) return 'Testing';
  if (r.startsWith('docs/features')) return 'Features';
  if (r.startsWith('docs/implementation')) return 'Implementation Progress';
  if (r.startsWith('docs/reports')) return 'Reports';
  if (r.startsWith('docs/development')) return 'Development';
  if (r.startsWith('docs/fixes')) return 'Fixes';
  return 'General';
}

function summarize(content){
  const MAX = 320; // brief summary
  // crude extraction: first heading + first paragraph sentences
  const lines = content.split(/\r?\n/);
  const paras=[]; let buf=[];
  for (const l of lines){
    if (!l.trim()){ if (buf.length){ paras.push(buf.join(' ')); buf=[]; } continue; }
    if (l.startsWith('#')) continue;
    if (l.trim().startsWith('>')) continue;
    buf.push(l.trim());
    if (paras.length>=2) break;
  }
  if (buf.length) paras.push(buf.join(' '));
  let summary = paras.join(' ').replace(/\s+/g,' ').trim();
  if (summary.length>MAX) summary = summary.slice(0, MAX-3) + '...';
  return summary || 'No summary content extracted.';
}

const files = walk(REPO_ROOT).filter(f => !rel(f).startsWith('docs/INDEX') && !rel(f).startsWith('docs/SUMMARIES'));

const records = files.map(f => {
  const content = readFileSafe(f);
  const title = extractTitle(content, f);
  return { file:f, rel:rel(f), title, category: categorize(f), content };
});

// Validation pass: ensure H1
for (const r of records){
  if (!/^#\s+/m.test(r.content.split(/\n/,5).join('\n'))){
    const newTitle = '# ' + r.title + '\n\n' + r.content;
    fs.writeFileSync(r.file, newTitle, 'utf8');
    r.content = newTitle;
  }
}

// Duplicate & near-duplicate detection
const duplicates = new Map();
for (let i=0;i<records.length;i++){
  for (let j=i+1;j<records.length;j++){
    const a=records[i], b=records[j];
    if (a.title === b.title){
      const key = a.title;
      duplicates.set(key, [...(duplicates.get(key)||[]), a.rel, b.rel]);
    } else {
      const dist = levenshtein(a.title.toLowerCase(), b.title.toLowerCase());
      if (dist>0 && dist <=2){
        const key = `Near:${a.title}`;
        duplicates.set(key, [...(duplicates.get(key)||[]), a.rel, b.rel]);
      }
    }
  }
}

// Build INDEX.md
const byCategory = new Map();
for (const r of records){
  if (!byCategory.has(r.category)) byCategory.set(r.category, []);
  byCategory.get(r.category).push(r);
}
for (const arr of byCategory.values()) arr.sort((a,b)=> a.title.localeCompare(b.title));

let indexMd = '# 📚 Documentation Index\n\nAuto-generated by scripts/generate-docs-index.js. Do not edit manually.\n\n';
indexMd += `Last Generated: ${new Date().toISOString()}\n\n`;
for (const [cat, arr] of [...byCategory.entries()].sort((a,b)=> a[0].localeCompare(b[0]))){
  indexMd += `## ${cat}\n\n`;
  for (const r of arr){
    indexMd += `- [${r.title}](${r.rel})\n`;
  }
  indexMd += '\n';
}
if (duplicates.size){
  indexMd += '---\n\n### 🔍 Potential Duplicates / Typos\n\n';
  for (const [title, list] of duplicates.entries()){
    const unique = [...new Set(list)];
    indexMd += `- ${title}: ${unique.join(', ')}\n`;
  }
  indexMd += '\n';
}
fs.writeFileSync(path.join(DOCS_DIR, 'INDEX.md'), indexMd, 'utf8');

// Build SUMMARIES.md
let summariesMd = '# 📝 Documentation Summaries\n\nConcise summaries of each document.\n\n';
for (const r of records.sort((a,b)=> a.title.localeCompare(b.title))){
  summariesMd += `### ${r.title}\n\n`;
  summariesMd += `${summarize(r.content)}\n\n`;
}
fs.writeFileSync(path.join(DOCS_DIR, 'SUMMARIES.md'), summariesMd, 'utf8');

console.log('Documentation index and summaries generated.');
