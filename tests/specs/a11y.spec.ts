import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from '../fixtures';
import { screens } from '../features/screens';

interface RuleCount {
  ruleId: string;
  count: number;
}

// One file per screen and scheme, so parallel workers never write the same file. Only rule ids
// and counts are stored: axe targets are CSS selectors that change with every markup change.
const baselineDir = fileURLToPath(new URL('../a11y/baseline/', import.meta.url));
const updateBaseline = process.env['A11Y_UPDATE_BASELINE'] === '1';

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme });

    for (const screen of screens) {
      test(screen.name, async ({ page }) => {
        await gotoReady(page, screen.path);
        await screen.ready(page);

        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
        const actual: Array<RuleCount> = results.violations
          .map((violation) => ({ ruleId: violation.id, count: violation.nodes.length }))
          .sort((a, b) => a.ruleId.localeCompare(b.ruleId));
        const baselineFile = join(baselineDir, `${screen.name}-${colorScheme}.json`);

        if (updateBaseline) {
          mkdirSync(baselineDir, { recursive: true });
          writeFileSync(baselineFile, `${JSON.stringify(actual, null, 2)}\n`);
          return;
        }

        const baseline: Array<RuleCount> = JSON.parse(readFileSync(baselineFile, 'utf-8'));
        const countIn = (counts: Array<RuleCount>, ruleId: string) =>
          counts.find((entry) => entry.ruleId === ruleId)?.count ?? 0;

        const improved = baseline.filter(({ ruleId, count }) => countIn(actual, ruleId) < count);
        if (improved.length > 0) {
          console.log(
            `[a11y] ${screen.name}-${colorScheme}: fewer violations than the baseline for ` +
              `${improved.map(({ ruleId }) => ruleId).join(', ')}; the baseline can be shrunk.`,
          );
        }

        const regressions = actual.filter(({ ruleId, count }) => count > countIn(baseline, ruleId));
        const details = results.violations
          .filter((violation) => regressions.some(({ ruleId }) => ruleId === violation.id))
          .map(
            (violation) =>
              `${violation.id} (${violation.help}):\n` +
              violation.nodes.map((node) => `  ${node.target.join(' ')}`).join('\n'),
          )
          .join('\n');

        expect(regressions, `New accessibility violations:\n${details}`).toEqual([]);
      });
    }
  });
}

async function gotoReady(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-test', 'ready');
}
