const ACCESS_TOKEN_KEY = "accessToken"
const REFRESH_TOKEN_KEY = "refreshToken"

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem("superAdminToken")
}

export function parseJwt(token) {
  try {
    if (!token) return null
    return JSON.parse(atob(token.split(".")[1]))
  } catch {
    return null
  }
}

export function getRoleFromToken(token = getAccessToken()) {
  const payload = parseJwt(token)

  return (
    payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    payload?.role ||
    null
  )
}