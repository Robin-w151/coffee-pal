import { Chance } from 'chance';
import { DateTime } from 'luxon';
import { v4 as uuid } from 'uuid';
import { writeFileSync } from 'fs';

const numberOfEntries = 10_000;
const chance = new Chance();

const backup = generateBackup();
const backupName = `testdata/backup-${DateTime.now().toISO()}.json`;

writeFileSync(backupName, JSON.stringify(backup));

function generateBackup() {
  const journalEntries = [];
  const coffeesEntries = [];
  for (let i = 0; i < numberOfEntries; i++) {
    coffeesEntries.push(generateCoffeeEntry());
  }

  for (let i = 0; i < numberOfEntries; i++) {
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

  return {
    id: uuid(),
    method: chance.name(),
    water: chance.integer({ min: 100, max: 1000 }),
    waterTemperature: chance.integer({ min: 4, max: 100 }),
    coffee: chance.integer({ min: 10, max: 80 }),
    coffeeType,
    grindSettings: chance.syllable(),
    rating: chance.integer({ min: 0, max: 5 }) || undefined,
    description: chance.paragraph(),
    createdAt: DateTime.now().toISO(),
    updatedAt: DateTime.now().toISO(),
  };
}

function generateCoffeeEntry() {
  return {
    id: uuid(),
    name: chance.name(),
    origin: chance.country(),
    variety: chance.word(),
    process: chance.word(),
    roaster: chance.name(),
    trader: chance.name(),
    aromas: Array.from({ length: chance.integer({ min: 2, max: 5 }) }, () => chance.word()),
    rating: chance.integer({ min: 0, max: 5 }) || undefined,
    description: chance.paragraph(),
    createdAt: DateTime.now().toISO(),
    updatedAt: DateTime.now().toISO(),
  };
}
