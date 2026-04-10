import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDarkmode } from "../stores/useDarkmode"
import { getAccessToken } from "../utils/auth"
import { apiFetch } from "../utils/apiFetch"
import { REGION_OPTIONS } from "../data/regions"
import {
  BODY_TYPE_OPTIONS,
  CAR_BRANDS,
  COLOR_OPTIONS,
  FUEL_OPTIONS,
  TRANSMISSION_OPTIONS,
  YEAR_OPTIONS,
} from "../data/carOptions"

const API_BASE = "http://localhost:5248"

const UpdateCar = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isDarkmodeEnabled } = useDarkmode()
  const token = getAccessToken()

  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [year, setYear] = useState("")
  const [pricePerDay, setPricePerDay] = useState("")
  const [fuelType, setFuelType] = useState("")
  const [transmission, setTransmission] = useState("")
  const [mileage, setMileage] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [color, setColor] = useState("")
  const [bodyType, setBodyType] = useState("")

  const [images, setImages] = useState([])
  const [mainNewImageIndex, setMainNewImageIndex] = useState(0)

  const [existingImages, setExistingImages] = useState([])
  const [visibleBrandCount, setVisibleBrandCount] = useState(6)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingImageId, setDeletingImageId] = useState(null)
  const [settingMainImageId, setSettingMainImageId] = useState(null)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const getImageUrl = (path) => {
    if (!path) return "https://placehold.co/600x400?text=No+Image"

    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path
    }

    return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`
  }

  const availableModels = useMemo(() => {
    const selectedBrand = CAR_BRANDS.find((item) => item.brand === brand)
    return selectedBrand ? selectedBrand.models : []
  }, [brand])

  const imagePreviewUrls = useMemo(() => {
    return images.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
  }, [images])

  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [imagePreviewUrls])

  const normalizeImages = (carData) => {
    if (Array.isArray(carData?.images)) return carData.images
    if (Array.isArray(carData?.Images)) return carData.Images
    if (Array.isArray(carData?.images?.$values)) return carData.images.$values
    if (Array.isArray(carData?.Images?.$values)) return carData.Images.$values
    return []
  }

  const fillForm = (carData) => {
    setBrand(carData.brand || carData.Brand || "")
    setModel(carData.model || carData.Model || "")
    setYear(String(carData.year || carData.Year || ""))
    setPricePerDay(String(carData.pricePerDay || carData.PricePerDay || ""))
    setFuelType(carData.fuelType || carData.FuelType || "")
    setTransmission(carData.transmission || carData.Transmission || "")
    setMileage(String(carData.mileage || carData.Mileage || ""))
    setDescription(carData.description || carData.Description || "")
    setLocation(carData.location || carData.Location || "")
    setColor(carData.color || carData.Color || "")
    setBodyType(String(carData.bodyType ?? carData.BodyType ?? ""))
    setExistingImages(normalizeImages(carData))
  }

  const fetchCar = async () => {
    try {
      setLoading(true)
      setError("")

      if (!token) {
        setError("You must be logged in")
        return
      }

      const response = await apiFetch(`/api/Cars/${id}`, {
        method: "GET",
        headers: {
          Accept: "*/*",
        },
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.Message || data?.message || "Car not found")
      }

      fillForm(data)
    } catch (err) {
      console.log(err)
      setError(err.message || "Car data could not be loaded")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCar()
  }, [id])

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    setImages((prev) => [...prev, ...selectedFiles])
    e.target.value = ""
  }

  const handleRemoveSelectedImage = (removeIndex) => {
    setImages((prev) => {
      const updated = prev.filter((_, index) => index !== removeIndex)

      setMainNewImageIndex((prevMainIndex) => {
        if (updated.length === 0) return 0
        if (removeIndex === prevMainIndex) return 0
        if (removeIndex < prevMainIndex) return prevMainIndex - 1
        return prevMainIndex >= updated.length ? 0 : prevMainIndex
      })

      return updated
    })
  }

  const handleSetSelectedMainImage = (index) => {
    setMainNewImageIndex(index)
  }

  const handleDeleteImage = async (imageId) => {
    try {
      setDeletingImageId(imageId)
      setError("")
      setSuccess("")

      const response = await apiFetch(`/api/Cars/images/${imageId}`, {
        method: "DELETE",
        headers: {
          Accept: "*/*",
        },
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.Message || data?.message || "Image could not be deleted")
      }

      setSuccess("Image deleted successfully")
      await fetchCar()
    } catch (err) {
      console.log(err)
      setError(err.message || "Image delete failed")
    } finally {
      setDeletingImageId(null)
    }
  }

  const handleSetMainImage = async (imageId) => {
    try {
      setSettingMainImageId(imageId)
      setError("")
      setSuccess("")

      const response = await apiFetch(`/api/Cars/images/${imageId}/set-main`, {
        method: "PUT",
        headers: {
          Accept: "*/*",
        },
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.Message || data?.message || "Main image could not be updated")
      }

      setSuccess("Main image updated successfully")
      await fetchCar()
    } catch (err) {
      console.log(err)
      setError(err.message || "Main image update failed")
    } finally {
      setSettingMainImageId(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!token) {
      setError("You must be logged in")
      return
    }

    if (
      !brand ||
      !model ||
      !year ||
      !pricePerDay ||
      !fuelType ||
      !transmission ||
      !mileage ||
      !description ||
      !location ||
      !color ||
      bodyType === ""
    ) {
      setError("Please fill in all fields")
      return
    }

    try {
      setSubmitting(true)

      const updateFormData = new FormData()
      updateFormData.append("Brand", brand)
      updateFormData.append("Model", model)
      updateFormData.append("Year", year)
      updateFormData.append("PricePerDay", pricePerDay)
      updateFormData.append("FuelType", fuelType)
      updateFormData.append("Transmission", transmission)
      updateFormData.append("Mileage", mileage)
      updateFormData.append("Description", description)
      updateFormData.append("Location", location)
      updateFormData.append("Color", color)
      updateFormData.append("BodyType", bodyType)

      const updateResponse = await apiFetch(`/api/Cars/${id}`, {
        method: "PUT",
        body: updateFormData,
      })

      const updateText = await updateResponse.text()

      if (!updateResponse.ok) {
        throw new Error(updateText || "Car could not be updated")
      }

      let uploadedImageIds = []

      if (images.length > 0) {
        for (const image of images) {
          const imageFormData = new FormData()
          imageFormData.append("file", image)

          const imageResponse = await apiFetch(`/api/Cars/${id}/images`, {
            method: "POST",
            body: imageFormData,
          })

          const imageContentType = imageResponse.headers.get("content-type") || ""

          if (!imageResponse.ok) {
            const imageText = await imageResponse.text()
            throw new Error(imageText || "Image could not be added")
          }

          if (imageContentType.includes("application/json")) {
            const uploadedImage = await imageResponse.json()
            uploadedImageIds.push(uploadedImage?.id || uploadedImage?.Id)
          } else {
            uploadedImageIds.push(null)
          }
        }

        const selectedMainImageId = uploadedImageIds[mainNewImageIndex]

        if (selectedMainImageId) {
          const setMainResponse = await apiFetch(`/api/Cars/images/${selectedMainImageId}/set-main`, {
            method: "PUT",
            headers: {
              Accept: "*/*",
            },
          })

          const setMainText = await setMainResponse.text()

          if (!setMainResponse.ok) {
            throw new Error(setMainText || "Main image could not be updated")
          }
        }
      }

      setSuccess("Car updated successfully")
      setImages([])
      setMainNewImageIndex(0)
      await fetchCar()
    } catch (err) {
      console.log("Update error:", err)
      setError(err.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const inputClassName = `w-full p-3 rounded-xl outline-none border ${
    isDarkmodeEnabled
      ? "bg-white/10 border-white/20 text-white placeholder-gray-300"
      : "bg-black/5 border-black/10 text-black placeholder-gray-500"
  }`

  const cardClassName = isDarkmodeEnabled
    ? "bg-[#111111] border-[#2a2a2a] text-white"
    : "bg-[#f7f7f7] border-[#e5e5e5] text-black"

  const visibleBrands = CAR_BRANDS.slice(0, visibleBrandCount)

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkmodeEnabled ? "bg-[#1a1a1a] text-white" : "bg-white text-black"
        }`}
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="font-semibold text-lg">Loading car...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full min-h-screen ${isDarkmodeEnabled ? "bg-[#1a1a1a] text-white" : "bg-white text-black"}`}>
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10">
        <div className={`rounded-[24px] sm:rounded-[28px] border p-5 sm:p-7 ${cardClassName}`}>
          <h1 className="text-[24px] sm:text-[32px] lg:text-[40px] font-bold text-center">
            Update Car
          </h1>
          <p className={`text-center mt-3 text-sm sm:text-base ${isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"}`}>
            Change only what you want, current values are already loaded
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
          <div className="xl:col-span-5">
            <div className={`rounded-[24px] sm:rounded-[28px] border p-4 sm:p-6 ${cardClassName}`}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold">Select Brand</h2>
                <div className={`text-sm ${isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"}`}>
                  {brand || "No brand selected"}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {visibleBrands.map((item) => {
                  const isSelected = brand === item.brand

                  return (
                    <button
                      key={item.brand}
                      type="button"
                      onClick={() => {
                        setBrand(item.brand)
                        setModel("")
                      }}
                      className={`rounded-[18px] border p-4 text-center font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                        isSelected
                          ? "bg-yellow-400 text-black border-yellow-400"
                          : isDarkmodeEnabled
                          ? "bg-[#1a1a1a] border-[#2d2d2d] text-white hover:bg-[#202020]"
                          : "bg-white border-[#dddddd] text-black hover:bg-[#fafafa]"
                      }`}
                    >
                      <div className="text-base sm:text-lg">{item.brand}</div>
                    </button>
                  )
                })}
              </div>

              {visibleBrandCount < CAR_BRANDS.length && (
                <div className="flex justify-center mt-6">
                  <button
                    type="button"
                    onClick={() => setVisibleBrandCount((prev) => prev + 6)}
                    className="group relative overflow-hidden px-6 sm:px-8 py-3 rounded-full font-semibold bg-yellow-400 text-black shadow-md hover:shadow-xl hover:bg-yellow-500 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out"
                  >
                    <span className="relative z-10">Load More</span>
                    <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
                  </button>
                </div>
              )}
            </div>

            <div className={`rounded-[24px] sm:rounded-[28px] border p-4 sm:p-6 mt-6 ${cardClassName}`}>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Current Images</h2>

              {existingImages.length === 0 ? (
                <p className={isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"}>
                  No images found
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {existingImages.map((image, index) => {
                    const imageId = image.id || image.Id
                    const isMain = image.isMain || image.IsMain
                    const imageUrl = image.imageUrl || image.ImageUrl

                    return (
                      <div
                        key={imageId}
                        className={`rounded-[18px] overflow-hidden border ${
                          isDarkmodeEnabled
                            ? "border-[#2a2a2a] bg-[#1a1a1a]"
                            : "border-[#e5e5e5] bg-white"
                        }`}
                      >
                        <img
                          src={getImageUrl(imageUrl)}
                          alt={`existing-${index}`}
                          className="w-full h-[140px] sm:h-[180px] object-cover"
                        />

                        <div className="p-2">
                          <div className="text-xs sm:text-sm mb-2 font-medium">
                            {isMain ? "Main image" : `Image ${index + 1}`}
                          </div>

                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(imageId)}
                              disabled={isMain || settingMainImageId === imageId}
                              className={`w-full py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                                isMain
                                  ? "bg-green-500 text-white cursor-default"
                                  : "bg-blue-500 text-white hover:opacity-90 disabled:opacity-50"
                              }`}
                            >
                              {isMain
                                ? "Main Image"
                                : settingMainImageId === imageId
                                ? "Processing..."
                                : "Set Main"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteImage(imageId)}
                              disabled={deletingImageId === imageId}
                              className="w-full py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-500 text-white hover:opacity-90 disabled:opacity-50 transition"
                            >
                              {deletingImageId === imageId ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className={`rounded-[24px] sm:rounded-[28px] border p-4 sm:p-6 mt-6 ${cardClassName}`}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-bold">Add New Images</h2>
                <div className={`text-sm ${isDarkmodeEnabled ? "text-gray-400" : "text-gray-500"}`}>
                  {images.length} image selected
                </div>
              </div>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className={inputClassName}
              />

              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
                  {imagePreviewUrls.map((item, index) => {
                    const isMain = index === mainNewImageIndex

                    return (
                      <div
                        key={`${item.file.name}-${index}-${item.file.lastModified}`}
                        className={`rounded-[18px] overflow-hidden border ${
                          isDarkmodeEnabled
                            ? "border-[#2a2a2a] bg-[#1a1a1a]"
                            : "border-[#e5e5e5] bg-white"
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={`preview-${index}`}
                          className="w-full h-[140px] sm:h-[180px] object-cover"
                        />

                        <div className="p-3">
                          <div className="px-0 py-0 text-xs sm:text-sm truncate mb-2">
                            {item.file.name}
                          </div>

                          <div className="text-xs sm:text-sm font-medium mb-3">
                            {isMain ? "Main image" : `New image ${index + 1}`}
                          </div>

                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => handleSetSelectedMainImage(index)}
                              disabled={isMain}
                              className={`w-full py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                                isMain
                                  ? "bg-green-500 text-white cursor-default"
                                  : "bg-blue-500 text-white hover:opacity-90"
                              }`}
                            >
                              {isMain ? "Main Image" : "Set Main"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveSelectedImage(index)}
                              className="w-full py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-500 text-white hover:opacity-90 transition"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-7">
            <div className={`rounded-[24px] sm:rounded-[28px] border p-4 sm:p-6 ${cardClassName}`}>
              <h2 className="text-xl sm:text-2xl font-bold mb-6">Car Details</h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm sm:text-base">Brand</label>
                    <input
                      type="text"
                      value={brand}
                      readOnly
                      placeholder="Select a brand from the left"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm sm:text-base">Model</label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className={inputClassName}
                      disabled={!brand}
                    >
                      <option value="">
                        {brand ? "Select model" : "Select brand first"}
                      </option>
                      {availableModels.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm sm:text-base">Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className={inputClassName}
                    >
                      <option value="">Select year</option>
                      {YEAR_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm sm:text-base">Fuel Type</label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      className={inputClassName}
                    >
                      <option value="">Select fuel type</option>
                      {FUEL_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm sm:text-base">Transmission</label>
                    <select
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value)}
                      className={inputClassName}
                    >
                      <option value="">Select transmission</option>
                      {TRANSMISSION_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm sm:text-base">Color</label>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className={inputClassName}
                    >
                      <option value="">Select color</option>
                      {COLOR_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm sm:text-base">Region</label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className={inputClassName}
                    >
                      <option value="">Select region</option>
                      {REGION_OPTIONS.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm sm:text-base">Body Type</label>
                    <select
                      value={bodyType}
                      onChange={(e) => setBodyType(e.target.value)}
                      className={inputClassName}
                    >
                      <option value="">Select body type</option>
                      {BODY_TYPE_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm sm:text-base">Price Per Day</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={pricePerDay}
                      onChange={(e) => setPricePerDay(e.target.value)}
                      placeholder="Enter daily price"
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm sm:text-base">Mileage</label>
                    <input
                      type="number"
                      min="0"
                      value={mileage}
                      onChange={(e) => setMileage(e.target.value)}
                      placeholder="Enter mileage"
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm sm:text-base">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Write car details"
                    className={`${inputClassName} resize-none`}
                  />
                </div>

                {error && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm ${
                      isDarkmodeEnabled
                        ? "bg-red-500/10 text-red-300 border border-red-500/20"
                        : "bg-red-50 text-red-600 border border-red-200"
                    }`}
                  >
                    {error}
                  </div>
                )}

                {success && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm ${
                      isDarkmodeEnabled
                        ? "bg-green-500/10 text-green-300 border border-green-500/20"
                        : "bg-green-50 text-green-600 border border-green-200"
                    }`}
                  >
                    {success}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative overflow-hidden w-full bg-yellow-400 text-black py-3 rounded-xl hover:bg-yellow-500 duration-200 disabled:opacity-50 font-semibold flex items-center justify-center shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out"
                  >
                    <span className="relative z-10">
                      {submitting ? "Processing..." : "Update Car"}
                    </span>
                    <span className="absolute inset-0 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-500 group-hover:translate-x-[150%]"></span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/my-cars")}
                    className={`w-full py-3 rounded-xl font-semibold transition ${
                      isDarkmodeEnabled
                        ? "bg-white/10 text-white hover:bg-white/20"
                        : "bg-black text-white hover:opacity-90"
                    }`}
                  >
                    Back to My Cars
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateCar