/**
 * The sections the nav indexes, in page order.
 *
 * It lives beside the nav rather than inside either component because both
 * need it and neither owns it: NavLinks renders the row, while Nav derives
 * the id list it watches for the active section. Importing it from one
 * component into the other would make them circular.
 */
export const SECTIONS = [
  { id: 'work', n: '01', label: 'Work' },
  { id: 'about', n: '02', label: 'About' },
  { id: 'writing', n: '03', label: 'Writing' },
  { id: 'adventures', n: '04', label: 'Adventures' },
  { id: 'elsewhere', n: '05', label: 'Elsewhere' },
];

export const CONTACT_ID = 'contact';

/** Every section the active-section observer watches, contact included. */
export const SECTION_IDS = [...SECTIONS.map((s) => s.id), CONTACT_ID];
