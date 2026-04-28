# Agent Guide

このプロジェクトで作業する AI Agent 向けの短いガイドです。

## まず守ること

- ミニゲーム追加だけなら、基本的に `src/minigames` と `src/minigames/index.ts` だけを触る
- 共通 HUD、タイマー、ライフ、ゲームオーバー処理は `RunScene` にあるので、個別ミニゲームへ複製しない
- `ctx.layer` に追加した表示物はランナーが破棄する。イベント購読は `destroy()` で解除する
- 画面サイズは `480 x 800` 固定論理座標。描画は `ctx.arena` の内側に収める
- タップ、ドラッグ、Space、矢印キーのうち、そのゲームに自然な入力を最低1つ入れる
- 新規アセットが必要な場合は、画像生成ツールで作り、生成元を残したまま `public/assets` 配下へコピーする
- 完了前に `npm run build` を実行する

## 新しいミニゲームの型

```ts
export const exampleGame: MicrogameDefinition = {
  id: "example-game",
  title: "Example Game",
  instruction: "さけべ!",
  durationMs: 4200,
  completion: "objective",
  create: (ctx) => new ExampleGame(ctx),
};
```

`update()` の戻り値:

- `"success"`: 即クリア
- `"failure"`: 即ミス
- `undefined`: 継続

## 難易度調整

`ctx.difficulty` はおおむね4スコアごとに1増えます。`ctx.speed` は少しずつ上がります。最初の数ラウンドでも理不尽にならないよう、速度や目標数は必ず上限を設けてください。

## 表示品質

- `letterSpacing` は `0`
- 小さな UI 内で巨大な文字を使わない
- ミニゲーム内テキストは短くする
- 重要な対象はタップしやすいサイズにする
- ピクセル風の絵は Phaser の矩形・コンテナで組むと差し替えしやすい

## チェックリスト

- `src/minigames/index.ts` に登録した
- 入力イベントを `destroy()` で解除した
- `ctx.arena` の外に主要 UI が出ていない
- クリア条件と失敗条件が数秒で理解できる
- `npm run build` が通る
