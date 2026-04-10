import { useEffect, useState } from "react"
import { useDarkmode } from "../stores/useDarkmode"

const PageTransition = ({ children, direction = "left" }) => {
  const { isDarkmodeEnabled } = useDarkmode()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 20)

    return () => clearTimeout(timer)
  }, [])

  const getInitialClass = () => {
    switch (direction) {
      case "top":
        return "opacity-0 -translate-y-6"
      case "bottom":
        return "opacity-0 translate-y-6"
      case "right":
        return "opacity-0 translate-x-8"
      case "left":
      default:
        return "opacity-0 -translate-x-8"
    }
  }

  const getFinalClass = () => {
    return "opacity-100 translate-x-0 translate-y-0"
  }

  return (
    <div
      className={`min-h-screen transition-all duration-500 ease-out will-change-transform ${
        isDarkmodeEnabled ? "bg-[#111111] text-white" : "bg-[#f8f8f8] text-black"
      } ${isVisible ? getFinalClass() : getInitialClass()}`}
    >
      {children}
    </div>
  )
}

export default PageTransition