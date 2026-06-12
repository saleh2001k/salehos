import {
  Award,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FilePlus,
  FolderOpen,
  FolderPlus,
  Monitor,
  Pencil,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  certificates,
  education,
  experience,
  projects,
  projectsNote,
  skillGroups,
} from "../../data/content";
import { FolderGlyph, TextFileGlyph } from "../components/AppIcons";
import { fs, useFs, type FsNode } from "../lib/fs";
import { sfx } from "../lib/sfx";

export type FinderSection = "projects" | "experience" | "skills" | "education";

const SIDEBAR: { id: FinderSection; label: string; icon: typeof FolderOpen }[] = [
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "education", label: "Education", icon: Award },
];

function ProjectsPane() {
  const [openProject, setOpenProject] = useState<string | null>(null);
  const index = projects.findIndex((entry) => entry.title === openProject);
  const project = index >= 0 ? projects[index] : undefined;

  if (project) {
    const prev = projects[(index - 1 + projects.length) % projects.length]!;
    const next = projects[(index + 1) % projects.length]!;
    return (
      <div className="flex h-full flex-col">
        {/* Project navigator: back, position, and prev/next stepping */}
        <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-2">
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-[#5aa7f2] hover:underline"
            onClick={() => setOpenProject(null)}
          >
            <ChevronLeft size={15} />
            All Projects
          </button>
          <span className="ml-auto text-xs tabular-nums text-white/40">
            {index + 1} of {projects.length}
          </span>
          <button
            type="button"
            aria-label={`Previous: ${prev.title}`}
            className="rounded-md bg-white/10 p-1 text-white/75 hover:bg-white/20"
            onClick={() => setOpenProject(prev.title)}
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            aria-label={`Next: ${next.title}`}
            className="rounded-md bg-white/10 p-1 text-white/75 hover:bg-white/20"
            onClick={() => setOpenProject(next.title)}
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <h3 className="text-lg font-semibold text-white">{project.title}</h3>
          <p className="mt-0.5 text-xs text-white/50">
            {project.tag}
            {project.period ? ` · ${project.period}` : ""}
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75">
            {project.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-xs text-white/80"
              >
                {tech}
              </span>
            ))}
          </div>
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block rounded-lg bg-[#2a7de1] px-4 py-1.5 text-sm font-medium text-[#fff] hover:bg-[#3b8af0]"
            >
              Open on GitHub
            </a>
          )}

          {/* Jump straight to any other project */}
          <p className="mt-8 text-[11px] font-semibold uppercase tracking-widest text-white/35">
            More projects
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {projects
              .filter((entry) => entry.title !== project.title)
              .map((entry) => (
                <button
                  key={entry.title}
                  type="button"
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/75 hover:border-[#5aa7f2]/60 hover:text-white"
                  onClick={() => setOpenProject(entry.title)}
                >
                  {entry.title}
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2">
        {projects.map((entry) => (
          <button
            key={entry.title}
            type="button"
            className="group flex flex-col items-center gap-1.5 rounded-lg p-2 hover:bg-white/10"
            onClick={() => setOpenProject(entry.title)}
          >
            <FolderGlyph className="h-12 w-14" />
            <span className="line-clamp-2 text-center text-xs leading-tight text-white/85">
              {entry.title}
            </span>
            {entry.featured && (
              <span className="rounded-full bg-[#e8aa42]/20 px-1.5 text-[10px] text-[#e8aa42]">
                Featured
              </span>
            )}
          </button>
        ))}
        <div className="flex flex-col items-center gap-1.5 rounded-lg p-2 opacity-60">
          <TextFileGlyph className="h-12 w-10" />
          <span className="text-center text-xs leading-tight text-white/70">{projectsNote}</span>
        </div>
      </div>
    </div>
  );
}

function ExperiencePane() {
  return (
    <div className="p-5">
      {/* Vertical timeline: line, glowing dots, current-role badge */}
      <div className="relative border-l border-white/15 pl-6">
        {experience.map((item, index) => {
          const current = /present/i.test(item.period);
          return (
            <div key={item.company} className={index === experience.length - 1 ? "" : "pb-7"}>
              <span
                className={`absolute -left-[5px] mt-2 h-2.5 w-2.5 rounded-full ${
                  current
                    ? "bg-[#34d058] shadow-[0_0_12px_rgba(52,208,88,0.9)]"
                    : "bg-[#e8aa42] shadow-[0_0_8px_rgba(232,170,66,0.6)]"
                }`}
              />
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-[#e8aa42]/35">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">{item.company}</h3>
                  {current && (
                    <span className="rounded-full bg-[#34d058]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#34d058]">
                      Current
                    </span>
                  )}
                  <span className="ml-auto rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] tabular-nums text-white/60">
                    {item.period}
                  </span>
                </div>
                <p className="mt-1 text-[13px] font-medium text-[#e8aa42]">{item.role}</p>
                <ul className="mt-3 space-y-1.5">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2 text-[13px] leading-relaxed text-white/70">
                      <span className="mt-[9px] h-px w-2.5 shrink-0 bg-[#e8aa42]/60" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkillsPane() {
  return (
    <div className="space-y-6 p-5">
      {skillGroups.map((group) => (
        <div key={group.label}>
          <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-white/50">
            {group.label}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {group.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[13px] text-white/85"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EducationPane() {
  return (
    <div className="space-y-6 p-5">
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-white/50">
          Education
        </h3>
        <div className="space-y-2">
          {education.map((item) => (
            <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="mt-0.5 text-xs text-white/50">
                {item.org}
                {item.period ? ` · ${item.period}` : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-white/50">
          Certificates
        </h3>
        <div className="space-y-1">
          {certificates.map((cert) => (
            <div
              key={cert.name}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/10 py-2"
            >
              <span className="text-sm text-white/85">{cert.name}</span>
              <span className="text-xs text-white/50">{cert.org}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface FsPaneProps {
  folderId: string | null;
  onNavigate: (folderId: string | null) => void;
  onOpenFile?: (fileId: string) => void;
  onTrashNode?: (nodeId: string) => void;
}

/** Browses the user's virtual desktop: create, rename, move (drag), delete. */
function FsPane({ folderId, onNavigate, onOpenFile, onTrashNode }: FsPaneProps) {
  useFs();
  const children = fs.childrenOf(folderId);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    renameRef.current?.focus();
    renameRef.current?.select();
  }, [renaming]);

  // Breadcrumb chain up to the desktop root.
  const crumbs: { id: string | null; name: string }[] = [{ id: null, name: "Desktop" }];
  {
    const chain: FsNode[] = [];
    let cursor = folderId ? fs.get(folderId) : undefined;
    while (cursor) {
      chain.unshift(cursor);
      cursor = cursor.parentId ? fs.get(cursor.parentId) : undefined;
    }
    chain.forEach((node) => crumbs.push({ id: node.id, name: node.name }));
  }

  const commitRename = () => {
    if (renaming) fs.rename(renaming, draft);
    setRenaming(null);
  };

  const dropProps = (targetId: string | null) => ({
    onDragOver: (event: React.DragEvent) => {
      if (event.dataTransfer.types.includes("application/x-fs-node")) event.preventDefault();
    },
    onDrop: (event: React.DragEvent) => {
      const id = event.dataTransfer.getData("application/x-fs-node");
      if (id && fs.move(id, targetId)) sfx.click();
      event.preventDefault();
      event.stopPropagation();
    },
  });

  return (
    <div className="flex h-full flex-col" {...dropProps(folderId)}>
      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-white/10 px-4 py-2 text-[13px]">
        {crumbs.map((crumb, index) => (
          <span key={crumb.id ?? "root"} className="flex items-center gap-1">
            {index > 0 && <ChevronRight size={12} className="text-white/30" />}
            <button
              type="button"
              className={`rounded px-1.5 py-0.5 ${
                index === crumbs.length - 1 ? "font-semibold text-white" : "text-white/60 hover:bg-white/10"
              }`}
              onClick={() => onNavigate(crumb.id)}
              {...dropProps(crumb.id)}
            >
              {crumb.name}
            </button>
          </span>
        ))}
        <span className="ml-auto flex gap-1">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/20"
            onClick={() => {
              sfx.click();
              fs.create("folder", folderId);
            }}
          >
            <FolderPlus size={13} />
            Folder
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs text-white/80 hover:bg-white/20"
            onClick={() => {
              sfx.click();
              fs.create("text", folderId);
            }}
          >
            <FilePlus size={13} />
            Text File
          </button>
        </span>
      </div>

      {children.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <FolderGlyph className="h-16 w-20 opacity-40" />
          <p className="text-sm text-white/60">This folder is empty</p>
          <p className="max-w-xs text-xs leading-relaxed text-white/35">
            Create files and folders with the buttons above, and drag items onto folders to move
            them.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {children.map((node) => (
            <div
              key={node.id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("application/x-fs-node", node.id);
                event.dataTransfer.effectAllowed = "move";
              }}
              {...(node.type === "folder" ? dropProps(node.id) : {})}
              className="group flex items-center gap-2.5 rounded-lg px-3 py-1.5 hover:bg-white/10"
            >
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                onDoubleClick={() => {
                  sfx.open();
                  if (node.type === "folder") onNavigate(node.id);
                  else onOpenFile?.(node.id);
                }}
              >
                {node.type === "folder" ? (
                  <FolderGlyph className="h-7 w-9 shrink-0" />
                ) : (
                  <TextFileGlyph className="h-7 w-6 shrink-0" />
                )}
                {renaming === node.id ? (
                  <input
                    ref={renameRef}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") commitRename();
                      if (event.key === "Escape") setRenaming(null);
                    }}
                    className="w-full rounded border border-[#5aa7f2] bg-black/40 px-1.5 py-0.5 text-[13px] text-white outline-none"
                    aria-label={`Rename ${node.name}`}
                  />
                ) : (
                  <span className="truncate text-[13px] text-white/85">{node.name}</span>
                )}
              </button>
              <span className="hidden shrink-0 gap-0.5 group-hover:flex">
                <button
                  type="button"
                  aria-label={`Rename ${node.name}`}
                  className="rounded p-1 text-white/50 hover:bg-white/15 hover:text-white"
                  onClick={() => {
                    setRenaming(node.id);
                    setDraft(node.name);
                  }}
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${node.name}`}
                  className="rounded p-1 text-white/50 hover:bg-[#c0392b] hover:text-white"
                  onClick={() => onTrashNode?.(node.id)}
                >
                  <Trash2 size={13} />
                </button>
              </span>
              <span className="text-[11px] text-white/30">
                {node.type === "folder" ? `${fs.childrenOf(node.id).length} items` : "text"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface FinderAppProps {
  /** Section this window starts on. Each Finder window keeps its own navigation state. */
  initialSection?: FinderSection;
  /** When set, this window starts browsing the virtual file system at this folder. */
  fsFolderId?: string | null;
  onOpenFile?: (fileId: string) => void;
  onTrashNode?: (nodeId: string) => void;
}

export function FinderApp({
  initialSection = "projects",
  fsFolderId,
  onOpenFile,
  onTrashNode,
}: FinderAppProps) {
  useFs();
  const [view, setView] = useState<FinderSection | "fs">(
    fsFolderId !== undefined ? "fs" : initialSection,
  );
  const [folderId, setFolderId] = useState<string | null>(fsFolderId ?? null);
  const section = view === "fs" ? null : view;
  const title = view === "fs" ? (folderId ? (fs.get(folderId)?.name ?? "Desktop") : "Desktop") : view;

  const openFs = (target: string | null) => {
    setView("fs");
    setFolderId(target);
  };

  return (
    <div className="flex h-full">
      <aside className="hidden w-44 shrink-0 flex-col gap-0.5 border-r border-white/10 bg-white/5 p-2 sm:flex">
        <p className="px-2 pb-1 pt-2 text-[11px] font-semibold text-white/40">Favorites</p>
        <button
          type="button"
          className={`flex items-center gap-2 rounded-md px-2 py-1 text-left text-[13px] ${
            view === "fs" ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"
          }`}
          onClick={() => openFs(null)}
        >
          <Monitor size={14} className="text-[#5aa7f2]" />
          Desktop
        </button>
        {SIDEBAR.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`flex items-center gap-2 rounded-md px-2 py-1 text-left text-[13px] ${
              section === id ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"
            }`}
            onClick={() => setView(id)}
          >
            <Icon size={14} className="text-[#5aa7f2]" />
            {label}
          </button>
        ))}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2">
          <ChevronLeft size={16} className="text-white/35" />
          <ChevronRight size={16} className="text-white/25" />
          <span className="text-[13px] font-semibold capitalize text-white/85">{title}</span>
          <div className="ml-auto flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-1 text-xs text-white/40">
            <Search size={12} />
            Search
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto sm:hidden">
          <div className="flex gap-1 border-b border-white/10 p-2">
            <button
              type="button"
              className={`rounded-full px-3 py-1 text-xs ${
                view === "fs" ? "bg-white/20 text-white" : "text-white/60"
              }`}
              onClick={() => openFs(null)}
            >
              Desktop
            </button>
            {SIDEBAR.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`rounded-full px-3 py-1 text-xs ${
                  section === id ? "bg-white/20 text-white" : "text-white/60"
                }`}
                onClick={() => setView(id)}
              >
                {label}
              </button>
            ))}
          </div>
          {view === "fs" && (
            <FsPane folderId={folderId} onNavigate={setFolderId} onOpenFile={onOpenFile} onTrashNode={onTrashNode} />
          )}
          {section === "projects" && <ProjectsPane />}
          {section === "experience" && <ExperiencePane />}
          {section === "skills" && <SkillsPane />}
          {section === "education" && <EducationPane />}
        </div>

        <div className="hidden min-h-0 flex-1 sm:block">
          {view === "fs" ? (
            <FsPane folderId={folderId} onNavigate={setFolderId} onOpenFile={onOpenFile} onTrashNode={onTrashNode} />
          ) : (
            <div className="h-full overflow-y-auto">
              {section === "projects" && <ProjectsPane />}
              {section === "experience" && <ExperiencePane />}
              {section === "skills" && <SkillsPane />}
              {section === "education" && <EducationPane />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
