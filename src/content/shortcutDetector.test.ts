import { describe, test, expect } from 'vitest';
import { 
  detectIndentAction, 
  IndentActionType,
  isTabKey,
  isAddIndentShortcut,
  isRemoveIndentShortcut
} from './shortcutDetector';

describe('shortcutDetector', () => {
  describe('isTabKey', () => {
    test('Tabキーを検出する', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      expect(isTabKey(event)).toBe(true);
    });

    test('Tab以外のキーは検出しない', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      expect(isTabKey(event)).toBe(false);
    });
  });

  describe('isAddIndentShortcut', () => {
    test('Cmd + ]を検出する', () => {
      const event = new KeyboardEvent('keydown', {
        key: ']',
        metaKey: true,
        ctrlKey: false,
      });
      expect(isAddIndentShortcut(event)).toBe(true);
    });

    test('Ctrl + ]を検出する', () => {
      const event = new KeyboardEvent('keydown', {
        key: ']',
        metaKey: false,
        ctrlKey: true,
      });
      expect(isAddIndentShortcut(event)).toBe(true);
    });

    test('Shift付きは検出しない', () => {
      const event = new KeyboardEvent('keydown', {
        key: ']',
        metaKey: true,
        shiftKey: true,
      });
      expect(isAddIndentShortcut(event)).toBe(false);
    });
  });

  describe('isRemoveIndentShortcut', () => {
    test('Cmd + [を検出する', () => {
      const event = new KeyboardEvent('keydown', {
        key: '[',
        metaKey: true,
        ctrlKey: false,
      });
      expect(isRemoveIndentShortcut(event)).toBe(true);
    });

    test('Ctrl + [を検出する', () => {
      const event = new KeyboardEvent('keydown', {
        key: '[',
        metaKey: false,
        ctrlKey: true,
      });
      expect(isRemoveIndentShortcut(event)).toBe(true);
    });

    test('Alt付きは検出しない', () => {
      const event = new KeyboardEvent('keydown', {
        key: '[',
        metaKey: true,
        altKey: true,
      });
      expect(isRemoveIndentShortcut(event)).toBe(false);
    });
  });

  describe('detectIndentAction', () => {
    describe('Tabキー', () => {
      test('Tab単体でADDを返す', () => {
        const event = new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: false,
        });
        expect(detectIndentAction(event)).toBe(IndentActionType.ADD);
      });

      test('Shift+TabでREMOVEを返す', () => {
        const event = new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: true,
        });
        expect(detectIndentAction(event)).toBe(IndentActionType.REMOVE);
      });
    });

    describe('ショートカットキー', () => {
      test('Cmd/Ctrl + ]でADDを返す', () => {
        const event = new KeyboardEvent('keydown', {
          key: ']',
          metaKey: true,
        });
        expect(detectIndentAction(event)).toBe(IndentActionType.ADD);
      });

      test('Cmd/Ctrl + [でREMOVEを返す', () => {
        const event = new KeyboardEvent('keydown', {
          key: '[',
          ctrlKey: true,
        });
        expect(detectIndentAction(event)).toBe(IndentActionType.REMOVE);
      });
    });

    describe('対象外のキー', () => {
      test('Enterキー単体はNONEを返す', () => {
        const event = new KeyboardEvent('keydown', {
          key: 'Enter',
        });
        expect(detectIndentAction(event)).toBe(IndentActionType.NONE);
      });

      test('修飾キーなしの]はNONEを返す', () => {
        const event = new KeyboardEvent('keydown', {
          key: ']',
          metaKey: false,
          ctrlKey: false,
        });
        expect(detectIndentAction(event)).toBe(IndentActionType.NONE);
      });

      test('Cmd/Ctrl + 他のキーはNONEを返す', () => {
        const event = new KeyboardEvent('keydown', {
          key: 'a',
          metaKey: true,
        });
        expect(detectIndentAction(event)).toBe(IndentActionType.NONE);
      });
    });
  });
});