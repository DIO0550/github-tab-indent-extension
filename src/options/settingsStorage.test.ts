import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadSettings, saveSettings, resetSettings } from './settingsStorage';
import { DEFAULT_SETTINGS } from './constants';

// Chrome API モック
const mockChrome = {
  storage: {
    sync: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
};

vi.stubGlobal('chrome', mockChrome);

describe('SettingsStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadSettings', () => {
    it('ストレージから設定を読み込む', async () => {
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
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('saveSettings', () => {
    it('設定をストレージに保存する', async () => {
      const settings = { ...DEFAULT_SETTINGS, indentSize: 4 };
      mockChrome.storage.sync.set.mockResolvedValue(undefined);

      await saveSettings(settings);

      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({ settings });
    });

    it('エラーが発生した場合は例外をスローする', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Save error');
      mockChrome.storage.sync.set.mockRejectedValue(error);

      await expect(saveSettings(DEFAULT_SETTINGS)).rejects.toThrow('Save error');
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('resetSettings', () => {
    it('デフォルト設定に戻す', async () => {
      mockChrome.storage.sync.set.mockResolvedValue(undefined);

      await resetSettings();

      expect(mockChrome.storage.sync.set).toHaveBeenCalledWith({ settings: DEFAULT_SETTINGS });
    });
  });
});