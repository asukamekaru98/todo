# TODOアプリ

React (Vite + TypeScript) のフロントエンドと、Node.js/Express + SQLite のバックエンドで構成されたTODOアプリです。

## 構成

- `server/` — Express製のREST API (SQLiteで永続化)
- `client/` — React + TypeScriptのフロントエンド (Vite)

## セットアップと起動

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
- SQLiteによるデータの永続化
