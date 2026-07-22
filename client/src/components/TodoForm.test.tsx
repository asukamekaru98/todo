import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoForm } from "./TodoForm";

describe("TodoForm", () => {
  it("submit ボタンは入力が空のとき無効になっている", () => {
    render(<TodoForm onAdd={vi.fn().mockResolvedValue(undefined)} />);

    expect(screen.getByRole("button", { name: "追加" })).toBeDisabled();
  });

  it("文字を入力すると submit ボタンが有効になる", async () => {
    const user = userEvent.setup();
    render(<TodoForm onAdd={vi.fn().mockResolvedValue(undefined)} />);

    await user.type(screen.getByLabelText("新しいTODO"), "牛乳を買う");

    expect(screen.getByRole("button", { name: "追加" })).toBeEnabled();
  });

  it("送信すると入力値を trim して onAdd に渡し、入力欄をクリアする", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<TodoForm onAdd={onAdd} />);

    const input = screen.getByLabelText<HTMLInputElement>("新しいTODO");
    await user.type(input, "  牛乳を買う  ");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith("牛乳を買う");
    expect(input.value).toBe("");
  });

  it("Enter キーでも送信できる", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<TodoForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText("新しいTODO"), "掃除{Enter}");

    expect(onAdd).toHaveBeenCalledWith("掃除");
  });

  it("空白のみの入力では onAdd を呼ばない", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn().mockResolvedValue(undefined);
    render(<TodoForm onAdd={onAdd} />);

    // ボタンは無効なので直接フォーム送信を試みても onAdd は呼ばれない
    await user.type(screen.getByLabelText("新しいTODO"), "   {Enter}");

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("送信処理の完了までボタンは無効化され、二重送信を防ぐ", async () => {
    const user = userEvent.setup();
    let resolveAdd: () => void = () => {};
    const onAdd = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveAdd = resolve;
        })
    );
    render(<TodoForm onAdd={onAdd} />);

    const button = screen.getByRole("button", { name: "追加" });
    await user.type(screen.getByLabelText("新しいTODO"), "タスク");
    await user.click(button);

    // onAdd が pending の間は submitting=true でボタンが無効
    expect(button).toBeDisabled();

    // 無効化中に再度クリックしても onAdd は増えない
    await user.click(button);
    expect(onAdd).toHaveBeenCalledTimes(1);

    // 解決後は再び入力可能な状態に戻る（入力はクリア済みなので無効のまま）
    resolveAdd();
    await vi.waitFor(() =>
      expect(screen.getByLabelText<HTMLInputElement>("新しいTODO").value).toBe("")
    );
  });
});
