import { getAromaColor } from '$lib/services/myCoffees/colors/colors';
import { expect } from '@playwright/test';
import { testCoffeeEntries } from '../features/app.feature';
import { test } from '../fixtures';

test('list', async ({ myCoffeesPage }) => {
  await expect(myCoffeesPage.coffeeList).toHaveCount(3);
});

test('entry item', async ({ myCoffeesPage }) => {
  const firstEntry = myCoffeesPage.getCoffeeEntry(0);
  await expect(myCoffeesPage.getCoffeeEntryTitle(firstEntry)).toHaveText(
    'Rwanda Kamajumba (Drip Roasters)',
  );
  await expect(myCoffeesPage.getCoffeeEntryDetail(firstEntry)).toHaveText(
    'Kamajumba Estate | Washed | Red Bourbon',
  );
});

test('search', async ({ myCoffeesPage }) => {
  await myCoffeesPage.enterSearch('Terroir PAN');
  await expect(myCoffeesPage.coffeeList).toHaveCount(1);
  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Terroir PAN (Rösterei)');
});

test('search clear', async ({ myCoffeesPage }) => {
  await myCoffeesPage.enterSearch('Terroir PAN');
  await expect(myCoffeesPage.coffeeList).toHaveCount(1);

  await myCoffeesPage.clearSearch();
  await expect(myCoffeesPage.coffeeList).toHaveCount(3);
});

test('sort Recently Added', async ({ myCoffeesPage }) => {
  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Rwanda Kamajumba (Drip Roasters)');

  await myCoffeesPage.clickSortButton();
  await myCoffeesPage.clickSortOption('Recently Added');

  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Wiedner Mischung (Alt Wien)');
});

test('sort Recently Updated', async ({ myCoffeesPage }) => {
  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Rwanda Kamajumba (Drip Roasters)');

  await myCoffeesPage.clickSortButton();
  await myCoffeesPage.clickSortOption('Recently Updated');

  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Rwanda Kamajumba (Drip Roasters)');
});

test('sort Best', async ({ myCoffeesPage }) => {
  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Rwanda Kamajumba (Drip Roasters)');

  await myCoffeesPage.clickSortButton();
  await myCoffeesPage.clickSortOption('Best');

  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Terroir PAN (Rösterei)');
});

test('sort A-Z', async ({ myCoffeesPage }) => {
  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Rwanda Kamajumba (Drip Roasters)');

  await myCoffeesPage.clickSortButton();
  await myCoffeesPage.clickSortOption('A-Z');

  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Rwanda Kamajumba (Drip Roasters)');
});

test('sort Z-A', async ({ myCoffeesPage }) => {
  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Rwanda Kamajumba (Drip Roasters)');

  await myCoffeesPage.clickSortButton();
  await myCoffeesPage.clickSortOption('Z-A');

  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Wiedner Mischung (Alt Wien)');
});

test('sort Low Altitude', async ({ myCoffeesPage }) => {
  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Rwanda Kamajumba (Drip Roasters)');

  await myCoffeesPage.clickSortButton();
  await myCoffeesPage.clickSortOption('Low Altitude');

  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Terroir PAN (Rösterei)');
  await expect(myCoffeesPage.getCoffeeEntryTitle(2)).toHaveText('Rwanda Kamajumba (Drip Roasters)');
});

test('sort High Altitude', async ({ myCoffeesPage }) => {
  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Rwanda Kamajumba (Drip Roasters)');

  await myCoffeesPage.clickSortButton();
  await myCoffeesPage.clickSortOption('High Altitude');

  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Wiedner Mischung (Alt Wien)');
  await expect(myCoffeesPage.getCoffeeEntryTitle(2)).toHaveText('Rwanda Kamajumba (Drip Roasters)');
});

test('entry add', async ({ myCoffeesPage, myCoffeesEntryDetailPage }) => {
  await myCoffeesPage.clickAddButton();
  await expect(myCoffeesEntryDetailPage.header).toBeVisible();

  await myCoffeesEntryDetailPage.nameInput.fill('Tovolea Classic');
  await myCoffeesEntryDetailPage.originInput.fill('Brazil/Ethiopia');
  await myCoffeesEntryDetailPage.processInput.fill('Washed');
  await myCoffeesEntryDetailPage.varietyInput.fill('Arabica');
  await myCoffeesEntryDetailPage.altitudeInput.fill('1500');
  await myCoffeesEntryDetailPage.roasterInput.fill('Tovolea');
  await myCoffeesEntryDetailPage.traderInput.fill('Tovolea');
  const aromasInput = myCoffeesEntryDetailPage.aromasInput;
  for (const aroma of ['nutty', 'dark chocolate', 'smokey']) {
    await aromasInput.fill(aroma);
    await aromasInput.press('Enter');
  }
  await myCoffeesEntryDetailPage.descriptionInput.fill('excellent for iced coffee');

  await myCoffeesEntryDetailPage.clickSaveButton();
  await myCoffeesEntryDetailPage.clickBackButton();

  const entry = myCoffeesPage.getCoffeeEntry(0);
  await expect(myCoffeesPage.getCoffeeEntryTitle(entry)).toHaveText('Tovolea Classic (Tovolea)');
  await expect(myCoffeesPage.getCoffeeEntryDetail(entry)).toHaveText(
    'Brazil/Ethiopia | Washed | Arabica | 1500m',
  );
});

