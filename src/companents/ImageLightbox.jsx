import { createPortal } from "react-dom"
import { useEffect } from "react"
import { useDarkmode } from "../stores/useDarkmode"

const ImageLightbox = ({
  isOpen,
  onClose,
  images = [],
  currentIndex = 0,
  setCurrentIndex,
  title = "Image Preview",
}) => {
  const { isDarkmodeEnabled } = useDarkmode()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.()
      }

      if (images.length > 1) {
        if (e.key === "ArrowLeft") {
          setCurrentIndex?.((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
          )
        }

        if (e.key === "ArrowRight") {
          setCurrentIndex?.((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
          )
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = oldOverflow
    }
  }, [isOpen, images.length, onClose, setCurrentIndex])

  if (!isOpen || !images.length) return null

  const currentImage = images[currentIndex] || images[0]

  const goPrev = () => {
    if (images.length <= 1) return
    setCurrentIndex?.((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goNext = () => {
    if (images.length <= 1) return
    setCurrentIndex?.((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return createPortal(
    <div className="fixed inset-0 z-[100000]">
      <div
        className="absolute inset-0 bg-black/88 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 w-full h-full flex items-center justify-center px-3 sm:px-6 py-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl transition z-20"
        >
          ×
        </button>

        {images.length > 1 && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl transition z-20"
          >
            ‹
          </button>
        )}

        <div
          className="relative w-full max-w-[1400px] h-full flex flex-col items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full flex items-center justify-center min-h-0 flex-1">
            <img
              src={currentImage}
              alt={title}
              className="max-w-full max-h-[78vh] sm:max-h-[82vh] object-contain select-none rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
              draggable={false}
            />
          </div>

          <div className="mt-4 sm:mt-5 flex flex-col items-center gap-3 w-full">
            <div
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium ${
                isDarkmodeEnabled
                  ? "bg-white/10 text-white"
                  : "bg-white/90 text-black"
              }`}
            >
              {title}
              {images.length > 1 ? ` • ${currentIndex + 1} / ${images.length}` : ""}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto max-w-full pb-1">
                {images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentIndex?.(index)}
                    className={`w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                      currentIndex === index
                        ? "border-yellow-400 scale-105"
                        : "border-white/20 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`preview-${index}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl transition z-20"
          >
            ›
          </button>
        )}
      </div>
    </div>,
    document.body
  )
}

export default ImageLightbox