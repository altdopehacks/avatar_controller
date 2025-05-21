# Avatar Controller

VRM Avatar Controller using pose JSON data from MediaPipe Pose.

## 概要 (Overview)

このウェブアプリケーションは以下の機能を提供します：

1. Pose JSON 取込 - MediaPipe Poseから出力されたJSONデータをファイルまたはURLから読み込み
2. Kalidokit 変換 - 各フレームをKalidokit.Pose.solve()でVRM Humanoidのボーン回転＆表情係数へマッピング
3. Three.js 再生ループ - @pixiv/three-vrmでロードしたVRMのhumanoid.getBoneNode()にクォータニオンを適用
4. UI 操作 - 再生／停止ボタンとシークバーでJSONフレームをインデックス、元動画を並べて同期表示

## 機能 (Features)

- **Pose JSONロード**: JSONファイルのアップロードまたはURLからの読み込み
- **VRMモデルロード**: 任意のVRMアバターモデルをアップロードして表示
- **Kalidokit統合**: MediaPipe Poseのランドマークをボーン回転に変換
- **アニメーションコントロール**: 再生、一時停止、停止、シーク機能
- **ビデオ同期**: オリジナルビデオとの同期表示（オプション）
- **パフォーマンス最適化**: フレームの事前処理によるスムーズな再生

## JSONフォーマット (JSON Format)

アプリケーションは以下の形式のポーズデータを期待します：

```json
{
  "fps": 30,
  "frames": [
    {
      "timestamp": 0,
      "poseLandmarks": [ { "id":0,"x":0.5,"y":0.4,"z":-0.2,"visibility":0.99 }, ... 33点 ]
    },
    ...
  ]
}
```

- `fps`: アニメーション速度（必須）
- `poseLandmarks`: MediaPipe Pose 33点（BlazePose world座標基準）

## 使用方法 (Usage)

1. 「Load VRM Model」ボタンでVRMモデルをロード
2. 「Load Pose JSON」ボタンまたはURLを入力してポーズデータをロード
3. 再生コントロールを使用してアニメーションを再生、一時停止、シーク
4. オプションで元のビデオを同期再生

## 開発 (Development)

### 前提条件 (Prerequisites)

- Node.js
- npm

### インストール (Installation)

```bash
# リポジトリをクローン
git clone https://github.com/altdopehacks/avatar_controller.git
cd avatar_controller

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### 本番用ビルド (Building for Production)

```bash
npm run build
```

## 依存関係 (Dependencies)

- Three.js: 3Dレンダリング
- @pixiv/three-vrm: VRMモデルのロードと操作
- Kalidokit: ポーズからVRMへの変換