test('entry edit', async ({ myCoffeesPage, myCoffeesEntryDetailPage }) => {
  await myCoffeesPage.clickCoffeeEntry(1);
  await myCoffeesEntryDetailPage.varietyInput.fill('SL34');
  await myCoffeesEntryDetailPage.clickSaveButton();
  await myCoffeesEntryDetailPage.clickBackButton();

  await expect(myCoffeesPage.getCoffeeEntryDetail(0)).toHaveText('Panama | Washed | SL34 | 1000m');
});

test('entry edit cancel', async ({ appPage, myCoffeesPage, myCoffeesEntryDetailPage }) => {
  await myCoffeesPage.clickCoffeeEntry(1);
  await myCoffeesEntryDetailPage.roasterInput.fill('');
  await myCoffeesEntryDetailPage.clickBackButton();
  await appPage.clickWarningConfirmButton();

  await expect(myCoffeesPage.getCoffeeEntryDetail(1)).toHaveText('Panama | Washed | 1000m');
});

test('entry edit without changes', async ({ myCoffeesPage, myCoffeesEntryDetailPage }) => {
  await myCoffeesPage.clickCoffeeEntry(2);
  await myCoffeesEntryDetailPage.descriptionInput.fill('Excellent for cold brew');
  await myCoffeesEntryDetailPage.descriptionInput.fill('');
  await myCoffeesEntryDetailPage.clickBackButton();

  await expect(myCoffeesPage.getCoffeeEntryTitle(2)).toHaveText('Wiedner Mischung (Alt Wien)');
});

test('entry delete', async ({ myCoffeesPage, myCoffeesEntryDetailPage }) => {
  await myCoffeesPage.clickCoffeeEntry(2);
  await myCoffeesEntryDetailPage.clickDeleteButton();

  await expect(myCoffeesPage.coffeeList).toHaveCount(2);
});

test('entry delete undo', async ({ myCoffeesPage, myCoffeesEntryDetailPage }) => {
  await myCoffeesPage.clickCoffeeEntry(2);
  await myCoffeesEntryDetailPage.clickDeleteButton();
  await myCoffeesPage.clickUndoButton();

  await expect(myCoffeesPage.coffeeList).toHaveCount(3);
});

test('aromas of a new, unsaved entry use the aroma colours', async ({
  myCoffeesPage,
  myCoffeesEntryDetailPage,
}) => {
  await myCoffeesPage.clickAddButton();
  await expect(myCoffeesEntryDetailPage.nameInput).toBeVisible();

  for (const aroma of ['apple', 'cherry']) {
    await myCoffeesEntryDetailPage.addAroma(aroma);
  }

  await expect(myCoffeesEntryDetailPage.aromaChips).toHaveCount(2);
  for (const aroma of ['apple', 'cherry']) {
    await expect(myCoffeesEntryDetailPage.getAromaChip(aroma)).toHaveCSS(
      'background-color',
      getAromaColor(aroma).backgroundColor,
    );
  }
});

test.describe('aromas', () => {
  test.beforeEach(async ({ myCoffeesPage, myCoffeesEntryDetailPage }) => {
    await myCoffeesPage.clickCoffeeEntry(1);
    await expect(myCoffeesEntryDetailPage.nameInput).toHaveValue('Terroir PAN');
  });

  test('chips use the aroma colours', async ({ myCoffeesEntryDetailPage }) => {
    const aromas = ['blueberry', 'caramel', 'floral', 'sweet', 'honey'];
    await expect(myCoffeesEntryDetailPage.aromaChips).toHaveCount(aromas.length);

    for (const aroma of aromas) {
      await expect(myCoffeesEntryDetailPage.getAromaChip(aroma)).toHaveCSS(
        'background-color',
        getAromaColor(aroma).backgroundColor,
      );
    }
  });

  test('add, reject duplicate, remove and save', async ({
    page,
    appPage,
    myCoffeesEntryDetailPage,
  }) => {
    await myCoffeesEntryDetailPage.addAroma('nutty');
    await expect(myCoffeesEntryDetailPage.getAromaChip('nutty')).toBeVisible();
    await expect(myCoffeesEntryDetailPage.aromaChips).toHaveCount(6);

    await myCoffeesEntryDetailPage.addAroma('caramel');
    await expect(myCoffeesEntryDetailPage.aromaChips).toHaveCount(6);
    await expect(myCoffeesEntryDetailPage.getAromaChip('caramel')).toHaveCount(1);

    await myCoffeesEntryDetailPage.getAromaChip('floral').click();
    await expect(myCoffeesEntryDetailPage.getAromaChip('floral')).toHaveCount(0);

    await myCoffeesEntryDetailPage.clickSaveButton();
    await expect
      .poll(async () => (await appPage.getCoffeeEntry(testCoffeeEntries[1].id))?.aromas)
      .toEqual(['blueberry', 'caramel', 'sweet', 'honey', 'nutty']);
    await page.reload();
    await expect(myCoffeesEntryDetailPage.aromaChips).toHaveText([
      /blueberry/,
      /caramel/,
      /sweet/,
      /honey/,
      /nutty/,
    ]);
  });

  test('escape in the input does not propagate', async ({ page, myCoffeesEntryDetailPage }) => {
    await page.evaluate(() => {
      (window as EscapeCounter).__escapes = 0;
      window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          (window as EscapeCounter).__escapes! += 1;
        }
      });
    });
    const escapes = () => page.evaluate(() => (window as EscapeCounter).__escapes);

    await myCoffeesEntryDetailPage.aromasInput.press('Escape');
    expect(await escapes()).toBe(0);

    await myCoffeesEntryDetailPage.aromasInput.blur();
    await page.keyboard.press('Escape');
    expect(await escapes()).toBe(1);
  });
});

type EscapeCounter = Window & { __escapes?: number };
