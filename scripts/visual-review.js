import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parseArgs } from 'node:util';

const SCREENSHOTS_DIR = 'tests/visual/__screenshots__';
const RESULTS_DIR = 'test-results';
const OUTPUT_FILE = join(RESULTS_DIR, 'visual-review.html');
// Written by the JSON reporter in playwright.visual.config.ts.
const TEST_RESULTS_FILE = join(RESULTS_DIR, 'visual-results.json');

/**
 * Builds test-results/visual-review.html.
 *
 * Default: every committed baseline next to the `-actual.png` (and `-diff.png`) of the last
 * `pnpm test:visual` run. Playwright only writes actuals for failing screenshots, so a baseline
 * without one is "unchanged". Tests that failed before taking their screenshot are listed apart, as
 * their baselines were never compared.
 *
 * `--base <git-ref>`: the baselines committed at <ref> next to the baselines in the working tree,
 * including screenshots removed since <ref>.
 */
const { values: args } = parseArgs({ options: { base: { type: 'string' } } });

const baselines = listBaselines();
const rows = args.base ? compareWithRef(args.base, baselines) : baselines.map(findActual);
const failedTests = args.base ? [] : listTestsFailedBeforeScreenshot();

mkdirSync(RESULTS_DIR, { recursive: true });
writeFileSync(OUTPUT_FILE, renderPage(rows, failedTests));

const changed = rows.filter((row) => row.status !== 'unchanged').length;
console.log(`${OUTPUT_FILE}: ${rows.length} screens, ${changed} changed`);
if (failedTests.length) {
  console.log(`${failedTests.length} tests failed before their screenshot; see the report`);
}

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

// Git errors (e.g. an unknown ref) end the script, rather than reporting every screenshot as new.
function compareWithRef(ref, baselines) {
  try {
    git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]);
  } catch {
    console.error(`Unknown git ref: ${ref}`);
    process.exit(1);
  }
  const refPaths = new Set(
    git(['ls-tree', '-r', '--name-only', ref, '--', SCREENSHOTS_DIR])
      .toString()
      .split('\n')
      .filter((path) => path.endsWith('.png')),
  );
  const currentPaths = new Set(baselines.map((baseline) => baseline.path));
  const removed = [...refPaths]
    .filter((path) => !currentPaths.has(path))
    .map((path) => {
      const [project, file] = relative(SCREENSHOTS_DIR, path).split(sep);
      return {
        project,
        name: file.replace(/\.png$/, ''),
        path,
        status: 'removed',
        images: [
          [ref, dataSrc(git(['show', `${ref}:${path}`]))],
          ['Working tree', null],
        ],
      };
    });

  const compared = baselines.map((baseline) => {
    const current = readFileSync(baseline.path);
    if (!refPaths.has(baseline.path)) {
      return {
        ...baseline,
        status: 'new',
        images: [
          [ref, null],
          ['Working tree', dataSrc(current)],
        ],
      };
    }

    const previous = git(['show', `${ref}:${baseline.path}`]);
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
  });

  return [...compared, ...removed].sort((a, b) =>
    `${a.project}/${a.name}`.localeCompare(`${b.project}/${b.name}`),
  );
}

function git(args) {
  // NOSONAR: dev script, git from PATH
  return execFileSync('git', args, {
    stdio: ['ignore', 'pipe', 'inherit'],
    maxBuffer: 64 * 1024 * 1024,
  });
}

// Failed tests without an -actual.png never compared their screenshot, so its baseline would wrongly
// show as unchanged.
function listTestsFailedBeforeScreenshot() {
  if (!existsSync(TEST_RESULTS_FILE)) {
    console.warn(
      `${TEST_RESULTS_FILE} is missing: tests that failed before their screenshot can't be listed`,
    );
    return [];
  }

  const report = JSON.parse(readFileSync(TEST_RESULTS_FILE, 'utf8'));
  // Each spec with its describe titles; the top-level suites are the files.
  const specs = (suite, titles) => [
    ...(suite.specs ?? []).map((spec) => ({ ...spec, title: [...titles, spec.title].join(' › ') })),
    ...(suite.suites ?? []).flatMap((child) => specs(child, [...titles, child.title])),
  ];
  return report.suites
    .flatMap((file) => specs(file, []))
    .flatMap((spec) =>
      spec.tests
        .filter((test) => test.status === 'unexpected')
        .filter((test) =>
          test.results.every(
            (result) =>
              !result.attachments.some((attachment) => attachment.name.endsWith('-actual.png')),
          ),
        )
        .map((test) => ({
          title: `${test.projectName} / ${spec.file} › ${spec.title}`,
          error: stripAnsi(test.results.at(-1)?.error?.message ?? 'unknown error').split('\n')[0],
        })),
    );
}

function fileSrc(path) {
  return existsSync(path) ? relative(RESULTS_DIR, path) : null;
}

function dataSrc(buffer) {
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

function renderPage(rows, failedTests) {
  const failures = failedTests.length
    ? `
    <section class="failed">
      <h2>Failed before the screenshot <span>${failedTests.length} tests, their screens weren't compared</span></h2>
      <ul>
        ${failedTests.map((test) => `<li>${escapeHtml(test.title)}: ${escapeHtml(test.error)}</li>`).join('')}
      </ul>
    </section>`
    : '';
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
    section.failed { color: #b00; }
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
  ${failures}
  ${sections}
</body>
</html>
`;
}

function escapeHtml(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return text.replaceAll(/\u001b\[[0-9;]*m/g, '');
}
