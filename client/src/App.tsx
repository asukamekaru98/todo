import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { api } from "./api";
import { TodoForm } from "./components/TodoForm";
import { TodoList } from "./components/TodoList";
import type { Todo } from "./types";

type Filter = "all" | "active" | "completed";

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .list()
      .then(setTodos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (title: string) => {
    const created = await api.create(title);
    setTodos((prev) => [created, ...prev]);
  };

  const handleToggle = async (id: number, completed: boolean) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    );
    try {
      await api.update(id, { completed });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleRename = async (id: number, title: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
    try {
      await api.update(id, { title });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await api.remove(id);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const filteredTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const remainingCount = useMemo(
    () => todos.filter((t) => !t.completed).length,
    [todos]
  );

  return (
    <div className="app">
      <h1>TODOリスト</h1>

      <TodoForm onAdd={handleAdd} />

      {error && <p className="app__error">エラー: {error}</p>}

      <div className="app__filters">
        {(["all", "active", "completed"] as Filter[]).map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "すべて" : f === "active" ? "未完了" : "完了済み"}
          </button>
        ))}
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <TodoList
          todos={filteredTodos}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onRename={handleRename}
        />
      )}

      <p className="app__summary">残り {remainingCount} 件</p>
    </div>
  );
}

export default App;
