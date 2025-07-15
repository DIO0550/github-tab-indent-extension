# GitHub Tab Indent Extension

GitHub のコードエディタで Tab キーによるインデント操作を可能にする Chrome 拡張機能です。

## 概要

この拡張機能は、GitHub の以下の入力エリアで Tab キーを使用したインデント操作を可能にします：

- Issue の作成・編集
- Pull Request の作成・編集
- コメントの入力
- コードエディタ

## 機能

- **Tab キー**: カーソル位置に適切なインデント（スペース 4 つ）を挿入
- **Shift + Tab キー**: 現在の行のインデントを削除（スペース 4 つ分）
- 複数行選択時の一括インデント操作に対応

## インストール方法

### 開発版のインストール

1. このリポジトリをクローン

   ```bash
   git clone https://github.com/DIO0550/github-tab-indent-extension.git
   ```

2. ビルド実行

   ```bash
   pnpm install
   pnpm run build
   ```

3. Chrome で拡張機能を読み込み
   - Chrome で `chrome://extensions/` を開く
   - 「デベロッパーモード」を有効化
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - `dist` フォルダを選択

## 開発

### 必要な環境

- Node.js 18 以上
- pnpm

### セットアップ

```bash
# 依存関係のインストール
pnpm install

# 開発モードでビルド（ウォッチモード）
pnpm run dev

# プロダクションビルド
pnpm run build

# テストの実行
pnpm test
```

### プロジェクト構成

```
github-tab-indent-extension/
├── src/               # ソースコード
│   ├── content/       # コンテンツスクリプト
│   └── options/       # 設定ページ
├── public/            # 静的ファイル
│   ├── manifest.json  # 拡張機能マニフェスト
│   ├── options.html   # 設定ページHTML
│   └── icons/         # アイコンファイル
└── dist/              # ビルド成果物
```

## 技術スタック

- TypeScript
- Chrome Extension Manifest V3
- Vite（ビルドツール）
- Vitest（テストフレームワーク）
- pnpm（パッケージマネージャー）

## ライセンス

[MIT License](./LICENSE)
