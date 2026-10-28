import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseArgs } from 'node:util';

const SCREENSHOTS_DIR = 'tests/visual/__screenshots__';
const RESULTS_DIR = 'test-results';
const OUTPUT_FILE = join(RESULTS_DIR, 'visual-review.html');

/**
 * Builds test-results/visual-review.html.
 *
 * Default: every committed baseline next to the `-actual.png` (and `-diff.png`) of the last
 * `pnpm test:visual` run. Playwright only writes actuals for failing screenshots, so a baseline
 * without one is "unchanged".
 *
 * `--base <git-ref>`: the baselines committed at <ref> next to the baselines in the working tree.
 */
const { values: args } = parseArgs({ options: { base: { type: 'string' } } });

const baselines = listBaselines();
const rows = args.base ? baselines.map(compareWithRef(args.base)) : baselines.map(findActual);

mkdirSync(RESULTS_DIR, { recursive: true });
writeFileSync(OUTPUT_FILE, renderPage(rows));

const changed = rows.filter((row) => row.status !== 'unchanged').length;
console.log(`${OUTPUT_FILE}: ${rows.length} screens, ${changed} changed`);

function listBaselines() {
  return readdirSync(SCREENSHOTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((project) =>
      readdirSync(join(SCREENSHOTS_DIR, project.name))
        .filter((file) => file.endsWith('.png'))
        .map((file) => ({
          project: project.name,
          name: file.replace(/\.png$/, ''),
          path: join(SCREENSHOTS_DIR, project.name, file),
        })),
    )
    .sort((a, b) => `${a.project}/${a.name}`.localeCompare(`${b.project}/${b.name}`));
}

// Playwright names result directories after the test and ends them with the project name.
function findActual(baseline) {
  const resultDirs = existsSync(RESULTS_DIR)
    ? readdirSync(RESULTS_DIR, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && entry.name.endsWith(`-${baseline.project}`))
        .map((entry) => join(RESULTS_DIR, entry.name))
    : [];
  const dir = resultDirs.find((candidate) =>
    existsSync(join(candidate, `${baseline.name}-actual.png`)),
  );

  if (!dir) {
    return { ...baseline, status: 'unchanged', images: [['Baseline', fileSrc(baseline.path)]] };
  }

  return {
    ...baseline,
    status: 'changed',
    images: [
      ['Baseline', fileSrc(baseline.path)],
      ['Actual', fileSrc(join(dir, `${baseline.name}-actual.png`))],
      ['Diff', fileSrc(join(dir, `${baseline.name}-diff.png`))],
    ],
  };
}

function compareWithRef(ref) {
  return (baseline) => {
    const current = readFileSync(baseline.path);
    const previous = gitShow(ref, baseline.path);

    if (!previous) {
      return {
        ...baseline,
        status: 'new',
        images: [
          [ref, null],
          ['Working tree', dataSrc(current)],
        ],
      };
    }
    if (previous.equals(current)) {
      return { ...baseline, status: 'unchanged', images: [['Working tree', dataSrc(current)]] };
    }
    return {
      ...baseline,
      status: 'changed',
      images: [
        [ref, dataSrc(previous)],
        ['Working tree', dataSrc(current)],
      ],
    };
  };
}

function gitShow(ref, path) {
  try {
    // NOSONAR: dev script, git from PATH
    return execFileSync('git', ['show', `${ref}:${path}`], { stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    // Missing at <ref>: a new screenshot.
    return undefined;
  }
}

function fileSrc(path) {
  return existsSync(path) ? relative(RESULTS_DIR, path) : null;
}

function dataSrc(buffer) {
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

function renderPage(rows) {
  const sections = rows
    .map(
      (row) => `
    <section class="${row.status}">
      <h2>${row.project} / ${row.name} <span>${row.status}</span></h2>
      <div class="images">
        ${row.images
          .map(
            ([label, src]) =>
              `<figure><figcaption>${label}</figcaption>${src ? `<img src="${src}" loading="lazy">` : '<p>missing</p>'}</figure>`,
          )
          .join('')}
      </div>
    </section>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Visual review</title>
  <style>
    body { font: 14px system-ui, sans-serif; margin: 1rem; }
    nav label { margin-right: 1rem; }
    section { border-top: 1px solid #ccc; padding: 0.5rem 0; }
    section.unchanged { opacity: 0.6; }
    body.only-changed section.unchanged { display: none; }
    h2 { font-size: 1rem; }
    h2 span { font-weight: normal; color: #666; }
    .images { display: flex; gap: 1rem; align-items: flex-start; overflow-x: auto; }
    figure { margin: 0; }
    img { max-width: 40vw; border: 1px solid #ddd; }
  </style>
</head>
<body>
  <nav>
    <label><input type="checkbox" onchange="document.body.classList.toggle('only-changed', this.checked)"> Only changed</label>
    ${rows.length} screens, ${rows.filter((row) => row.status !== 'unchanged').length} changed
  </nav>
  ${sections}
</body>
</html>
`;
}
