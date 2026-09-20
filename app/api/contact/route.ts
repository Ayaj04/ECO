import { NextResponse } from "next/server";
import { validateContact, type ContactValues } from "@/lib/contact";

/**
 * Receives the contact form and passes it on to whatever service should deliver it.
 *
 * Set CONTACT_WEBHOOK_URL to that service's address, for example a Formspree form URL or a
 * Zapier or Make webhook. Each message is sent to it as JSON: name, email, phone, message, sentAt.
 * Without it, messages are only printed to the server log while developing, and a live site
 * answers with an error, so nothing is ever reported as sent when it was not.
 */

const MAX_BODY_BYTES = 10_000;
const DELIVERY_TIMEOUT_MS = 10_000;

const reply = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status });

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return reply({ error: "unsupported" }, 415);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return reply({ error: "too_large" }, 413);

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return reply({ error: "invalid" }, 400);
  }

  // A hidden field that people never see and never fill in. Bots do. Say it worked so they do not retry.
  if (typeof body.website === "string" && body.website.trim() !== "") return reply({ ok: true });

  const text = (key: string) => (typeof body[key] === "string" ? (body[key] as string) : "");
  const values: ContactValues = { name: text("name"), email: text("email"), phone: text("phone"), message: text("message") };

  const errors = validateContact(values);
  if (Object.keys(errors).length > 0) return reply({ error: "invalid", errors }, 400);

  const enquiry = {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    message: values.message.trim(),
    sentAt: new Date().toISOString(),
  };

  const destination = process.env.CONTACT_WEBHOOK_URL;
  if (!destination) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact form] CONTACT_WEBHOOK_URL is not set, so this message was not delivered:", enquiry);
      return reply({ ok: true, delivered: false });
    }
    console.error("[contact form] CONTACT_WEBHOOK_URL is not set. A message could not be delivered.");
    return reply({ error: "not_configured" }, 503);
  }

  try {
    const response = await fetch(destination, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(enquiry),
      signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`The delivery service answered ${response.status}`);
  } catch (error) {
    console.error("[contact form] Delivery failed:", error);
    return reply({ error: "delivery_failed" }, 502);
  }

  return reply({ ok: true });
}
