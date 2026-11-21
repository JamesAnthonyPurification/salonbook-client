/** Only allow same-origin relative redirects (prevents open-redirects). */
export function safeRedirect(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}

export const roleHome = (role?: string | null) => (role === "admin" ? "/dashboard/admin" : "/dashboard/customer");
