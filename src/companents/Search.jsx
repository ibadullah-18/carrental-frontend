import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useDarkmode } from "../stores/useDarkmode"
import { useSearchStore } from "../stores/search"
import { apiFetch, getFileUrl } from "../utils/apiFetch"
import Carcart from "../companents/Carcart"

const Search = () => {
  const { isDarkmodeEnabled } = useDarkmode()
  const { search, setSearch } = useSearchStore()
  const [searchParams] = useSearchParams()

  const queryFromUrl = searchParams.get("q") || ""

  const [cars, setCars] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [visibleCount, setVisibleCount] = useState(6)
  const [debouncedSearch, setDebouncedSearch] = useState(search || queryFromUrl)
  const [isPageVisible, setIsPageVisible] = useState(false)
  const [isResultsVisible, setIsResultsVisible] = useState(true)
  const [searchType, setSearchType] = useState("cars")

  useEffect(() => {
    const timer = setTimeout(() => setIsPageVisible(true), 80)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (queryFromUrl && queryFromUrl !== search) {
      setSearch(queryFromUrl)
    }
  }, [queryFromUrl, search, setSearch])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
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
          setUsers([])
          setLoading(false)
          setTimeout(() => setIsResultsVisible(true), 80)
          return
        }

        if (searchType === "cars") {
          const response = await apiFetch(
            `/api/Cars/search-by-model?query=${encodeURIComponent(trimmed)}`,
            { method: "GET" }
          )

          const data = await response.json().catch(() => null)

          if (!response.ok) {
            throw new Error(
              data?.message || data?.Message || "Maşınlar yüklənə bilmədi."
            )
          }

          setCars(Array.isArray(data) ? data : [])
          setUsers([])
        }

        if (searchType === "users") {
          const response = await apiFetch(
            `/api/Users/search?query=${encodeURIComponent(trimmed)}`,
            { method: "GET" }
          )

          const data = await response.json().catch(() => null)

          if (!response.ok) {
            throw new Error(
              data?.message || data?.Message || "İstifadəçilər yüklənə bilmədi."
            )
          }

          const activeUsers = Array.isArray(data)
            ? data.filter(
                (user) =>
                  user.isBanned !== true &&
                  user.emailConfirmed === true &&
                  user.isDeleted !== true &&
                  user.isProfilePublic === true
              )
            : []

          setUsers(activeUsers)
          setCars([])
        }

        setTimeout(() => setIsResultsVisible(true), 120)
      } catch (err) {
        setError(err.message || "Axtarış zamanı xəta baş verdi.")
        setTimeout(() => setIsResultsVisible(true), 120)
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [debouncedSearch, searchType])

  const visibleCars = cars.slice(0, visibleCount)

  return (
    <div
      className={`min-h-screen pt-[95px] pb-12 px-3 sm:px-5 lg:px-8 transition-all duration-500 ${
        isPageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${isDarkmodeEnabled ? "bg-[#111111] text-white" : "bg-[#f8f8f8] text-black"}`}
    >
      <div className="max-w-[1280px] mx-auto">
        <div
          className={`mb-8 transition-all duration-500 delay-75 ${
            isPageVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Axtarış nəticələri
          </h1>

          <p
            className={`mt-2 text-sm sm:text-base transition-all duration-300 ${
              isDarkmodeEnabled ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {search.trim() ? `"${search}" üçün nəticələr` : "Axtarış üçün yazın."}
          </p>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={() => setSearchType("cars")}
              className={`relative overflow-hidden inline-flex items-center justify-center px-5 py-2 rounded-xl font-bold shadow-md transition-all duration-300 before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%] hover:-translate-y-1 hover:shadow-xl ${
                searchType === "cars"
                  ? "bg-yellow-400 text-black"
                  : isDarkmodeEnabled
                  ? "bg-[#1d1d1d] text-white border border-gray-700 hover:border-yellow-400"
                  : "bg-white text-black border border-gray-300 hover:border-yellow-400"
              }`}
            >
              <span className="relative z-10">Maşınlar</span>
            </button>

            <button
              onClick={() => setSearchType("users")}
              className={`relative overflow-hidden inline-flex items-center justify-center px-5 py-2 rounded-xl font-bold shadow-md transition-all duration-300 before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%] hover:-translate-y-1 hover:shadow-xl ${
                searchType === "users"
                  ? "bg-yellow-400 text-black"
                  : isDarkmodeEnabled
                  ? "bg-[#1d1d1d] text-white border border-gray-700 hover:border-yellow-400"
                  : "bg-white text-black border border-gray-300 hover:border-yellow-400"
              }`}
            >
              <span className="relative z-10">İstifadəçilər</span>
            </button>
          </div>
        </div>

        {loading && search.trim() ? (
          <div className={`py-10 transition-all duration-300 ${isResultsVisible ? "opacity-100" : "opacity-60"}`}>
            <div className="flex justify-center items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
              <div className={`text-sm sm:text-base font-medium ${isDarkmodeEnabled ? "text-gray-300" : "text-gray-700"}`}>
                Axtarılır...
              </div>
            </div>
          </div>
        ) : error ? (
          <div
            className={`rounded-2xl border px-4 py-6 text-center transition-all duration-500 ${
              isResultsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
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
              isResultsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            } ${
              isDarkmodeEnabled
                ? "bg-[#1a1a1a] border-gray-800 text-gray-300"
                : "bg-white border-gray-200 text-gray-700"
            }`}
          >
            Axtarış üçün nəsə yazın.
          </div>
        ) : (
          <>
            {searchType === "cars" && (
              <>
                {cars.length === 0 ? (
                  <div
                    className={`rounded-2xl border px-4 py-10 text-center transition-all duration-500 ${
                      isResultsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    } ${
                      isDarkmodeEnabled
                        ? "bg-[#1a1a1a] border-gray-800 text-gray-300"
                        : "bg-white border-gray-200 text-gray-700"
                    }`}
                  >
                    Maşın tapılmadı.
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
                            transform: isResultsVisible ? "translateY(0px)" : "translateY(10px)",
                          }}
                        >
                          <Carcart car={car} />
                        </div>
                      ))}
                    </div>

                    {visibleCount < cars.length && (
                      <div
                        className={`flex justify-center mt-10 transition-all duration-500 ${
                          isResultsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                        }`}
                      >
                        <button
                          onClick={() => setVisibleCount((prev) => prev + 6)}
                          className="relative overflow-hidden inline-flex items-center justify-center px-6 py-3 rounded-xl bg-yellow-400 text-black font-bold shadow-md hover:shadow-xl hover:-translate-y-1 active:translate-y-0 transition-all duration-300 before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-white/30 before:skew-x-12 before:transition-all before:duration-500 hover:before:left-[120%]"
                        >
                          <span className="relative z-10">Daha çox</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {searchType === "users" && (
              <>
                {users.length === 0 ? (
                  <div
                    className={`rounded-2xl border px-4 py-10 text-center transition-all duration-500 ${
                      isResultsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                    } ${
                      isDarkmodeEnabled
                        ? "bg-[#1a1a1a] border-gray-800 text-gray-300"
                        : "bg-white border-gray-200 text-gray-700"
                    }`}
                  >
                    İstifadəçi tapılmadı.
                  </div>
                ) : (
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-500 ${
                      isResultsVisible
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 translate-y-3 scale-[0.985]"
                    }`}
                  >
                    {users.map((user, index) => (
                      <div
                        key={user.id}
                        className="transition-all duration-500"
                        style={{
                          transitionDelay: `${index * 40}ms`,
                          opacity: isResultsVisible ? 1 : 0,
                          transform: isResultsVisible ? "translateY(0px)" : "translateY(10px)",
                        }}
                      >
                        <Link
                          to={`/owner-profile/${user.id}`}
                          className={`group block rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                            isDarkmodeEnabled
                              ? "bg-[#1a1a1a] border-gray-800 hover:border-yellow-400"
                              : "bg-white border-gray-200 hover:border-yellow-400"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 shrink-0 border-2 border-yellow-400/50">
                              {user.profileImageUrl ? (
                                <img
                                  src={getFileUrl(user.profileImageUrl)}
                                  alt={user.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-black">
                                  {user.fullName?.charAt(0)}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col min-w-0">
                              <h2 className="font-bold text-lg truncate group-hover:text-yellow-400 transition">
                                {user.fullName}
                              </h2>

                              <p className={`text-sm mt-1 ${isDarkmodeEnabled ? "text-gray-400" : "text-gray-600"}`}>
                                📍 {user.city || "Şəhər yoxdur"}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Search