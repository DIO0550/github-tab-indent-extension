#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 引数を取得
const args = process.argv.slice(2);
const bumpType = args[0];

if (!bumpType || !['major', 'minor', 'patch'].includes(bumpType)) {
  console.log('使い方: npm run version:bump [major|minor|patch]');
  console.log('');
  console.log('例:');
  console.log('  npm run version:bump patch   # 0.1.0 → 0.1.1');
  console.log('  npm run version:bump minor   # 0.1.0 → 0.2.0');
  console.log('  npm run version:bump major   # 0.1.0 → 1.0.0');
  process.exit(1);
}

// バージョンを更新する関数
function bumpVersion(currentVersion, type) {
  const parts = currentVersion.split('.').map(Number);
  
  switch (type) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
      parts[2]++;
      break;
  }
  
  return parts.join('.');
}

// package.jsonを読み込む
const packageJsonPath = join(dirname(__dirname), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const currentVersion = packageJson.version;
const newVersion = bumpVersion(currentVersion, bumpType);

// manifest.jsonを読み込む
const manifestJsonPath = join(dirname(__dirname), 'public', 'manifest.json');
const manifestJson = JSON.parse(readFileSync(manifestJsonPath, 'utf-8'));

console.log(`📋 バージョンアップ`);
console.log(`   現在: ${currentVersion}`);
console.log(`   新規: ${newVersion}`);
console.log(`   種別: ${bumpType}`);

// package.jsonを更新
packageJson.version = newVersion;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`✅ package.json を更新しました`);

// manifest.jsonを更新
manifestJson.version = newVersion;
writeFileSync(manifestJsonPath, JSON.stringify(manifestJson, null, 2));
console.log(`✅ manifest.json を更新しました`);

console.log(`\n🎉 バージョン ${newVersion} に更新しました！`);
console.log(`\n次のステップ:`);
console.log(`1. 変更をコミット: git add -A && git commit -m "🚀 [Release]: バージョン ${newVersion} にアップデート"`);
console.log(`2. タグを作成: npm run release:tag`);
console.log(`3. プッシュ: git push && git push --tags`);