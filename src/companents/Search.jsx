import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useDarkmode } from "../stores/useDarkmode"
import { useSearchStore } from "../stores/search"
import { apiFetch } from "../utils/apiFetch"
import Carcart from "../companents/Carcart"

const Search = () => {
  const { isDarkmodeEnabled } = useDarkmode()
  const { search, setSearch } = useSearchStore()
  const [searchParams] = useSearchParams()

  const queryFromUrl = searchParams.get("q") || ""

  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [visibleCount, setVisibleCount] = useState(6)
  const [debouncedSearch, setDebouncedSearch] = useState(search || queryFromUrl)
  const [isPageVisible, setIsPageVisible] = useState(false)
  const [isResultsVisible, setIsResultsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageVisible(true)
    }, 80)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (queryFromUrl && queryFromUrl !== search) {
      setSearch(queryFromUrl)
    }
  }, [queryFromUrl, search, setSearch])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setIsResultsVisible(false)
        setLoading(true)
        setError("")
        setVisibleCount(6)

        const trimmed = debouncedSearch.trim()

        if (!trimmed) {
          setCars([])
          setLoading(false)
          setTimeout(() => setIsResultsVisible(true), 80)
          return
        }

        const response = await apiFetch(
          `/api/Cars/filter?Search=${encodeURIComponent(trimmed)}`,
          {
            method: "GET",
          }
        )

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.Message ||
              "Search results could not be loaded."
          )
        }

        setCars(Array.isArray(data) ? data : [])

        setTimeout(() => {
          setIsResultsVisible(true)
        }, 120)
      } catch (err) {
        setError(err.message || "Something went wrong while searching.")
        setTimeout(() => {
          setIsResultsVisible(true)
        }, 120)
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [debouncedSearch])

  const visibleCars = cars.slice(0, visibleCount)

  return (
    <div
      className={`min-h-screen pt-[95px] pb-12 px-3 sm:px-5 lg:px-8 transition-all duration-500 ${
        isPageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${
        isDarkmodeEnabled ? "bg-[#111111] text-white" : "bg-[#f8f8f8] text-black"
      }`}
    >
      <div className="max-w-[1280px] mx-auto">
        <div
          className={`mb-8 transition-all duration-500 delay-75 ${
            isPageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Search Results
          </h1>

          <p
            className={`mt-2 text-sm sm:text-base transition-all duration-300 ${
              isDarkmodeEnabled ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {search.trim()
              ? `Results for "${search}"`
              : "Start typing to search cars."}
          </p>
        </div>

        {loading && search.trim() ? (
          <div
            className={`py-10 transition-all duration-300 ${
              isResultsVisible ? "opacity-100" : "opacity-60"
            }`}
          >
            <div className="flex justify-center items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
              <div
                className={`text-sm sm:text-base font-medium ${
                  isDarkmodeEnabled ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Searching...
              </div>
            </div>
          </div>
        ) : error ? (
          <div
            className={`rounded-2xl border px-4 py-6 text-center transition-all duration-500 ${
              isResultsVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3"
            } ${
              isDarkmodeEnabled
                ? "bg-[#1a1a1a] border-red-500/30 text-red-300"
                : "bg-white border-red-200 text-red-600"
            }`}
          >
            {error}
          </div>
        ) : !search.trim() ? (
          <div
            className={`rounded-2xl border px-4 py-10 text-center transition-all duration-500 ${
              isResultsVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3"
            } ${
              isDarkmodeEnabled
                ? "bg-[#1a1a1a] border-gray-800 text-gray-300"
                : "bg-white border-gray-200 text-gray-700"
            }`}
          >
            Write something to search.
          </div>
        ) : cars.length === 0 ? (
          <div
            className={`rounded-2xl border px-4 py-10 text-center transition-all duration-500 ${
              isResultsVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3"
            } ${
              isDarkmodeEnabled
                ? "bg-[#1a1a1a] border-gray-800 text-gray-300"
                : "bg-white border-gray-200 text-gray-700"
            }`}
          >
            No cars found.
          </div>
        ) : (
          <>
            <div
              className={`grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 transition-all duration-500 ${
                isResultsVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-3 scale-[0.985]"
              }`}
            >
              {visibleCars.map((car, index) => (
                <div
                  key={car.id}
                  className="transition-all duration-500"
                  style={{
                    transitionDelay: `${index * 40}ms`,
                    opacity: isResultsVisible ? 1 : 0,
                    transform: isResultsVisible
                      ? "translateY(0px)"
                      : "translateY(10px)",
                  }}
                >
                  <Carcart car={car} />
                </div>
              ))}
            </div>

            {visibleCount < cars.length && (
              <div
                className={`flex justify-center mt-10 transition-all duration-500 ${
                  isResultsVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-3"
                }`}
              >
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="relative overflow-hidden inline-flex items-center justify-center px-6 py-3 rounded-xl bg-yellow-400 text-black font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%]"
                >
                  <span className="relative z-10">Load More</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Search