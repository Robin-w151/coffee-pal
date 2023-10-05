import type { Backup } from '$lib/models/backup';
import type { JournalEntry } from '$lib/models/journal';
import { Chance } from 'chance';
import { DateTime } from 'luxon';
import { v4 as uuid } from 'uuid';
import { writeFileSync } from 'fs';
import type { CoffeeEntry } from '$lib/models/myCoffees';

const chance = new Chance();

const backup = generateBackup();
const backupName = `backup-${DateTime.now().toISO()}.json`;

writeFileSync(backupName, JSON.stringify(backup));

function generateBackup(): Backup {
  const journalEntries: Array<JournalEntry> = [];
  const myCoffeesEntries: Array<CoffeeEntry> = [];
  for (let i = 0; i < 10000; i++) {
    journalEntries.push(generateJournalEntry());
    myCoffeesEntries.push(generateCoffeeEntry());
  }

  return {
    journal: {
      entries: journalEntries,
    },
    myCoffees: {
      entries: myCoffeesEntries,
    },
  };
}

function generateJournalEntry(): JournalEntry {
  return {
    id: uuid(),
    method: chance.name(),
    water: chance.integer({ min: 100, max: 1000 }),
    waterTemperature: chance.integer({ min: 4, max: 100 }),
    coffee: chance.integer({ min: 10, max: 80 }),
    coffeeType: chance.name(),
    grindSettings: chance.syllable(),
    description: chance.paragraph(),
    createdAt: DateTime.now().toISO()!,
    updatedAt: DateTime.now().toISO()!,
  };
}

function generateCoffeeEntry(): CoffeeEntry {
  return {
    id: uuid(),
    name: chance.name(),
    origin: chance.country(),
    trader: chance.name(),
    aromas: Array(chance.integer({ min: 2, max: 5 })).map(() => chance.word()),
    description: chance.paragraph(),
    createdAt: DateTime.now().toISO()!,
    updatedAt: DateTime.now().toISO()!,
  };
}
