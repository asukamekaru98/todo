import { Router } from "express";
import { db } from "../db.js";

export const router = Router();

const toTodo = (row) => ({
  id: row.id,
  title: row.title,
  completed: Boolean(row.completed),
  createdAt: row.created_at,
});

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM todos ORDER BY id DESC").all();
  res.json(rows.map(toTodo));
});

router.post("/", (req, res) => {
  const title = String(req.body?.title ?? "").trim();
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  const result = db
    .prepare("INSERT INTO todos (title, completed) VALUES (?, 0)")
    .run(title);
  const row = db
    .prepare("SELECT * FROM todos WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(toTodo(row));
});

router.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM todos WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ error: "todo not found" });
  }

  const title =
    req.body?.title !== undefined ? String(req.body.title).trim() : existing.title;
  const completed =
    req.body?.completed !== undefined
      ? Boolean(req.body.completed)
      : Boolean(existing.completed);

  if (!title) {
    return res.status(400).json({ error: "title cannot be empty" });
  }

  db.prepare("UPDATE todos SET title = ?, completed = ? WHERE id = ?").run(
    title,
    completed ? 1 : 0,
    id
  );

  const row = db.prepare("SELECT * FROM todos WHERE id = ?").get(id);
  res.json(toTodo(row));
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare("DELETE FROM todos WHERE id = ?").run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "todo not found" });
  }
  res.status(204).send();
});
