import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "./auth";

const BASE_URL = "http://172.20.60.165:5248";

async function refreshAccessToken() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  console.log("Refresh başlayır...");
  console.log("Köhnə access token:", accessToken);
  console.log("Refresh token:", refreshToken);

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
  console.log("Refresh response:", data);

  if (!response.ok) {
    clearTokens();
    throw new Error(data?.message || "Refresh token yenilənmədi");
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

  console.log("Yeni access token save olundu");
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
    console.log("401 gəldi:", url);

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

      console.log("Request yenidən göndərildi:", url);
    } catch (error) {
      console.log("Refresh xətası:", error);
      clearTokens();
      window.location.href = "/login";
      throw error;
    }
  }

  return response;
}