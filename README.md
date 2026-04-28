# Retro Rush

ブラウザだけで動く、レトロ調の高速ミニゲーム集です。Phaser + TypeScript + Vite で構成し、今後ミニゲームを量産しやすいように `MicrogameDefinition` 単位で追加できる形にしています。

## セットアップ

```bash
npm install
npm run dev
```

本番ビルド確認:

```bash
npm run build
```

## 現在入っているミニゲーム

- `Asteroid Dodge`: 宇宙船をドラッグまたは左右キーで動かし、隕石を避ける
- `Coin Hop`: タップまたは Space でジャンプしてコインを集める
- `Circuit Snap`: 色をタップで切り替えてターゲットと一致させる
- `Button Mash`: タップまたは Space を連打してメーターを満たす

## ディレクトリ

```text
src/
  audio/       WebAudio ベースのチップチューン効果音
  core/        ゲーム定数、テーマ、進行、Microgame 契約
  game/        Phaser.Game の起動設定
  minigames/   個別ミニゲーム。基本的にここへ追加する
  scenes/      Boot / Title / Run の Phaser シーン
docs/
  ARCHITECTURE.md  設計メモ
  AGENT_GUIDE.md   今後の AI Agent 向け作業ルール
public/assets/
  generated/   画像生成ツールで作ったプロジェクト用アセット
```

## ミニゲーム追加の最短手順

1. `src/minigames/newGame.ts` を作り、`MicrogameDefinition` を export する
2. `src/minigames/index.ts` の `microgames` 配列に追加する
3. `npm run build` で型とビルドを確認する

詳しくは [docs/AGENT_GUIDE.md](docs/AGENT_GUIDE.md) を参照してください。
