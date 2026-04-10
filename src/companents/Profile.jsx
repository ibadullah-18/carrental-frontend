import { useEffect, useMemo, useState } from "react"
import { useDarkmode } from "../stores/useDarkmode"
import { apiFetch } from "../utils/apiFetch"
import { getAccessToken, parseJwt } from "../utils/auth"

const BASE_URL = "http://localhost:5248"

const Profile = () => {
  const { isDarkmodeEnabled } = useDarkmode()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("")
  const [profileImage, setProfileImage] = useState(null)
  const [previewImage, setPreviewImage] = useState("")
  const [existingProfileImage, setExistingProfileImage] = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const token = getAccessToken()

  const userId = useMemo(() => {
    const payload = parseJwt(token)
    return (
      payload?.nameid ||
      payload?.sub ||
      payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      ""
    )
  }, [token])

  const getFullImageUrl = (url) => {
    if (!url) return ""
    if (url.startsWith("http://") || url.startsWith("https://")) return url
    return `${BASE_URL}${url}`
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError("")
        setSuccess("")

        if (!userId) {
          throw new Error("User ID not found")
        }

        const response = await apiFetch(`/api/Users/${userId}`, {
          method: "GET",
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.Message ||
              "Error occurred while loading profile data"
          )
        }

        setFullName(data?.fullName || "")
        setEmail(data?.email || "")
        setPhone(data?.phone || "")
        setDriverLicenseNumber(data?.driverLicenseNumber || "")
        setExistingProfileImage(data?.profileImageUrl || "")
      } catch (err) {
        setError(err.message || "Error occurred while loading profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  useEffect(() => {
    if (!profileImage) {
      setPreviewImage("")
      return
    }

    const objectUrl = URL.createObjectURL(profileImage)
    setPreviewImage(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [profileImage])

  const validateForm = () => {
    if (!fullName.trim()) {
      return "Full name cannot be empty"
    }

    if (!email.trim()) {
      return "Email cannot be empty"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Email format is incorrect."
    }

    if (newPassword.trim() && !currentPassword.trim()) {
      return "If you enter a new password, you must also enter the current password"
    }

    if (newPassword.trim() && newPassword.trim().length < 8) {
      return "New password must be at least 8 characters long."
    }

    return ""
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProfileImage(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      const validationError = validateForm()
      if (validationError) {
        throw new Error(validationError)
      }

      const formData = new FormData()
      formData.append("FullName", fullName.trim())
      formData.append("Phone", phone.trim())
      formData.append("DriverLicenseNumber", driverLicenseNumber.trim())
      formData.append("Email", email.trim())

      if (currentPassword.trim()) {
        formData.append("CurrentPassword", currentPassword.trim())
      }

      if (newPassword.trim()) {
        formData.append("NewPassword", newPassword.trim())
      }

      if (profileImage) {
        formData.append("ProfileImage", profileImage)
      }

      const response = await apiFetch(`/api/Users/${userId}`, {
        method: "PUT",
        body: formData,
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.Message ||
            "Error occurred while updating profile"
        )
      }

      setSuccess("Profile updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setProfileImage(null)

      if (data?.profileImageUrl) {
        setExistingProfileImage(data.profileImageUrl)
      } else if (profileImage && previewImage) {
        setExistingProfileImage("")
      }
    } catch (err) {
      setError(err.message || "Error occurred while updating profile")
    } finally {
      setSaving(false)
    }
  }

  const containerClass = isDarkmodeEnabled
    ? "min-h-screen bg-black text-white"
    : "min-h-screen bg-white text-black"

  const cardClass = isDarkmodeEnabled
    ? "bg-zinc-900 border border-zinc-800"
    : "bg-white border border-zinc-200"

  const inputClass = isDarkmodeEnabled
    ? "w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-yellow-400"
    : "w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-black outline-none transition focus:border-yellow-500"

  const labelClass = isDarkmodeEnabled
    ? "mb-2 block text-sm font-medium text-zinc-300"
    : "mb-2 block text-sm font-medium text-zinc-700"

  const secondaryTextClass = isDarkmodeEnabled ? "text-zinc-400" : "text-zinc-500"

  const shownImage =
    previewImage || getFullImageUrl(existingProfileImage) || "/default-avatar.png"

  if (loading) {
    return (
      <div className={`${containerClass} flex items-center justify-center px-4 py-10`}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent"></div>
          <p className="text-lg font-medium">Profile is loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${containerClass} px-4 py-8 sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Profile settings</h1>
          <p className={`mt-2 text-sm sm:text-base ${secondaryTextClass}`}>
            From here you can update your profile picture, email, and password.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-2xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`grid gap-6 rounded-3xl p-4 shadow-xl sm:p-6 lg:grid-cols-[320px_1fr] ${cardClass}`}
        >
          <div className="flex flex-col items-center rounded-3xl border border-yellow-400/20 p-5">
            <div className="relative mb-4 h-40 w-40 overflow-hidden rounded-full border-4 border-yellow-400 shadow-lg">
              <img
                src={shownImage}
                alt="Profile image"
                className="h-full w-full object-cover"
              />
            </div>

            <label className="w-full cursor-pointer rounded-2xl bg-yellow-400 px-4 py-3 text-center font-semibold text-black transition hover:scale-[1.02]">
              Select image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <p className={`mt-3 text-center text-xs ${secondaryTextClass}`}>
              If you select a new image, it will be updated after saving.
            </p>
          </div>

          <div className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="Email"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  placeholder="Phone"
                />
              </div>

              <div>
                <label className={labelClass}>Driver's license number</label>
                <input
                  type="text"
                  value={driverLicenseNumber}
                  onChange={(e) => setDriverLicenseNumber(e.target.value)}
                  className={inputClass}
                  placeholder="Driver's license number"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-yellow-400/20 p-4">
              <h2 className="mb-4 text-xl font-semibold">Change password</h2>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Current password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`${inputClass} pr-14`}
                      placeholder="Current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-yellow-400 px-3 py-1 text-xs font-semibold text-black"
                    >
                      {showCurrentPassword ? "Hide it" : "Show it"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>New password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${inputClass} pr-14`}
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-yellow-400 px-3 py-1 text-xs font-semibold text-black"
                    >
                      {showNewPassword ? "Hide it" : "Show it"}
                    </button>
                  </div>
                </div>
              </div>

              <p className={`mt-3 text-xs ${secondaryTextClass}`}>
                If you don't want to change your password, leave this section blank.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Yenilənir..." : "Yadda saxla"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile