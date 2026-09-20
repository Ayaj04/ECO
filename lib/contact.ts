export type ContactField = "name" | "email" | "phone" | "message";
export type ContactValues = Record<ContactField, string>;
export type ContactErrors = Partial<Record<ContactField, string>>;

export const CONTACT_LIMITS = { name: 100, email: 254, phone: 30, message: 2000 } as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARACTERS = /^[+()\-.\s\d]+$/;

/** Used by the form in the browser and again by the server, so both agree on what is acceptable. */
export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const message = values.message.trim();
  const digits = phone.replace(/\D/g, "").length;

  if (!name) errors.name = "Please enter your name.";
  else if (name.length > CONTACT_LIMITS.name) errors.name = "That name is too long.";

  if (!EMAIL.test(email) || email.length > CONTACT_LIMITS.email) errors.email = "Please enter a valid email address.";

  if (!PHONE_CHARACTERS.test(phone) || digits < 7 || digits > 15 || phone.length > CONTACT_LIMITS.phone) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!message) errors.message = "Please write a short message.";
  else if (message.length > CONTACT_LIMITS.message) errors.message = "That message is too long.";

  return errors;
}
