const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
  clearAccessToken();
  clearRefreshToken();
}

export function parseJwt(token) {
  try {
    if (!token) return null;

    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = parseJwt(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
}

export function getValidAccessToken() {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  if (isTokenExpired(token)) {
    return null;
  }

  return token;
}

export function getUserIdFromToken() {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const payload = parseJwt(token);

    return (
      payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      payload.nameid ||
      payload.sub ||
      null
    );
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getAccessToken();
}