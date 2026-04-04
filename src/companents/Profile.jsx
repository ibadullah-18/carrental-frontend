import { useEffect, useMemo, useState } from "react";
import LexusBg from "../assets/lexus-bg.png";
import { useDarkmode } from "../stores/useDarkmode";
import { getAccessToken } from "../stores/auth";

const Profile = () => {
  const { isDarkmodeEnabled } = useDarkmode();

  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const imageSrc = useMemo(() => {
    if (previewImage) return previewImage;
    if (profileImageUrl) return `http://localhost:5248${profileImageUrl}`;
    return "";
  }, [previewImage, profileImageUrl]);

  const getUserIdFromToken = (jwtToken) => {
    try {
      const payload = jwtToken.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));

      return (
        decodedPayload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] || ""
      );
    } catch {
      return "";
    }
  };

  const fetchUser = async (currentToken, currentUserId) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5248/api/Users/${currentUserId}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      let data = null;
      const text = await response.text();

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!response.ok) {
        throw new Error(data?.message || "User məlumatları gətirilə bilmədi");
      }

      setFullName(data?.fullName || "");
      setEmail(data?.email || "");
      setPhone(data?.phone || "");
      setDriverLicenseNumber(data?.driverLicenseNumber || "");
      setProfileImageUrl(data?.profileImageUrl || "");
    } catch (err) {
      setError(err.message || "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentToken = getAccessToken();

    if (!currentToken) {
      setError("İstifadəçi giriş etməyib");
      setLoading(false);
      return;
    }

    const extractedUserId = getUserIdFromToken(currentToken);

    if (!extractedUserId) {
      setError("User ID tapılmadı");
      setLoading(false);
      return;
    }

    setToken(currentToken);
    setUserId(extractedUserId);

    fetchUser(currentToken, extractedUserId);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!fullName.trim()) {
        setError("Full name cannot be empty");
        return;
      }

      if (!phone.trim()) {
        setError("Phone cannot be empty");
        return;
      }

      if (!driverLicenseNumber.trim()) {
        setError("Driver license number cannot be empty");
        return;
      }

      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("phone", phone.trim());
      formData.append("driverLicenseNumber", driverLicenseNumber.trim());

      if (selectedImage) {
        formData.append("profileImage", selectedImage);
      }

      const response = await fetch(`http://localhost:5248/api/Users/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      let data = null;
      const text = await response.text();

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!response.ok) {
        throw new Error(data?.message || "Profile update failed");
      }

      setSuccess("Profile updated successfully");
      setSelectedImage(null);

      await fetchUser(token, userId);
    } catch (err) {
      setError(err.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

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
    );
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
          {/* PROFILE IMAGE */}
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-white/30 shadow-xl bg-white/10 flex items-center justify-center">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Profile"
                  className="w-full h-full object-cover"
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
          </div>

          {/* FULL NAME */}
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

          {/* EMAIL */}
          <div>
            <label className="block mb-2 text-sm sm:text-base">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full h-[46px] sm:h-[50px] px-4 rounded-xl outline-none border bg-white/5 border-white/10 text-gray-300 placeholder-gray-400 cursor-not-allowed text-sm sm:text-base"
            />
          </div>

          {/* PHONE */}
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

          {/* DRIVER LICENSE */}
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

          {/* MESSAGES */}
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

          {/* SAVE BUTTON */}
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
    </div>
  );
};

export default Profile;