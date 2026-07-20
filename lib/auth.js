// Hashes a password the same way the desktop app does:
// hashlib.sha256(password.encode()).hexdigest()
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const SESSION_KEY = "onpoint_current_user";

export function saveSession(username) {
  localStorage.setItem(SESSION_KEY, username);
}

export function getSession() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
