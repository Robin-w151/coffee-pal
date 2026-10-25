import { screens } from '../features/screens';
import { colorSchemes, expectScreenshot, gotoReady, test } from './visual.fixtures';

for (const colorScheme of colorSchemes) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme });

    for (const screen of screens) {
      test(screen.name, async ({ page }) => {
        await gotoReady(page, screen.path);
        await screen.ready(page);

        await expectScreenshot(page, screen.name, colorScheme);
      });
    }
  });
}
