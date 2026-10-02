/**
 * Sugar & Spice Bakes — theme tokens.
 *
 * SINGLE SOURCE OF TRUTH for the brand palette. To swap the palette later
 * (e.g. when confirmed brand colors arrive), change ONLY the hex values
 * below AND the matching `@theme` block in `app/globals.css`.
 * Everything else (components, pages) references these token names.
 */

export const theme = {
  colors: {
    /** warm cream page background */
    cream: '#FFF9F1',
    /** deeper cream for alt sections / cards */
    creamDark: '#F7EBDC',
    /** deep cocoa — primary text + dark luxe sections */
    cocoa: '#3B2417',
    /** softer cocoa for secondary surfaces */
    cocoaSoft: '#4E3220',
    /** caramel — primary brand accent (buttons, links, highlights) */
    caramel: '#C68B4E',
    /** darker caramel for hover states */
    caramelDark: '#A96F36',
    /** raspberry — secondary accent (badges, sale, sticker bursts) */
    raspberry: '#B23A5E',
    /** deep raspberry for dark-section accents */
    raspberryDeep: '#8C2A47',
    /** soft pink tints for badges / highlights */
    pinkSoft: '#F9E3E8',
    /** butter yellow for playful sticker accents */
    butter: '#F6C453',
    /** mint for success states */
    mint: '#7FB069',
  },
  fonts: {
    /** display serif — headlines */
    display: '"Fraunces", Georgia, serif',
    /** body sans */
    sans: '"Inter", "Helvetica Neue", sans-serif',
  },
  radius: {
    card: '1.75rem',
    pill: '999px',
  },
} as const;

export type ThemeColors = keyof typeof theme.colors;
