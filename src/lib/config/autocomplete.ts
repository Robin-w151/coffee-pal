import type { AutocompleteOption } from '@skeletonlabs/skeleton';

export const methodOptions: Array<AutocompleteOption> = [
  {
    label: 'Aeropress',
    value: 'aeropress',
    keywords: 'filter,press,pressure',
  },
  {
    label: 'V60',
    value: 'v60',
    keywords: 'filter,hario',
  },
  {
    label: 'V60 Switch',
    value: 'v60 switch',
    keywords: 'filter,hario,immersion',
  },
  {
    label: 'Chemex',
    value: 'chemex',
    keywords: 'filter',
  },
  {
    label: 'French Press',
    value: 'french press',
    keywords: 'filter,press,pressure,immersion',
  },
  {
    label: 'Moka',
    value: 'moka',
    keywords: 'stovetop,espresso,pressure',
  },
  {
    label: 'Cold Brew',
    value: 'cold brew',
    keywords: 'filter,immersion,cold extraction',
  },
  {
    label: 'Cold Drip',
    value: 'cold drip',
    keywords: 'filter,cold extraction',
  },
];
