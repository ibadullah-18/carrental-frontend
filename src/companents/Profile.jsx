import { useEffect, useMemo, useState } from "react"
import LexusBg from "../assets/lexus-bg.png"
import { useDarkmode } from "../stores/useDarkmode"
import { getAccessToken } from "../stores/auth"
import ImageLightbox from "./ImageLightbox"

const Profile = () => {
  const { isDarkmodeEnabled } = useDarkmode()

  const [userId, setUserId] = useState("")
  const [token, setToken] = useState("")

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("")
  const [profileImageUrl, setProfileImageUrl] = useState("")

  const [selectedImage, setSelectedImage] = useState(null)
  const [previewImage, setPreviewImage] = useState("")

  const [imageScale, setImageScale] = useState(1.15)
  const [imagePositionX, setImagePositionX] = useState(50)
  const [imagePositionY, setImagePositionY] = useState(50)

  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const imageSrc = useMemo(() => {
    if (previewImage) return previewImage
    if (profileImageUrl) return `http://localhost:5248${profileImageUrl}`
    return ""
  }, [previewImage, profileImageUrl])

  const getUserIdFromToken = (jwtToken) => {
    try {
      const payload = jwtToken.split(".")[1]
      const decodedPayload = JSON.parse(atob(payload))

      return (
        decodedPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] || ""
      )
    } catch {
      return ""
    }
  }

  const fetchUser = async (currentToken, currentUserId) => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(
        `http://localhost:5248/api/Users/${currentUserId}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${currentToken}`,
          },
        }
      )

      let data = null
      const text = await response.text()

      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = text
      }

      if (!response.ok) {
        throw new Error(data?.message || "User melumatlari getirilmedi")
      }

      setFullName(data?.fullName || "")
      setEmail(data?.email || "")
      setPhone(data?.phone || "")
      setDriverLicenseNumber(data?.driverLicenseNumber || "")
      setProfileImageUrl(data?.profileImageUrl || "")
    } catch (err) {
      setError(err.message || "Xeta bas verdi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const currentToken = getAccessToken()

    if (!currentToken) {
      setError("Istifadeci giris etmeyib")
      setLoading(false)
      return
    }

    const extractedUserId = getUserIdFromToken(currentToken)

    if (!extractedUserId) {
      setError("User ID tapilmadi")
      setLoading(false)
      return
    }

    setToken(currentToken)
    setUserId(extractedUserId)

    fetchUser(currentToken, extractedUserId)
  }, [])

  useEffect(() => {
    return () => {
      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage)
      }
    }
  }, [previewImage])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)

    setSelectedImage(file)
    setPreviewImage(localUrl)

    setImageScale(1.15)
    setImagePositionX(50)
    setImagePositionY(50)
  }

  const createCroppedImageFile = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = imageUrl

      img.onload = () => {
        const canvas = document.createElement("canvas")
        const size = 500

        canvas.width = size
        canvas.height = size

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Canvas tapilmadi"))
          return
        }

        const baseScale = Math.max(size / img.width, size / img.height)
        const finalScale = baseScale * imageScale

        const drawWidth = img.width * finalScale
        const drawHeight = img.height * finalScale

        const offsetX = (size - drawWidth) / 2 + ((imagePositionX - 50) / 50) * 80
        const offsetY = (size - drawHeight) / 2 + ((imagePositionY - 50) / 50) * 80

        ctx.save()
        ctx.beginPath()
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
        ctx.restore()

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Sekil hazirlanmadi"))
              return
            }

            const file = new File([blob], "profile-image.png", {
              type: "image/png",
            })

            resolve(file)
          },
          "image/png",
          1
        )
      }

      img.onerror = () => reject(new Error("Sekil oxunmadi"))
    })
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError("")
      setSuccess("")

      if (!fullName.trim()) {
        setError("Full name cannot be empty")
        return
      }

      if (!phone.trim()) {
        setError("Phone cannot be empty")
        return
      }

      if (!driverLicenseNumber.trim()) {
        setError("Driver license number cannot be empty")
        return
      }

      const formData = new FormData()
      formData.append("fullName", fullName.trim())
      formData.append("phone", phone.trim())
      formData.append("driverLicenseNumber", driverLicenseNumber.trim())

      if (selectedImage && previewImage) {
        const croppedFile = await createCroppedImageFile(previewImage)
        formData.append("profileImage", croppedFile)
      }

      const response = await fetch(`http://localhost:5248/api/Users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      let data = null
      const text = await response.text()

      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = text
      }

      if (!response.ok) {
        throw new Error(data?.message || "Profile update failed")
      }

      setSuccess("Profile updated successfully")
      setSelectedImage(null)

      await fetchUser(token, userId)
    } catch (err) {
      setError(err.message || "Profile update failed")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 relative"
        style={{ backgroundImage: `url(${LexusBg})` }}
      >
        <div className="absolute inset-0 bg-black/55"></div>

        <div
          className={`relative z-10 w-16 h-16 rounded-full border-4 ${
            isDarkmodeEnabled
              ? "border-white/30 border-t-white"
              : "border-white/30 border-t-yellow-400"
          } animate-spin`}
        ></div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-3 sm:px-4 md:px-6 py-8 sm:py-10 md:py-14 relative"
      style={{ backgroundImage: `url(${LexusBg})` }}
    >
      <div className="absolute inset-0 bg-black/55"></div>

      <div
        className={`relative z-10 w-full max-w-[380px] sm:max-w-[500px] md:max-w-[650px] rounded-[28px] shadow-2xl border backdrop-blur-md px-4 sm:px-6 md:px-8 py-6 sm:py-7 md:py-8 ${
          isDarkmodeEnabled
            ? "bg-white/10 border-white/20 text-white"
            : "bg-black/20 border-white/20 text-white"
        }`}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-7">
          My Profile
        </h1>

        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
          <div className="flex flex-col items-center">
            <div
              onClick={() => imageSrc && setIsViewerOpen(true)}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-white/30 shadow-xl bg-white/10 flex items-center justify-center cursor-zoom-in"
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: `${imagePositionX}% ${imagePositionY}%`,
                    transform: selectedImage ? `scale(${imageScale})` : "scale(1)",
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center px-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-9 h-9 mb-1 text-white/80"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.118a7.5 7.5 0 0115 0"
                    />
                  </svg>
                  <span className="text-xs text-white/80">No image</span>
                </div>
              )}
            </div>

            <label className="mt-4 cursor-pointer relative overflow-hidden inline-flex items-center justify-center px-4 py-2 rounded-xl bg-yellow-400 text-black font-semibold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300">
              <span className="relative z-10">Upload New Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {selectedImage && (
              <div className="w-full mt-5 rounded-2xl border border-white/15 bg-black/20 p-4">
                <h3 className="text-sm sm:text-base font-semibold mb-4 text-center">
                  Sekli daireye uygun ayarla
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm mb-2">
                      Zoom: {imageScale.toFixed(2)}x
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="2.5"
                      step="0.01"
                      value={imageScale}
                      onChange={(e) => setImageScale(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Sol / Sag: {imagePositionX}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={imagePositionX}
                      onChange={(e) => setImagePositionX(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">
                      Yuxari / Asagi: {imagePositionY}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={imagePositionY}
                      onChange={(e) => setImagePositionY(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm sm:text-base">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-[46px] sm:h-[50px] px-4 rounded-xl outline-none border bg-white/10 border-white/20 text-white placeholder-gray-300 backdrop-blur-sm focus:border-yellow-400 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm sm:text-base">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full h-[46px] sm:h-[50px] px-4 rounded-xl outline-none border bg-white/5 border-white/10 text-gray-300 placeholder-gray-400 cursor-not-allowed text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm sm:text-base">Phone</label>
            <input
              type="text"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-[46px] sm:h-[50px] px-4 rounded-xl outline-none border bg-white/10 border-white/20 text-white placeholder-gray-300 backdrop-blur-sm focus:border-yellow-400 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm sm:text-base">
              Driver License Number
            </label>
            <input
              type="text"
              placeholder="Enter your driver license number"
              value={driverLicenseNumber}
              onChange={(e) => setDriverLicenseNumber(e.target.value)}
              className="w-full h-[46px] sm:h-[50px] px-4 rounded-xl outline-none border bg-white/10 border-white/20 text-white placeholder-gray-300 backdrop-blur-sm focus:border-yellow-400 text-sm sm:text-base"
            />
          </div>

          {error && (
            <div className="w-full rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="w-full rounded-xl border border-green-400/30 bg-green-500/15 px-4 py-3 text-green-200 text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="group relative overflow-hidden w-full bg-yellow-400 text-black h-[48px] sm:h-[52px] rounded-xl hover:bg-yellow-500 disabled:opacity-60 font-semibold flex items-center justify-center shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out mt-2"
          >
            <span className="relative z-10 flex items-center justify-center">
              {saving ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Save Changes"
              )}
            </span>

            {!saving && (
              <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
            )}
          </button>
        </form>
      </div>

      <ImageLightbox
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        images={imageSrc ? [imageSrc] : []}
        currentIndex={0}
        setCurrentIndex={() => {}}
        title="Profile image"
      />
    </div>
  )
}

export default Profile