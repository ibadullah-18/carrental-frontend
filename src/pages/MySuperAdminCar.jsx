import { useEffect, useState } from "react"
import { apiFetch, getFileUrl } from "../utils/apiFetch"
import { getAccessToken, setAccessToken, setRefreshToken, clearTokens } from "../utils/auth"

const arr = (data) =>
  Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.$values)
    ? data.$values
    : Array.isArray(data?.items)
    ? data.items
    : []

const unwrap = (data) => data?.data ?? data
const fileUrl = (url) => getFileUrl(url, "")

const getTokens = (data) => ({
  accessToken:
    data?.accessToken ||
    data?.token ||
    data?.jwtToken ||
    data?.data?.accessToken ||
    data?.data?.token ||
    "",
  refreshToken: data?.refreshToken || data?.data?.refreshToken || "",
})

const emptyPackage = {
  name: "",
  durationDays: "",
  price: "",
  currency: "AZN",
  isVip: false,
  isActive: true,
  sortOrder: "",
}

const periodName = (p) =>
  p === "daily" ? "Son 1 gün" : p === "weekly" ? "Son 7 gün" : p === "monthly" ? "Son 1 ay" : "Naməlum"

const az = (k) =>
  ({
    totalUsers: "Ümumi istifadəçilər",
    activeUsers: "Aktiv istifadəçilər",
    bannedUsers: "Banlanan istifadəçilər",
    totalCars: "Ümumi maşınlar",
    activeCars: "Aktiv maşınlar",
    vipCars: "VIP maşınlar",
    removedCars: "Silinən maşınlar",
    pendingReports: "Gözləyən reportlar",
    pendingVerificationCars: "Təsdiq gözləyən maşınlar",
    totalPayments: "Ümumi ödənişlər",
    paidPayments: "Ödənilmiş ödənişlər",
    totalRevenue: "Ümumi gəlir",
    registeredUsers: "Yeni qeydiyyatlar",
    newCars: "Yeni maşınlar",
    salesCount: "Satış sayı",
    revenue: "Gəlir",
    reportsCount: "Report sayı",
    period: "Period",
    from: "Başlanğıc",
    to: "Son",
  }[k] || k)

const reportStatusText = (status) => {
  const s = String(status ?? "").toLowerCase()
  if (s === "1" || s === "pending") return "Gözləyir"
  if (s === "2" || s === "underreview" || s === "under_review") return "Baxışdadır"
  if (s === "3" || s === "rejected") return "Rədd edilib"
  if (s === "4" || s === "resolved") return "Həll edilib"
  return status ?? "Naməlum"
}

export default function MySuperAdminCar() {
  const [token, setToken] = useState(getAccessToken() || "")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [tab, setTab] = useState("dashboard")
  const [loading, setLoading] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [period, setPeriod] = useState("daily")

  const [dashboard, setDashboard] = useState(null)
  const [overview, setOverview] = useState(null)
  const [reportStats, setReportStats] = useState(null)

  const [users, setUsers] = useState([])
  const [bannedUsers, setBannedUsers] = useState([])
  const [removedCars, setRemovedCars] = useState([])
  const [payments, setPayments] = useState([])
  const [reports, setReports] = useState([])
  const [resolvedReports, setResolvedReports] = useState([])
  const [packages, setPackages] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [legalConsents, setLegalConsents] = useState([])

  const [userSearch, setUserSearch] = useState("")
  const [bannedUserSearch, setBannedUserSearch] = useState("")
  const [removedCarSearch, setRemovedCarSearch] = useState("")
  const [auditSearch, setAuditSearch] = useState("")
  const [legalSearch, setLegalSearch] = useState("")
  const [paymentSearch, setPaymentSearch] = useState("")
  const [reportSearch, setReportSearch] = useState("")
  const [resolvedReportSearch, setResolvedReportSearch] = useState("")
  const [searchedUsers, setSearchedUsers] = useState([])
  const [plate, setPlate] = useState("")
  const [cars, setCars] = useState([])

  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedCar, setSelectedCar] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedAuditUser, setSelectedAuditUser] = useState(null)
  const [selectedLegalUser, setSelectedLegalUser] = useState(null)
  const [selectedPaymentUser, setSelectedPaymentUser] = useState(null)
  const [packageForm, setPackageForm] = useState(emptyPackage)

  const clear = () => {
    setError("")
    setMessage("")
    setSelectedUser(null)
    setSelectedCar(null)
    setSelectedPayment(null)
    setSelectedReport(null)
    setSelectedPackage(null)
    setSelectedAuditUser(null)
    setSelectedLegalUser(null)
    setSelectedPaymentUser(null)
  }

  const logout = () => {
    clearTokens()
    setToken("")
    clear()
  }

  const request = async (url, options = {}) => {
    const finalOptions = {
      ...options,
      headers: {
        ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    }

    const res = await apiFetch(url, finalOptions)

    if (res.status === 401 || res.status === 403) {
      clearTokens()
      setToken("")
      throw new Error("Sessiya bitib və ya bu hesabın icazəsi yoxdur")
    }

    if (!res.ok) {
      let msg = "Xəta baş verdi"
      try {
        const e = await res.json()
        msg = e?.message || e?.title || JSON.stringify(e)
      } catch {
        msg = await res.text()
      }
      throw new Error(msg)
    }

    const text = await res.text()
    if (!text) return null

    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  }

  const login = async (e) => {
    e.preventDefault()
    setError("")
    setLoginLoading(true)

    try {
      const res = await apiFetch("/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || "Email və ya şifrə yanlışdır")

      const { accessToken, refreshToken } = getTokens(data)
      if (!accessToken) throw new Error("Access token gəlmədi")

      const check = await apiFetch(
        "/api/SuperAdmin/dashboard",
        { headers: { Authorization: `Bearer ${accessToken}` } },
        false
      )

      if (check.status === 401 || check.status === 403) throw new Error("Bu hesab SuperAdmin deyil")

      setAccessToken(accessToken)
      if (refreshToken) setRefreshToken(refreshToken)
      setToken(accessToken)
    } catch (e) {
      clearTokens()
      setToken("")
      setError(e.message)
    } finally {
      setLoginLoading(false)
    }
  }

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [d, o, r] = await Promise.all([
        request("/api/SuperAdmin/dashboard"),
        request("/api/Stats/overview"),
        request(`/api/Stats/report?period=${period}`),
      ])
      setDashboard(unwrap(d))
      setOverview(unwrap(o))
      setReportStats(unwrap(r))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const list = arr(await request("/api/SuperAdmin/users"))
      setUsers(list.filter((u) => !u.isBanned))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadBannedUsers = async () => {
    setLoading(true)
    try {
      setBannedUsers(arr(await request("/api/Admin/banned-users")))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadRemovedCars = async () => {
    setLoading(true)
    try {
      setRemovedCars(arr(await request("/api/Admin/removed-cars")))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadPayments = async () => {
    setLoading(true)
    try {
      setPayments(arr(await request("/api/SuperAdmin/payments")))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadReports = async () => {
    setLoading(true)
    try {
      setReports(arr(await request("/api/Admin/reports/pending")))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadResolvedReports = async () => {
    setLoading(true)
    try {
      const list = arr(await request("/api/Admin/reports"))
      const onlyResolved = list.filter((r) => {
        const s = String(r.status ?? "").toLowerCase()
        return s === "4" || s === "resolved" || Boolean(r.reviewedAt || r.actionTaken)
      })
      setResolvedReports(onlyResolved)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadPackages = async () => {
    try {
      setPackages(arr(await request("/api/Packages")))
    } catch {
      try {
        setPackages(arr(await request("/api/SuperAdmin/packages")))
      } catch (e) {
        setError(e.message)
      }
    }
  }

  const loadAudit = async () => {
    setLoading(true)
    try {
      setAuditLogs(arr(await request("/api/SuperAdmin/audit-logs")))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadLegal = async () => {
    setLoading(true)
    try {
      setLegalConsents(arr(await request("/api/SuperAdmin/legal-consents")))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadUser = async (userId) => {
    setLoading(true)
    try {
      const [p, l, c] = await Promise.all([
        request(`/api/SuperAdmin/users/${userId}/full-profile`),
        request(`/api/SuperAdmin/audit-logs/user/${userId}`),
        request(`/api/SuperAdmin/legal-consents/user/${userId}`),
      ])
      setSelectedUser({ ...unwrap(p), auditLogs: arr(l), legalConsents: arr(c) })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCar = async (carId) => {
    if (!carId) return
    setLoading(true)
    try {
      try {
        setSelectedCar(unwrap(await request(`/api/Admin/cars/${carId}`)))
      } catch {
        setSelectedCar(unwrap(await request(`/api/Cars/${carId}`)))
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadReport = async (reportId) => {
    setLoading(true)
    try {
      setSelectedReport(unwrap(await request(`/api/Admin/reports/${reportId}`)))
    } catch {
      const found = reports.find((r) => r.id === reportId) || resolvedReports.find((r) => r.id === reportId)
      if (found) setSelectedReport(found)
      else setError("Report detalları tapılmadı")
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async (e) => {
    e.preventDefault()
    if (!userSearch.trim()) return
    setLoading(true)
    try {
      setSearchedUsers(arr(await request(`/api/Users/search?query=${encodeURIComponent(userSearch.trim())}`)))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const searchCars = async (e) => {
    e.preventDefault()
    if (!plate.trim()) return
    setLoading(true)
    try {
      const data = await request(`/api/Cars/search?plate=${encodeURIComponent(plate.trim())}`)
      const list = arr(data)
      setCars(list.length ? list : data ? [unwrap(data)] : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const banUser = async (id) => {
    const note = window.prompt("Ban səbəbini yaz:", "")
    if (note === null) return
    try {
      await request(`/api/SuperAdmin/users/${id}/ban`, { method: "PUT", body: JSON.stringify({ note }) })
      setMessage("İstifadəçi ban edildi")
      loadUsers()
      loadBannedUsers()
      if (selectedUser?.id === id) loadUser(id)
    } catch (e) {
      setError(e.message)
    }
  }

  const adminBanUser = async (id) => {
    if (!id) return setError("Ban ediləcək istifadəçi ID tapılmadı")
    const note = window.prompt("Ban səbəbini yaz:", "")
    if (note === null) return
    try {
      await request(`/api/Admin/users/${id}/ban`, { method: "PUT", body: JSON.stringify({ note }) })
      setMessage("İstifadəçi ban edildi")
      loadReports()
      loadBannedUsers()
    } catch (e) {
      setError(e.message)
    }
  }

  const unbanUser = async (id) => {
    try {
      await request(`/api/SuperAdmin/users/${id}/unban`, { method: "PUT" })
      setMessage("Ban silindi")
      loadUsers()
      loadBannedUsers()
      if (selectedUser?.id === id) loadUser(id)
    } catch (e) {
      setError(e.message)
    }
  }

  const setSearchPermission = async (id, canSearchCars) => {
    try {
      await request(`/api/SuperAdmin/users/${id}/search-permission`, {
        method: "PUT",
        body: JSON.stringify({ canSearchCars }),
      })
      setMessage("Axtarış icazəsi yeniləndi")
      if (selectedUser?.id === id) loadUser(id)
    } catch (e) {
      setError(e.message)
    }
  }

  const makeModerator = async (id) => {
    if (!id) return setError("İstifadəçi ID tapılmadı")
    try {
      await request("/api/SuperAdmin/moderators", { method: "POST", body: JSON.stringify({ userId: id }) })
      setMessage("İstifadəçi admin edildi")
      setSearchedUsers((prev) =>
        prev.map((u) => {
          const uid = u.id || u.userId
          if (uid !== id) return u
          const roles = arr(u.roles)
          return { ...u, roles: roles.includes("Admin") ? roles : [...roles, "Admin"] }
        })
      )
      loadUsers()
      if (selectedUser?.id === id) loadUser(id)
    } catch (e) {
      setError(e.message)
    }
  }

  const removeModerator = async (id) => {
    if (!id) return setError("İstifadəçi ID tapılmadı")
    try {
      await request(`/api/SuperAdmin/moderators/${id}`, { method: "DELETE" })
      setMessage("Adminlik ləğv edildi")
      setSearchedUsers((prev) =>
        prev.map((u) => {
          const uid = u.id || u.userId
          if (uid !== id) return u
          return { ...u, roles: arr(u.roles).filter((r) => r !== "Admin" && r !== "Moderator") }
        })
      )
      loadUsers()
      if (selectedUser?.id === id) loadUser(id)
    } catch (e) {
      setError(e.message)
    }
  }

  const savePackage = async (e) => {
    e.preventDefault()
    const body = {
      name: packageForm.name,
      durationDays: Number(packageForm.durationDays),
      price: Number(packageForm.price),
      currency: packageForm.currency || "AZN",
      isVip: Boolean(packageForm.isVip),
      sortOrder: Number(packageForm.sortOrder || 0),
    }
    if (selectedPackage) body.isActive = Boolean(packageForm.isActive)

    try {
      await request(selectedPackage ? `/api/SuperAdmin/packages/${selectedPackage.id}` : "/api/SuperAdmin/packages", {
        method: selectedPackage ? "PUT" : "POST",
        body: JSON.stringify(body),
      })
      setMessage(selectedPackage ? "Paket yeniləndi" : "Paket yaradıldı")
      setSelectedPackage(null)
      setPackageForm(emptyPackage)
      loadPackages()
    } catch (e) {
      setError(e.message)
    }
  }

  const editPackage = (p) => {
    setSelectedPackage(p)
    setPackageForm({
      name: p.name || "",
      durationDays: p.durationDays || "",
      price: p.price || "",
      currency: p.currency || "AZN",
      isVip: Boolean(p.isVip),
      isActive: Boolean(p.isActive),
      sortOrder: p.sortOrder || "",
    })
  }

  const removeCar = async (carId) => {
    const note = window.prompt("Maşının silinmə səbəbini yaz:", "")
    if (note === null) return
    try {
      await request(`/api/Admin/cars/${carId}/remove`, { method: "PUT", body: JSON.stringify({ note }) })
      setMessage("Maşın silindi")
      loadReports()
      loadRemovedCars()
      setSelectedCar(null)
    } catch (e) {
      setError(e.message)
    }
  }

  const setReportUnderReview = async (reportId) => {
    try {
      await request(`/api/Admin/reports/${reportId}/under-review`, { method: "PUT" })
      setMessage("Report baxışa götürüldü")
      loadReport(reportId)
      loadReports()
    } catch (e) {
      setError(e.message)
    }
  }

  const resolveReport = async (reportId) => {
    const note = window.prompt("Report həll qeydi:", "")
    if (note === null) return
    try {
      await request(`/api/Admin/reports/${reportId}/resolve`, { method: "PUT", body: JSON.stringify({ note }) })
      setMessage("Report həll edildi")
      setSelectedReport(null)
      loadReports()
      loadResolvedReports()
    } catch (e) {
      setError(e.message)
    }
  }

  const rejectReport = async (reportId) => {
    const note = window.prompt("Report rədd qeydi:", "")
    if (note === null) return
    try {
      await request(`/api/Admin/reports/${reportId}/reject`, { method: "PUT", body: JSON.stringify({ note }) })
      setMessage("Report rədd edildi")
      setSelectedReport(null)
      loadReports()
      loadResolvedReports()
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    if (!token) return
    clear()
    if (tab === "dashboard") loadDashboard()
    if (tab === "users") loadUsers()
    if (tab === "bannedUsers") loadBannedUsers()
    if (tab === "removedCars") loadRemovedCars()
    if (tab === "payments") loadPayments()
    if (tab === "reports") loadReports()
    if (tab === "resolvedReports") loadResolvedReports()
    if (tab === "packages") loadPackages()
    if (tab === "audit") loadAudit()
    if (tab === "legal") loadLegal()
  }, [token, tab, period])

  useEffect(() => {
    if (token) loadPackages()
  }, [token])

  const mainImg = (car) => {
    const media = arr(car?.media)
    const img = media.find((x) => x.mediaType === 1 && x.isMain) || media.find((x) => x.mediaType === 1)
    return fileUrl(img?.fileUrl || img?.thumbnailUrl || car?.mainImageUrl)
  }

  const getPackageName = (car) => {
    const id = car?.currentPackageId || car?.packageId || car?.package?.id
    const found = packages.find((p) => p.id === id || p.packageId === id)
    return car?.packageName || car?.package?.name || found?.name || id || "Paket yoxdur"
  }

  const userNameOf = (x) => x?.userFullName || x?.fullName || x?.actorFullName || x?.reportedByFullName || x?.name || x?.userName || "Adsız istifadəçi"
  const userEmailOf = (x) => x?.userEmail || x?.email || x?.actorEmail || x?.reportedByEmail || ""
  const userIdOf = (x) => x?.userId || x?.actorUserId || x?.reportedByUserId || x?.ownerId || x?.id || "unknown"

  const groupByUser = (list) => {
    const map = new Map()
    arr(list).forEach((item) => {
      const id = userIdOf(item)
      if (!map.has(id)) map.set(id, { userId: id, fullName: userNameOf(item), email: userEmailOf(item), items: [] })
      map.get(id).items.push(item)
    })
    return Array.from(map.values())
  }

  const contains = (value, q) => String(value || "").toLowerCase().includes(q.toLowerCase())

  const activeUsersCount = dashboard?.activeUsers ?? Math.max((dashboard?.totalUsers ?? 0) - (dashboard?.bannedUsers ?? 0), 0)

  const filteredUsers = users.filter((u) => {
    const q = userSearch.trim()
    if (!q) return true
    return contains(u.fullName, q) || contains(u.email, q) || contains(u.city, q)
  })

  const filteredBannedUsers = bannedUsers.filter((u) => {
    const q = bannedUserSearch.trim()
    if (!q) return true
    return contains(userNameOf(u), q) || contains(userEmailOf(u), q) || contains(u.note, q)
  })

  const filteredRemovedCars = removedCars.filter((c) => {
    const q = removedCarSearch.trim()
    if (!q) return true
    return contains(c.plateNumber, q) || contains(c.brand, q) || contains(c.model, q) || contains(c.note, q) || contains(c.removedNote, q)
  })

  const filteredReports = reports.filter((r) => {
    const q = reportSearch.trim()
    if (!q) return true
    return contains(r.plateNumber, q) || contains(r.description, q) || contains(r.reportedByFullName, q)
  })

  const filteredResolvedReports = resolvedReports.filter((r) => {
    const q = resolvedReportSearch.trim()
    if (!q) return true
    return contains(r.plateNumber, q) || contains(r.description, q) || contains(r.reportedByFullName, q) || contains(r.actionTaken, q)
  })

  const groupedAudit = groupByUser(auditLogs).filter((g) => {
    const q = auditSearch.trim()
    if (!q) return true
    return contains(g.fullName, q) || contains(g.email, q)
  })

  const groupedLegal = groupByUser(legalConsents).filter((g) => {
    const q = legalSearch.trim()
    if (!q) return true
    return contains(g.fullName, q) || contains(g.email, q)
  })

  const groupedPayments = groupByUser(payments).filter((g) => {
    const q = paymentSearch.trim()
    if (!q) return true
    return contains(g.fullName, q) || contains(g.email, q)
  })

  const Info = ({ label, value }) => (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-900">{value ?? "Yoxdur"}</p>
    </div>
  )

  const Badge = ({ children, good }) => (
    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${good ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
      {children}
    </span>
  )

  const Modal = ({ title, children, onClose, wide = true }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4">
      <div className={`max-h-[92vh] overflow-y-auto rounded-[1.5rem] bg-white p-4 shadow-2xl sm:rounded-[2rem] sm:p-6 ${wide ? "w-full max-w-6xl" : "w-full max-w-2xl"}`}>
        <div className="mb-5 flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-black text-slate-950 sm:text-2xl">{title}</h2>
          <button onClick={onClose} className="rounded-2xl bg-slate-100 px-4 py-2 font-black">Bağla</button>
        </div>
        {children}
      </div>
    </div>
  )

  const Card = ({ title, value, desc }) => (
    <div className="rounded-[1.5rem] bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5">
      <p className="text-sm font-bold text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">{value ?? 0}</p>
      <p className="mt-2 text-sm text-slate-500">{desc}</p>
    </div>
  )

  const UserModal = ({ user }) => (
    <Modal title={user.fullName || "İstifadəçi detalları"} onClose={() => setSelectedUser(null)}>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-64">
          <img src={fileUrl(user.profileImageUrl)} className="h-56 w-full rounded-3xl bg-slate-100 object-cover" />
          <div className="mt-4 flex flex-wrap gap-2">
            {arr(user.roles).map((r) => <span key={r} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">{r}</span>)}
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Info label="Email" value={user.email} />
            <Info label="Telefon" value={user.phoneNumber} />
            <Info label="Şəhər" value={user.city} />
            <Info label="Email təsdiqi" value={user.emailConfirmed ? "Bəli" : "Xeyr"} />
            <Info label="Ban vəziyyəti" value={user.isBanned ? "Banlı" : "Aktiv"} />
            <Info label="Maşın axtarış icazəsi" value={user.canSearchCars ? "Var" : "Yoxdur"} />
            <Info label="Maşın sayı" value={arr(user.cars).length} />
            <Info label="Ödəniş sayı" value={arr(user.payments).length} />
            <Info label="Qeydiyyat tarixi" value={user.registeredAt} />
          </div>

          <div className="mt-4 rounded-3xl bg-slate-50 p-4">
            <b>Bio</b>
            <p>{user.bio || "Yoxdur"}</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {user.isBanned ? (
              <button onClick={() => unbanUser(user.id)} className="rounded-2xl bg-emerald-600 px-4 py-2 font-black text-white">Banı sil</button>
            ) : (
              <button onClick={() => banUser(user.id)} className="rounded-2xl bg-red-600 px-4 py-2 font-black text-white">Ban et</button>
            )}
            <button onClick={() => setSearchPermission(user.id, !user.canSearchCars)} className="rounded-2xl bg-blue-600 px-4 py-2 font-black text-white">
              {user.canSearchCars ? "Axtarışı bağla" : "Axtarış icazəsi ver"}
            </button>
            <button onClick={() => makeModerator(user.id)} className="rounded-2xl bg-purple-600 px-4 py-2 font-black text-white">Admin et</button>
            <button onClick={() => removeModerator(user.id)} className="rounded-2xl bg-slate-900 px-4 py-2 font-black text-white">Adminliyi ləğv et</button>
          </div>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-3xl border p-4">
          <h3 className="mb-3 text-lg font-black">İstifadəçinin maşınları</h3>
          {arr(user.cars).map((c) => (
            <button key={c.id} onClick={() => loadCar(c.id)} className="mb-2 flex w-full flex-col gap-3 rounded-2xl bg-slate-50 p-3 text-left hover:bg-blue-50 sm:flex-row">
              {mainImg(c) ? <img src={mainImg(c)} className="h-40 w-full rounded-2xl object-cover sm:h-20 sm:w-28" /> : <div className="flex h-40 w-full items-center justify-center rounded-2xl bg-slate-200 text-xs font-black text-slate-400 sm:h-20 sm:w-28">Şəkil yoxdur</div>}
              <div>
                <p className="font-black">{c.plateNumber} — {c.brand} {c.model}</p>
                <p className="text-sm text-slate-500">{c.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="rounded-3xl border p-4">
          <h3 className="mb-3 text-lg font-black">İstifadəçinin ödənişləri</h3>
          {arr(user.payments).map((p) => (
            <button key={p.id} onClick={() => setSelectedPayment(p)} className="mb-2 w-full rounded-2xl bg-slate-50 p-3 text-left">
              <b>{p.amount} {p.currency} — {p.packageName}</b>
              <p className="text-sm text-slate-500">{p.receiptNumber}</p>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  )

  const CarModal = ({ car }) => {
    const media = arr(car.media)
    const images = media.filter((m) => m.mediaType === 1)
    const videos = media.filter((m) => m.mediaType === 2)

    return (
      <Modal title={`${car.plateNumber || "Nömrə yoxdur"} — ${car.brand || ""} ${car.model || ""}`} onClose={() => setSelectedCar(null)}>
        {images.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {images.map((i) => <img key={i.id} src={fileUrl(i.fileUrl || i.thumbnailUrl)} className="h-44 w-full rounded-3xl object-cover" />)}
          </div>
        ) : (
          <div className="rounded-3xl bg-slate-100 p-8 text-center font-bold text-slate-500">Media yoxdur</div>
        )}

        {videos.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            {videos.map((v) => <video key={v.id} src={fileUrl(v.fileUrl)} controls className="h-56 w-full rounded-3xl bg-black object-cover" />)}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Info label="ID" value={car.id} />
          <Info label="User ID" value={car.userId} />
          <Info label="Marka" value={car.brand} />
          <Info label="Model" value={car.model} />
          <Info label="İl" value={car.year} />
          <Info label="Rəng" value={car.color} />
          <Info label="Şəhər" value={car.city} />
          <Info label="Status" value={car.status} />
          <Info label="Baxış sayı" value={car.viewCount} />
          <Info label="Paket" value={getPackageName(car)} />
          <Info label="Yaradılma tarixi" value={car.createdAt} />
          <Info label="Aktivlik bitir" value={car.activeUntil} />
        </div>

        <div className="mt-4 rounded-3xl bg-slate-50 p-4">
          <b>Açıqlama</b>
          <p>{car.description || "Yoxdur"}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={() => removeCar(car.id || car.carId)} className="rounded-2xl bg-red-600 px-4 py-3 font-black text-white">Maşını sil</button>
        </div>
      </Modal>
    )
  }

  const PaymentModal = ({ payment }) => (
    <Modal title="Ödəniş detalları" onClose={() => setSelectedPayment(null)} wide={false}>
      <div className="grid grid-cols-1 gap-3">
        <Info label="İstifadəçi" value={`${payment.userFullName || ""} — ${payment.userEmail || ""}`} />
        <Info label="Maşın nömrəsi" value={payment.plateNumber} />
        <Info label="Paket" value={payment.packageName} />
        <Info label="Məbləğ" value={`${payment.amount} ${payment.currency}`} />
        <Info label="Provider" value={payment.provider} />
        <Info label="Tranzaksiya" value={payment.providerTransactionId} />
        <Info label="Qəbz" value={payment.receiptNumber} />
        <Info label="Yaradılma tarixi" value={payment.createdAt} />
        <Info label="Ödənilmə tarixi" value={payment.paidAt} />
      </div>
    </Modal>
  )

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4 text-white sm:p-5">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center">
          <form onSubmit={login} className="w-full max-w-md rounded-[1.5rem] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur sm:rounded-[2rem] sm:p-8">
            <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-blue-200">ShowCar</p>
            <h1 className="text-3xl font-black sm:text-4xl">SuperAdmin</h1>
            <p className="mt-2 text-blue-100">Yalnız SuperAdmin hesabı ilə giriş mümkündür.</p>
            {error && <div className="my-4 rounded-2xl bg-red-500/20 p-3 font-bold text-red-100">{error}</div>}
            <input className="mt-6 mb-3 h-12 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-white" type="email" placeholder="SuperAdmin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="mb-5 h-12 w-full rounded-2xl border border-white/10 bg-white/10 px-4 text-white" type="password" placeholder="Şifrə" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button disabled={loginLoading} className="h-12 w-full rounded-2xl bg-blue-500 font-black text-white">{loginLoading ? "Yoxlanılır..." : "Daxil ol"}</button>
          </form>
        </div>
      </div>
    )
  }

  const tabs = [
    ["dashboard", "İdarə paneli"],
    ["users", "İstifadəçilər"],
    ["bannedUsers", "Banlanan userlər"],
    ["removedCars", "Silinmiş maşınlar"],
    ["moderators", "Admin ver/sil"],
    ["cars", "Nömrə axtar"],
    ["payments", "Ödənişlər"],
    ["reports", "Gözləyən reportlar"],
    ["resolvedReports", "Həll olunmuş reportlar"],
    ["packages", "Paketlər"],
    ["audit", "Audit loglar"],
    ["legal", "Hüquqi razılıqlar"],
  ]

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="w-full bg-slate-950 p-4 text-white lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-80 lg:overflow-y-auto lg:p-5">
        <div className="mb-4 rounded-3xl bg-white/10 p-4 lg:mb-7 lg:p-5">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-200">ShowCar</p>
          <h1 className="mt-2 text-2xl font-black lg:text-3xl">SuperAdmin</h1>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:block">
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => { clear(); setTab(k) }} className={`rounded-2xl px-3 py-3 text-left text-xs font-black sm:text-sm lg:mb-2 lg:w-full lg:px-4 ${tab === k ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/10"}`}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={logout} className="mt-4 w-full rounded-2xl bg-red-600 px-4 py-3 font-black lg:mt-5">Çıxış</button>
      </aside>

      <main className="p-4 sm:p-5 lg:ml-80 lg:p-7">
        <div className="mb-5 rounded-[1.5rem] bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 p-5 text-white lg:mb-6 lg:rounded-[2rem] lg:p-7">
          <h2 className="text-2xl font-black sm:text-3xl lg:text-4xl">SuperAdmin Panel</h2>
          <p className="mt-2 text-sm text-blue-100 sm:text-base">Bütün idarəetmə funksiyaları aktivdir.</p>
        </div>

        {error && <div className="mb-4 rounded-2xl bg-red-100 p-4 text-sm font-black text-red-700 sm:text-base">{error}</div>}
        {message && <div className="mb-4 rounded-2xl bg-emerald-100 p-4 text-sm font-black text-emerald-700 sm:text-base">{message}</div>}
        {loading && <div className="mb-4 rounded-2xl bg-blue-100 p-4 text-sm font-black text-blue-700 sm:text-base">Yüklənir...</div>}

        {tab === "dashboard" && (
          <section className="space-y-5 lg:space-y-6">
            <div className="rounded-[1.5rem] bg-white p-4 lg:rounded-[2rem] lg:p-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-2xl font-black lg:text-3xl">Sayt statistikası</h2>
                  <p className="text-sm text-slate-500 sm:text-base">Seçilən period: <b>{periodName(period)}</b></p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  {[["daily", "Günlük"], ["weekly", "Həftəlik"], ["monthly", "Aylıq"]].map(([k, l]) => (
                    <button key={k} onClick={() => setPeriod(k)} className={`rounded-2xl px-4 py-3 text-sm font-black ${period === k ? "bg-blue-600 text-white" : "bg-slate-100"}`}>{l}</button>
                  ))}
                  <button onClick={loadDashboard} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">Yenilə</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card title="Ümumi istifadəçilər" value={activeUsersCount} desc="Banlanmayan istifadəçilər" />
              <Card title="Ümumi maşınlar" value={dashboard?.totalCars} desc="Sistemdə yaradılmış elanlar" />
              <Card title="Aktiv maşınlar" value={dashboard?.activeCars} desc="Hazırda aktiv elanlar" />
              <Card title="Ümumi gəlir" value={`${dashboard?.totalRevenue ?? 0} AZN`} desc="Ödənişlərdən gəlir" />
              <Card title="Ödənişlər" value={dashboard?.totalPayments} desc="Bütün ödəniş sayı" />
              <Card title="Banlanan userlər" value={dashboard?.bannedUsers} desc="Məhdudlaşdırılmış hesablar" />
              <Card title="VIP maşınlar" value={dashboard?.vipCars} desc="VIP paketli elanlar" />
              <Card title="Gözləyən reportlar" value={dashboard?.pendingReports} desc="Admin baxışı gözləyənlər" />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className="rounded-[1.5rem] bg-white p-4 lg:rounded-[2rem] lg:p-5">
                <h3 className="mb-4 text-lg font-black lg:text-xl">Ümumi göstəricilər</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{Object.entries(overview || {}).map(([k, v]) => <Info key={k} label={az(k)} value={v} />)}</div>
              </div>
              <div className="rounded-[1.5rem] bg-white p-4 lg:rounded-[2rem] lg:p-5">
                <h3 className="mb-4 text-lg font-black lg:text-xl">{periodName(period)} üzrə hesabat</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{Object.entries(reportStats || {}).map(([k, v]) => <Info key={k} label={az(k)} value={v} />)}</div>
              </div>
            </div>
          </section>
        )}

        {tab === "users" && (
          <section className="rounded-[1.5rem] bg-white p-4 lg:rounded-[2rem] lg:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-black lg:text-2xl">Aktiv istifadəçilər</h2>
              <button onClick={loadUsers} className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">Yenilə</button>
            </div>
            <input className="mb-4 h-12 w-full rounded-2xl border px-4" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="İstifadəçiyə görə axtar..." />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead><tr className="border-b text-sm text-slate-500"><th className="py-3">İstifadəçi</th><th>Email</th><th>Rollar</th><th>Maşın</th><th>Ödəniş</th><th>Status</th><th>Əməliyyat</th></tr></thead>
                <tbody>{filteredUsers.map((u) => <tr key={u.id} className="border-b"><td className="py-4 font-black">{u.fullName}</td><td>{u.email}</td><td>{arr(u.roles).join(", ")}</td><td>{u.carsCount}</td><td>{u.paymentsCount}</td><td><Badge good>Aktiv</Badge></td><td><button onClick={() => loadUser(u.id)} className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-black text-white">Detal</button></td></tr>)}</tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "bannedUsers" && (
          <section className="rounded-[1.5rem] bg-white p-4 lg:rounded-[2rem] lg:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-xl font-black lg:text-2xl">Banlanan istifadəçilər</h2><button onClick={loadBannedUsers} className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">Yenilə</button></div>
            <input className="mb-4 h-12 w-full rounded-2xl border px-4" value={bannedUserSearch} onChange={(e) => setBannedUserSearch(e.target.value)} placeholder="Banlanan istifadəçilərdə axtar..." />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{filteredBannedUsers.map((u) => <div key={userIdOf(u)} className="rounded-3xl border p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-black">{userNameOf(u)}</h3><p className="text-sm text-slate-500">{userEmailOf(u)}</p><p className="text-xs text-slate-400">{u.note || u.banNote || u.reason || "Səbəb qeyd olunmayıb"}</p></div><button onClick={() => unbanUser(userIdOf(u))} className="rounded-2xl bg-emerald-600 px-4 py-2 font-black text-white">Banı sil</button></div></div>)}</div>
          </section>
        )}

        {tab === "removedCars" && (
          <section className="rounded-[1.5rem] bg-white p-4 lg:rounded-[2rem] lg:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-xl font-black lg:text-2xl">Silinmiş maşınlar</h2><button onClick={loadRemovedCars} className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">Yenilə</button></div>
            <input className="mb-4 h-12 w-full rounded-2xl border px-4" value={removedCarSearch} onChange={(e) => setRemovedCarSearch(e.target.value)} placeholder="Nömrə, marka və ya modelə görə axtar..." />
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{filteredRemovedCars.map((c) => <div key={c.id || c.carId} className="rounded-3xl border p-4"><h3 className="font-black">{c.plateNumber} — {c.brand} {c.model}</h3><p className="text-sm text-slate-500">{c.description}</p><p className="mt-2 text-xs text-red-500">{c.note || c.removedNote || c.reason || "Silinmə səbəbi yoxdur"}</p><button onClick={() => loadCar(c.id || c.carId)} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 font-black text-white">Detal</button></div>)}</div>
          </section>
        )}

        {tab === "moderators" && (
          <section className="rounded-[1.5rem] bg-white p-4 lg:rounded-[2rem] lg:p-6">
            <h2 className="mb-4 text-xl font-black lg:text-2xl">İstifadəçiyə admin ver və ya adminliyi ləğv et</h2>
            <form onSubmit={searchUsers} className="mb-5 flex flex-col gap-3 sm:flex-row"><input className="h-12 flex-1 rounded-2xl border px-4" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Ad və ya email yaz" /><button className="rounded-2xl bg-blue-600 px-7 py-3 font-black text-white">Axtar</button></form>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{searchedUsers.map((u) => { const id = u.id || u.userId; const roles = arr(u.roles); return <div key={id} className="rounded-3xl border p-4"><h3 className="font-black">{u.fullName || u.name || "Adsız istifadəçi"}</h3><p className="text-sm text-slate-500">{u.email || "Email yoxdur"}</p><p className="mt-1 text-xs text-slate-400">Rollar: {roles.length ? roles.join(", ") : "Rol yoxdur"}</p><div className="mt-4 flex flex-col gap-2 sm:flex-row"><button type="button" onClick={() => makeModerator(id)} className="rounded-xl bg-purple-600 px-4 py-2 font-black text-white">Admin et</button><button type="button" onClick={() => removeModerator(id)} className="rounded-xl bg-red-600 px-4 py-2 font-black text-white">Adminliyi ləğv et</button><button type="button" onClick={() => loadUser(id)} className="rounded-xl bg-slate-950 px-4 py-2 font-black text-white">Profil</button></div></div> })}</div>
          </section>
        )}

        {tab === "cars" && (
          <section className="rounded-[1.5rem] bg-white p-4 lg:rounded-[2rem] lg:p-6">
            <h2 className="mb-4 text-xl font-black lg:text-2xl">Nömrəyə görə maşın axtar</h2>
            <form onSubmit={searchCars} className="mb-5 flex flex-col gap-3 sm:flex-row"><input className="h-12 flex-1 rounded-2xl border px-4" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="77MF835" /><button className="rounded-2xl bg-blue-600 px-7 py-3 font-black text-white">Axtar</button></form>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{cars.map((c) => <button key={c.id || c.carId} onClick={() => loadCar(c.id || c.carId)} className="flex flex-col gap-4 rounded-3xl border p-4 text-left hover:bg-blue-50 sm:flex-row">{mainImg(c) ? <img src={mainImg(c)} className="h-44 w-full rounded-2xl object-cover sm:h-24 sm:w-32" /> : <div className="flex h-44 w-full items-center justify-center rounded-2xl bg-slate-100 text-xs font-black text-slate-400 sm:h-24 sm:w-32">Şəkil yoxdur</div>}<div><h3 className="font-black">{c.plateNumber} — {c.brand} {c.model}</h3><p className="text-sm text-slate-500">{c.description}</p></div></button>)}</div>
          </section>
        )}

        {tab === "payments" && (
          <section className="rounded-[1.5rem] bg-white p-4 lg:rounded-[2rem] lg:p-6"><h2 className="mb-4 text-xl font-black lg:text-2xl">Ödənişlər</h2><input className="mb-4 h-12 w-full rounded-2xl border px-4" value={paymentSearch} onChange={(e) => setPaymentSearch(e.target.value)} placeholder="İstifadəçiyə görə axtar..." /><div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{groupedPayments.map((g) => <button key={g.userId} onClick={() => setSelectedPaymentUser(g)} className="w-full rounded-3xl border p-4 text-left hover:bg-blue-50"><h3 className="font-black">{g.fullName}</h3><p className="text-sm text-slate-500">{g.email}</p><p className="mt-2 text-sm font-bold text-blue-600">{g.items.length} ödəniş</p></button>)}</div></section>
        )}

        {tab === "reports" && (
          <section className="rounded-[1.5rem] bg-white p-4 lg:rounded-[2rem] lg:p-6"><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-xl font-black lg:text-2xl">Gözləyən reportlar</h2><button onClick={loadReports} className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">Yenilə</button></div><input className="mb-4 h-12 w-full rounded-2xl border px-4" value={reportSearch} onChange={(e) => setReportSearch(e.target.value)} placeholder="Nömrə, report cümləsi və ya istifadəçiyə görə axtar..." /><div className="space-y-3">{filteredReports.map((r) => <button key={r.id} onClick={() => loadReport(r.id)} className="w-full rounded-3xl border p-4 text-left hover:bg-blue-50"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-black">{r.plateNumber} — {r.carBrand} {r.carModel}</h3><p className="text-sm text-slate-600">{r.description}</p><p className="text-xs text-slate-400">Şikayət edən: {r.reportedByFullName} • Status: {reportStatusText(r.status)}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={(e) => { e.stopPropagation(); loadCar(r.carId) }} className="rounded-2xl bg-blue-600 px-4 py-2 font-black text-white">Maşına bax</button><button type="button" onClick={(e) => { e.stopPropagation(); setReportUnderReview(r.id) }} className="rounded-2xl bg-yellow-500 px-4 py-2 font-black text-white">Baxışa al</button></div></div></button>)}</div></section>
        )}

        {tab === "resolvedReports" && (
          <section className="rounded-[1.5rem] bg-white p-4 lg:rounded-[2rem] lg:p-6"><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-xl font-black lg:text-2xl">Həll olunmuş reportlar</h2><button onClick={loadResolvedReports} className="rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">Yenilə</button></div><input className="mb-4 h-12 w-full rounded-2xl border px-4" value={resolvedReportSearch} onChange={(e) => setResolvedReportSearch(e.target.value)} placeholder="Nömrə, report cümləsi, nəticə və ya istifadəçiyə görə axtar..." /><div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{filteredResolvedReports.map((r) => <button key={r.id} onClick={() => loadReport(r.id)} className="rounded-3xl border p-4 text-left hover:bg-blue-50"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="font-black">{r.plateNumber || "Nömrə yoxdur"}</h3><p className="mt-1 text-sm font-semibold text-slate-700">{r.description || "Report mətni yoxdur"}</p><p className="mt-2 text-xs text-slate-400">Status: {reportStatusText(r.status)} • Baxan: {r.reviewedByAdminFullName || "Yoxdur"}</p></div><Badge good>Həll olunub</Badge></div></button>)}</div></section>
        )}

        {tab === "packages" && (
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]"><form onSubmit={savePackage} className="rounded-[1.5rem] bg-white p-4 lg:rounded-[2rem] lg:p-6"><h2 className="mb-4 text-xl font-black lg:text-2xl">{selectedPackage ? "Paketi yenilə" : "Yeni paket yarat"}</h2>{[["name", "Ad"], ["durationDays", "Gün sayı"], ["price", "Qiymət"], ["currency", "Valyuta"], ["sortOrder", "Sıralama"]].map(([k, l]) => <input key={k} className="mb-3 h-12 w-full rounded-2xl border px-4" placeholder={l} type={["durationDays", "price", "sortOrder"].includes(k) ? "number" : "text"} value={packageForm[k]} onChange={(e) => setPackageForm({ ...packageForm, [k]: e.target.value })} />)}<label className="mb-3 flex gap-2 font-bold"><input type="checkbox" checked={packageForm.isVip} onChange={(e) => setPackageForm({ ...packageForm, isVip: e.target.checked })} /> VIP paket</label>{selectedPackage && <label className="mb-3 flex gap-2 font-bold"><input type="checkbox" checked={packageForm.isActive} onChange={(e) => setPackageForm({ ...packageForm, isActive: e.target.checked })} /> Aktivdir</label>}<button className="h-12 w-full rounded-2xl bg-blue-600 font-black text-white">{selectedPackage ? "Yenilə" : "Yarat"}</button></form><div className="rounded-[1.5rem] bg-white p-4 lg:rounded-[2rem] lg:p-6"><h2 className="mb-4 text-xl font-black lg:text-2xl">Paketlər</h2><div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{packages.map((p) => <div key={p.id} className="rounded-3xl border p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-black">{p.name}</h3><p className="text-sm text-slate-500">{p.price} {p.currency} • {p.durationDays} gün</p></div>{p.isActive ? <Badge good>Aktiv</Badge> : <Badge>Passiv</Badge>}</div><button onClick={() => editPackage(p)} className="mt-4 rounded-xl bg-slate-950 px-4 py-2 font-black text-white">Düzəlt</button></div>)}</div></div></section>
        )}

        {tab === "audit" && (
          <section className="rounded-[1.5rem] bg-white p-4 lg:rounded-[2rem] lg:p-6"><h2 className="mb-4 text-xl font-black lg:text-2xl">Audit loglar</h2><input className="mb-4 h-12 w-full rounded-2xl border px-4" value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)} placeholder="İstifadəçiyə görə axtar..." /><div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{groupedAudit.map((g) => <button key={g.userId} onClick={() => setSelectedAuditUser(g)} className="w-full rounded-3xl border p-4 text-left hover:bg-blue-50"><h3 className="font-black">{g.fullName}</h3><p className="text-sm text-slate-500">{g.email}</p><p className="mt-2 text-sm font-bold text-blue-600">{g.items.length} audit log</p></button>)}</div></section>
        )}

        {tab === "legal" && (
          <section className="rounded-[1.5rem] bg-white p-4 lg:rounded-[2rem] lg:p-6"><h2 className="mb-4 text-xl font-black lg:text-2xl">Hüquqi razılıqlar</h2><input className="mb-4 h-12 w-full rounded-2xl border px-4" value={legalSearch} onChange={(e) => setLegalSearch(e.target.value)} placeholder="İstifadəçiyə görə axtar..." /><div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{groupedLegal.map((g) => <button key={g.userId} onClick={() => setSelectedLegalUser(g)} className="w-full rounded-3xl border p-4 text-left hover:bg-blue-50"><h3 className="font-black">{g.fullName}</h3><p className="text-sm text-slate-500">{g.email}</p><p className="mt-2 text-sm font-bold text-blue-600">{g.items.length} razılıq</p></button>)}</div></section>
        )}
      </main>

      {selectedUser && <UserModal user={selectedUser} />}
      {selectedCar && <CarModal car={selectedCar} />}
      {selectedPayment && <PaymentModal payment={selectedPayment} />}

      {selectedPaymentUser && <Modal title={`${selectedPaymentUser.fullName} — ödənişlər`} onClose={() => setSelectedPaymentUser(null)}><div className="space-y-3">{selectedPaymentUser.items.map((p) => <button key={p.id} onClick={() => setSelectedPayment(p)} className="w-full rounded-3xl border p-4 text-left hover:bg-blue-50"><h3 className="font-black">{p.amount} {p.currency} — {p.packageName}</h3><p className="text-sm text-slate-500">{p.plateNumber} • {p.receiptNumber}</p></button>)}</div></Modal>}

      {selectedAuditUser && <Modal title={`${selectedAuditUser.fullName} — audit loglar`} onClose={() => setSelectedAuditUser(null)}><div className="space-y-3">{selectedAuditUser.items.map((l, index) => <div key={l.id || index} className="rounded-3xl border p-4"><h3 className="font-black">{l.actionType} — {l.entityName}</h3><p className="text-sm text-slate-500">{l.actorFullName} • {l.actorEmail}</p><p className="text-xs text-slate-400">{l.actionAt}</p></div>)}</div></Modal>}

      {selectedLegalUser && <Modal title={`${selectedLegalUser.fullName} — hüquqi razılıqlar`} onClose={() => setSelectedLegalUser(null)}><div className="space-y-3">{selectedLegalUser.items.map((c, index) => <div key={c.id || index} className="rounded-3xl border p-4"><h3 className="font-black">Razılıq tipi: {c.consentType}</h3><p className="text-sm text-slate-600">{c.consentTextSnapshot}</p><p className="text-xs text-slate-400">Qəbul tarixi: {c.acceptedAt}</p></div>)}</div></Modal>}

      {selectedReport && (
        <Modal title="Report detalları" onClose={() => setSelectedReport(null)} wide={false}>
          <div className="mb-4 rounded-3xl bg-yellow-50 p-4"><p className="font-black text-yellow-800">Report yazısı</p><p>{selectedReport.description}</p></div>
          <div className="mb-4 grid grid-cols-1 gap-3"><Info label="Maşın" value={`${selectedReport.plateNumber || ""} — ${selectedReport.carBrand || ""} ${selectedReport.carModel || ""}`} /><Info label="Şikayət edən" value={`${selectedReport.reportedByFullName || ""} — ${selectedReport.reportedByEmail || ""}`} /><Info label="Status" value={reportStatusText(selectedReport.status)} /><Info label="Baxan admin" value={selectedReport.reviewedByAdminFullName} /><Info label="Nəticə qeydi" value={selectedReport.actionTaken} /><Info label="Yaradılma tarixi" value={selectedReport.createdAt} /><Info label="Baxılma tarixi" value={selectedReport.reviewedAt} /></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><button onClick={() => loadCar(selectedReport.carId)} className="rounded-2xl bg-blue-600 px-4 py-3 font-black text-white">Maşına bax</button><button onClick={() => setReportUnderReview(selectedReport.id)} className="rounded-2xl bg-yellow-500 px-4 py-3 font-black text-white">Baxışa götür</button><button onClick={() => resolveReport(selectedReport.id)} className="rounded-2xl bg-emerald-600 px-4 py-3 font-black text-white">Reportu həll et</button><button onClick={() => rejectReport(selectedReport.id)} className="rounded-2xl bg-slate-900 px-4 py-3 font-black text-white">Reportu rədd et</button><button onClick={() => removeCar(selectedReport.carId)} className="rounded-2xl bg-red-600 px-4 py-3 font-black text-white">Maşını sil</button><button onClick={() => adminBanUser(selectedReport.ownerId || selectedReport.userId || selectedReport.reportedUserId)} className="rounded-2xl bg-red-700 px-4 py-3 font-black text-white">Maşın sahibini ban et</button></div>
          <div className="mt-5 grid grid-cols-1 gap-3">{Object.entries(selectedReport).map(([k, v]) => <Info key={k} label={k} value={typeof v === "object" ? JSON.stringify(v) : v} />)}</div>
        </Modal>
      )}
    </div>
  )
}
