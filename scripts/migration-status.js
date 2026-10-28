import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { matchesGlob } from 'node:path';
import { parseArgs } from 'node:util';

const SRC_CODE = 'src/**/*.{ts,js,svelte}';
const SRC_ALL = 'src/**/*.{ts,js,svelte,html,css,scss}';
const UI_LAYER = ['src/lib/components/shared/ui/**', 'src/lib/services/ui/**'];
// The quoted package name only appears in JS imports: v4+ imports its CSS from .css files, which
// the globs using this don't match.
const SKELETON_V2_JS_IMPORT = /['"]@skeletonlabs\/skeleton(?:\/[^'"\n]*)?['"]/g;
const SKELETON_APPLY_CLASS = /\b(?:variant-|btn\b|card\b|chip\b|badge\b|input)|-token\b/;
// `input-group` itself stays in v4; only its v2 children and divider are gone.
const V2_CLASS = /^(?:variant-[a-z]|input-group-(?:shim|divider))|-token$/;

/**
 * Each category consists of rules. A rule matches tracked files via `glob` (minus `exclude`).
 * With `regex`, every match in a file counts (only those passing `select`, if given); without it,
 * the file's existence counts once. `select` keeps the regexes simple (no backtracking).
 * `unit: 'files'` counts matching files instead of matches.
 */
const CATEGORIES = [
  {
    name: 'skeleton-v2-imports-outside-ui',
    targetPhase: 1,
    unit: 'files',
    rules: [{ glob: SRC_CODE, exclude: UI_LAYER, regex: SKELETON_V2_JS_IMPORT }],
  },
  {
    name: 'local-storage-store',
    targetPhase: 1,
    unit: 'files',
    rules: [{ glob: SRC_CODE, regex: /\blocalStorageStore\b/g }],
  },
  {
    name: 'app-shell',
    targetPhase: 1,
    unit: 'files',
    rules: [{ glob: SRC_CODE, regex: /\bAppShell\b/g }],
  },
  {
    name: 'conic-gradient',
    targetPhase: 1,
    unit: 'files',
    rules: [{ glob: SRC_CODE, regex: /\bConicGradient\b/g }],
  },
  {
    name: 'scss',
    targetPhase: 1,
    rules: [
      { glob: 'src/**/*.scss' },
      { glob: 'src/**/*.svelte', regex: /lang=["']scss["']/g },
      { glob: 'package.json', regex: /"sass"\s*:/g },
    ],
  },
  {
    name: 'skeleton-apply-in-app-css',
    targetPhase: 1,
    rules: [
      {
        glob: 'src/app.{css,scss}',
        regex: /@apply[^;\n]*/g,
        select: (match) => SKELETON_APPLY_CLASS.test(match),
      },
    ],
  },
  {
    name: 'tailwind-v3',
    targetPhase: 2,
    rules: [
      { glob: 'tailwind.config.*' },
      { glob: 'postcss.config.*' },
      { glob: 'theme.ts' },
      { glob: SRC_ALL, regex: /@tailwind\s/g },
      {
        glob: 'package.json',
        regex: /"(?:@skeletonlabs\/tw-plugin|@tailwindcss\/container-queries|autoprefixer)"\s*:/g,
      },
    ],
  },
  {
    name: 'skeleton-v2-imports-total',
    targetPhase: 2,
    unit: 'files',
    rules: [{ glob: SRC_CODE, regex: SKELETON_V2_JS_IMPORT }],
  },
  {
    name: 'v2-classes',
    targetPhase: 2,
    rules: [{ glob: SRC_ALL, regex: /[\w-]+/g, select: (word) => V2_CLASS.test(word) }],
  },
  {
    name: 'migration-placeholders',
    targetPhase: 2,
    rules: [{ glob: '{src,tests}/**', regex: /MIGRATION_PLACEHOLDER/g }],
  },
  {
    name: 'skeleton-v4-only',
    targetPhase: 3,
    rules: [
      { glob: SRC_ALL, regex: /\big-[\w-]+|\bcard-hover\b|\bbtn-icon-fab\b|@variant theme-/g },
    ],
  },
  {
    name: 'sveltekit-2',
    targetPhase: 4,
    rules: [
      { glob: 'svelte.config.js' },
      { glob: SRC_CODE, regex: /['"]\$app\/stores['"]/g },
      { glob: SRC_CODE, regex: /['"]\$lib\//g },
    ],
  },
];

const { values: args } = parseArgs({
  options: {
    json: { type: 'boolean', default: false },
    phase: { type: 'string' },
  },
});

const files = listFiles();
const results = CATEGORIES.map(evaluateCategory);

if (args.json) {
  console.log(JSON.stringify(results, null, 2));
} else {
  printTable(results);
}

if (args.phase !== undefined) {
  const phase = Number(args.phase);
  if (!Number.isInteger(phase)) {
    console.error(`Invalid --phase value: ${args.phase}`);
    process.exit(2);
  }

  const open = results.filter((result) => result.targetPhase <= phase && result.count > 0);
  if (open.length > 0) {
    if (!args.json) {
      console.error(
        `\nPhase ${phase}: ${open.length} categories not done: ${open.map((r) => r.category).join(', ')}`,
      );
    }
    process.exit(1);
  }
}

function listFiles() {
  const gitArgs = ['ls-files', '--cached', '--others', '--exclude-standard'];
  const output = execFileSync('git', gitArgs, { encoding: 'utf-8' }); // NOSONAR: dev script, git from PATH
  return [...new Set(output.split('\n').filter(Boolean))].filter((file) => existsSync(file));
}

function evaluateCategory({ name, targetPhase, unit = 'matches', rules }) {
  const matchesPerFile = new Map();

  for (const { glob, exclude = [], regex, select = () => true } of rules) {
    const ruleFiles = files.filter(
      (file) => matchesGlob(file, glob) && !exclude.some((pattern) => matchesGlob(file, pattern)),
    );

    for (const file of ruleFiles) {
      const count = regex
        ? (readFileSync(file, 'utf-8').match(regex) ?? []).filter(select).length
        : 1;
      if (count > 0) {
        matchesPerFile.set(file, (matchesPerFile.get(file) ?? 0) + count);
      }
    }
  }

  const matchedFiles = [...matchesPerFile.keys()].sort((a, b) => a.localeCompare(b));
  const count =
    unit === 'files'
      ? matchedFiles.length
      : [...matchesPerFile.values()].reduce((sum, value) => sum + value, 0);

  return { category: name, count, targetPhase, files: matchedFiles };
}

function printTable(results) {
  const headers = ['Category', 'Count', 'Files', 'Phase'];
  const rows = results.map((r) => [
    r.category,
    String(r.count),
    String(r.files.length),
    String(r.targetPhase),
  ]);
  const widths = headers.map((header, i) =>
    Math.max(header.length, ...rows.map((row) => row[i].length)),
  );
  const format = (row) =>
    row.map((cell, i) => (i === 0 ? cell.padEnd(widths[i]) : cell.padStart(widths[i]))).join('  ');

  console.log(format(headers));
  console.log(widths.map((width) => '-'.repeat(width)).join('  '));
  rows.forEach((row) => console.log(format(row)));
}
