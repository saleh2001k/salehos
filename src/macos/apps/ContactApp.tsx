import { Check, Github, Linkedin, Loader2, Mail, Phone, Send } from "lucide-react";
import { useState } from "react";
import { site } from "../../data/content";
import { XIcon } from "../components/AppIcons";
import { sfx } from "../lib/sfx";

type SendState = "idle" | "sending" | "sent" | "error";

export function ContactApp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<SendState>("idle");

  // Netlify Forms: POST url-encoded fields to "/" with the form-name that the
  // hidden static form in index.html registers at deploy time.
  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (state === "sending") return;
    sfx.click();
    setState("sending");
    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "contact",
          name,
          email,
          message,
        }).toString(),
      });
      if (!response.ok) throw new Error(`status ${response.status}`);
      sfx.win();
      setState("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      sfx.miss();
      setState("error");
    }
  };

  const field =
    "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-[#5aa7f2]/70";

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-5 sm:flex-row">
      <div className="sm:w-56 sm:shrink-0">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e8aa42_0%,#a8690f_100%)] font-display text-xl font-semibold text-[#101013]">
          SA
        </div>
        <h2 className="mt-3 font-display text-lg font-semibold text-white">{site.name}</h2>
        <p className="text-xs text-white/50">{site.role}</p>

        <div className="mt-4 space-y-2 text-[13px]">
          <a href={`mailto:${site.email}`} className="flex items-center gap-2 text-white/75 hover:text-white">
            <Mail size={14} className="text-[#5aa7f2]" />
            {site.email}
          </a>
          <a href={`tel:${site.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 text-white/75 hover:text-white">
            <Phone size={14} className="text-[#34d058]" />
            {site.phone}
          </a>
          <a href={site.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/75 hover:text-white">
            <Github size={14} className="text-white/60" />
            {site.github.replace("https://", "")}
          </a>
          <a href={site.x} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/75 hover:text-white">
            <span className="h-3.5 w-3.5 [&>*]:h-full [&>*]:w-full">
              <XIcon />
            </span>
            @saleh_almashne
          </a>
          <a href={site.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white/75 hover:text-white">
            <Linkedin size={14} className="text-[#5aa7f2]" />
            LinkedIn
          </a>
        </div>
      </div>

      <form onSubmit={send} className="flex min-w-0 flex-1 flex-col gap-3">
        <p className="text-[13px] leading-relaxed text-white/60">
          Drop a message — it lands straight in Saleh’s inbox.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            name="name"
            required
            className={field}
            aria-label="Your name"
          />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email"
            name="email"
            type="email"
            required
            className={field}
            aria-label="Your email"
          />
        </div>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="What are we building?"
          name="message"
          required
          rows={6}
          className={`${field} min-h-28 flex-1 resize-none`}
          aria-label="Message"
        />

        {state === "sent" ? (
          <p className="flex items-center gap-2 text-sm font-medium text-[#34d058]">
            <Check size={15} />
            Sent — Saleh will get back to you soon.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={state === "sending"}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-[#2a7de1] px-5 py-2 text-sm font-medium text-[#fff] hover:bg-[#3b8af0] disabled:opacity-60"
            >
              {state === "sending" ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {state === "sending" ? "Sending…" : "Send Message"}
            </button>
            {state === "error" && (
              <span className="text-xs text-[#ff6b64]">
                Could not send (forms work on the live site) —{" "}
                <a href={`mailto:${site.email}`} className="underline">
                  email instead
                </a>
              </span>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
