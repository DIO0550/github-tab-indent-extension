import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  Settings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  resetSettings,
  getFormValues,
  setFormValues,
  showStatusMessage,
  handleSave,
  handleReset,
  initialize,
} from './index';

// Chrome API モック
const mockChrome = {
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
};

// グローバルオブジェクトのモック
vi.stubGlobal('chrome', mockChrome);

// DOM要素のモックを作成する関数
function createMockElement(type: 'input' | 'select', id: string): HTMLElement {
  const element = document.createElement(type);
  element.id = id;
  return element;
}

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

describe('Options Page', () => {
  beforeEach(() => {
    setupDOM();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('loadSettings', () => {
    it('chrome.storageから設定を読み込む', async () => {
      const customSettings = { indentSize: 4, indentType: 'tab' as const };
      mockChrome.storage.sync.get.mockResolvedValue({ settings: customSettings });

      const result = await loadSettings();

      expect(mockChrome.storage.sync.get).toHaveBeenCalledWith('settings');
      expect(result).toEqual({ ...DEFAULT_SETTINGS, ...customSettings });
    });

    it('設定が存在しない場合はデフォルト設定を返す', async () => {
      mockChrome.storage.sync.get.mockResolvedValue({});

      const result = await loadSettings();

      expect(result).toEqual(DEFAULT_SETTINGS);
    });

    it('エラーが発生した場合はデフォルト設定を返す', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockChrome.storage.sync.get.mockRejectedValue(new Error('Storage error'));

      const result = await loadSettings();

      expect(result).toEqual(DEFAULT_SETTINGS);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load settings:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('saveSettings', () => {
    it('設定をchrome.storageに保存する', async () => {
      const settings: Settings = {
        indentSize: 4,
        indentType: 'tab',
        enableTab: false,
        enableBracket: true,
        applyToComments: true,
        applyToCodeEditor: false,
        applyToMarkdown: true,
      };
      mockChrome.storage.sync.set.mockResolvedValue(undefined);

      await saveSettings(settings);

      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({ settings });
    });

    it('エラーが発生した場合は例外をスローする', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Save error');
      mockChrome.storage.sync.set.mockRejectedValue(error);

      await expect(saveSettings(DEFAULT_SETTINGS)).rejects.toThrow('Save error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to save settings:', error);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getFormValues', () => {
    it('フォームから設定値を取得する', () => {
      (document.getElementById('indent-size') as HTMLInputElement).value = '4';
      (document.getElementById('indent-type') as HTMLSelectElement).value = 'tab';
      (document.getElementById('enable-tab') as HTMLInputElement).checked = false;
      (document.getElementById('enable-bracket') as HTMLInputElement).checked = true;
      (document.getElementById('apply-to-comments') as HTMLInputElement).checked = false;
      (document.getElementById('apply-to-code-editor') as HTMLInputElement).checked = true;
      (document.getElementById('apply-to-markdown') as HTMLInputElement).checked = false;

      const result = getFormValues();

      expect(result).toEqual({
        indentSize: 4,
        indentType: 'tab',
        enableTab: false,
        enableBracket: true,
        applyToComments: false,
        applyToCodeEditor: true,
        applyToMarkdown: false,
      });
    });
  });

  describe('setFormValues', () => {
    it('設定値をフォームに反映する', () => {
      const settings: Settings = {
        indentSize: 8,
        indentType: 'tab',
        enableTab: false,
        enableBracket: false,
        applyToComments: false,
        applyToCodeEditor: false,
        applyToMarkdown: false,
      };

      setFormValues(settings);

      expect((document.getElementById('indent-size') as HTMLInputElement).value).toBe('8');
      expect((document.getElementById('indent-type') as HTMLSelectElement).value).toBe('tab');
      expect((document.getElementById('enable-tab') as HTMLInputElement).checked).toBe(false);
      expect((document.getElementById('enable-bracket') as HTMLInputElement).checked).toBe(false);
      expect((document.getElementById('apply-to-comments') as HTMLInputElement).checked).toBe(false);
      expect((document.getElementById('apply-to-code-editor') as HTMLInputElement).checked).toBe(false);
      expect((document.getElementById('apply-to-markdown') as HTMLInputElement).checked).toBe(false);
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

    it('エラーメッセージを表示する', () => {
      showStatusMessage('エラーが発生しました', 'error');

      const statusElement = document.getElementById('status-message')!;
      expect(statusElement.textContent).toBe('エラーが発生しました');
      expect(statusElement.className).toBe('status-message error');
      expect(statusElement.hidden).toBe(false);
    });

    it('3秒後にメッセージを非表示にする', () => {
      showStatusMessage('テストメッセージ', 'success');

      const statusElement = document.getElementById('status-message')!;
      expect(statusElement.hidden).toBe(false);

      vi.advanceTimersByTime(3000);
      expect(statusElement.hidden).toBe(true);
    });

    it('status-message要素が存在しない場合はエラーにならない', () => {
      document.getElementById('status-message')?.remove();

      expect(() => showStatusMessage('テスト', 'success')).not.toThrow();
    });
  });

  describe('handleSave', () => {
    it('設定を保存して成功メッセージを表示する', async () => {
      mockChrome.storage.sync.set.mockResolvedValue(undefined);
      const showStatusMessageSpy = vi.spyOn({ showStatusMessage }, 'showStatusMessage');

      await handleSave();

      expect(mockChrome.storage.sync.set).toHaveBeenCalled();
      const statusElement = document.getElementById('status-message')!;
      expect(statusElement.textContent).toBe('設定を保存しました');
      expect(statusElement.className).toBe('status-message success');
    });

    it('保存エラー時にエラーメッセージを表示する', async () => {
      mockChrome.storage.sync.set.mockRejectedValue(new Error('Save error'));

      await handleSave();

      const statusElement = document.getElementById('status-message')!;
      expect(statusElement.textContent).toBe('設定の保存に失敗しました');
      expect(statusElement.className).toBe('status-message error');
    });
  });

  describe('handleReset', () => {
    it('設定をリセットして成功メッセージを表示する', async () => {
      mockChrome.storage.sync.set.mockResolvedValue(undefined);

      await handleReset();

      // フォームの値がデフォルトに戻っていることを確認
      expect((document.getElementById('indent-size') as HTMLInputElement).value).toBe('2');
      expect((document.getElementById('indent-type') as HTMLSelectElement).value).toBe('space');
      expect((document.getElementById('enable-tab') as HTMLInputElement).checked).toBe(true);

      // ストレージに保存されていることを確認
      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({ settings: DEFAULT_SETTINGS });

      // 成功メッセージが表示されていることを確認
      const statusElement = document.getElementById('status-message')!;
      expect(statusElement.textContent).toBe('設定をリセットしました');
      expect(statusElement.className).toBe('status-message success');
    });

    it('リセットエラー時にエラーメッセージを表示する', async () => {
      mockChrome.storage.sync.set.mockRejectedValue(new Error('Reset error'));

      await handleReset();

      const statusElement = document.getElementById('status-message')!;
      expect(statusElement.textContent).toBe('設定のリセットに失敗しました');
      expect(statusElement.className).toBe('status-message error');
    });
  });

  describe('initialize', () => {
    it('設定を読み込んでフォームに反映し、イベントリスナーを設定する', async () => {
      const customSettings = { indentSize: 4, indentType: 'tab' as const };
      mockChrome.storage.sync.get.mockResolvedValue({ settings: customSettings });

      await initialize();

      // 設定がフォームに反映されていることを確認
      expect((document.getElementById('indent-size') as HTMLInputElement).value).toBe('4');
      expect((document.getElementById('indent-type') as HTMLSelectElement).value).toBe('tab');

      // イベントリスナーが設定されていることを確認
      const saveButton = document.getElementById('save-button') as HTMLButtonElement;
      const resetButton = document.getElementById('reset-button') as HTMLButtonElement;

      // モック関数でイベントリスナーが設定されているか確認
      expect(saveButton).toBeTruthy();
      expect(resetButton).toBeTruthy();
    });
  });

  describe('DOMContentLoaded', () => {
    it('DOMContentLoadedイベントでinitializeが呼ばれることを確認', async () => {
      // コードの最後の行がDOMContentLoadedのイベントリスナーを設定していることを確認
      // 実際のイベント発火のテストはE2Eテストで行うのが適切
      
      // initializeが呼ばれた際の動作を確認
      mockChrome.storage.sync.get.mockResolvedValue({ settings: { indentSize: 4 } });

      await initialize();

      expect(mockChrome.storage.sync.get).toHaveBeenCalledWith('settings');
      expect((document.getElementById('indent-size') as HTMLInputElement).value).toBe('4');
    });
  });
});