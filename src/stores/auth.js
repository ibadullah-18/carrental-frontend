// src/utils/auth.js

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

export function getUserIdFromToken() {
  const token = getAccessToken()
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return (
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      payload["sub"] ||
      payload["id"]
    )
  } catch {
    return null
  }
}