import { useState } from "react";
import type { FormEvent } from "react";

interface Props {
  onAdd: (title: string) => Promise<void>;
}

export function TodoForm({ onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await onAdd(trimmed);
      setTitle("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="やることを入力..."
        aria-label="新しいTODO"
      />
      <button type="submit" disabled={!title.trim() || submitting}>
        追加
      </button>
    </form>
  );
}
