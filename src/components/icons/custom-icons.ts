/**
 * LUPO custom icons — drawn on Lucide's 24×24 grid (stroke 2, round caps & joins)
 * so they sit naturally next to lucide-react and @lucide/lab icons.
 *
 * Usage:
 *   import { Icon } from 'lucide-react';
 *   import { fries } from '@/components/icons/custom-icons';
 *   <Icon iconNode={fries} size={24} strokeWidth={1.75} />
 */
import type { IconNode } from 'lucide-react';

/** French fries in a carton — used for the "Sides / الإضافات" section and fries items. */
export const fries: IconNode = [
  ['path', { d: 'M5 10l1.67 9.2a2 2 0 0 0 1.97 1.8h6.72a2 2 0 0 0 1.97 -1.8l1.67 -9.2', key: 'carton' }],
  ['path', { d: 'M5 10c2.2 1.6 4.6 2.4 7 2.4s4.8 -.8 7 -2.4', key: 'lip' }],
  ['path', { d: 'M8 11.4l-1 -6.4', key: 'fry-left' }],
  ['path', { d: 'M12 12.4v-9.4', key: 'fry-mid' }],
  ['path', { d: 'M16 11.4l1 -6.4', key: 'fry-right' }],
];

/** Squeeze sauce bottle with a drop on the label — used for the "Sauce / صوص" item. */
export const sauceBottle: IconNode = [
  ['path', { d: 'M12 2.5v3', key: 'nozzle' }],
  ['path', { d: 'M9.5 8v-1.5a1 1 0 0 1 1 -1h3a1 1 0 0 1 1 1v1.5', key: 'cap' }],
  ['path', { d: 'M7.5 11.5l1 -3.5h7l1 3.5v6.5a3 3 0 0 1 -3 3h-4a3 3 0 0 1 -3 -3z', key: 'body' }],
  ['path', { d: 'M12 13.2c-1 1.2 -1.5 2 -1.5 2.7a1.5 1.5 0 0 0 3 0c0 -.7 -.5 -1.5 -1.5 -2.7z', key: 'drop' }],
];
