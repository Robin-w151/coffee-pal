import {
  faCalculator,
  faClipboardList,
  faGear,
  faSeedling,
} from '@fortawesome/free-solid-svg-icons';

export const routes = [
  {
    href: '/',
    label: 'Journal',
    icon: faClipboardList,
    shortcutIcon: {
      src: 'icons/shortcuts/journal96.png',
      sizes: '96x96',
      type: 'image/png',
      purpose: 'any',
    },
  },
  {
    href: '/my-coffees',
    label: 'My Coffees',
    icon: faSeedling,
    shortcutIcon: {
      src: 'icons/shortcuts/my_coffees96.png',
      sizes: '96x96',
      type: 'image/png',
      purpose: 'any',
    },
  },
  {
    href: '/calculator',
    label: 'Calculator',
    icon: faCalculator,
    shortcutIcon: {
      src: 'icons/shortcuts/calculator96.png',
      sizes: '96x96',
      type: 'image/png',
      purpose: 'any',
    },
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: faGear,
    shortcutIcon: {
      src: 'icons/shortcuts/settings96.png',
      sizes: '96x96',
      type: 'image/png',
      purpose: 'any',
    },
  },
];

export const mainRoute = routes[0];
