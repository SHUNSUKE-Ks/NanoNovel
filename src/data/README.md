# Data Layer

ゲームのマスターデータ（JSON）を管理するディレクトリです。

## ⚠️ 重要

**このディレクトリがデータ仕様の正（Single Source of Truth）です。**

## ファイル一覧

| ファイル | 説明 |
|---------|------|
| `scenario.json` | シナリオデータ（ストーリー進行） |
| `characters.json` | キャラクターデータ |
| `enemy.json` | 敵キャラクターデータ |
| `skill.json` | スキルデータ |
| `tips.json` | Tips（用語集）データ |
| `sound.json` | サウンドメタデータ |
| `image_registry.json` | 生成画像レジストリ |
| `title.json` | タイトル画面設定 |
| `game_config.json` | ゲーム全体設定 |

## storyID命名規則

```
EP_CH_TXT

例:
01_01_01  → Episode 1, Chapter 1, Text 1
02_03_015 → Episode 2, Chapter 3, Text 15
```

## 詳細仕様

各JSONの詳細スキーマは `doc01/Gemini_AI_NovelGame/AIノベルTRPGジェネレーター_統合要件定義書_仕様書.md` を参照してください。
