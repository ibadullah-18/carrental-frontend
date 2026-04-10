import { useEffect } from "react"
import Navigator from "./companents/Navigator"
import Navbar from "./companents/Navbar"
import { useDarkmode } from "./stores/useDarkmode"

const App = () => {
  const { isDarkmodeEnabled } = useDarkmode()

  useEffect(() => {
    const bg = isDarkmodeEnabled ? "#111111" : "#f8f8f8"

    document.documentElement.style.backgroundColor = bg
    document.body.style.backgroundColor = bg
    document.getElementById("root").style.backgroundColor = bg
  }, [isDarkmodeEnabled])

  return (
    <div
      className={`min-h-screen ${
        isDarkmodeEnabled ? "bg-[#111111] text-white" : "bg-[#f8f8f8] text-black"
      }`}
    >
      <Navbar />
      <div className="pt-[75px] min-h-[calc(100vh-75px)]">
        <Navigator />
      </div>
    </div>
  )
}

export default App