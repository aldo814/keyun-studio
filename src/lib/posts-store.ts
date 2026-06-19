"use client";


import { useCallback, useState } from "react";

import { type BoardPost, initialPosts } from "@/features/dashboard/content-posts-data";

const STORAGE_KEY = "keyun_posts";

function loadPosts(): BoardPost[] {
  if (typeof window === "undefined") return initialPosts;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialPosts;
    return JSON.parse(raw) as BoardPost[];
  } catch {
    return initialPosts;
  }
}

function savePosts(posts: BoardPost[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function nextId() {
  return "local-post-" + Date.now().toString(36);
}

function todayStr() {
  const d = new Date();
  return String(d.getFullYear()) + "." + String(d.getMonth() + 1).padStart(2, "0") + "." + String(d.getDate()).padStart(2, "0");
}

export function usePosts() {
  const [posts, setPosts] = useState<BoardPost[]>(() => loadPosts());

  const sync = useCallback((next: BoardPost[]) => {
    setPosts(next);
    savePosts(next);
  }, []);

  function createPost(data: Omit<BoardPost, "id" | "updatedAt" | "updatedAtRaw" | "views">) {
    const now = new Date().toISOString();
    const updated = [
      { ...data, id: nextId(), updatedAt: todayStr(), updatedAtRaw: now, views: 0 },
      ...posts,
    ];
    sync(updated);
    return updated[0];
  }

  function updatePost(id: string, data: Partial<Omit<BoardPost, "id">>) {
    const now = new Date().toISOString();
    const updated = posts.map((p) =>
      p.id === id ? { ...p, ...data, updatedAt: todayStr(), updatedAtRaw: now } : p,
    );
    sync(updated);
  }

  function deletePost(id: string) {
    sync(posts.filter((p) => p.id !== id));
  }

  function togglePinned(id: string) {
    const updated = posts.map((p) =>
      p.id === id ? { ...p, pinned: !p.pinned } : p,
    );
    sync(updated);
  }

  function getPost(id: string) {
    return posts.find((p) => p.id === id) ?? null;
  }

  return { posts, createPost, updatePost, deletePost, togglePinned, getPost };
}
