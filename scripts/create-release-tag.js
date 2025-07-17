#!/usr/bin/env node

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// コマンドライン引数をパース
const { values } = parseArgs({
  options: {
    message: {
      type: 'string',
      short: 'm'
    }
  }
});

// package.jsonを読み込む
const packageJsonPath = join(dirname(__dirname), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

// manifest.jsonを読み込んで同期を確認
const manifestJsonPath = join(dirname(__dirname), 'public', 'manifest.json');
const manifestJson = JSON.parse(readFileSync(manifestJsonPath, 'utf-8'));
const manifestVersion = manifestJson.version;

// バージョンの同期を確認
if (version !== manifestVersion) {
  console.error(`❌ バージョンの不一致が検出されました:`);
  console.error(`   package.json: ${version}`);
  console.error(`   manifest.json: ${manifestVersion}`);
  console.error(`\n両方のファイルでバージョンを同じにしてください。`);
  process.exit(1);
}

// タグ名を作成
const tagName = `v${version}`;

console.log(`📋 リリースタグの作成準備`);
console.log(`   バージョン: ${version}`);
console.log(`   タグ名: ${tagName}`);

// 既存のタグを確認
try {
  execSync(`git tag -l ${tagName}`, { encoding: 'utf-8' });
  const existingTag = execSync(`git tag -l ${tagName}`, { encoding: 'utf-8' }).trim();
  
  if (existingTag) {
    console.error(`\n❌ タグ ${tagName} は既に存在します。`);
    console.error(`   新しいリリースを作成する場合は、package.jsonとmanifest.jsonのバージョンを更新してください。`);
    process.exit(1);
  }
} catch (error) {
  // タグが存在しない場合は続行
}

// コミットされていない変更の確認はスキップ（要望により削除）

// タグを作成
console.log(`\n🏷️  タグを作成中...`);
try {
  // アノテーション付きタグを作成（カスタムメッセージまたはデフォルトメッセージ）
  const tagMessage = values.message || `Release version ${version}`;
  execSync(`git tag -a ${tagName} -m "${tagMessage}"`, { stdio: 'inherit' });
  
  console.log(`✅ タグ ${tagName} を作成しました。`);
  console.log(`   メッセージ: ${tagMessage}`);
  
  // タグをリモートにプッシュ
  console.log(`\n📤 タグをリモートにプッシュ中...`);
  execSync(`git push origin ${tagName}`, { stdio: 'inherit' });
  console.log(`✅ タグをリモートにプッシュしました。`);
  
  console.log(`\n🚀 GitHubでリリースを作成するには、以下のURLにアクセスしてください:`);
  console.log(`   https://github.com/DIO0550/github-tab-indent-extension/releases/new?tag=${tagName}`);
  
} catch (error) {
  console.error(`\n❌ エラーが発生しました: ${error.message}`);
  process.exit(1);
}