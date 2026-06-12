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
  "cat ",
  "mkdir ",
  "touch ",
  "rm ",
  "open ",
  "echo ",
  "date",
  "neofetch",
  "clear",
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

function completeInput(value: string): string {
  const parts = value.split(/\s+/);
  if (parts.length <= 1) {
    const match = COMMANDS.find((cmd) => cmd.startsWith(value.toLowerCase()) && cmd !== value);
    return match ?? value;
  }
  const [cmd, partial = ""] = [parts[0]!.toLowerCase(), parts[1]];
  const pool = cmd === "open" ? OPEN_TARGETS : cmd === "cat" ? CAT_TARGETS : null;
  if (!pool) return value;
  const match = pool.find((target) => target.toLowerCase().startsWith(partial.toLowerCase()));
  return match ? `${parts[0]} ${match}` : value;
}

/** One-tap commands — handy on touch, harmless on desktop. */
const QUICK_COMMANDS = [
  "help",
  "neofetch",
  "ls",
  "cat contact.txt",
  "cat skills.txt",
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
        <span className="text-white/50"> ~ % </span>
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
              "  ls                  list desktop files",
              "  cat <file>          read contact.txt, skills.txt, projects.txt",
              "  mkdir <name>        create a folder on the desktop",
              "  touch <name>        create a text file on the desktop",
              "  rm <name>           delete a desktop item",
              "  open <app>          finder | safari | arcade | cv | contact | about",
              "  echo <text>         say it back",
              "  date                what year is it",
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
        const entries = [
          ...["Projects/", "Experience/", "Skills/", "CV.pdf", "About.txt"],
          ...fs.childrenOf(null).map((node) => (node.type === "folder" ? `${node.name}/` : node.name)),
        ];
        print(<span className="text-white/80">{entries.join("   ")}</span>);
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
          print(<span className="text-[#ff6b64]">cat: {arg || "?"}: No such file (try contact.txt, skills.txt, projects.txt)</span>);
        }
        break;

      case "mkdir":
        if (!arg) print(<span className="text-[#ff6b64]">usage: mkdir &lt;name&gt;</span>);
        else {
          fs.create("folder", null, fs.uniqueName(arg, null));
          sfx.click();
          print(<span className="text-white/60">created folder “{arg}” on the desktop</span>);
        }
        break;

      case "touch":
        if (!arg) print(<span className="text-[#ff6b64]">usage: touch &lt;name&gt;</span>);
        else {
          fs.create("text", null, fs.uniqueName(arg, null));
          sfx.click();
          print(<span className="text-white/60">created “{arg}” on the desktop</span>);
        }
        break;

      case "rm": {
        if (args[0] === "-rf" && (args[1] === "/" || args[1] === "/*")) {
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
        const victim = fs.childrenOf(null).find((node) => node.name === arg);
        if (!victim) print(<span className="text-[#ff6b64]">rm: {arg || "?"}: No such desktop item</span>);
        else {
          fs.remove(victim.id);
          sfx.trash();
          print(<span className="text-white/60">moved “{victim.name}” to trash</span>);
        }
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
      setInput((value) => completeInput(value));
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
      className="force-dark flex h-full cursor-text flex-col p-4 font-mono text-[13px] leading-relaxed"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        {lines.map((line) => (
          <p key={line.id}>{line.content}</p>
        ))}
        {ready ? (
          <div className="flex items-center">
            <span className="text-[#28c840]">saleh@macbook</span>
            <span className="text-white/50">&nbsp;~ %&nbsp;</span>
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
