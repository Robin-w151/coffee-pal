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
  },
  {
    href: '/my-coffees',
    label: 'My Coffees',
    icon: faSeedling,
  },
  {
    href: '/calculator',
    label: 'Calculator',
    icon: faCalculator,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: faGear,
  },
];

export const mainRoute = routes[0];
