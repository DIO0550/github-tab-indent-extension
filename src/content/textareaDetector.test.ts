import { isValidTextArea, getTextAreaElement } from './textareaDetector';

describe('textareaDetector', () => {
  describe('isValidTextArea', () => {
    describe('正常系', () => {
      it('HTMLTextAreaElementを渡した場合、trueを返す', () => {
        const textarea = document.createElement('textarea');
        const result = isValidTextArea(textarea);
        expect(result).toBe(true);
      });

      it('HTMLInputElementを渡した場合、trueを返す', () => {
        const input = document.createElement('input');
        input.type = 'text';
        const result = isValidTextArea(input);
        expect(result).toBe(true);
      });
    });

    describe('異常系', () => {
      it('undefinedを渡した場合、falseを返す', () => {
        const result = isValidTextArea(undefined);
        expect(result).toBe(false);
      });

      it('divなどのサポートされていない要素を渡した場合、falseを返す', () => {
        const div = document.createElement('div');
        const result = isValidTextArea(div);
        expect(result).toBe(false);
      });

      it('HTMLElement以外のEventTargetを渡した場合、falseを返す', () => {
        const xmlHttpRequest = new XMLHttpRequest();
        const result = isValidTextArea(xmlHttpRequest);
        expect(result).toBe(false);
      });
    });
  });

  describe('getTextAreaElement', () => {
    describe('正常系', () => {
      it('textareaをターゲットとするKeyboardEventの場合、textareaを返す', () => {
        const textarea = document.createElement('textarea');
        const event = new KeyboardEvent('keydown', { bubbles: true });
        Object.defineProperty(event, 'target', { value: textarea, writable: false });
        
        const result = getTextAreaElement(event);
        expect(result).toBe(textarea);
      });

      it('inputをターゲットとするKeyboardEventの場合、inputを返す', () => {
        const input = document.createElement('input');
        input.type = 'text';
        const event = new KeyboardEvent('keydown', { bubbles: true });
        Object.defineProperty(event, 'target', { value: input, writable: false });
        
        const result = getTextAreaElement(event);
        expect(result).toBe(input);
      });
    });

    describe('異常系', () => {
      it('targetがnullのKeyboardEventの場合、undefinedを返す', () => {
        const event = new KeyboardEvent('keydown', { bubbles: true });
        Object.defineProperty(event, 'target', { value: null, writable: false });
        
        const result = getTextAreaElement(event);
        expect(result).toBeUndefined();
      });

      it('divをターゲットとするKeyboardEventの場合、undefinedを返す', () => {
        const div = document.createElement('div');
        const event = new KeyboardEvent('keydown', { bubbles: true });
        Object.defineProperty(event, 'target', { value: div, writable: false });
        
        const result = getTextAreaElement(event);
        expect(result).toBeUndefined();
      });
    });
  });
});