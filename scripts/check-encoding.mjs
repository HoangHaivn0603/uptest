import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const SCAN_DIRS = [
  'src',
  'public',
  '.github',
];

const ROOT_FILES = [
  'index.html',
  'README.md',
  'package.json',
  'vite.config.js',
  'eslint.config.js',
  'tailwind.config.js',
];

const TEXT_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.css',
  '.html',
  '.md',
  '.json',
  '.yml',
  '.yaml',
  '.txt',
]);

const BAD_PATTERNS = [
  { label: 'replacement-char', regex: /\uFFFD/g },
  { label: 'mojibake-marker', regex: /(Ã.|Ä.|Æ.|á»|áº|â€|â€¢|ðŸ)/g },
];

function shouldSkipDir(name) {
  return name === 'node_modules' || name === 'dist' || name === '.git';
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!shouldSkipDir(entry.name)) walk(fullPath, out);
      continue;
    }
    if (!entry.isFile()) continue;
    if (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      out.push(fullPath);
    }
  }
  return out;
}

function getAllFiles() {
  const files = [];
  for (const dir of SCAN_DIRS) {
    walk(path.join(ROOT, dir), files);
  }
  for (const file of ROOT_FILES) {
    const fullPath = path.join(ROOT, file);
    if (fs.existsSync(fullPath)) files.push(fullPath);
  }
  return Array.from(new Set(files));
}

function findLineCol(content, index) {
  const before = content.slice(0, index);
  const lines = before.split('\n');
  const line = lines.length;
  const col = lines[lines.length - 1].length + 1;
  return { line, col };
}

function relative(p) {
  return path.relative(ROOT, p).replaceAll('\\', '/');
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  for (const { label, regex } of BAD_PATTERNS) {
    regex.lastIndex = 0;
    let match = regex.exec(content);
    while (match) {
      const { line, col } = findLineCol(content, match.index);
      issues.push({
        file: relative(filePath),
        line,
        col,
        label,
        snippet: match[0],
      });
      match = regex.exec(content);
    }
  }

  return issues;
}

function main() {
  const files = getAllFiles();
  const issues = files.flatMap(scanFile);

  if (issues.length === 0) {
    console.log('Encoding check passed: no mojibake markers found.');
    process.exit(0);
  }

  console.error(`Encoding check failed: found ${issues.length} issue(s).`);
  for (const issue of issues) {
    console.error(
      `- ${issue.file}:${issue.line}:${issue.col} [${issue.label}] "${issue.snippet}"`,
    );
  }
  process.exit(1);
}

main();
