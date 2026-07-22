import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { api } from "./api";
import type { Todo } from "./types";

// api モジュールをモック化して、ネットワークを介さず App の挙動を検証する
vi.mock("./api", () => ({
  api: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

const seed: Todo[] = [
  { id: 1, title: "牛乳を買う", completed: false, createdAt: "2026-07-22T00:00:00.000Z" },
  { id: 2, title: "掃除する", completed: true, createdAt: "2026-07-22T01:00:00.000Z" },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockedApi.list.mockResolvedValue(seed.map((t) => ({ ...t })));
  mockedApi.create.mockImplementation(async (title: string) => ({
    id: 99,
    title,
    completed: false,
    createdAt: "2026-07-22T02:00:00.000Z",
  }));
  mockedApi.update.mockImplementation(async () => seed[0]);
  mockedApi.remove.mockResolvedValue(undefined);
});

describe("App 初期表示", () => {
  it("読み込み中は「読み込み中...」を表示する", () => {
    // list を保留させてローディング状態を維持する
    mockedApi.list.mockReturnValue(new Promise(() => {}));
    render(<App />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("取得した TODO を一覧表示し、残り件数を計算する", async () => {
    render(<App />);

    expect(await screen.findByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.getByText("掃除する")).toBeInTheDocument();
    // 未完了は1件（牛乳を買う）
    expect(screen.getByText("残り 1 件")).toBeInTheDocument();
  });

  it("一覧取得に失敗するとエラーメッセージを表示する", async () => {
    mockedApi.list.mockRejectedValue(new Error("接続に失敗しました"));
    render(<App />);

    expect(await screen.findByText("エラー: 接続に失敗しました")).toBeInTheDocument();
  });
});

describe("App の TODO 追加", () => {
  it("追加すると api.create を呼び、新しい項目を先頭に挿入する", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("牛乳を買う");

    await user.type(screen.getByLabelText("新しいTODO"), "運動する");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(mockedApi.create).toHaveBeenCalledWith("運動する");
    const items = await screen.findAllByRole("listitem");
    // 先頭に挿入される
    expect(within(items[0]).getByText("運動する")).toBeInTheDocument();
    // 追加により未完了が2件になる
    expect(screen.getByText("残り 2 件")).toBeInTheDocument();
  });
});

describe("App の完了トグル", () => {
  it("未完了項目をチェックすると api.update を completed:true で呼ぶ", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("牛乳を買う");

    const milkItem = screen.getByText("牛乳を買う").closest("li")!;
    await user.click(within(milkItem).getByRole("checkbox"));

    expect(mockedApi.update).toHaveBeenCalledWith(1, { completed: true });
    // 楽観的更新で残り件数が0件になる
    expect(await screen.findByText("残り 0 件")).toBeInTheDocument();
  });
});

describe("App の削除", () => {
  it("削除すると api.remove を呼び、一覧から取り除く", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("掃除する");

    await user.click(screen.getByRole("button", { name: "掃除する を削除" }));

    expect(mockedApi.remove).toHaveBeenCalledWith(2);
    expect(screen.queryByText("掃除する")).not.toBeInTheDocument();
    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
  });
});

describe("App のフィルタ", () => {
  it("「未完了」フィルタは未完了の TODO だけを表示する", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("牛乳を買う");

    await user.click(screen.getByRole("button", { name: "未完了" }));

    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.queryByText("掃除する")).not.toBeInTheDocument();
  });

  it("「完了済み」フィルタは完了済みの TODO だけを表示する", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("掃除する");

    await user.click(screen.getByRole("button", { name: "完了済み" }));

    expect(screen.getByText("掃除する")).toBeInTheDocument();
    expect(screen.queryByText("牛乳を買う")).not.toBeInTheDocument();
  });

  it("「すべて」フィルタは全ての TODO を表示する", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("牛乳を買う");

    await user.click(screen.getByRole("button", { name: "未完了" }));
    await user.click(screen.getByRole("button", { name: "すべて" }));

    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.getByText("掃除する")).toBeInTheDocument();
  });
});

describe("App のリネーム", () => {
  it("項目名を変更すると api.update を title 付きで呼ぶ", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("牛乳を買う");

    await user.dblClick(screen.getByText("牛乳を買う"));
    // フォームの入力欄と区別するため、現在値で編集欄を特定する
    const input = screen.getByDisplayValue("牛乳を買う");
    await user.clear(input);
    await user.type(input, "豆乳を買う{Enter}");

    expect(mockedApi.update).toHaveBeenCalledWith(1, { title: "豆乳を買う" });
    expect(await screen.findByText("豆乳を買う")).toBeInTheDocument();
  });
});
