export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns an error message, or null when the password satisfies the rules. */
export function validatePassword(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  return null;
}

export const isHttpUrl = (v: string) => /^https?:\/\/\S+$/i.test(v.trim());
