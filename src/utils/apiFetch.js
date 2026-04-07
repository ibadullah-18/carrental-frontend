import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "./auth";

// Eyni domain ustunden isleyir:
// /api -> nginx backend-e yonlendirir
const BASE_URL = "";

async function refreshAccessToken() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    throw new Error("Refresh token tapilmadi");
  }

  const response = await fetch(`${BASE_URL}/api/Auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accessToken,
      refreshToken,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    clearTokens();
    throw new Error(data?.message || data?.Message || "Refresh token yenilenmedi");
  }

  const newAccessToken = data?.accessToken || data?.token;
  const newRefreshToken = data?.refreshToken;

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

function buildHeaders(optionsHeaders = {}, hasBody = false, isFormData = false) {
  const headers = { ...optionsHeaders };
  const accessToken = getAccessToken();

  if (!isFormData && hasBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

export async function apiFetch(url, options = {}, retry = true) {
  const isFormData = options.body instanceof FormData;
  const hasBody = !!options.body;

  let headers = buildHeaders(options.headers, hasBody, isFormData);

  let response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry) {
    try {
      const newAccessToken = await refreshAccessToken();

      headers = {
        ...buildHeaders(options.headers, hasBody, isFormData),
        Authorization: `Bearer ${newAccessToken}`,
      };

      response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers,
      });
    } catch (error) {
      clearTokens();
      window.location.href = "/login";
      throw error;
    }
  }

  return response;
}