import { expect } from '@playwright/test';
import { test } from '../fixtures';

test('my-coffees list', async ({ myCoffeesPage }) => {
  await expect(myCoffeesPage.coffeeList).toHaveCount(3);
});

test('my-coffees entry item', async ({ myCoffeesPage }) => {
  const firstEntry = myCoffeesPage.getCoffeeEntry(0);
  await expect(myCoffeesPage.getCoffeeEntryTitle(firstEntry)).toHaveText(
    'Rwanda Kamajumba - Kamajumba Estate',
  );
  await expect(myCoffeesPage.getCoffeeEntryDetail(firstEntry)).toHaveText(
    'Red Bourbon | Drip Roasters',
  );
});

test('my-coffees search', async ({ myCoffeesPage }) => {
  await myCoffeesPage.enterSearch('Terroir PAN');
  await expect(myCoffeesPage.coffeeList).toHaveCount(1);
  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Terroir PAN - Panama');
});

test('my-coffees search clear', async ({ myCoffeesPage }) => {
  await myCoffeesPage.enterSearch('Terroir PAN');
  await expect(myCoffeesPage.coffeeList).toHaveCount(1);

  await myCoffeesPage.clearSearch();
  await expect(myCoffeesPage.coffeeList).toHaveCount(3);
});

test('my-coffees sort', async ({ myCoffeesPage }) => {
  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText(
    'Rwanda Kamajumba - Kamajumba Estate',
  );

  await myCoffeesPage.clickSortButton();

  await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText('Wiedner Mischung - Mix');
});

test('my-coffees entry add', async ({ myCoffeesPage, myCoffeesEntryDetailPage }) => {
  await myCoffeesPage.clickAddButton();
  await expect(myCoffeesEntryDetailPage.header).toBeVisible();

  await myCoffeesEntryDetailPage.nameInput.fill('Tovolea Classic');
  await myCoffeesEntryDetailPage.originInput.fill('Brazil/Ethiopia');
  await myCoffeesEntryDetailPage.varietyInput.fill('Arabica');
  await myCoffeesEntryDetailPage.traderInput.fill('Tovolea');
  const aromasInput = myCoffeesEntryDetailPage.aromasInput;
  for (const aroma of ['nutty', 'dark chocolate', 'smokey']) {
    await aromasInput.fill(aroma);
    await aromasInput.press('Enter');
  }
  await myCoffeesEntryDetailPage.descriptionInput.fill('excellent for iced coffee');

  await myCoffeesEntryDetailPage.clickSaveButton();

  const entry = myCoffeesPage.getCoffeeEntry(2);
  await expect(myCoffeesPage.getCoffeeEntryTitle(entry)).toHaveText(
    'Tovolea Classic - Brazil/Ethiopia',
  );
  await expect(myCoffeesPage.getCoffeeEntryDetail(entry)).toHaveText('Arabica | Tovolea');
});

test('my-coffees entry edit', async ({ myCoffeesPage, myCoffeesEntryDetailPage }) => {
  await myCoffeesPage.clickJournalEntryEditButton(1);
  await myCoffeesEntryDetailPage.traderInput.fill('Rösterei');
  await myCoffeesEntryDetailPage.clickSaveButton();

  await expect(myCoffeesPage.getCoffeeEntryDetail(1)).toHaveText('Rösterei');
});

test('my-coffees entry delete', async ({ myCoffeesPage, myCoffeesEntryDetailPage }) => {
  await myCoffeesPage.clickJournalEntryEditButton(2);
  await myCoffeesEntryDetailPage.clickDeleteButton();

  await expect(myCoffeesPage.coffeeList).toHaveCount(2);
});

test('my-coffees entry delete undo', async ({ myCoffeesPage, myCoffeesEntryDetailPage }) => {
  await myCoffeesPage.clickJournalEntryEditButton(2);
  await myCoffeesEntryDetailPage.clickDeleteButton();
  await myCoffeesPage.clickUndoButton();

  await expect(myCoffeesPage.coffeeList).toHaveCount(3);
});
