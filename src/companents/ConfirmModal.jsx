import { createPortal } from "react-dom"
import { useEffect } from "react"
import { useDarkmode } from "../stores/useDarkmode"

const ConfirmModal = ({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}) => {
  const { isDarkmodeEnabled } = useDarkmode()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel?.()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = oldOverflow
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onCancel}
      />

      <div
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 transition-all duration-300 ${
          isDarkmodeEnabled
            ? "bg-[#181818] border-white/10 text-white"
            : "bg-white border-black/10 text-black"
        }`}
      >
        <h2 className="text-xl font-bold">{title}</h2>

        <p
          className={`mt-3 text-sm sm:text-base ${
            isDarkmodeEnabled ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {message}
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              isDarkmodeEnabled
                ? "bg-white/8 hover:bg-white/14 text-white"
                : "bg-black/5 hover:bg-black/10 text-black"
            }`}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
              danger
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-yellow-400 text-black hover:bg-yellow-500"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmModal