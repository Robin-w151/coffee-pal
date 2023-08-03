import { faCalculator, faClipboardList, faGear } from '@fortawesome/free-solid-svg-icons';

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
    href: '/settings',
    label: 'Settings',
    icon: faGear,
  },
];
