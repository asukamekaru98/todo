# TODOアプリ

React (Vite + TypeScript) のフロントエンドと、Node.js/Express + SQLite のバックエンドで構成されたTODOアプリです。

**公開URL:** https://todo-orpin-kappa.vercel.app

## 構成

- `client/` — React + TypeScriptのフロントエンド (Vite)。`/api/todos` を叩いてデータを取得・更新
- `server/` — Express + SQLiteのREST API (`server/src/app.js` がExpress app本体、`server/src/server.js` はローカル起動用のエントリポイント)
- `api/[...path].js` — `server/src/app.js` をラップしたVercel Serverless Function。本番では `/api/*` へのリクエストがこの関数で処理される
- `vercel.json` / ルートの `package.json` — Vercelデプロイ用の設定・依存関係(`api/`関数が使うexpress・cors・better-sqlite3)

## セットアップと起動(ローカル)

### 1. バックエンド

```bash
cd server
npm install
npm run dev   # http://localhost:3001
```

### 2. フロントエンド

別のターミナルで:

```bash
cd client
npm install
npm run dev   # http://localhost:5173
```

ブラウザで http://localhost:5173 を開いてください。`/api` へのリクエストはViteの開発サーバーからバックエンド (`http://localhost:3001`) にプロキシされます。

## デプロイ (Vercel)

```bash
vercel deploy --prod
```

`vercel.json` の設定で `client/` を静的ビルドし、`api/[...path].js` がサーバーレス関数としてAPIを処理します。このVercelプロジェクトはGitと連携していないため、GitHubへpushしただけでは自動デプロイされません。更新を反映する場合は上記コマンドを再実行してください。

**注意:** Vercelのサーバーレス関数はソースツリーが読み取り専用で、書き込み可能なのは `/tmp` のみです。そのためVercel上ではSQLiteのDBファイルを `/tmp` に置いており、コールドスタートやインスタンスの切り替わりでデータがリセットされます。動作確認・デモ用途を想定しており、データの永続性を保証するものではありません。本格的に永続化する場合はTursoやVercel Postgresなどの外部DBサービスへの切り替えが必要です。

## API

| メソッド | パス | 説明 |
| --- | --- | --- |
| GET | `/api/todos` | 一覧取得 |
| POST | `/api/todos` | 追加 (`{ "title": string }`) |
| PATCH | `/api/todos/:id` | 更新 (`{ "title"?: string, "completed"?: boolean }`) |
| DELETE | `/api/todos/:id` | 削除 |

## 機能

- TODOの追加・削除
- 完了/未完了の切り替え
- タイトルのダブルクリックによる編集
- すべて / 未完了 / 完了済み のフィルター
- SQLiteによるデータの永続化(ローカル環境。Vercel上では上記の注意点あり)
