// src/utils/api.js

import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "./auth";

const BASE_URL = "http://localhost:5248";

// refresh token ile yeni access token almaq
async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("Refresh token tapilmadi");
  }

  const response = await fetch(`${BASE_URL}/api/Auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refreshToken: refreshToken,
    }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error("Refresh token yenilenmedi");
  }

  const data = await response.json();

  // backendden gelen field adlarina gore deyisdirersen
  // misal:
  // data.token
  // data.accessToken
  // data.refreshToken

  const newAccessToken = data.accessToken || data.token;
  const newRefreshToken = data.refreshToken;

  if (!newAccessToken) {
    clearTokens();
    throw new Error("Yeni access token gelmedi");
  }

  setAccessToken(newAccessToken);

  if (newRefreshToken) {
    setRefreshToken(newRefreshToken);
  }

  return newAccessToken;
}

// esas request funksiyasi
export async function apiFetch(url, options = {}, retry = true) {
  let accessToken = getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // eger token vaxti bitibse
  if (response.status === 401 && retry) {
    try {
      const newAccessToken = await refreshAccessToken();

      const retryHeaders = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        Authorization: `Bearer ${newAccessToken}`,
      };

      response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: retryHeaders,
      });
    } catch (error) {
      clearTokens();
      window.location.href = "/login";
      throw error;
    }
  }

  return response;
}