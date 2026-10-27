import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, LoaderCircle, RotateCcw } from "lucide-react";
import { site } from "../data/content";
import { EASE } from "./motion";

const topics = ["Full-time role", "Freelance project", "Open source", "Just saying hi"] as const;

type Status = "idle" | "sending" | "sent" | "error";

function encode(data: Record<string, string>) {
  return new URLSearchParams(data).toString();
}

/** Posts to Netlify Forms (the hidden "contact" form in index.html). */
export default function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [topic, setTopic] = useState<string>(topics[0]);
  const [status, setStatus] = useState<Status>("idle");
  const [touched, setTouched] = useState(false);

  const errors = {
    name: values.name.trim().length < 2 ? "Tell me your name." : "",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email) ? "" : "An email I can reply to.",
    message: values.message.trim().length < 10 ? "A sentence or two, please." : "",
  };
  const valid = !errors.name && !errors.email && !errors.message;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({ "form-name": "contact", topic, ...values }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(`${topic} — from ${values.name || "your site"}`)}&body=${encodeURIComponent(values.message)}`;

  return (
    <div className="contact-form-wrap">
      <AnimatePresence mode="popLayout" initial={false}>
        {status === "sent" ? (
          <motion.div
            key="sent"
            className="form-done"
            initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <motion.span
              className="done-mark"
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 }}
            >
              <Check size={26} />
            </motion.span>
            <h3>Message sent.</h3>
            <p>Thanks, {values.name.split(" ")[0]}. I’ll reply to {values.email} within a day.</p>
            <button
              type="button"
              className="pill-btn invert-ghost"
              onClick={() => {
                setValues({ name: "", email: "", message: "" });
                setTouched(false);
                setStatus("idle");
              }}
            >
              <RotateCcw size={14} /> Send another
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            className="contact-form"
            name="contact"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            noValidate
            onSubmit={submit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <input type="hidden" name="form-name" value="contact" />
            <p hidden>
              <label>
                Leave this empty <input name="bot-field" />
              </label>
            </p>
            <fieldset className="topic-field">
              <legend>What’s it about?</legend>
              <div className="topic-chips">
                {topics.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={topic === t}
                    onClick={() => setTopic(t)}
                  >
                    {topic === t && (
                      <motion.span
                        layoutId="topic-pill"
                        className="topic-pill"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="field-row">
              <Field
                label="Your name"
                name="name"
                autoComplete="name"
                value={values.name}
                error={touched ? errors.name : ""}
                onChange={(v) => setValues({ ...values, name: v })}
              />
              <Field
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email}
                error={touched ? errors.email : ""}
                onChange={(v) => setValues({ ...values, email: v })}
              />
            </div>
            <Field
              label="Tell me about it"
              name="message"
              multiline
              value={values.message}
              error={touched ? errors.message : ""}
              onChange={(v) => setValues({ ...values, message: v })}
            />
            <AnimatePresence>
              {status === "error" && (
                <motion.p
                  className="form-error"
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  That didn’t go through. <a href={mailto}>Send it by email instead</a>.
                </motion.p>
              )}
            </AnimatePresence>
            <motion.button
              type="submit"
              className="submit-btn"
              layout
              disabled={status === "sending"}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={status}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -18, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {status === "sending" ? (
                    <>
                      <LoaderCircle size={16} className="spin" /> Sending
                    </>
                  ) : (
                    <>
                      Send message <ArrowRight size={16} />
                    </>
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  multiline,
  autoComplete,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  error: string;
  type?: string;
  multiline?: boolean;
  autoComplete?: string;
}) {
  const id = `f-${name}`;
  const props = {
    id,
    name,
    value,
    placeholder: " ",
    autoComplete,
    "aria-invalid": Boolean(error) || undefined,
    "aria-describedby": error ? `${id}-err` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
  };
  return (
    <div className={`float-field ${error ? "has-error" : ""}`}>
      {multiline ? <textarea rows={4} {...props} /> : <input type={type} {...props} />}
      <label htmlFor={id}>{label}</label>
      <AnimatePresence>
        {error && (
          <motion.span
            id={`${id}-err`}
            className="field-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
