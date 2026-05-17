import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from "./auth"

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://13.36.176.206:8081"

let isRefreshing = false
let refreshPromise = null

async function refreshAccessToken() {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    clearTokens()
    throw new Error("Refresh token tapılmadı")
  }

  const res = await fetch(`${API_BASE_URL}/api/Auth/refresh-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accessToken,
      refreshToken,
    }),
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    clearTokens()
    throw new Error(data?.message || data?.Message || "Sessiya bitib")
  }

  const newAccessToken =
    data?.accessToken ||
    data?.token ||
    data?.data?.accessToken ||
    data?.data?.token

  const newRefreshToken =
    data?.refreshToken || data?.data?.refreshToken

  if (!newAccessToken) {
    clearTokens()
    throw new Error("Yeni access token gəlmədi")
  }

  setAccessToken(newAccessToken)

  if (newRefreshToken) {
    setRefreshToken(newRefreshToken)
  }

  return newAccessToken
}

function buildHeaders(customHeaders = {}, hasBody = false, isFormData = false) {
  const headers = { ...customHeaders }
  const accessToken = getAccessToken()

  if (!isFormData && hasBody && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json"
  }

  if (accessToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  return headers
}

export function getFileUrl(url, fallback = "") {
  if (!url) return fallback
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`
}

export async function apiFetch(url, options = {}, retry = true) {
  const isFormData = options.body instanceof FormData
  const hasBody = !!options.body

  let headers = buildHeaders(options.headers, hasBody, isFormData)

  let res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })

  if (res.status === 401 && retry) {
    try {
      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = refreshAccessToken().finally(() => {
          isRefreshing = false
        })
      }

      const newAccessToken = await refreshPromise

      headers = {
        ...buildHeaders(options.headers, hasBody, isFormData),
        Authorization: `Bearer ${newAccessToken}`,
      }

      res = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      })
    } catch (err) {
      clearTokens()
      throw err
    }
  }

  return res
}

apiFetch.baseUrl = API_BASE_URL