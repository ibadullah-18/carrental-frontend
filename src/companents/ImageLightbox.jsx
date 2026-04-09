import { useEffect } from "react"

const ImageLightbox = ({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  setCurrentIndex,
  title = "Image preview",
}) => {
  const handlePrev = () => {
    if (!images.length) return
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    if (!images.length) return
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "ArrowRight") handleNext()
    }

    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "auto"
    }
  }, [isOpen, images.length])

  if (!isOpen || !images.length) return null

  return (
    <div
      className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-[28px] bg-[#111111] border border-white/10 shadow-2xl p-4 sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl transition"
        >
          ✕
        </button>

        <div className="mb-3 pr-12">
          <h3 className="text-white text-sm sm:text-base font-semibold">
            {title}
          </h3>
        </div>

        <div className="relative w-full h-[260px] sm:h-[420px] md:h-[520px] rounded-[24px] overflow-hidden bg-black flex items-center justify-center">
          <img
            src={images[currentIndex]}
            alt={`preview-${currentIndex}`}
            className="max-w-full max-h-full object-contain rounded-[18px]"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/55 hover:bg-black/75 text-white text-2xl transition"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/55 hover:bg-black/75 text-white text-2xl transition"
              >
                ›
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {images.map((img, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`w-20 h-16 sm:w-24 sm:h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition ${
                  currentIndex === index
                    ? "border-yellow-400 scale-105"
                    : "border-white/10"
                }`}
              >
                <img
                  src={img}
                  alt={`thumb-${index}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageLightbox