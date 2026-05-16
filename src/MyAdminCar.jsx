import { useEffect, useState } from "react"
import { apiFetch } from "./utils/apiFetch"
import { getAccessToken, setAccessToken, setRefreshToken, clearTokens } from "./utils/auth"

const API_BASE_URL = "https://localhost:52247"

const arr = (data) => Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.$values) ? data.$values : Array.isArray(data?.items) ? data.items : []
const unwrap = (data) => data?.data ?? data
const fileUrl = (url) => !url ? "" : url.startsWith("http") ? url : `${API_BASE_URL}${url}`

const getTokens = (data) => ({
  accessToken: data?.accessToken || data?.token || data?.jwtToken || data?.data?.accessToken || data?.data?.token || data?.data?.jwtToken || "",
  refreshToken: data?.refreshToken || data?.data?.refreshToken || "",
})

export default function MyAdminCar() {
  const [token, setToken] = useState(getAccessToken() || "")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [tab, setTab] = useState("reports")
  const [loading, setLoading] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const [reports, setReports] = useState([])
  const [bannedUsers, setBannedUsers] = useState([])
  const [removedCars, setRemovedCars] = useState([])
  const [packages, setPackages] = useState([])
  const [cars, setCars] = useState([])
  const [users, setUsers] = useState([])
  const [plate, setPlate] = useState("")
  const [query, setQuery] = useState("")
  const [selectedCar, setSelectedCar] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [ownerCache, setOwnerCache] = useState({})
  const [profile, setProfile] = useState({ fullName: "", phoneNumber: "", bio: "", city: "", instagramUrl: "", tikTokUrl: "", youTubeUrl: "", telegramUrl: "", websiteUrl: "", profileImage: null })

  const clear = () => { setError(""); setMessage(""); setSelectedCar(null); setSelectedUser(null) }
  const logout = () => { clearTokens(); setToken(""); setReports([]); setBannedUsers([]); setRemovedCars([]); setCars([]); setUsers([]); clear() }

  const request = async (url, options = {}) => {
    const res = await apiFetch(url, options)
    if (res.status === 401 || res.status === 403) {
      clearTokens(); setToken("")
      throw new Error("Sessiya bitib və ya bu hesab admin deyil")
    }
    if (!res.ok) {
      let msg = "Xəta baş verdi"
      try { const e = await res.json(); msg = e?.message || e?.title || JSON.stringify(e) } catch { msg = await res.text() }
      throw new Error(msg)
    }
    const text = await res.text()
    if (!text) return null
    try { return JSON.parse(text) } catch { return text }
  }

  const login = async (e) => {
    e.preventDefault(); setError(""); setLoginLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/Auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || "Email və ya şifrə yanlışdır")
      const { accessToken, refreshToken } = getTokens(data)
      if (!accessToken) throw new Error("Access token gəlmədi")
      const check = await fetch(`${API_BASE_URL}/api/Admin/reports/pending`, { headers: { Authorization: `Bearer ${accessToken}` } })
      if (check.status === 401 || check.status === 403) throw new Error("Admin yanlışdır. Bu hesab admin deyil")
      setAccessToken(accessToken); if (refreshToken) setRefreshToken(refreshToken)
      setToken(accessToken); setMessage("Admin girişi uğurludur")
    } catch (err) { clearTokens(); setToken(""); setError(err.message) } finally { setLoginLoading(false) }
  }

  const loadPackages = async () => { try { setPackages(arr(await request("/api/Packages"))) } catch (e) { setError(e.message) } }
  const packageName = (car) => car?.packageName || packages.find((p) => p.id === car?.currentPackageId)?.name || car?.currentPackageId || "Yoxdur"

  const loadOwner = async (userId) => {
    if (!userId) return null
    if (ownerCache[userId]) return ownerCache[userId]
    try {
      const data = unwrap(await request(`/api/Users/${userId}/public-profile`))
      setOwnerCache((p) => ({ ...p, [userId]: data }))
      return data
    } catch { return null }
  }

  const loadReports = async () => { setLoading(true); try { setReports(arr(await request("/api/Admin/reports/pending"))) } catch(e) { setError(e.message) } finally { setLoading(false) } }
  const loadBanned = async () => { setLoading(true); try { setBannedUsers(arr(await request("/api/Admin/banned-users"))) } catch(e) { setError(e.message) } finally { setLoading(false) } }
  const loadRemoved = async () => { setLoading(true); try { setRemovedCars(arr(await request("/api/Admin/removed-cars"))) } catch(e) { setError(e.message) } finally { setLoading(false) } }

  const loadCar = async (carId, reportInfo = null) => {
    if (!carId) return
    setLoading(true)
    try {
      const car = unwrap(await request(`/api/Admin/cars/${carId}`))
      const owner = await loadOwner(car?.userId)
      setSelectedCar({ ...car, ownerProfile: owner, reportInfo })
      setSelectedUser(null)
    } catch(e) { setError(e.message) } finally { setLoading(false) }
  }

  const searchCars = async (e) => {
    e.preventDefault(); if (!plate.trim()) return; clear(); setLoading(true)
    try { const data = await request(`/api/Cars/search?plate=${encodeURIComponent(plate.trim())}`); const list = arr(data); setCars(list.length ? list : data ? [unwrap(data)] : []) } catch(e) { setError(e.message) } finally { setLoading(false) }
  }

  const searchUsers = async (e) => {
    e.preventDefault(); if (!query.trim()) return; clear(); setLoading(true)
    try { const data = await request(`/api/Users/search?query=${encodeURIComponent(query.trim())}`); const list = arr(data); setUsers(list.length ? list : data ? [unwrap(data)] : []) } catch(e) { setError(e.message) } finally { setLoading(false) }
  }

  const removeCar = async (carId) => {
    const note = window.prompt("Maşını silmə səbəbini yaz:", "")
    if (note === null) return
    try { await request(`/api/Admin/cars/${carId}/remove`, { method: "PUT", body: JSON.stringify({ note }) }); setMessage("Maşın silindi"); setSelectedCar(null); loadRemoved(); if (tab === "reports") loadReports() } catch(e) { setError(e.message) }
  }

  const banUser = async (userId) => {
    const note = window.prompt("User ban səbəbini yaz:", "")
    if (note === null) return
    try { await request(`/api/Admin/users/${userId}/ban`, { method: "PUT", body: JSON.stringify({ note }) }); setMessage("User ban edildi"); setSelectedUser(null); loadBanned() } catch(e) { setError(e.message) }
  }

  const updateReport = async (reportId, action) => {
    let note = ""
    if (action === "resolve" || action === "reject") { note = window.prompt("Qeyd yaz:", ""); if (note === null) return }
    const url = action === "under-review" ? `/api/Admin/reports/${reportId}/under-review` : `/api/Admin/reports/${reportId}/${action}`
    try { await request(url, { method: "PUT", body: action === "under-review" ? undefined : JSON.stringify({ note }) }); setMessage("Report yeniləndi"); setSelectedCar(null); loadReports() } catch(e) { setError(e.message) }
  }

  const updateProfile = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(profile).forEach(([k, v]) => { if (k !== "profileImage") fd.append(k[0].toUpperCase() + k.slice(1), v || "") })
      if (profile.profileImage) fd.append("ProfileImage", profile.profileImage)
      await request("/api/Users/profile", { method: "PUT", body: fd })
      setMessage("Admin profili yeniləndi")
    } catch(e) { setError(e.message) } finally { setLoading(false) }
  }

  useEffect(() => { if (token) loadPackages() }, [token])
  useEffect(() => { if (!token) return; clear(); if (tab === "reports") loadReports(); if (tab === "banned") loadBanned(); if (tab === "removed") loadRemoved() }, [token, tab])

  const carImg = (car) => { const media = arr(car?.media); const img = media.find((m) => m.mediaType === 1 && m.isMain) || media.find((m) => m.mediaType === 1); return fileUrl(img?.fileUrl || img?.thumbnailUrl) }
  const Info = ({ label, value }) => <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs font-bold text-gray-500">{label}</p><p className="mt-1 break-words text-sm font-bold text-gray-900">{value ?? "Yoxdur"}</p></div>
  const Modal = ({ title, children, onClose }) => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl"><div className="mb-5 flex items-center justify-between border-b pb-4"><h2 className="text-2xl font-black text-gray-900">{title}</h2><button onClick={onClose} className="rounded-xl bg-gray-100 px-4 py-2 font-bold">Bağla</button></div>{children}</div></div>

  const CarModal = ({ car }) => {
    const media = arr(car.media), images = media.filter((m) => m.mediaType === 1), videos = media.filter((m) => m.mediaType === 2)
    const report = car.reportInfo, reportId = report?.id || report?.reportId
    return <Modal title={`${car.plateNumber || "Nömrə yoxdur"} — ${car.brand || ""} ${car.model || ""}`} onClose={() => setSelectedCar(null)}>
      {images.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{images.map((i) => <img key={i.id} src={fileUrl(i.fileUrl || i.thumbnailUrl)} className="h-40 w-full rounded-2xl object-cover" />)}</div> : <div className="rounded-2xl bg-gray-100 p-6 text-center text-gray-500">Şəkil yoxdur</div>}
      {videos.length > 0 && <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">{videos.map((v) => <video key={v.id} src={fileUrl(v.fileUrl)} controls className="h-56 w-full rounded-2xl bg-black object-cover" />)}</div>}
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Info label="ID" value={car.id} /><div className="rounded-xl bg-gray-50 p-3"><p className="text-xs font-bold text-gray-500">Owner</p><button className="mt-1 text-sm font-black text-blue-600" onClick={() => car.ownerProfile && setSelectedUser(car.ownerProfile)}>{car.ownerProfile?.fullName || car.ownerFullName || car.userId}</button><p className="text-xs text-gray-500">{car.ownerEmail}</p></div><Info label="Nömrə" value={car.plateNumber} />
        <Info label="Brand" value={car.brand} /><Info label="Model" value={car.model} /><Info label="İl" value={car.year} /><Info label="Rəng" value={car.color} /><Info label="Şəhər" value={car.city} /><Info label="Status" value={car.status} /><Info label="VIP" value={car.isVip ? "Bəli" : "Xeyr"} /><Info label="Baxış sayı" value={car.viewCount} /><Info label="Paket" value={packageName(car)} />
      </div>
      <div className="mt-4 rounded-2xl bg-gray-50 p-4"><p className="text-xs font-black text-gray-500">Açıqlama</p><p>{car.description || "Yoxdur"}</p></div>
      {report && <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4"><p className="font-black text-yellow-800">Report yazısı</p><p className="text-yellow-900">{report.description || report.note || "Yoxdur"}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => updateReport(reportId, "under-review")} className="rounded-xl bg-yellow-500 px-4 py-2 font-bold text-white">Baxılır et</button><button onClick={() => updateReport(reportId, "resolve")} className="rounded-xl bg-green-600 px-4 py-2 font-bold text-white">Həll et</button><button onClick={() => updateReport(reportId, "reject")} className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white">Rədd et</button></div></div>}
      <div className="mt-5 flex gap-3"><button onClick={() => removeCar(car.id || car.carId)} className="rounded-xl bg-red-700 px-4 py-2 font-bold text-white">Maşını sil</button>{car.userId && <button onClick={() => banUser(car.userId)} className="rounded-xl bg-gray-900 px-4 py-2 font-bold text-white">Owner ban et</button>}</div>
    </Modal>
  }

  const UserModal = ({ user }) => <Modal title={user.fullName || user.name || "User detalları"} onClose={() => setSelectedUser(null)}><div className="flex gap-5"><img src={fileUrl(user.profileImageUrl || user.imageUrl)} className="h-40 w-40 rounded-3xl object-cover bg-gray-100" /><div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2"><Info label="ID" value={user.id || user.userId} /><Info label="Ad Soyad" value={user.fullName || user.name} /><Info label="Email" value={user.email} /><Info label="Şəhər" value={user.city} /><Info label="Bio" value={user.bio} /></div></div><button onClick={() => banUser(user.id || user.userId)} className="mt-5 rounded-xl bg-red-600 px-4 py-2 font-bold text-white">User ban et</button></Modal>

  if (!token) return <div className="flex min-h-screen items-center justify-center bg-gray-100 p-5"><form onSubmit={login} className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl"><h1 className="text-3xl font-black">Admin Giriş</h1><p className="mt-2 text-gray-500">Yalnız admin hesabı ilə giriş mümkündür</p>{error && <div className="mt-5 rounded-2xl bg-red-100 p-3 font-semibold text-red-700">{error}</div>}<input className="mt-5 h-12 w-full rounded-2xl border px-4" type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required /><input className="mt-3 h-12 w-full rounded-2xl border px-4" type="password" placeholder="Şifrə" value={password} onChange={(e) => setPassword(e.target.value)} required /><button disabled={loginLoading} className="mt-5 h-12 w-full rounded-2xl bg-gray-900 font-bold text-white">{loginLoading ? "Yoxlanılır..." : "Daxil ol"}</button></form></div>

  return <div className="flex min-h-screen bg-gray-100"><aside className="fixed left-0 top-0 flex h-screen w-72 flex-col bg-gray-950 p-5 text-white"><h2 className="mb-6 text-2xl font-black">MyAdminCar</h2>{[["reports","Reportlar"],["cars","Maşın axtar"],["users","User axtar"],["banned","Banlanan userlər"],["removed","Silinən maşınlar"],["profile","Admin profil"]].map(([k,l])=><button key={k} onClick={()=>{clear();setTab(k)}} className={`mb-2 rounded-2xl px-4 py-3 text-left font-semibold ${tab===k?"bg-blue-600":"text-gray-300 hover:bg-white/10"}`}>{l}</button>)}<button onClick={logout} className="mt-auto rounded-2xl bg-red-600 px-4 py-3 font-bold">Çıxış</button></aside><main className="ml-72 flex-1 p-7"><div className="mb-5 rounded-3xl bg-white p-6"><h1 className="text-3xl font-black">Admin Panel</h1><p className="text-gray-500">Refresh token sistemi aktivdir</p></div>{error&&<div className="mb-4 rounded-2xl bg-red-100 p-3 font-semibold text-red-700">{error}</div>}{message&&<div className="mb-4 rounded-2xl bg-green-100 p-3 font-semibold text-green-700">{message}</div>}{loading&&<div className="mb-4 rounded-2xl bg-blue-100 p-3 font-semibold text-blue-700">Yüklənir...</div>}
    {tab==="reports"&&<section className="rounded-3xl bg-white p-6"><h2 className="mb-4 text-2xl font-black">Pending reportlar</h2><div className="space-y-3">{reports.map((r)=><button key={r.id||r.reportId} onClick={()=>loadCar(r.carId||r.car?.id,r)} className="w-full rounded-2xl border p-4 text-left hover:bg-blue-50"><h3 className="font-black">{r.car?.plateNumber||r.plateNumber||r.carId} — {r.user?.fullName||r.userFullName||"User"}</h3><p className="text-sm text-gray-600">{r.description||r.note||"Report yazısı yoxdur"}</p></button>)}</div></section>}
    {tab==="cars"&&<section className="rounded-3xl bg-white p-6"><h2 className="mb-4 text-2xl font-black">Maşını nömrəyə görə axtar</h2><form onSubmit={searchCars} className="mb-5 flex gap-3"><input className="h-12 flex-1 rounded-2xl border px-4" placeholder="77MF835" value={plate} onChange={(e)=>setPlate(e.target.value)}/><button className="rounded-2xl bg-blue-600 px-7 font-bold text-white">Axtar</button></form><div className="space-y-3">{cars.map((c)=><button key={c.id||c.carId} onClick={()=>loadCar(c.id||c.carId)} className="flex w-full gap-4 rounded-2xl border p-4 text-left hover:bg-blue-50">{carImg(c)?<img src={carImg(c)} className="h-20 w-28 rounded-2xl object-cover"/>:<div className="flex h-20 w-28 items-center justify-center rounded-2xl bg-gray-100 text-xs font-bold text-gray-400">Şəkil yoxdur</div>}<div><h3 className="font-black">{c.plateNumber} — {c.brand} {c.model}</h3><p className="text-sm text-gray-600">{c.description||"Açıqlama yoxdur"}</p></div></button>)}</div></section>}
    {tab==="users"&&<section className="rounded-3xl bg-white p-6"><h2 className="mb-4 text-2xl font-black">User axtar</h2><form onSubmit={searchUsers} className="mb-5 flex gap-3"><input className="h-12 flex-1 rounded-2xl border px-4" placeholder="Ad, email" value={query} onChange={(e)=>setQuery(e.target.value)}/><button className="rounded-2xl bg-blue-600 px-7 font-bold text-white">Axtar</button></form><div className="space-y-3">{users.map((u)=><button key={u.id||u.userId} onClick={()=>setSelectedUser(u)} className="flex w-full gap-4 rounded-2xl border p-4 text-left hover:bg-blue-50"><img src={fileUrl(u.profileImageUrl||u.imageUrl)} className="h-16 w-16 rounded-2xl object-cover bg-gray-100"/><div><h3 className="font-black">{u.fullName||u.name}</h3><p className="text-sm text-gray-600">{u.city||u.email}</p></div></button>)}</div></section>}
    {tab==="banned"&&<section className="rounded-3xl bg-white p-6"><h2 className="mb-4 text-2xl font-black">Banlanan userlər</h2>{bannedUsers.map((u)=><button key={u.id||u.userId} onClick={()=>setSelectedUser(u)} className="mb-3 w-full rounded-2xl border p-4 text-left"><b>{u.fullName||u.email}</b><p className="text-sm text-gray-500">{u.banNote||u.note||"Qeyd yoxdur"}</p></button>)}</section>}
    {tab==="removed"&&<section className="rounded-3xl bg-white p-6"><h2 className="mb-4 text-2xl font-black">Silinən maşınlar</h2>{removedCars.map((c)=><button key={c.id||c.carId} onClick={()=>loadCar(c.id||c.carId)} className="mb-3 w-full rounded-2xl border p-4 text-left"><b>{c.plateNumber} — {c.brand} {c.model}</b><p className="text-sm text-gray-500">{c.removeNote||c.description}</p></button>)}</section>}
    {tab==="profile"&&<section className="rounded-3xl bg-white p-6"><h2 className="mb-4 text-2xl font-black">Admin profilini düzəlt</h2><form onSubmit={updateProfile} className="grid grid-cols-1 gap-3 md:grid-cols-2">{[["fullName","Ad Soyad"],["phoneNumber","Telefon"],["city","Şəhər"],["instagramUrl","Instagram"],["tikTokUrl","TikTok"],["youTubeUrl","YouTube"],["telegramUrl","Telegram"],["websiteUrl","Website"]].map(([k,l])=><input key={k} className="h-12 rounded-2xl border px-4" placeholder={l} value={profile[k]} onChange={(e)=>setProfile({...profile,[k]:e.target.value})}/>) }<textarea className="min-h-28 rounded-2xl border p-4 md:col-span-2" placeholder="Bio" value={profile.bio} onChange={(e)=>setProfile({...profile,bio:e.target.value})}/><input className="rounded-2xl border p-3 md:col-span-2" type="file" accept="image/*" onChange={(e)=>setProfile({...profile,profileImage:e.target.files?.[0]||null})}/><button className="h-12 rounded-2xl bg-gray-900 font-bold text-white md:col-span-2">Profili yenilə</button></form></section>}
    </main>{selectedCar&&<CarModal car={selectedCar}/>} {selectedUser&&<UserModal user={selectedUser}/>}</div>
}
