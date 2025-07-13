import { loadSettings, saveSettings, resetSettings } from './settingsStorage';
import { getFormValues, setFormValues, showStatusMessage } from './domHelpers';
import { MESSAGES, DEFAULT_SETTINGS } from './constants';

/**
 * 保存ボタンのクリックハンドラー
 * フォームの値を取得してChrome Storageに保存し、結果をユーザーに通知する
 */
export async function handleSave(): Promise<void> {
  try {
    const settings = getFormValues();
    await saveSettings(settings);
    showStatusMessage(MESSAGES.SAVE_SUCCESS, 'success');
  } catch (error) {
    showStatusMessage(MESSAGES.SAVE_ERROR, 'error');
  }
}

/**
 * リセットボタンのクリックハンドラー
 * フォームとChrome Storageの設定をデフォルト値に戻し、結果をユーザーに通知する
 */
export async function handleReset(): Promise<void> {
  setFormValues(DEFAULT_SETTINGS);
  try {
    await resetSettings();
    showStatusMessage(MESSAGES.RESET_SUCCESS, 'success');
  } catch (error) {
    showStatusMessage(MESSAGES.RESET_ERROR, 'error');
  }
}

/**
 * オプションページの初期化処理
 * Chrome Storageから設定を読み込み、フォームに反映する
 */
export async function initializeOptions(): Promise<void> {
  const settings = await loadSettings();
  setFormValues(settings);
}