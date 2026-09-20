"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, CircleAlert, LoaderCircle, X } from "lucide-react";
import clsx from "clsx";
import {
  CONTACT_LIMITS,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactValues,
} from "@/lib/contact";

type Status = "idle" | "sending" | "sent" | "error";

const EMPTY: ContactValues = { name: "", email: "", phone: "", message: "" };
const FIELD_ORDER: ContactField[] = ["name", "email", "phone", "message"];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SEND_TIMEOUT_MS = 15_000;

const subscribeNothing = () => () => {};
/** False on the server and during hydration, true afterwards, so the portal never causes a mismatch. */
const useMounted = () => useSyncExternalStore(subscribeNothing, () => true, () => false);

const labelClass =
  "mb-2 flex items-baseline justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500";
const controlClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-sans text-base text-ecovis-black outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-ecovis-red focus:ring-4 focus:ring-ecovis-red/10 aria-invalid:border-ecovis-red sm:text-[15px]";

interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
}

/** The phone from the call button, ringing, for the dark side of the dialog. */
function PhoneCoin() {
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex shrink-0 rounded-full p-1"
      style={{ background: "linear-gradient(135deg, #e10600 0%, #a80510 100%)" }}
    >
      <span className="call-ripple pointer-events-none absolute inset-0 rounded-full border-2 border-ecovis-red/60" />
      <span className="call-ripple pointer-events-none absolute inset-0 rounded-full border-2 border-ecovis-red/60 [animation-delay:1.3s]" />
      <span className="relative grid size-12 place-items-center rounded-full bg-white md:size-14">
        <span className="call-emoji text-[22px] leading-none md:text-[26px]">📞</span>
      </span>
    </span>
  );
}

