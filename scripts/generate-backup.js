import { Chance } from 'chance';
import { DateTime } from 'luxon';
import { v4 as uuid } from 'uuid';
import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    journal: { type: 'string', default: '10000' },
    coffees: { type: 'string', default: '10000' },
    out: { type: 'string' },
    seed: { type: 'string' },
  },
});

const numberOfJournalEntries = Number(args.journal);
const numberOfCoffeeEntries = Number(args.coffees);
const seed = args.seed === undefined ? undefined : Number(args.seed);
const chance = seed === undefined ? new Chance() : new Chance(seed);
// With a seed, ids and dates come from the seeded generator, so the output is reproducible.
const seedBaseDate = DateTime.fromISO('2024-01-01T00:00:00.000Z', { zone: 'utc' });

const backup = generateBackup();
const backupName = args.out ?? `testdata/backup-${DateTime.now().toISO()}.json`;

writeFileSync(backupName, JSON.stringify(backup));

function generateBackup() {
  const journalEntries = [];
  const coffeesEntries = [];
  for (let i = 0; i < numberOfCoffeeEntries; i++) {
    coffeesEntries.push(generateCoffeeEntry());
  }

  for (let i = 0; i < numberOfJournalEntries; i++) {
    journalEntries.push(generateJournalEntry(coffeesEntries));
  }

  return {
    journal: {
      entries: journalEntries,
    },
    myCoffees: {
      entries: coffeesEntries,
    },
  };
}

function generateJournalEntry(coffeeEntries) {
  const coffeeType = coffeeEntries
    ? coffeeEntries[chance.integer({ min: 0, max: coffeeEntries.length - 1 })]
    : chance.name();

  const { createdAt, updatedAt } = generateTimestamps();

  return {
    id: generateId(),
    method: chance.name(),
    water: chance.integer({ min: 100, max: 1000 }),
    waterTemperature: chance.integer({ min: 4, max: 100 }),
    coffee: chance.integer({ min: 10, max: 80 }),
    coffeeType,
    grindSettings: chance.syllable(),
    rating: chance.integer({ min: 0, max: 5 }) || undefined,
    description: chance.paragraph(),
    createdAt,
    updatedAt,
  };
}

function generateCoffeeEntry() {
  const { createdAt, updatedAt } = generateTimestamps();

  return {
    id: generateId(),
    name: chance.name(),
    origin: chance.country(),
    variety: chance.word(),
    process: chance.word(),
    altitude: chance.integer({ min: 0, max: 3000 }),
    roaster: chance.name(),
    trader: chance.name(),
    aromas: Array.from({ length: chance.integer({ min: 2, max: 5 }) }, () => chance.word()),
    rating: chance.integer({ min: 0, max: 5 }) || undefined,
    description: chance.paragraph(),
    createdAt,
    updatedAt,
  };
}

function generateId() {
  return seed === undefined ? uuid() : chance.guid({ version: 4 });
}

function generateTimestamps() {
  if (seed === undefined) {
    const now = DateTime.now().toISO();
    return { createdAt: now, updatedAt: now };
  }

  const createdAt = seedBaseDate.plus({ minutes: chance.integer({ min: 0, max: 365 * 24 * 60 }) });
  const updatedAt = createdAt.plus({ minutes: chance.integer({ min: 0, max: 30 * 24 * 60 }) });
  return { createdAt: createdAt.toISO(), updatedAt: updatedAt.toISO() };
}
