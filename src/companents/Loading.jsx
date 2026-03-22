import { useDarkmode } from "../stores/darkmode"

const Loading = () => {
    const { isDarkmodeEnabled } = useDarkmode()

    return (
        <div className={`w-full h-screen flex flex-col items-center justify-center
            ${isDarkmodeEnabled ? "bg-gray-900 text-white" : "bg-white text-black"}`}>

            <div className={`w-16 h-16 border-4 rounded-full animate-spin
                ${isDarkmodeEnabled 
                    ? "border-gray-700 border-t-white" 
                    : "border-gray-300 border-t-black"
                }`}>
            </div>

            <p className="mt-4 text-lg animate-pulse">
                Loading ...
            </p>
        </div>
    )
}

export default Loading