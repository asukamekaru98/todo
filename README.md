# TODOアプリ

React (Vite + TypeScript) のフロントエンドのTODOアプリです。データはブラウザのlocalStorageに保存されます。

**公開URL:** https://asukamekaru98.github.io/todo/

## 構成

- `client/` — React + TypeScriptのフロントエンド (Vite)。データはlocalStorageに保存
- `server/` — Express + SQLiteのREST APIサーバー(現在client/からは利用していません。未使用ですが参考実装として残しています)

## セットアップと起動

```bash
cd client
npm install
npm run dev   # http://localhost:5173
```

## デプロイ

`master` ブランチへのpushで `.github/workflows/deploy.yml` が自動的に `client/` をビルドし、GitHub Pagesに公開します。

## 機能

- TODOの追加・削除
- 完了/未完了の切り替え
- タイトルのダブルクリックによる編集
- すべて / 未完了 / 完了済み のフィルター
- localStorageによるデータの永続化(ブラウザ・端末ごと)
