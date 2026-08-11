import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';

const root = process.cwd();
const markdownRoots = [
  'README.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'SUPPORT.md',
  'ROADMAP.md',
  'docs',
];
const markdownFiles: string[] = [];

function collectMarkdown(path: string) {
  if (!existsSync(path)) return;

  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const entryPath = resolve(path, entry.name);
    if (entry.isDirectory()) collectMarkdown(entryPath);
    else if (entry.isFile() && entry.name.endsWith('.md')) markdownFiles.push(entryPath);
  }
}

for (const target of markdownRoots) {
  const targetPath = resolve(root, target);
  if (target.endsWith('.md')) {
    if (existsSync(targetPath)) markdownFiles.push(targetPath);
  } else {
    collectMarkdown(targetPath);
  }
}

const linkPattern = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const failures: string[] = [];

for (const file of markdownFiles) {
  const contents = readFileSync(file, 'utf8');
  for (const match of contents.matchAll(linkPattern)) {
    const href = match[1];
    if (
      href.startsWith('#') ||
      href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('mailto:')
    ) {
      continue;
    }

    const [pathPart] = href.split('#', 1);
    if (!pathPart) continue;

    const candidate = resolve(dirname(file), pathPart);
    const candidateInsideRepository = candidate === root || candidate.startsWith(`${root}${sep}`);
    if (!candidateInsideRepository || !existsSync(candidate)) {
      failures.push(`${relative(root, file)} -> ${href}`);
    }
  }
}

if (failures.length > 0) {
  console.error('Broken internal Markdown links:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${markdownFiles.length} Markdown files with no broken internal links.`);
}
