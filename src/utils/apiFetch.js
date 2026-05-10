import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "./auth";

const BASE_URL = "https://localhost:52247";

let isRefreshing = false;
let refreshPromise = null;

async function refreshAccessToken() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    throw new Error("Refresh token tapılmadı");
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

    throw new Error(
      data?.message ||
      data?.Message ||
      "Refresh token yenilənmədi"
    );
  }

  const newAccessToken = data?.accessToken || data?.token;
  const newRefreshToken = data?.refreshToken;

  if (!newAccessToken) {
    clearTokens();
    throw new Error("Yeni access token gəlmədi");
  }

  setAccessToken(newAccessToken);

  if (newRefreshToken) {
    setRefreshToken(newRefreshToken);
  }

  return newAccessToken;
}

function buildHeaders(customHeaders = {}, hasBody = false, isFormData = false) {
  const headers = {
    ...customHeaders,
  };

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

  let headers = buildHeaders(
    options.headers,
    hasBody,
    isFormData
  );

  let response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry) {
    try {
      if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise = refreshAccessToken().finally(() => {
          isRefreshing = false;
        });
      }

      const newAccessToken = await refreshPromise;

      headers = {
        ...buildHeaders(
          options.headers,
          hasBody,
          isFormData
        ),
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