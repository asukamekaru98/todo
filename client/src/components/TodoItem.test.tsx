import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "./TodoItem";
import type { Todo } from "../types";

const baseTodo: Todo = {
  id: 42,
  title: "牛乳を買う",
  completed: false,
  createdAt: "2026-07-22T00:00:00.000Z",
};

function renderItem(overrides: Partial<Todo> = {}) {
  const onToggle = vi.fn();
  const onDelete = vi.fn();
  const onRename = vi.fn();
  const todo = { ...baseTodo, ...overrides };
  render(
    <TodoItem
      todo={todo}
      onToggle={onToggle}
      onDelete={onDelete}
      onRename={onRename}
    />
  );
  return { todo, onToggle, onDelete, onRename };
}

describe("TodoItem", () => {
  it("タイトルを表示し、未完了ならチェックは外れている", () => {
    renderItem();

    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("completed が true なら完了スタイルとチェック済み状態になる", () => {
    const { todo } = renderItem({ completed: true });

    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByRole("listitem")).toHaveClass("completed");
    expect(screen.getByRole("listitem")).toHaveClass("todo-item");
    // 参照が変わっていないことも確認
    expect(todo.completed).toBe(true);
  });

  it("チェックボックス操作で onToggle が id と新しい状態で呼ばれる", async () => {
    const user = userEvent.setup();
    const { onToggle } = renderItem({ completed: false });

    await user.click(screen.getByRole("checkbox"));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(42, true);
  });

  it("削除ボタンで onDelete が id 付きで呼ばれる", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderItem();

    await user.click(screen.getByRole("button", { name: "牛乳を買う を削除" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(42);
  });

  it("ダブルクリックで編集モードに入り、現在のタイトルが編集欄に入る", async () => {
    const user = userEvent.setup();
    renderItem();

    await user.dblClick(screen.getByText("牛乳を買う"));

    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("牛乳を買う");
  });

  it("編集後に Enter で trim した新しいタイトルを onRename に渡す", async () => {
    const user = userEvent.setup();
    const { onRename } = renderItem();

    await user.dblClick(screen.getByText("牛乳を買う"));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "  パンを買う  {Enter}");

    expect(onRename).toHaveBeenCalledTimes(1);
    expect(onRename).toHaveBeenCalledWith(42, "パンを買う");
    // 編集モードを抜けて表示に戻る
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("blur でも編集内容を確定する", async () => {
    const user = userEvent.setup();
    const { onRename } = renderItem();

    await user.dblClick(screen.getByText("牛乳を買う"));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "卵を買う");
    await user.tab(); // フォーカスを外して blur を発火

    expect(onRename).toHaveBeenCalledWith(42, "卵を買う");
  });

  it("Escape で編集を破棄し、onRename を呼ばず元のタイトルに戻す", async () => {
    const user = userEvent.setup();
    const { onRename } = renderItem();

    await user.dblClick(screen.getByText("牛乳を買う"));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "変更内容{Escape}");

    expect(onRename).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
  });

  it("内容を変えずに確定した場合は onRename を呼ばない", async () => {
    const user = userEvent.setup();
    const { onRename } = renderItem();

    await user.dblClick(screen.getByText("牛乳を買う"));
    await user.type(screen.getByRole("textbox"), "{Enter}");

    expect(onRename).not.toHaveBeenCalled();
  });

  it("空文字に編集して確定した場合は onRename を呼ばず元に戻す", async () => {
    const user = userEvent.setup();
    const { onRename } = renderItem();

    await user.dblClick(screen.getByText("牛乳を買う"));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "   {Enter}");

    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
  });
});
