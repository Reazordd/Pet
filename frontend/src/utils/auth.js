// frontend/src/utils/auth.js
// Утилиты для хранения токенов и простого парсинга JWT (no external jwt-decode)
export function setAccessToken(token) {
  localStorage.setItem("access_token", token);
}

export function setRefreshToken(token) {
  localStorage.setItem("refresh_token", token);
}

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  // optional: redirect handled by callers
}

function parseJwtPayload(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    // pad base64
    const pad = payload.length % 4;
    const padded = payload + (pad === 2 ? "==" : pad === 3 ? "=" : pad === 0 ? "" : "");
    const decoded = atob(padded);
    // decode utf-8
    try {
      // handle unicode
      return JSON.parse(decodeURIComponent(escape(decoded)));
    } catch (e) {
      return JSON.parse(decoded);
    }
  } catch (e) {
    return null;
  }
}

export function getTokenPayload(token = null) {
  const t = token || getAccessToken();
  return parseJwtPayload(t);
}

export function checkToken() {
  const token = getAccessToken();
  if (!token) return false;
  const payload = parseJwtPayload(token);
  if (!payload || !payload.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
}