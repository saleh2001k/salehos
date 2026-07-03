import { useEffect, useRef, useState, type ReactNode } from "react";
import { site, skillGroups, projects } from "../../data/content";
import { fs } from "../lib/fs";
import { sfx } from "../lib/sfx";

export interface TerminalActions {
  openApp: (app: "finder" | "safari" | "games" | "preview" | "about" | "contact") => void;
  close: () => void;
}

interface Line {
  id: number;
  content: ReactNode;
}

const NEOFETCH = String.raw`
            .:'        saleh@macbook
        __ :'__        ------------------
     .'~  ~\`·__.      OS: salehOS 26.0 "Amman"
    /        ,~\`\     Host: Portfolio (Web Edition)
   |          ;:|     Kernel: react 19.2 / motion 12
   |          ;:|     Shell: caveman-zsh
    \         ;:/     Uptime: shipping since 2022
     '·.,_,.·'        Resolution: every merge conflict
`;

const COFFEE = String.raw`
      ( (
       ) )
    ........
    |      |]
    \      /    coffee break approved.
     '----'
`;

let lineId = 0;

/** Commands for Tab completion; trailing space = takes an argument. */
const COMMANDS = [
  "help",
  "whoami",
  "about",
  "ls",
  "pwd",
  "cd ",
  "cat ",
  "mkdir ",
  "touch ",
  "rm ",
  "cp ",
  "mv ",
  "open ",
  "echo ",
  "man ",
  "which ",
  "history",
  "clear",
  "date",
  "uname",
  "uptime",
  "hostname",
  "env",
  "whoami",
  "neofetch",
  "exit",
  "sudo ",
  "coffee",
  "doom",
  "matrix",
  "hack",
  "hire",
  "vim",
];

const OPEN_TARGETS = ["finder", "safari", "arcade", "cv", "contact", "about"];
const CAT_TARGETS = ["contact.txt", "skills.txt", "projects.txt", "About.txt"];

/** Short manual pages, BSD-style, for `man <cmd>`. */
const MAN_PAGES: Record<string, { name: string; desc: string; usage: string }> = {
  ls: { name: "ls", desc: "list directory contents", usage: "ls" },
  cd: { name: "cd", desc: "change the working directory", usage: "cd [dir | .. | ~]" },
  pwd: { name: "pwd", desc: "print the full path of the working directory", usage: "pwd" },
  cat: { name: "cat", desc: "concatenate and print files", usage: "cat <file>" },
  mkdir: { name: "mkdir", desc: "make a directory on the desktop tree", usage: "mkdir <name>" },
  touch: { name: "touch", desc: "create an empty text file", usage: "touch <name>" },
  rm: { name: "rm", desc: "remove a file or folder", usage: "rm [-rf] <name>" },
  cp: { name: "cp", desc: "copy a file or folder", usage: "cp <src> <dest>" },
  mv: { name: "mv", desc: "move or rename a file or folder", usage: "mv <src> <dest>" },
  open: { name: "open", desc: "open an application", usage: "open <finder|safari|arcade|cv|contact|about>" },
  echo: { name: "echo", desc: "write arguments to the standard output", usage: "echo <text>" },
  man: { name: "man", desc: "display the manual page for a command", usage: "man <command>" },
  which: { name: "which", desc: "locate a command", usage: "which <command>" },
  date: { name: "date", desc: "display the current date and time", usage: "date" },
  clear: { name: "clear", desc: "clear the terminal screen", usage: "clear" },
  history: { name: "history", desc: "show the command history", usage: "history" },
  uname: { name: "uname", desc: "print system information", usage: "uname [-a]" },
  uptime: { name: "uptime", desc: "show how long the system has been running", usage: "uptime" },
  hostname: { name: "hostname", desc: "print the name of the current host", usage: "hostname" },
  env: { name: "env", desc: "print the environment", usage: "env" },
  whoami: { name: "whoami", desc: "print the effective user name", usage: "whoami" },
  neofetch: { name: "neofetch", desc: "show system info, with flair", usage: "neofetch" },
  exit: { name: "exit", desc: "close the terminal window", usage: "exit" },
};

