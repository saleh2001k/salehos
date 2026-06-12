/**
 * Tiny virtual file system for the desktop: folders and rich-text files,
 * persisted to localStorage. Root nodes (parentId === null) appear on the
 * desktop; Finder and TextEdit operate on the same tree.
 */
import { useSyncExternalStore } from "react";

export type FsNodeType = "folder" | "text";

export interface FsNode {
  id: string;
  name: string;
  type: FsNodeType;
  parentId: string | null;
  /** HTML content for text files. */
  content: string;
  createdAt: number;
}

const STORAGE_KEY = "macos-fs-v1";

let nodes: FsNode[] = load();
const listeners = new Set<() => void>();

function load(): FsNode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FsNode[];
  } catch {
    /* fresh start */
  }
  return [];
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
  } catch {
    /* storage full or blocked — keep in-memory */
  }
}

function emit() {
  persist();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useFs(): FsNode[] {
  return useSyncExternalStore(subscribe, () => nodes);
}

export const fs = {
  all: () => nodes,
  get: (id: string) => nodes.find((node) => node.id === id),
  childrenOf: (parentId: string | null) =>
    nodes
      .filter((node) => node.parentId === parentId)
      .sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === "folder" ? -1 : 1)),

  /** Unique name within a parent: "untitled", "untitled 2", … */
  uniqueName(base: string, parentId: string | null): string {
    const siblings = new Set(
      nodes.filter((node) => node.parentId === parentId).map((node) => node.name),
    );
    if (!siblings.has(base)) return base;
    let counter = 2;
    while (siblings.has(`${base} ${counter}`)) counter++;
    return `${base} ${counter}`;
  },

  create(type: FsNodeType, parentId: string | null, name?: string): FsNode {
    const node: FsNode = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name ?? fs.uniqueName(type === "folder" ? "untitled folder" : "untitled.txt", parentId),
      type,
      parentId,
      content: "",
      createdAt: Date.now(),
    };
    nodes = [...nodes, node];
    emit();
    return node;
  },

  rename(id: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    nodes = nodes.map((node) => (node.id === id ? { ...node, name: trimmed } : node));
    emit();
  },

  setContent(id: string, content: string) {
    nodes = nodes.map((node) => (node.id === id ? { ...node, content } : node));
    emit();
  },

  /** True if `maybeAncestor` is `id` itself or one of its ancestors. */
  isWithin(id: string, maybeAncestor: string): boolean {
    let current: FsNode | undefined = fs.get(id);
    while (current) {
      if (current.id === maybeAncestor) return true;
      current = current.parentId ? fs.get(current.parentId) : undefined;
    }
    return false;
  },

  /** Move a node into a folder (or to the desktop with null). No-op on cycles. */
  move(id: string, targetFolderId: string | null): boolean {
    if (id === targetFolderId) return false;
    if (targetFolderId) {
      const target = fs.get(targetFolderId);
      if (!target || target.type !== "folder") return false;
      if (fs.isWithin(targetFolderId, id)) return false; // folder into itself
    }
    const node = fs.get(id);
    if (!node || node.parentId === targetFolderId) return false;
    const name = fs.uniqueName(node.name, targetFolderId);
    nodes = nodes.map((n) => (n.id === id ? { ...n, parentId: targetFolderId, name } : n));
    emit();
    return true;
  },

  /** Erase every user-created file and folder. */
  reset() {
    nodes = [];
    emit();
  },

  /** Delete a node and all descendants. Returns count removed. */
  remove(id: string): number {
    const doomed = new Set<string>([id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const node of nodes) {
        if (node.parentId && doomed.has(node.parentId) && !doomed.has(node.id)) {
          doomed.add(node.id);
          grew = true;
        }
      }
    }
    nodes = nodes.filter((node) => !doomed.has(node.id));
    emit();
    return doomed.size;
  },
};
