import type { Todo } from "./types";

const STORAGE_KEY = "todos";

function loadTodos(): Todo[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Todo[];
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export const api = {
  async list(): Promise<Todo[]> {
    return loadTodos().sort((a, b) => b.id - a.id);
  },

  async create(title: string): Promise<Todo> {
    const todos = loadTodos();
    const id = todos.reduce((max, t) => Math.max(max, t.id), 0) + 1;
    const todo: Todo = {
      id,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    saveTodos([todo, ...todos]);
    return todo;
  },

  async update(
    id: number,
    changes: Partial<Pick<Todo, "title" | "completed">>
  ): Promise<Todo> {
    const todos = loadTodos();
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error("todo not found");
    }
    const updated = { ...todos[index], ...changes };
    todos[index] = updated;
    saveTodos(todos);
    return updated;
  },

  async remove(id: number): Promise<void> {
    const todos = loadTodos();
    const next = todos.filter((t) => t.id !== id);
    if (next.length === todos.length) {
      throw new Error("todo not found");
    }
    saveTodos(next);
  },
};
