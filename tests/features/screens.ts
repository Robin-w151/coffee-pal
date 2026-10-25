import { expect, type Page } from '@playwright/test';
import { testCoffeeEntries, testJournalEntries } from './app.feature';

/** The app's screens with a check that each has rendered its content. */
export interface Screen {
  name: string;
  path: string;
  ready: (page: Page) => Promise<void>;
}

export const screens: Array<Screen> = [
  {
    name: 'journal-list',
    path: '/',
    ready: (page) => expect(page.getByText(/Terroir PAN/).first()).toBeVisible(),
  },
  {
    name: 'journal-entry',
    path: `/journal/${testJournalEntries[0].id}`,
    ready: (page) => expect(page.getByPlaceholder('Brew method')).toHaveValue('Aeropress'),
  },
  {
    name: 'journal-new',
    path: '/journal/new',
    ready: (page) => expect(page.getByRole('heading', { name: 'New Entry' })).toBeVisible(),
  },
  {
    name: 'my-coffees-list',
    path: '/my-coffees',
    ready: (page) => expect(page.getByText(/Rwanda Kamajumba/).first()).toBeVisible(),
  },
  {
    name: 'my-coffees-entry',
    path: `/my-coffees/${testCoffeeEntries[1].id}`,
    ready: (page) => expect(page.getByPlaceholder('Name')).toHaveValue('Terroir PAN'),
  },
  {
    name: 'my-coffees-new',
    path: '/my-coffees/new',
    ready: (page) => expect(page.getByPlaceholder('Name')).toBeVisible(),
  },
  {
    name: 'calculator',
    path: '/calculator',
    ready: (page) => expect(page.getByRole('heading', { name: 'Recipe' })).toBeVisible(),
  },
  {
    name: 'drip-counter',
    path: '/drip-counter',
    ready: (page) => expect(page.getByText('Tap to start counting')).toBeVisible(),
  },
  {
    name: 'settings',
    path: '/settings',
    ready: (page) => expect(page.getByRole('button', { name: 'Check for Updates' })).toBeVisible(),
  },
];
