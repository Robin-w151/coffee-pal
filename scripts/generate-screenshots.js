import { chromium } from 'playwright';
import { expect } from '@playwright/test';
import { join } from 'path';

const baseUrl = process.env.BASE_URL ?? 'https://coffee-pal.vercel.app';
const screenshotsDir = process.env.SCREENSHOTS_DIR ?? 'screenshots';
const testJournalEntries = [
  {
    method: 'Aeropress',
    water: 200,
    waterTemperature: 98,
    coffee: 12,
    coffeeType: 'Frutos Rojos',
    grindSettings: '24 clicks',
    description: 'Super sweet and fruity with an hint of sour cherries',
  },
  {
    method: 'Moka',
    water: 90,
    waterTemperature: 100,
    coffee: 10,
    coffeeType: 'Java WIB',
    grindSettings: '12 clicks',
    description: '',
  },
  {
    method: 'PuckPuck',
    water: 500,
    waterTemperature: 20,
    coffee: 38,
    coffeeType: 'Ethiopia Sidamo',
    grindSettings: '36 clicks',
    description: '45-60 drops/min',
  },
];
const testCoffeeEntries = [
  {
    name: 'Frutos Rojos',
    origin: 'Colombia',
    trader: 'Alt Wien',
    aromas: [
      'strawberry yoghurt',
      'red berries',
      'vanilla pudding',
      'apple-grape juice',
      'orange',
      'sour cherry',
      'black tea',
    ],
    description: 'Tastes super fresh',
  },
  {
    name: 'Ethiopia Sidamo',
    origin: 'Ethiopia',
    trader: 'Alt Wien',
    aromas: [],
    description: '',
  },
  {
    name: 'Java WIB',
    origin: 'Indonesia',
    trader: 'Alt Wien',
    aromas: [],
    description: '',
  },
];

let page;
let category;

generateScreenshots().catch(console.error);

async function generateScreenshots() {
  const browser = await chromium.launch();

  const mobileContext = await browser.newContext({ viewport: { width: 412, height: 915 } });
  page = await mobileContext.newPage();
  category = 'mobile';
  await captureApp();

  const desktopContext = await browser.newContext({ viewport: { width: 1400, height: 800 } });
  page = await desktopContext.newPage();
  category = 'desktop';
  await page.goto(`${baseUrl}/settings`);
  await page.getByText('Dark').click();
  await captureApp();

  await browser.close();
}

async function captureApp() {
  await captureJournal();
  await captureMyCoffees();
  await captureCalculator();
  await captureDripCounter();
}

async function captureJournal() {
  await page.goto(baseUrl);
  await expect(page.getByText('could not find any entries')).toBeVisible();

  for (let i = 0; i < testJournalEntries.length; i++) {
    await addJournalEntry(testJournalEntries[i], i === 0);
  }

  await takeScreenshot('journal-overview');
}

async function captureMyCoffees() {
  await page.goto(`${baseUrl}/my-coffees`);
  await expect(page.getByText('could not find any coffees')).toBeVisible();

  for (const entry of testCoffeeEntries) {
    await addCoffeeEntry(entry);
  }

  await takeScreenshot('my-coffees-overview');
}

async function captureCalculator() {
  await page.goto(`${baseUrl}/calculator`);
  await takeScreenshot('calculator');
}

async function captureDripCounter() {
  await page.goto(`${baseUrl}/drip-counter`);

  for (const timeout of [0, 1000]) {
    await page.waitForTimeout(timeout);
    await page.getByRole('button', { name: 'Tap' }).click();
  }

  await takeScreenshot('drip-counter');
}

async function addJournalEntry(
  { method, water, waterTemperature, coffee, coffeeType, grindSettings, description } = {},
  screenshot = false,
) {
  await clickAddButton();
  await expect(page.getByText('add entry')).toBeVisible();

  const methodInput = page.getByLabel('brew method');
  await methodInput.fill(method);
  await methodInput.press('Escape');

  const coffeeTypeInput = page.getByLabel('type of coffee');
  await coffeeTypeInput.fill(coffeeType);
  await coffeeTypeInput.press('Escape');

  await page.getByLabel('amount of water').fill(`${water}`);
  await page.getByLabel('amount of coffee').fill(`${coffee}`);
  await page.getByLabel('water temperature').fill(`${waterTemperature}`);
  await page.getByLabel('grind settings').fill(grindSettings);
  await page.getByLabel('description').fill(description);

  await page.waitForTimeout(250);
  if (screenshot) {
    await takeScreenshot('journal-add-entry');
  }

  await clickSaveButton();
  await page.waitForTimeout(250);
}

async function addCoffeeEntry({ name, origin, trader, aromas, description } = {}) {
  await clickAddButton();
  await expect(page.getByText('add entry')).toBeVisible();

  await page.getByLabel('name').fill(name);
  await page.getByLabel('origin').fill(origin);
  await page.getByLabel('trader').fill(trader);

  const aromasInput = page.getByPlaceholder('aromas');
  for (const aroma of aromas) {
    await aromasInput.fill(aroma);
    await aromasInput.press('Enter');
  }

  await page.getByLabel('description').fill(description);

  await clickSaveButton();
  await page.waitForTimeout(250);
}

async function clickAddButton() {
  await page.getByTitle('add new entry').click();
}

async function clickSaveButton() {
  await page.getByTitle('save').click();
}

async function takeScreenshot(name) {
  await page.screenshot({ path: join(screenshotsDir, `${category}/${name}.jpeg`) });
}
