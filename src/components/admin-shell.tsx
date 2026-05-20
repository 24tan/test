"use client";

import { FormEvent, useEffect, useState } from "react";
import { SiteSettingsPanel } from "@/components/site-settings-panel";
import { UploadPanel } from "@/components/upload-panel";
import { WorksPanel } from "@/components/works-panel";

const storageKey = "aiyuan-admin-credentials";

type AdminCredentials = {
  username: string;
  password: string;
};

const tabs = [
  { id: "site", label: "站点" },
  { id: "works", label: "作品" },
  { id: "media", label: "素材" },
] as const;

type AdminTab = (typeof tabs)[number]["id"];

export function AdminShell() {
  const [credentials, setCredentials] = useState<AdminCredentials>({
    username: "",
    password: "",
  });
  const [activeCredentials, setActiveCredentials] = useState<AdminCredentials | null>(
    null,
  );
  const [status, setStatus] = useState("请输入账号和密码后再管理作品。");
  const [isChecking, setIsChecking] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("site");

  async function verify(nextCredentials: AdminCredentials) {
    const response = await fetch("/api/admin/verify", {
      method: "POST",
      headers: {
        "x-admin-username": nextCredentials.username,
        "x-admin-password": nextCredentials.password,
      },
    });
    const data = (await response.json()) as { ok?: boolean; error?: string };

    if (!response.ok || !data.ok) {
      throw new Error(data.error ?? "后台账号或密码不正确。");
    }
  }

  useEffect(() => {
    const savedCredentials = window.sessionStorage.getItem(storageKey);

    if (!savedCredentials) {
      return;
    }

    const parsedCredentials = JSON.parse(savedCredentials) as AdminCredentials;

    verify(parsedCredentials)
      .then(() => {
        setCredentials(parsedCredentials);
        setActiveCredentials(parsedCredentials);
        setStatus("已登录后台。");
      })
      .catch(() => {
        window.sessionStorage.removeItem(storageKey);
      });
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsChecking(true);
    setStatus("正在验证后台账号...");

    try {
      await verify(credentials);
      window.sessionStorage.setItem(storageKey, JSON.stringify(credentials));
      setActiveCredentials(credentials);
      setStatus("已登录后台。");
    } catch (error) {
      setActiveCredentials(null);
      setStatus(error instanceof Error ? error.message : "后台账号或密码不正确。");
    } finally {
      setIsChecking(false);
    }
  }

  function logout() {
    window.sessionStorage.removeItem(storageKey);
    setActiveCredentials(null);
    setCredentials({ username: "", password: "" });
    setStatus("已退出后台。");
  }

  if (!activeCredentials) {
    return (
      <form
        onSubmit={handleLogin}
        className="mx-auto max-w-xl space-y-5 rounded-lg border border-white/10 bg-white/[0.04] p-6 shadow-cinematic"
      >
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-amberline">
            Private admin
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-bone">登录后台</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            公开网址只展示作品内容。只有输入你的后台账号和密码后，才能上传素材和编辑作品。
          </p>
        </div>
        <label className="block text-sm font-semibold text-bone">
          账号
          <input
            value={credentials.username}
            onChange={(event) =>
              setCredentials((current) => ({
                ...current,
                username: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-sm text-bone outline-none transition focus:border-amberline/70"
          />
        </label>
        <label className="block text-sm font-semibold text-bone">
          密码
          <input
            type="password"
            value={credentials.password}
            onChange={(event) =>
              setCredentials((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            className="mt-2 w-full rounded-lg border border-white/10 bg-ink/70 px-4 py-3 text-sm text-bone outline-none transition focus:border-amberline/70"
          />
        </label>
        <button
          type="submit"
          disabled={isChecking}
          className="inline-flex w-full items-center justify-center rounded-full bg-bone px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isChecking ? "验证中..." : "进入后台"}
        </button>
        <p className="rounded-lg border border-white/10 bg-ink/55 p-4 text-sm leading-6 text-muted">
          {status}
        </p>
      </form>
    );
  }

  return (
    <div className="space-y-10">
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-amberline">
              Creator console
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-bone sm:text-4xl">
              内容后台
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              管理公开网站的站点资料、作品内容、图片和视频素材。
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-muted transition hover:border-white/30 hover:text-bone"
          >
            退出后台
          </button>
        </div>
        <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-bone text-ink"
                    : "border border-white/12 bg-white/[0.035] text-muted hover:border-white/30 hover:text-bone"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "site" ? (
        <SiteSettingsPanel
          adminUsername={activeCredentials.username}
          adminPassword={activeCredentials.password}
        />
      ) : null}

      {activeTab === "works" ? (
        <WorksPanel
          adminUsername={activeCredentials.username}
          adminPassword={activeCredentials.password}
        />
      ) : null}

      {activeTab === "media" ? (
        <UploadPanel
          adminUsername={activeCredentials.username}
          adminPassword={activeCredentials.password}
        />
      ) : null}
    </div>
  );
}