export default function ContactDialog({ open, onClose }: ContactDialogProps) {
  const mounted = useMounted();
  const titleId = useId();
  const descriptionId = useId();
  const fieldId = useId();

  const panelRef = useRef<HTMLDivElement>(null);
  // The thank-you only appears once the form has faded out, so focus is set when its button arrives.
  const focusWhenShown = useCallback((el: HTMLButtonElement | null) => {
    el?.focus();
  }, []);
  const fieldRefs = useRef<Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [website, setWebsite] = useState("");

  const sending = status === "sending";

  // Closing is blocked while a message is on its way, so the result is never lost.
  const requestClose = () => {
    if (!sending) onClose();
  };
  const closeRef = useRef(requestClose);
  useEffect(() => {
    closeRef.current = requestClose;
  });

  // While open: freeze the page behind, make it unreachable, close on Escape, and hand focus back afterwards.
  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
    lenis?.stop();

    const behind = Array.from(document.body.children).filter(
      (el): el is HTMLElement =>
        el instanceof HTMLElement &&
        !el.hasAttribute("data-contact-root") &&
        !el.inert &&
        !["SCRIPT", "STYLE", "NEXTJS-PORTAL"].includes(el.tagName),
    );
    behind.forEach((el) => {
      el.inert = true;
    });

    // A phone keyboard would cover the form the moment it opened, so only focus a field with a mouse.
    const frame = requestAnimationFrame(() => {
      const target = window.matchMedia("(pointer: fine)").matches ? fieldRefs.current.name : panelRef.current;
      target?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      behind.forEach((el) => {
        el.inert = false;
      });
      lenis?.start();
      opener?.focus();
    };
  }, [open]);

  // Tab stays inside the dialog.
  const keepFocusInside = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    const current = document.activeElement;
    if (e.shiftKey && (current === first || current === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && current === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const setField = (field: ContactField, value: string) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: validateContact(next)[field] }));
    if (status === "error") setStatus("idle");
  };

  // Once someone leaves a field they have filled in, tell them if it is not right.
  const checkField = (field: ContactField) => {
    if (values[field].trim()) setErrors((prev) => ({ ...prev, [field]: validateContact(values)[field] }));
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;

    const found = validateContact(values);
    setErrors(found);
    const firstInvalid = FIELD_ORDER.find((field) => found[field]);
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          message: values.message.trim(),
          website,
        }),
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      });

      if (response.ok) {
        setStatus("sent");
        return;
      }
      if (response.status === 400) {
        const data = (await response.json().catch(() => null)) as { errors?: ContactErrors } | null;
        if (data?.errors) {
          setErrors(data.errors);
          setStatus("idle");
          return;
        }
      }
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  // After the dialog has faded out, a sent message clears the form. An unsent draft is kept.
  const afterExit = () => {
    if (status === "sent") {
      setValues(EMPTY);
      setErrors({});
      setWebsite("");
    }
    setStatus((current) => (current === "sending" ? current : "idle"));
  };

  const fields: Array<{
    field: ContactField;
    label: string;
    type: string;
    autoComplete: string;
    placeholder: string;
    inputMode?: "email" | "tel";
  }> = [
    { field: "name", label: "Your name", type: "text", autoComplete: "name", placeholder: "Full name" },
    { field: "email", label: "Your email", type: "email", autoComplete: "email", placeholder: "you@company.com", inputMode: "email" },
    { field: "phone", label: "Your phone no.", type: "tel", autoComplete: "tel", placeholder: "+91 98765 43210", inputMode: "tel" },
  ];

  const renderInput = ({ field, label, type, autoComplete, placeholder, inputMode }: (typeof fields)[number]) => {
    const id = `${fieldId}-${field}`;
    const error = errors[field];
    return (
      <div key={field}>
        <label htmlFor={id} className={labelClass}>
          <span>
            {label} <span className="text-ecovis-red">*</span>
          </span>
        </label>
        <input
          ref={(el) => {
            fieldRefs.current[field] = el;
          }}
          id={id}
          name={field}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={values[field]}
          maxLength={CONTACT_LIMITS[field]}
          required
          aria-required="true"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => setField(field, e.target.value)}
          onBlur={() => checkField(field)}
          className={controlClass}
        />
        {error && (
          <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-ecovis-red">
            {error}
          </p>
        )}
      </div>
    );
  };

  const [nameField, emailField, phoneField] = fields;
  const messageId = `${fieldId}-message`;

  if (!mounted) return null;

  return createPortal(
    <div data-contact-root="">
      <AnimatePresence onExitComplete={afterExit}>
        {open && (
          <motion.div
            key="contact-dialog"
            className="fixed inset-0 z-[45] flex items-end justify-center p-3 sm:items-center sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div aria-hidden="true" onClick={requestClose} className="absolute inset-0 bg-ecovis-black/65 backdrop-blur-sm" />

            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              tabIndex={-1}
              onKeyDown={keepFocusInside}
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative flex max-h-[92svh] w-full max-w-[880px] flex-col overflow-hidden rounded-3xl bg-white shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)] outline-none md:flex-row"
            >
              <button
                type="button"
                onClick={requestClose}
                aria-label="Close contact form"
                className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-white/10 text-white outline-none transition-colors duration-300 hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-ecovis-red/80 md:bg-gray-100 md:text-ecovis-black md:hover:bg-ecovis-red md:hover:text-white"
              >
                <X aria-hidden="true" className="size-5" />
              </button>

              {/* The dark side: the ringing phone and what this is for */}
              <aside
                className="relative shrink-0 overflow-hidden px-6 py-6 text-white md:flex md:w-[42%] md:flex-col md:justify-between md:px-9 md:py-10"
                style={{
                  background:
                    "radial-gradient(120% 80% at 0% 0%, rgba(225,6,0,0.32) 0%, rgba(225,6,0,0) 60%), #080808",
                }}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 400 400"
                  fill="none"
                  className="pointer-events-none absolute -bottom-28 -right-28 hidden w-[430px] md:block"
                >
                  <circle cx="200" cy="200" r="190" stroke="#fff" strokeOpacity="0.09" />
                  <circle cx="200" cy="200" r="140" stroke="#E10600" strokeOpacity="0.45" />
                  <circle cx="200" cy="200" r="90" stroke="#fff" strokeOpacity="0.09" />
                </svg>

                <div className="relative flex items-center gap-4 pr-12 md:block md:pr-0">
                  <PhoneCoin />
                  <div className="md:mt-8">
                    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-ecovis-red">Get in touch</p>
                    <h2
                      id={titleId}
                      className="mt-1.5 font-heading text-[28px] font-bold uppercase leading-[1.02] tracking-tight md:mt-3 md:text-[46px]"
                    >
                      Let&rsquo;s <span className="text-ecovis-red">talk.</span>
                    </h2>
                    <p id={descriptionId} className="mt-4 hidden max-w-[24ch] text-sm leading-relaxed text-gray-400 md:block">
                      Tell us what you need and our team will get back to you.
                    </p>
                  </div>
                </div>

                <div className="relative hidden flex-col leading-none md:flex" aria-hidden="true">
                  <span className="flex items-center font-heading text-2xl font-bold tracking-tighter">
                    ECOVIS
                    <span className="ml-1 h-1.5 w-1.5 rounded-sm bg-ecovis-red" />
                  </span>
                  <span className="mt-1 text-[10px] font-medium tracking-[0.2em] text-gray-500">RKCA</span>
                </div>
              </aside>

              {/* The form, or the thank-you once it is sent */}
              <div
                data-lenis-prevent=""
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 md:px-10 md:py-10"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {status === "sent" ? (
                    <motion.div
                      key="sent"
                      role="status"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex min-h-[320px] flex-col items-center justify-center text-center md:min-h-[400px]"
                    >
                      <span className="grid size-16 place-items-center rounded-full bg-ecovis-red text-white shadow-[0_16px_36px_-10px_rgba(225,6,0,0.7)]">
                        <Check aria-hidden="true" className="size-8" strokeWidth={3} />
                      </span>
                      <h3 className="mt-6 font-heading text-3xl font-bold uppercase tracking-tight text-ecovis-black">
                        Thank you.
                      </h3>
                      <p className="mt-3 max-w-[28ch] text-[15px] leading-relaxed text-gray-500">
                        Your message is on its way to our team. We&rsquo;ll get back to you soon.
                      </p>
                      <button
                        ref={focusWhenShown}
                        type="button"
                        onClick={onClose}
                        className="mt-8 rounded-sm bg-ecovis-black px-8 py-3.5 text-sm font-semibold uppercase tracking-widest text-ecovis-white outline-none transition-colors duration-300 hover:bg-ecovis-red focus-visible:ring-2 focus-visible:ring-ecovis-red/70 focus-visible:ring-offset-2"
                      >
                        Close
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      noValidate
                      onSubmit={submit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-5"
                    >
                      {renderInput(nameField)}

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {renderInput(emailField)}
                        {renderInput(phoneField)}
                      </div>

                      <div>
                        <label htmlFor={messageId} className={labelClass}>
                          <span>
                            Message <span className="text-ecovis-red">*</span>
                          </span>
                          <span className="font-medium normal-case tracking-normal text-gray-400" aria-hidden="true">
                            {values.message.length}/{CONTACT_LIMITS.message}
                          </span>
                        </label>
                        <textarea
                          ref={(el) => {
                            fieldRefs.current.message = el;
                          }}
                          id={messageId}
                          name="message"
                          rows={4}
                          placeholder="How can we help?"
                          value={values.message}
                          maxLength={CONTACT_LIMITS.message}
                          required
                          aria-required="true"
                          aria-invalid={errors.message ? true : undefined}
                          aria-describedby={errors.message ? `${messageId}-error` : undefined}
                          onChange={(e) => setField("message", e.target.value)}
                          onBlur={() => checkField("message")}
                          className={clsx(controlClass, "resize-none")}
                        />
                        {errors.message && (
                          <p id={`${messageId}-error`} className="mt-1.5 text-xs font-medium text-ecovis-red">
                            {errors.message}
                          </p>
                        )}
                      </div>

                      {/* Bots fill in every field they can find. People never see this one. */}
                      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                        <label>
                          Website
                          <input
                            type="text"
                            name="website"
                            tabIndex={-1}
                            autoComplete="off"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                          />
                        </label>
                      </div>

                      {status === "error" && (
                        <p
                          role="alert"
                          className="flex items-start gap-2.5 rounded-xl border border-ecovis-red/25 bg-ecovis-red/5 px-4 py-3 text-sm text-ecovis-red"
                        >
                          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                          <span>We couldn&rsquo;t send your message just now. Please try again in a moment.</span>
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={sending}
                        className="group mt-1 flex w-full items-center justify-center gap-3 rounded-sm bg-ecovis-black px-8 py-4 text-sm font-semibold uppercase tracking-widest text-ecovis-white outline-none transition-colors duration-300 hover:bg-ecovis-red focus-visible:ring-2 focus-visible:ring-ecovis-red/70 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-80"
                      >
                        {sending ? (
                          <>
                            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                            Sending
                          </>
                        ) : (
                          <>
                            Send message
                            <ArrowRight
                              aria-hidden="true"
                              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                            />
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
