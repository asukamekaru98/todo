import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Vercelのサーバーレス関数はソースツリーが読み取り専用で、/tmpのみ書き込み可能。
// そのためVercel上ではDBがインスタンスごと・コールドスタートごとにリセットされる。
const dbPath = process.env.VERCEL
  ? "/tmp/todo.db"
  : path.join(__dirname, "..", "todo.db");

export const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);
