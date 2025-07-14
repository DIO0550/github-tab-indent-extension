// デフォルトのインデント設定
export const DEFAULT_INDENT_SIZE = 2;
export const DEFAULT_INDENT_CHAR = ' ';

export const SUPPORTED_ELEMENTS = ['TEXTAREA', 'INPUT'] as const;
export type SupportedElement = typeof SUPPORTED_ELEMENTS[number];

export const KEY_CODES = {
  TAB: 'Tab',
} as const;

export const EVENT_TYPES = {
  KEYDOWN: 'keydown',
  INPUT: 'input',
} as const;