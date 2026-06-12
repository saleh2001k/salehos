import type { ReactNode } from "react";

interface DesktopIconProps {
  id: string;
  label: string;
  icon: ReactNode;
  selected: boolean;
  onSelect: (id: string, additive: boolean) => void;
  onOpen: () => void;
  onContextMenu?: (x: number, y: number) => void;
  /** FS node id — makes the icon draggable for move operations. */
  fsNodeId?: string;
  /** FS folder id — makes the icon a drop target. */
  fsDropFolderId?: string;
  onFsDrop?: (nodeId: string, targetFolderId: string) => void;
}

export function DesktopIcon({
  id,
  label,
  icon,
  selected,
  onSelect,
  onOpen,
  onContextMenu,
  fsNodeId,
  fsDropFolderId,
  onFsDrop,
}: DesktopIconProps) {
  return (
    <button
      type="button"
      data-desktop-icon={id}
      className="flex w-20 flex-col items-center gap-1 outline-none"
      draggable={Boolean(fsNodeId)}
      onDragStart={(event) => {
        if (!fsNodeId) return;
        event.dataTransfer.setData("application/x-fs-node", fsNodeId);
        event.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(event) => {
        if (fsDropFolderId && event.dataTransfer.types.includes("application/x-fs-node")) {
          event.preventDefault();
        }
      }}
      onDrop={(event) => {
        if (!fsDropFolderId) return;
        const nodeId = event.dataTransfer.getData("application/x-fs-node");
        if (nodeId) {
          onFsDrop?.(nodeId, fsDropFolderId);
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      onPointerDown={(event) => {
        // Highlight immediately on press, like the real desktop.
        if (event.button === 0) onSelect(id, event.metaKey || event.ctrlKey || event.shiftKey);
      }}
      onDoubleClick={onOpen}
      onContextMenu={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelect(id, false);
        onContextMenu?.(event.clientX, event.clientY);
      }}
      aria-label={`Open ${label}`}
      aria-pressed={selected}
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-lg p-0.5 ${
          selected ? "bg-white/25 ring-1 ring-white/30" : ""
        }`}
      >
        {icon}
      </span>
      <span
        className={`max-w-full truncate rounded px-1.5 py-0.5 text-xs font-medium ${
          selected
            ? "bg-[#2a7de1] text-[#fff]"
            : "text-[#fff] [text-shadow:0_1px_3px_rgba(0,0,0,0.7)]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
