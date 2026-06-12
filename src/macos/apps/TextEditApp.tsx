import {
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fs, useFs } from "../lib/fs";
import { sfx } from "../lib/sfx";

interface ToolSpec {
  Icon: LucideIcon;
  label: string;
  command: string;
  value?: string;
}

const TOOLS: (ToolSpec | "divider")[] = [
  { Icon: Undo2, label: "Undo", command: "undo" },
  { Icon: Redo2, label: "Redo", command: "redo" },
  "divider",
  { Icon: Bold, label: "Bold", command: "bold" },
  { Icon: Italic, label: "Italic", command: "italic" },
  { Icon: Underline, label: "Underline", command: "underline" },
  { Icon: Strikethrough, label: "Strikethrough", command: "strikeThrough" },
  "divider",
  { Icon: Heading2, label: "Heading", command: "formatBlock", value: "h2" },
  { Icon: List, label: "Bullet list", command: "insertUnorderedList" },
  { Icon: ListOrdered, label: "Numbered list", command: "insertOrderedList" },
];

export function TextEditApp({ fileId }: { fileId: string }) {
  useFs(); // re-render on fs changes (rename etc.)
  const file = fs.get(fileId);
  const editorRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(true);

  // Load content once on mount; afterwards the editor owns the DOM.
  useEffect(() => {
    if (editorRef.current && file) editorRef.current.innerHTML = file.content;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  // Debounced autosave.
  useEffect(() => {
    if (saved) return;
    const id = setTimeout(() => {
      if (editorRef.current && fs.get(fileId)) {
        fs.setContent(fileId, editorRef.current.innerHTML);
        setSaved(true);
      }
    }, 600);
    return () => clearTimeout(id);
  }, [saved, fileId]);

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-white/45">
        This file was deleted.
      </div>
    );
  }

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    setSaved(false);
    sfx.click();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-0.5 border-b border-white/10 px-2 py-1.5">
        {TOOLS.map((tool, index) =>
          tool === "divider" ? (
            <span key={`div-${index}`} className="mx-1 h-4 w-px bg-white/15" />
          ) : (
            <button
              key={tool.label}
              type="button"
              title={tool.label}
              aria-label={tool.label}
              className="rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              onMouseDown={(event) => {
                // Keep the text selection alive.
                event.preventDefault();
                exec(tool.command, tool.value);
              }}
            >
              <tool.Icon size={15} />
            </button>
          ),
        )}
        <span className={`ml-auto px-2 text-[11px] ${saved ? "text-white/30" : "text-[#e8aa42]"}`}>
          {saved ? "Saved" : "Saving…"}
        </span>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="prose-invert min-h-0 flex-1 cursor-text select-text overflow-y-auto bg-[var(--editor)] p-5 text-[14px] leading-relaxed text-white/90 outline-none [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
        onInput={() => setSaved(false)}
        aria-label={`Editing ${file.name}`}
      />
    </div>
  );
}
