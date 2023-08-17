import {
  faCalculator,
  faClipboardList,
  faGear,
  faSeedling,
} from '@fortawesome/free-solid-svg-icons';

export const routes = [
  {
    href: '/',
    label: 'Calculator',
    icon: faCalculator,
  },
  {
    href: '/journal',
    label: 'Journal',
    icon: faClipboardList,
  },
  {
    href: '/my-coffees',
    label: 'My Coffees',
    icon: faSeedling,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: faGear,
  },
];
