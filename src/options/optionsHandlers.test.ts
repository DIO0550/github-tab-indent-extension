import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleSave, handleReset, initializeOptions } from './optionsHandlers';
import { DEFAULT_SETTINGS, MESSAGES } from './constants';

// モジュールのモック
vi.mock('./settingsStorage', () => ({
  loadSettings: vi.fn(),
  saveSettings: vi.fn(),
  resetSettings: vi.fn(),
}));

vi.mock('./domHelpers', () => ({
  getFormValues: vi.fn(),
  setFormValues: vi.fn(),
  showStatusMessage: vi.fn(),
}));

import { loadSettings, saveSettings, resetSettings } from './settingsStorage';
import { getFormValues, setFormValues, showStatusMessage } from './domHelpers';

describe('Options Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeOptions', () => {
    it('設定を読み込みフォームに反映する', async () => {
      const customSettings = { ...DEFAULT_SETTINGS, indentSize: 4 };
      vi.mocked(loadSettings).mockResolvedValue(customSettings);

      await initializeOptions();

      expect(loadSettings).toHaveBeenCalled();
      expect(setFormValues).toHaveBeenCalledWith(customSettings);
    });
  });

  describe('handleSave', () => {
    it('設定を保存して成功メッセージを表示する', async () => {
      const formValues = { ...DEFAULT_SETTINGS, indentSize: 8 };
      vi.mocked(getFormValues).mockReturnValue(formValues);
      vi.mocked(saveSettings).mockResolvedValue(undefined);

      await handleSave();

      expect(getFormValues).toHaveBeenCalled();
      expect(saveSettings).toHaveBeenCalledWith(formValues);
      expect(showStatusMessage).toHaveBeenCalledWith(MESSAGES.SAVE_SUCCESS, 'success');
    });

    it('保存エラー時にエラーメッセージを表示する', async () => {
      vi.mocked(getFormValues).mockReturnValue(DEFAULT_SETTINGS);
      vi.mocked(saveSettings).mockRejectedValue(new Error('Save failed'));

      await handleSave();

      expect(showStatusMessage).toHaveBeenCalledWith(MESSAGES.SAVE_ERROR, 'error');
    });
  });

  describe('handleReset', () => {
    it('フォームをリセットして成功メッセージを表示する', async () => {
      vi.mocked(resetSettings).mockResolvedValue(undefined);

      await handleReset();

      expect(setFormValues).toHaveBeenCalledWith(DEFAULT_SETTINGS);
      expect(resetSettings).toHaveBeenCalled();
      expect(showStatusMessage).toHaveBeenCalledWith(MESSAGES.RESET_SUCCESS, 'success');
    });

    it('リセットエラー時にエラーメッセージを表示する', async () => {
      vi.mocked(resetSettings).mockRejectedValue(new Error('Reset failed'));

      await handleReset();

      expect(setFormValues).toHaveBeenCalledWith(DEFAULT_SETTINGS);
      expect(showStatusMessage).toHaveBeenCalledWith(MESSAGES.RESET_ERROR, 'error');
    });
  });
});