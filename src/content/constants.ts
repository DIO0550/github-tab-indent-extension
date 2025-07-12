export const INDENT_SIZE = 2;
export const INDENT_CHAR = ' ';
export const INDENT_STRING = INDENT_CHAR.repeat(INDENT_SIZE);
export const INDENT = INDENT_STRING; // エイリアス

export const SUPPORTED_ELEMENTS = ['TEXTAREA', 'INPUT'] as const;
export type SupportedElement = typeof SUPPORTED_ELEMENTS[number];

export const KEY_CODES = {
  TAB: 'Tab',
} as const;

export const EVENT_TYPES = {
  KEYDOWN: 'keydown',
  INPUT: 'input',
} as const;