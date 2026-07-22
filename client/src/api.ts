import type { Todo } from "./types";

const BASE_URL = "/api/todos";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json();
}

export const api = {
  list: (): Promise<Todo[]> =>
    fetch(BASE_URL).then((res) => handleResponse<Todo[]>(res)),

  create: (title: string): Promise<Todo> =>
    fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then((res) => handleResponse<Todo>(res)),

  update: (id: number, changes: Partial<Pick<Todo, "title" | "completed">>): Promise<Todo> =>
    fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    }).then((res) => handleResponse<Todo>(res)),

  remove: (id: number): Promise<void> =>
    fetch(`${BASE_URL}/${id}`, { method: "DELETE" }).then((res) => handleResponse<void>(res)),
};