/** Unique command names for completion (deduped, sorted). */
const COMMAND_NAMES = [...new Set(COMMANDS.map((command) => command.trim()))].sort();

function longestCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return "";
  let prefix = strings[0]!;
  for (const entry of strings.slice(1)) {
    let index = 0;
    while (
      index < prefix.length &&
      index < entry.length &&
      prefix[index]!.toLowerCase() === entry[index]!.toLowerCase()
    ) {
      index++;
    }
    prefix = prefix.slice(0, index);
    if (!prefix) return "";
  }
  return prefix;
}

function commandNeedsArg(name: string): boolean {
  return COMMANDS.some((command) => command.trim() === name && command.endsWith(" "));
}

function fileCompletions(
  cwdId: string | null,
  partial: string,
  { foldersOnly = false }: { foldersOnly?: boolean } = {},
): string[] {
  const seeded =
    cwdId === null ? ["Projects", "Experience", "Skills", "CV.pdf", "About.txt"] : [];
  const fsFolders = fs.childrenOf(cwdId).filter((node) => node.type === "folder").map((node) => node.name);
  const fsFiles = fs.childrenOf(cwdId).map((node) => node.name);
  let pool: string[];
  if (foldersOnly) {
    pool = ["..", "~", ...seeded.filter((name) => !name.includes(".")), ...fsFolders];
  } else {
    pool = [...seeded, ...fsFiles];
  }
  const needle = partial.toLowerCase();
  return pool.filter((name) => name.toLowerCase().startsWith(needle));
}

/** Return matching completions and the best next input value after Tab. */
function getTabCompletions(
  value: string,
  cwdId: string | null,
): { next: string; options: string[] } {
  const hasTrailingSpace = value.endsWith(" ");
  const parts = value.trimEnd().split(/\s+/);
  const cmd = parts[0]?.toLowerCase() ?? "";

  // Completing a command name.
  if (parts.length === 0 || (parts.length === 1 && !hasTrailingSpace)) {
    const partial = (parts[0] ?? "").toLowerCase();
    const options = COMMAND_NAMES.filter((name) => name.startsWith(partial));
    if (options.length === 1) {
      const name = options[0]!;
      const next = commandNeedsArg(name) ? `${name} ` : name;
      return { next, options };
    }
    if (options.length > 1) {
      const common = longestCommonPrefix(options);
      const next = common.length > partial.length ? common : value;
      return { next, options };
    }
    return { next: value, options: [] };
  }

  // Completing arguments — figure out which token and pool apply.
  const argIndex = hasTrailingSpace ? parts.length : parts.length - 1;
  const partial = hasTrailingSpace ? "" : (parts[parts.length - 1] ?? "");
  const prefix = parts.slice(0, argIndex).join(" ");

  let options: string[] = [];
  switch (cmd) {
    case "open":
      options = OPEN_TARGETS.filter((target) => target.toLowerCase().startsWith(partial.toLowerCase()));
      break;
    case "cat":
      options = [
        ...new Set([
          ...CAT_TARGETS,
          ...fs.childrenOf(cwdId).filter((node) => node.type === "text").map((node) => node.name),
        ]),
      ].filter((target) => target.toLowerCase().startsWith(partial.toLowerCase()));
      break;
    case "man":
    case "which":
      options = COMMAND_NAMES.filter((name) => name.startsWith(partial.toLowerCase()));
      break;
    case "cd":
      options = fileCompletions(cwdId, partial, { foldersOnly: true });
      break;
    case "mkdir":
    case "touch":
    case "rm":
    case "cp":
    case "mv":
      options = fileCompletions(cwdId, partial);
      break;
    default:
      return { next: value, options: [] };
  }

  if (options.length === 1) {
    return { next: `${prefix} ${options[0]}`.trimStart(), options };
  }
  if (options.length > 1) {
    const common = longestCommonPrefix(options);
    const next =
      common.length > partial.length ? `${prefix} ${common}`.trimStart() : value;
    return { next, options };
  }
  return { next: value, options: [] };
}

function formatCompletionLine(options: string[]): string {
  if (options.length === 0) return "";
  const maxLen = Math.max(...options.map((option) => option.length));
  const colWidth = Math.min(maxLen + 2, 24);
  const cols = Math.max(1, Math.floor(72 / colWidth));
  const rows = Math.ceil(options.length / cols);
  const lines: string[] = [];
  for (let row = 0; row < rows; row++) {
    const cells: string[] = [];
    for (let col = 0; col < cols; col++) {
      const option = options[col * rows + row];
      if (option) cells.push(option.padEnd(colWidth));
    }
    lines.push(cells.join("").trimEnd());
  }
  return lines.join("\n");
}

/** One-tap commands — handy on touch, harmless on desktop. */
const QUICK_COMMANDS = [
  "help",
  "neofetch",
  "ls",
  "pwd",
  "cat contact.txt",
  "cat skills.txt",
  "man ls",
  "open arcade",
  "coffee",
  "doom",
  "sudo hire",
];

export function TerminalApp({ actions }: { actions: TerminalActions }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyAt, setHistoryAt] = useState(-1);
  // Working directory within the desktop tree. id === null is home (~).
  const [cwd, setCwd] = useState<{ id: string | null; path: string }>({ id: null, path: "~" });
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const print = (content: ReactNode) =>
    setLines((current) => [...current, { id: ++lineId, content }]);

  // Boot sequence: introduce Saleh, then hand over the prompt.
  useEffect(() => {
    const intro: [number, ReactNode][] = [
      [80, <span className="text-white/45">Last login: {new Date().toDateString()} on ttys001</span>],
      [420, <span className="text-white/55">starting saleh-shell v26…</span>],
      [
        800,
        <span>
          <span className="font-semibold text-[#e8aa42]">{site.name}</span>
          <span className="text-white/60"> — {site.role}</span>
        </span>,
      ],
      [1100, <span className="text-white/70">{site.tagline}</span>],
      [
        1500,
        <span className="text-white/55">
          type <span className="text-[#e8aa42]">help</span> to see what this thing can do.
        </span>,
      ],
    ];
    const timers = intro.map(([delay, content]) => setTimeout(() => print(content), delay));
    timers.push(
      setTimeout(() => {
        setReady(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }, 1700),
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    print(
      <span>
        <span className="text-[#28c840]">saleh@macbook</span>
        <span className="text-white/50"> {cwd.path} % </span>
        <span className="text-white">{cmd}</span>
      </span>,
    );
    if (!cmd) return;

    const [name, ...args] = cmd.split(/\s+/);
    const arg = args.join(" ");

    switch (name!.toLowerCase()) {
      case "help":
        print(
          <span className="whitespace-pre-wrap text-white/80">
            {[
              "available commands:",
              "  whoami / about      who runs this machine",
              "  ls                  list files in the current directory",
              "  pwd                 print the working directory",
              "  cd <dir>            change directory ( cd .. / cd ~ )",
              "  cat <file>          read a file (contact.txt, skills.txt, projects.txt)",
              "  mkdir <name>        create a folder",
              "  touch <name>        create a text file",
              "  cp <src> <dest>     copy a file or folder",
              "  mv <src> <dest>     rename / move a file or folder",
              "  rm <name>           delete a file or folder",
              "  open <app>          finder | safari | arcade | cv | contact | about",
              "  echo <text>         say it back",
              "  man <cmd>           manual page for a command",
              "  which <cmd>         locate a command",
              "  history             list past commands",
              "  date                what time is it",
              "  uname / uptime      system info",
              "  hostname / env      host name / environment",
              "  neofetch            system info, sort of",
              "  clear               wipe the screen",
              "  exit                close this window",
              "",
              "rumors of hidden commands: sudo, coffee, doom, matrix, hack,",
              "rm -rf /, hire …probably not all real.",
            ].join("\n")}
          </span>,
        );
        break;

      case "whoami":
        print(<span className="text-[#e8aa42]">{site.name}</span>);
        print(<span className="text-white/80">{site.role}</span>);
        break;

      case "about":
        print(<span className="text-white/80">{site.tagline}</span>);
        break;

      case "ls": {
        // The seeded entries (Projects/, CV.pdf, …) only live at home.
        const seeded = cwd.id === null ? ["Projects/", "Experience/", "Skills/", "CV.pdf", "About.txt"] : [];
        const entries = [
          ...seeded,
          ...fs.childrenOf(cwd.id).map((node) => (node.type === "folder" ? `${node.name}/` : node.name)),
        ];
        if (entries.length === 0) print(<span className="text-white/50">(empty)</span>);
        else print(<span className="text-white/80">{entries.join("   ")}</span>);
        break;
      }

      case "pwd":
        print(<span className="text-white/80">{cwd.path.replace("~", "/Users/saleh")}</span>);
        break;

      case "cd": {
        const target = arg.trim();
        if (!target || target === "~" || target === "/") {
          setCwd({ id: null, path: "~" });
          break;
        }
        let curId = cwd.id;
        const segs = cwd.path === "~" ? [] : cwd.path.slice(2).split("/");
        let failed = "";
        for (const part of target.split("/").filter(Boolean)) {
          if (part === ".") continue;
          if (part === "..") {
            if (segs.length) {
              segs.pop();
              curId = curId ? (fs.get(curId)?.parentId ?? null) : null;
            }
            continue;
          }
          if (part === "~") {
            curId = null;
            segs.length = 0;
            continue;
          }
          const folder = fs.childrenOf(curId).find((node) => node.type === "folder" && node.name === part);
          if (!folder) {
            failed = part;
            break;
          }
          curId = folder.id;
          segs.push(folder.name);
        }
        if (failed) {
          print(<span className="text-[#ff6b64]">cd: no such directory: {failed}</span>);
        } else {
          setCwd({ id: curId, path: segs.length ? `~/${segs.join("/")}` : "~" });
        }
        break;
      }

      case "cat":
        if (arg === "contact.txt") {
          print(
            <span className="whitespace-pre text-white/80">
              {`email     ${site.email}\nphone     ${site.phone}\nlocation  ${site.location}\ngithub    ${site.github.replace("https://", "")}`}
            </span>,
          );
        } else if (arg === "skills.txt") {
          skillGroups.forEach((group) =>
            print(
              <span className="text-white/80">
                <span className="text-[#5aa7f2]">{group.label}:</span> {group.skills.join(", ")}
              </span>,
            ),
          );
        } else if (arg === "projects.txt") {
          projects.forEach((project) =>
            print(
              <span className="text-white/80">
                <span className="text-[#e8aa42]">{project.title}</span> — {project.tag}
              </span>,
            ),
          );
        } else if (arg === "About.txt" || arg === "about.txt") {
          print(<span className="text-white/80">{site.tagline}</span>);
        } else {
          const file = fs.childrenOf(cwd.id).find((node) => node.name === arg && node.type === "text");
          if (file) {
            const text = file.content.replace(/<[^>]+>/g, "").trim();
            print(<span className="whitespace-pre-wrap text-white/80">{text || "(empty file)"}</span>);
          } else {
            print(<span className="text-[#ff6b64]">cat: {arg || "?"}: No such file (try contact.txt, skills.txt, projects.txt)</span>);
          }
        }
        break;

      case "mkdir":
        if (!arg) print(<span className="text-[#ff6b64]">usage: mkdir &lt;name&gt;</span>);
        else {
          fs.create("folder", cwd.id, fs.uniqueName(arg, cwd.id));
          sfx.click();
          print(<span className="text-white/60">created folder “{arg}”</span>);
        }
        break;

      case "touch":
        if (!arg) print(<span className="text-[#ff6b64]">usage: touch &lt;name&gt;</span>);
        else {
          fs.create("text", cwd.id, fs.uniqueName(arg, cwd.id));
          sfx.click();
          print(<span className="text-white/60">created “{arg}”</span>);
        }
        break;

      case "rm": {
        const targetName = args.filter((token) => !token.startsWith("-")).join(" ");
        if (args.includes("-rf") && (targetName === "/" || targetName === "/*" || targetName === "")) {
          sfx.gameOver();
          print(<span className="text-[#ff6b64]">deleting /System … deleting /Users … deleting /portfolio …</span>);
          setTimeout(
            () =>
              print(
                <span className="text-white/80">
                  just kidding. this Mac is made of React components, you can’t hurt it.
                </span>,
              ),
            800,
          );
          break;
        }
        const victim = fs.childrenOf(cwd.id).find((node) => node.name === targetName);
        if (!victim) print(<span className="text-[#ff6b64]">rm: {targetName || "?"}: No such file or directory</span>);
        else {
          fs.remove(victim.id);
          sfx.trash();
          print(<span className="text-white/60">moved “{victim.name}” to trash</span>);
        }
        break;
      }

      case "cp":
      case "mv": {
        const [src, dest] = args.filter((token) => !token.startsWith("-"));
        if (!src || !dest) {
          print(<span className="text-[#ff6b64]">usage: {name} &lt;src&gt; &lt;dest&gt;</span>);
          break;
        }
        const node = fs.childrenOf(cwd.id).find((entry) => entry.name === src);
        if (!node) {
          print(<span className="text-[#ff6b64]">{name}: {src}: No such file or directory</span>);
          break;
        }
        if (name!.toLowerCase() === "mv") {
          fs.rename(node.id, fs.uniqueName(dest, cwd.id));
          print(<span className="text-white/60">renamed “{src}” → “{dest}”</span>);
        } else {
          const copy = fs.create(node.type, cwd.id, fs.uniqueName(dest, cwd.id));
          if (node.type === "text") fs.setContent(copy.id, node.content);
          print(<span className="text-white/60">copied “{src}” → “{dest}”</span>);
        }
        sfx.click();
        break;
      }

      case "open": {
        const map: Record<string, Parameters<TerminalActions["openApp"]>[0]> = {
          finder: "finder",
          safari: "safari",
          arcade: "games",
          games: "games",
          cv: "preview",
          preview: "preview",
          about: "about",
          contact: "contact",
        };
        const app = map[arg.toLowerCase()];
        if (app) {
          actions.openApp(app);
          print(<span className="text-white/60">opening {arg}…</span>);
        } else {
          print(<span className="text-[#ff6b64]">open: unknown app “{arg}”. try finder, safari, arcade, cv, contact</span>);
        }
        break;
      }

      case "echo":
        print(<span className="text-white/80">{arg}</span>);
        break;

      case "date":
        print(<span className="text-white/80">{new Date().toString()}</span>);
        break;

      case "man": {
        const page = MAN_PAGES[arg.toLowerCase()];
        if (!arg) print(<span className="text-[#ff6b64]">What manual page do you want? (try: man ls)</span>);
        else if (!page) print(<span className="text-[#ff6b64]">No manual entry for {arg}</span>);
        else
          print(
            <span className="whitespace-pre-wrap text-white/80">
              {[
                `NAME`,
                `    ${page.name} — ${page.desc}`,
                ``,
                `SYNOPSIS`,
                `    ${page.usage}`,
                ``,
                `salehOS · type "help" for the full command list.`,
              ].join("\n")}
            </span>,
          );
        break;
      }

      case "which": {
        const target = arg.trim().toLowerCase();
        if (!target) print(<span className="text-[#ff6b64]">usage: which &lt;command&gt;</span>);
        else if (COMMANDS.some((command) => command.trim() === target))
          print(<span className="text-white/80">/usr/bin/{target}</span>);
        else print(<span className="text-[#ff6b64]">which: {target}: not found</span>);
        break;
      }

      case "history":
        if (history.length === 0) print(<span className="text-white/50">(no history yet)</span>);
        else
          print(
            <span className="whitespace-pre-wrap text-white/80">
              {history
                .slice()
                .reverse()
                .map((entry, index) => `${String(index + 1).padStart(4)}  ${entry}`)
                .join("\n")}
            </span>,
          );
        break;

      case "uname": {
        const full = args.includes("-a");
        print(
          <span className="text-white/80">
            {full
              ? "salehOS 26.0 Amman Darwin Kernel react-19.2 x86_64"
              : "salehOS"}
          </span>,
        );
        break;
      }

      case "uptime":
        print(
          <span className="text-white/80">
            up since 2022, 0 crashes, load average: 0.42, 0.21, 0.07 — shipping steadily.
          </span>,
        );
        break;

      case "hostname":
        print(<span className="text-white/80">macbook.local</span>);
        break;

      case "env":
        print(
          <span className="whitespace-pre-wrap text-white/80">
            {[
              "USER=saleh",
              "HOME=/Users/saleh",
              "SHELL=/bin/caveman-zsh",
              "PWD=" + cwd.path.replace("~", "/Users/saleh"),
              "TERM=xterm-256color",
              "EDITOR=vim",
              "LANG=en_JO.UTF-8",
            ].join("\n")}
          </span>,
        );
        break;

      case "neofetch":
        print(<span className="whitespace-pre text-[#5aa7f2]">{NEOFETCH}</span>);
        break;

      case "clear":
        setLines([]);
        break;

      case "exit":
        actions.close();
        break;

      // ----- easter eggs -----
      case "sudo":
        print(
          <span className="text-[#ff6b64]">
            saleh is not in the sudoers file. This incident will be reported to saleh.
          </span>,
        );
        break;

      case "coffee":
        print(<span className="whitespace-pre text-[#e8aa42]">{COFFEE}</span>);
        break;

      case "doom":
        actions.openApp("games");
        print(<span className="text-[#ff6b64]">rip and tear — check the Arcade window.</span>);
        break;

      case "matrix":
        print(<span className="text-[#28c840]">wake up, neo… the portfolio has you. follow the white cursor.</span>);
        break;

      case "hack":
        print(<span className="text-[#28c840]">accessing mainframe… bypassing firewall… enhancing… enhancing…</span>);
        setTimeout(
          () => print(<span className="text-[#28c840]">access granted. you found the secret: saleh replies to emails fast.</span>),
          900,
        );
        break;

      case "hire":
        print(
          <span className="text-white/85">
            excellent choice. opening contact form…
          </span>,
        );
        actions.openApp("contact");
        break;

      case "vim":
        print(<span className="text-white/80">you’ve been in vim for 0 seconds. estimated time to exit: 4 years.</span>);
        break;

      default:
        print(
          <span className="text-[#ff6b64]">
            zsh: command not found: {name}. try <span className="text-[#e8aa42]">help</span>
          </span>,
        );
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const { next, options } = getTabCompletions(input, cwd.id);
      const unchanged = next === input;
      // Multiple matches: list them. Single match already filled in: list on a second Tab.
      if (options.length > 1 || (options.length === 1 && unchanged)) {
        print(
          <span className="whitespace-pre-wrap text-white/55">{formatCompletionLine(options)}</span>,
        );
      }
      if (!unchanged) setInput(next);
      return;
    }
    if (event.key === "Enter") {
      run(input);
      if (input.trim()) {
        setHistory((current) => [input, ...current]);
      }
      setInput("");
      setHistoryAt(-1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.min(historyAt + 1, history.length - 1);
      if (history[next] !== undefined) {
        setHistoryAt(next);
        setInput(history[next]);
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = historyAt - 1;
      setHistoryAt(next);
      setInput(next >= 0 ? (history[next] ?? "") : "");
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className="force-dark flex h-full cursor-text flex-col bg-[#16161c]/95 p-4 font-mono text-[13px] leading-relaxed text-white/90"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        {lines.map((line) => (
          <p key={line.id}>{line.content}</p>
        ))}
        {ready ? (
          <div className="flex items-center">
            <span className="text-[#28c840]">saleh@macbook</span>
            <span className="text-white/50">&nbsp;{cwd.path} %&nbsp;</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              className="min-w-0 flex-1 bg-transparent text-white caret-[#28c840] outline-none"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              aria-label="Terminal input"
            />
          </div>
        ) : (
          <span className="mt-1 inline-block h-4 w-2 animate-pulse bg-white/60" aria-hidden="true" />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Tap-to-run commands */}
      {ready && (
        <div className="-mx-1 mt-2 flex shrink-0 gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]">
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              className="shrink-0 rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[11px] text-white/70 active:bg-white/20"
              onClick={(event) => {
                event.stopPropagation();
                run(cmd);
                setHistory((current) => [cmd, ...current]);
              }}
            >
              {cmd}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
