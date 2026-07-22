import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoList } from "./TodoList";
import type { Todo } from "../types";

const todos: Todo[] = [
  { id: 1, title: "牛乳を買う", completed: false, createdAt: "2026-07-22T00:00:00.000Z" },
  { id: 2, title: "掃除する", completed: true, createdAt: "2026-07-22T01:00:00.000Z" },
];

describe("TodoList", () => {
  it("todos が空のときは空メッセージを表示する", () => {
    render(
      <TodoList todos={[]} onToggle={vi.fn()} onDelete={vi.fn()} onRename={vi.fn()} />
    );

    expect(screen.getByText("TODOはありません")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("渡された todos の件数だけ項目を描画する", () => {
    render(
      <TodoList todos={todos} onToggle={vi.fn()} onDelete={vi.fn()} onRename={vi.fn()} />
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.getByText("掃除する")).toBeInTheDocument();
  });

  it("特定の項目の削除ボタンが、その項目の id で onDelete を呼ぶ", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TodoList todos={todos} onToggle={vi.fn()} onDelete={onDelete} onRename={vi.fn()} />
    );

    await user.click(screen.getByRole("button", { name: "掃除する を削除" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(2);
  });

  it("チェックボックス操作が該当項目の id で onToggle に伝わる", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TodoList todos={todos} onToggle={onToggle} onDelete={vi.fn()} onRename={vi.fn()} />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    // 1件目（未完了）をチェック → true になる
    await user.click(checkboxes[0]);

    expect(onToggle).toHaveBeenCalledWith(1, true);
  });
});
