import { describe, test, expect } from 'vitest';
import { 
  detectIndentAction, 
  IndentActionType,
  isTabKey,
  isAddIndentWithTab,
  isRemoveIndentWithTab,
  isAddIndentShortcut,
  isRemoveIndentShortcut,
  isAddIndent,
  isRemoveIndent
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

  describe('isAddIndentWithTab', () => {
    test('Tab単体を検出する', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false });
      expect(isAddIndentWithTab(event)).toBe(true);
    });

    test('Shift+Tabは検出しない', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
      expect(isAddIndentWithTab(event)).toBe(false);
    });

    test('Ctrl+Tabは検出しない', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', ctrlKey: true });
      expect(isAddIndentWithTab(event)).toBe(false);
    });

    test('Alt+Tabは検出しない', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', altKey: true });
      expect(isAddIndentWithTab(event)).toBe(false);
    });

    test('Cmd/Meta+Tabは検出しない', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', metaKey: true });
      expect(isAddIndentWithTab(event)).toBe(false);
    });

    test('Tab以外のキーは検出しない', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      expect(isAddIndentWithTab(event)).toBe(false);
    });
  });

  describe('isRemoveIndentWithTab', () => {
    test('Shift+Tabを検出する', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
      expect(isRemoveIndentWithTab(event)).toBe(true);
    });

    test('Tab単体は検出しない', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false });
      expect(isRemoveIndentWithTab(event)).toBe(false);
    });

    test('Shift+Ctrl+Tabは検出しない', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, ctrlKey: true });
      expect(isRemoveIndentWithTab(event)).toBe(false);
    });

    test('Shift+Alt+Tabは検出しない', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, altKey: true });
      expect(isRemoveIndentWithTab(event)).toBe(false);
    });

    test('Shift+Cmd/Meta+Tabは検出しない', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, metaKey: true });
      expect(isRemoveIndentWithTab(event)).toBe(false);
    });

    test('Shift+他のキーは検出しない', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
      expect(isRemoveIndentWithTab(event)).toBe(false);
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

  describe('isAddIndent', () => {
    test('Tab単体を検出する', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false });
      expect(isAddIndent(event)).toBe(true);
    });

    test('Cmd + ]を検出する', () => {
      const event = new KeyboardEvent('keydown', { key: ']', metaKey: true });
      expect(isAddIndent(event)).toBe(true);
    });

    test('Ctrl + ]を検出する', () => {
      const event = new KeyboardEvent('keydown', { key: ']', ctrlKey: true });
      expect(isAddIndent(event)).toBe(true);
    });

    test('Shift+Tabは検出しない', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
      expect(isAddIndent(event)).toBe(false);
    });
  });

  describe('isRemoveIndent', () => {
    test('Shift+Tabを検出する', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
      expect(isRemoveIndent(event)).toBe(true);
    });

    test('Cmd + [を検出する', () => {
      const event = new KeyboardEvent('keydown', { key: '[', metaKey: true });
      expect(isRemoveIndent(event)).toBe(true);
    });

    test('Ctrl + [を検出する', () => {
      const event = new KeyboardEvent('keydown', { key: '[', ctrlKey: true });
      expect(isRemoveIndent(event)).toBe(true);
    });

    test('Tab単体は検出しない', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false });
      expect(isRemoveIndent(event)).toBe(false);
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