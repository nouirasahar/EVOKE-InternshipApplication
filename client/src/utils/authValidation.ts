export const isEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export type Errors = Record<string, string>;

export function validateLogin(v: { email: string; password: string }): Errors {
  const e: Errors = {};
  if (!v.email) e.email = "Email is required.";
  else if (!isEmail(v.email)) e.email = "Enter a valid email address.";
  if (!v.password) e.password = "Password is required.";
  return e;
}

export function validateSignup(v: {
  name: string;
  email: string;
  password: string;
  confirm: string;
}): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Full name is required.";
  if (!v.email) e.email = "Email is required.";
  else if (!isEmail(v.email)) e.email = "Enter a valid email address.";
  if (!v.password) e.password = "Password is required.";
  else if (v.password.length < 8) e.password = "Password must be at least 8 characters.";
  if (v.confirm !== v.password) e.confirm = "Passwords do not match.";
  return e;
}

export function validateEmailOnly(email: string): Errors {
  const e: Errors = {};
  if (!email) e.email = "Email is required.";
  else if (!isEmail(email)) e.email = "Enter a valid email address.";
  return e;
}

export function validateReset(v: { password: string; confirm: string }): Errors {
  const e: Errors = {};
  if (!v.password) e.password = "Password is required.";
  else if (v.password.length < 8) e.password = "Password must be at least 8 characters.";
  if (v.confirm !== v.password) e.confirm = "Passwords do not match.";
  return e;
}
