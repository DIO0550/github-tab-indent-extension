import { attachEventListeners } from './domHelpers';
import { handleSave, handleReset, initializeOptions } from './optionsHandlers';

// アプリケーションのエントリーポイント
async function startOptionsPage(): Promise<void> {
  await initializeOptions();
  
  attachEventListeners({
    onSave: handleSave,
    onReset: handleReset,
  });
}

// DOMの準備ができたら初期化
document.addEventListener('DOMContentLoaded', startOptionsPage);

// 各モジュールからのエクスポート（テスト用）
export type { Settings } from './constants';
export { DEFAULT_SETTINGS } from './constants';
export { loadSettings, saveSettings, resetSettings } from './settingsStorage';
export { getFormValues, setFormValues, showStatusMessage } from './domHelpers';
export { handleSave, handleReset, initializeOptions as initialize } from './optionsHandlers';