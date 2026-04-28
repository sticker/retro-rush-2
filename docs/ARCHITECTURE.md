# Retro Rush Architecture

## 方針

Retro Rush は「1つのランナーが、短命なミニゲームを順番に生成して破棄する」構成です。ミニゲーム追加時にタイトル画面、HUD、スコア、ライフ、タイマーを触らなくてよいよう、共通進行は `RunScene` に集約しています。

## ランタイム構成

- `BootScene`: 画像アセットを読み込み、タイトルへ遷移する
- `TitleScene`: タイトル、ハイスコア、解放済み時代表示、開始入力を担当する
- `RunScene`: ミニゲーム抽選、ブリーフィング、タイマー、結果、ゲームオーバーを担当する
- `src/minigames/*`: ミニゲーム本体。`MicrogameDefinition` を export する

## MicrogameDefinition

ミニゲームは次の契約に従います。

```ts
export interface MicrogameDefinition {
  id: string;
  title: string;
  instruction: string;
  durationMs: number;
  completion: "survive" | "objective";
  create(ctx: MicrogameContext): MicrogameInstance;
}
```

`completion: "survive"` は時間切れが成功です。`"objective"` は時間切れが失敗で、成功時に `update()` から `"success"` を返します。

## MicrogameContext

`ctx.layer` へ追加した表示物はラウンド切り替え時に `RunScene` がまとめて破棄します。入力イベント、タイマー、外部購読だけは各ミニゲームの `destroy()` で必ず解除します。

重要な値:

- `arena`: ミニゲームが描画してよい画面領域
- `difficulty`: スコアに応じた整数難易度
- `speed`: スコアに応じた速度倍率
- `rng`: ラン中に使う Phaser の乱数
- `sfx`: 共通効果音
- `theme`: 現在の時代テーマ

## アセット

現在のプロジェクト用生成画像は `public/assets/generated` と `public/assets/sprites` にあります。主役級のゲーム内オブジェクトは、画像生成ツールで作成した透明 PNG を使います。生成元は `public/assets/generated/source` に残し、ゲームで参照する切り抜き済みスプライトは `public/assets/sprites` に置いてください。

## 拡張ポイント

- 新しいミニゲーム: `src/minigames`
- 時代テーマ追加: `src/core/theme.ts`
- 進行/スコア保存: `src/core/progression.ts`
- 効果音追加: `src/audio/Sfx.ts`

現在のミニゲーム登録は `src/minigames/index.ts` に集約しています。新規ゲームを追加したら、ここに import と配列登録を追加してください。

`RunScene` は登録済みミニゲームをシャッフルしたキューとして扱います。キューが空になるまで同じゲームは再登場しないため、全種類が満遍なく出ます。難易度はクリア数が登録ゲーム数を超えるごとに追加上昇し、2巡目以降は速度や各ゲーム内の難易度設定が少し強くなります。
