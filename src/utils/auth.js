const ACCESS_TOKEN_KEY = "accessToken"
const REFRESH_TOKEN_KEY = "refreshToken"

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token) {
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function clearAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function clearRefreshToken() {
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function clearTokens() {
  clearAccessToken()
  clearRefreshToken()

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

export function isTokenExpired(token) {
  const payload = parseJwt(token)

  if (!payload?.exp) return true

  return payload.exp * 1000 <= Date.now()
}

export function getValidAccessToken() {
  const token = getAccessToken()

  if (!token) return null

  if (isTokenExpired(token)) {
    clearTokens()
    return null
  }

  return token
}

export function getUserIdFromToken() {
  const token = getAccessToken()

  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))

    return (
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      payload["nameid"] ||
      payload["sub"] ||
      null
    )
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

export function isLoggedIn() {
  return !!getValidAccessToken()
}