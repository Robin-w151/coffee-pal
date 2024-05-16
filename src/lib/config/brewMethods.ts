import type { AutocompleteOption } from '@skeletonlabs/skeleton';

export const methodOptions: Array<AutocompleteOption> = [
  {
    label: 'Aeropress',
    value: 'aeropress',
    keywords: 'filter,press,pressure',
  },
  {
    label: 'Cezve',
    value: 'cezve',
    keywords: 'immersion,ibrik,turkish',
  },
  {
    label: 'Chemex',
    value: 'chemex',
    keywords: 'filter,drip,infusion',
  },
  {
    label: 'Cold Brew',
    value: 'cold brew',
    keywords: 'filter,immersion,cold extraction',
  },
  {
    label: 'Cold Drip',
    value: 'cold drip',
    keywords: 'filter,drip,infusion,cold extraction',
  },
  {
    label: 'French Press',
    value: 'french press',
    keywords: 'filter,press,pressure,immersion',
  },
  {
    label: 'Moka',
    value: 'moka',
    keywords: 'stovetop,espresso,pressure,bialetti,express',
  },
  {
    label: 'Orea',
    value: 'orea',
    keywords: 'filter,drip,infusion',
  },
  {
    label: 'Origami',
    value: 'origami',
    keywords: 'filter,drip,infusion',
  },
  {
    label: 'Siphon',
    value: 'siphon',
    keywords: 'filter,infusion',
  },
  {
    label: 'V60',
    value: 'v60',
    keywords: 'filter,drip,infusion,hario',
  },
  {
    label: 'V60 Switch',
    value: 'v60 switch',
    keywords: 'filter,drip,infusion,hario,immersion',
  },
].sort((a, b) => a.label.localeCompare(b.label));
