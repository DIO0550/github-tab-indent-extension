import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getFormValues, setFormValues, showStatusMessage, attachEventListeners } from './domHelpers';
import { Settings, DEFAULT_SETTINGS } from './constants';

// DOM環境のセットアップ
function setupDOM() {
  document.body.innerHTML = `
    <input type="number" id="indent-size" value="2">
    <select id="indent-type">
      <option value="space">スペース</option>
      <option value="tab">タブ</option>
    </select>
    <input type="checkbox" id="enable-tab" checked>
    <input type="checkbox" id="enable-bracket" checked>
    <input type="checkbox" id="apply-to-comments" checked>
    <input type="checkbox" id="apply-to-code-editor" checked>
    <input type="checkbox" id="apply-to-markdown" checked>
    <div id="status-message" hidden></div>
    <button id="save-button">保存</button>
    <button id="reset-button">リセット</button>
  `;
}

describe('DOM Helpers', () => {
  beforeEach(() => {
    setupDOM();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getFormValues', () => {
    it('フォームから設定値を取得する', () => {
      (document.getElementById('indent-size') as HTMLInputElement).value = '4';
      (document.getElementById('indent-type') as HTMLSelectElement).value = 'tab';
      (document.getElementById('enable-tab') as HTMLInputElement).checked = false;

      const result = getFormValues();

      expect(result.indentSize).toBe(4);
      expect(result.indentType).toBe('tab');
      expect(result.enableTab).toBe(false);
    });

    it('要素が存在しない場合はデフォルト値を返す', () => {
      document.body.innerHTML = '';

      const result = getFormValues();

      expect(result.indentSize).toBe(0);
      expect(result.indentType).toBe('');
      expect(result.enableTab).toBe(false);
    });
  });

  describe('setFormValues', () => {
    it('設定値をフォームに反映する', () => {
      const settings: Settings = {
        ...DEFAULT_SETTINGS,
        indentSize: 8,
        indentType: 'tab',
        enableTab: false,
      };

      setFormValues(settings);

      expect((document.getElementById('indent-size') as HTMLInputElement).value).toBe('8');
      expect((document.getElementById('indent-type') as HTMLSelectElement).value).toBe('tab');
      expect((document.getElementById('enable-tab') as HTMLInputElement).checked).toBe(false);
    });

    it('要素が存在しない場合はエラーにならない', () => {
      document.body.innerHTML = '';

      expect(() => setFormValues(DEFAULT_SETTINGS)).not.toThrow();
    });
  });

  describe('showStatusMessage', () => {
    it('成功メッセージを表示する', () => {
      showStatusMessage('保存しました', 'success');

      const statusElement = document.getElementById('status-message')!;
      expect(statusElement.textContent).toBe('保存しました');
      expect(statusElement.className).toBe('status-message success');
      expect(statusElement.hidden).toBe(false);
    });

    it('3秒後にメッセージを非表示にする', () => {
      showStatusMessage('テストメッセージ', 'success');

      const statusElement = document.getElementById('status-message')!;
      expect(statusElement.hidden).toBe(false);

      vi.advanceTimersByTime(3000);
      expect(statusElement.hidden).toBe(true);
    });

    it('連続してメッセージを表示した場合、前のタイマーがクリアされる', () => {
      showStatusMessage('最初のメッセージ', 'success');
      
      vi.advanceTimersByTime(1000);
      showStatusMessage('2番目のメッセージ', 'error');

      const statusElement = document.getElementById('status-message')!;
      expect(statusElement.textContent).toBe('2番目のメッセージ');
      expect(statusElement.className).toBe('status-message error');

      vi.advanceTimersByTime(2000);
      expect(statusElement.hidden).toBe(false);

      vi.advanceTimersByTime(1000);
      expect(statusElement.hidden).toBe(true);
    });

    it('status-message要素が存在しない場合はエラーにならない', () => {
      document.getElementById('status-message')?.remove();

      expect(() => showStatusMessage('テスト', 'success')).not.toThrow();
    });
  });

  describe('attachEventListeners', () => {
    it('イベントリスナーを正しく設定する', () => {
      const onSave = vi.fn();
      const onReset = vi.fn();

      attachEventListeners({ onSave, onReset });

      const saveButton = document.getElementById('save-button') as HTMLButtonElement;
      const resetButton = document.getElementById('reset-button') as HTMLButtonElement;

      saveButton.click();
      expect(onSave).toHaveBeenCalled();

      resetButton.click();
      expect(onReset).toHaveBeenCalled();
    });

    it('ボタンが存在しない場合はエラーにならない', () => {
      document.body.innerHTML = '';

      expect(() => {
        attachEventListeners({
          onSave: vi.fn(),
          onReset: vi.fn(),
        });
      }).not.toThrow();
    });
  });
});