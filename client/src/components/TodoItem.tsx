import { useState } from "react";
import type { Todo } from "../types";

interface Props {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  onRename: (id: number, title: string) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onRename }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);

  const commitRename = () => {
    const trimmed = draft.trim();
    setEditing(false);
    if (trimmed && trimmed !== todo.title) {
      onRename(todo.id, trimmed);
    } else {
      setDraft(todo.title);
    }
  };

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <label className="todo-item__checkbox">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={(e) => onToggle(todo.id, e.target.checked)}
        />
      </label>

      {editing ? (
        <input
          className="todo-item__edit-input"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") {
              setDraft(todo.title);
              setEditing(false);
            }
          }}
        />
      ) : (
        <span className="todo-item__title" onDoubleClick={() => setEditing(true)}>
          {todo.title}
        </span>
      )}

      <button
        type="button"
        className="todo-item__delete"
        onClick={() => onDelete(todo.id)}
        aria-label={`${todo.title} を削除`}
      >
        削除
      </button>
    </li>
  );
}
