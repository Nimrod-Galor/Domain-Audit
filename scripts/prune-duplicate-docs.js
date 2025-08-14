#!/usr/bin/env node
/**
 * Prune Duplicate / Near-Duplicate Markdown Docs
 * Strategy:
 *  1. Scan all markdown files (excluding node_modules, coverage, playwright-report).
 *  2. Group by normalized title (case-insensitive, punctuation removed).
 *  3. For exact duplicate content hashes keep earliest path (shortest path length) and remove others.
 *  4. For near-duplicates (title distance <=2) choose the longer content (assumed more complete) and mark shorter as deprecated by inserting a redirect note rather than deleting (safer).
 *  5. Maintain a report docs/DUPLICATE_PRUNE_REPORT.md of actions.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const REPO_ROOT = process.cwd();
const DOCS_DIR = path.join(REPO_ROOT, 'docs');
const REPORT_FILE = path.join(DOCS_DIR, 'DUPLICATE_PRUNE_REPORT.md');

const walk = (dir, acc=[]) => {
  for (const e of fs.readdirSync(dir,{withFileTypes:true})){
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()){
      if (/node_modules|coverage|playwright-report|\.git/.test(full)) continue;
      walk(full, acc);
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')){
      // skip generated index/summaries & previous reports
      if (/docs[\\/](INDEX|SUMMARIES|DUPLICATE_PRUNE_REPORT)\.md$/i.test(full)) continue;
      acc.push(full);
    }
  }
  return acc;
};

const rel = p => path.relative(REPO_ROOT, p).replace(/\\/g,'/');
const hash = c => crypto.createHash('sha256').update(c).digest('hex');

function titleOf(content, file){
  const m = content.match(/^#\s+(.+?)$/m);
  if (m) return m[1].trim();
  return path.basename(file, '.md');
}
function normTitle(t){
  return t.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
function levenshtein(a,b){
  const m=a.length,n=b.length;const dp=Array.from({length:m+1},()=>Array(n+1).fill(0));
  for (let i=0;i<=m;i++) dp[i][0]=i; for (let j=0;j<=n;j++) dp[0][j]=j;
  for (let i=1;i<=m;i++) for (let j=1;j<=n;j++){
    const cost=a[i-1]===b[j-1]?0:1;
    dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
  }
  return dp[m][n];
}

const files = walk(REPO_ROOT);
const docs = files.map(f=>{ const c=fs.readFileSync(f,'utf8'); return {file:f, rel:rel(f), content:c, title:titleOf(c,f), hash:hash(c)}; });

// Group by normalized title
const groups = new Map();
for (const d of docs){
  const k = normTitle(d.title);
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(d);
}

const actions = [];

// Exact duplicate content removal (keep first shortest path)
for (const [k, arr] of groups.entries()){
  const byHash = new Map();
  for (const d of arr){
    if (!byHash.has(d.hash)) byHash.set(d.hash, []);
    byHash.get(d.hash).push(d);
  }
  for (const [h, entries] of byHash.entries()){
    if (entries.length>1){
      entries.sort((a,b)=> a.file.length - b.file.length);
      const keep = entries[0];
      for (const dup of entries.slice(1)){
        fs.unlinkSync(dup.file);
        actions.push({type:'deleted-exact', kept:rel(keep.file), removed:rel(dup.file)});
      }
    }
  }
}

// Near-duplicate titles pruning
const docsRemaining = walk(REPO_ROOT).filter(f=>f.endsWith('.md') && !/docs[\\/](INDEX|SUMMARIES|DUPLICATE_PRUNE_REPORT)\.md$/i.test(f));
const meta = docsRemaining.map(f=>{ const c=fs.readFileSync(f,'utf8'); return {file:f, rel:rel(f), content:c, title:titleOf(c,f)}; });
for (let i=0;i<meta.length;i++){
  for (let j=i+1;j<meta.length;j++){
    const a=meta[i], b=meta[j];
    const dist = levenshtein(a.title.toLowerCase(), b.title.toLowerCase());
    if (dist>0 && dist<=2){
      // Choose longer content to keep
      const keep = a.content.length >= b.content.length ? a : b;
      const prune = keep===a ? b : a;
      // Instead of delete, mark as deprecated stub pointing to keep
      const notice = `# ${prune.title}\n\n> Deprecated duplicate of **${keep.title}**. Refer to [${keep.title}](${rel(path.relative(REPO_ROOT, keep.file))}).\n`;
      fs.writeFileSync(prune.file, notice, 'utf8');
      actions.push({type:'stubbed-near', kept:rel(keep.file), stub:rel(prune.file)});
    }
  }
}

// Write report
let report = '# Duplicate Documentation Prune Report\n\nGenerated: ' + new Date().toISOString() + '\n\n';
if (!actions.length){
  report += 'No duplicates detected.\n';
} else {
  report += '| Action | File | Target |\n|--------|------|--------|\n';
  for (const a of actions){
    if (a.type==='deleted-exact') report += `| Deleted Exact | ${a.removed} | kept: ${a.kept} |\n`;
    if (a.type==='stubbed-near') report += `| Stubbed Near | ${a.stub} | kept: ${a.kept} |\n`;
  }
}
fs.writeFileSync(REPORT_FILE, report, 'utf8');
console.log('Prune complete. Actions:', actions.length);
