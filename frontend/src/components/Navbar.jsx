import { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUser,
  FaBars,
  FaTimes,
  FaSun,
  FaMoon,
  FaHome,
  FaComments,
  FaSignOutAlt,
  FaShieldAlt,
  FaTags,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";
import { FaRankingStar } from "react-icons/fa6";
import AuthContext from "../context/AuthContext";
import DarkModeContext from "../context/DarkModeContext";
import Cookies from "js-cookie";
import api from "../services/api";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, update, loggedUser } = useContext(AuthContext);
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [isMobileGenreOpen, setIsMobileGenreOpen] = useState(false);

  const searchRef = useRef(null);
  const genreRef = useRef(null);

  const handleLogout = async () => {
    Cookies.remove("token");
    Cookies.remove("userId");
    update();
    navigate("/login");
  };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await api.get("/genres");
        if (Array.isArray(res.data)) {
          setGenres(res.data);
        }
      } catch (err) {
        console.error("Error fetching navbar genres:", err);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (genreRef.current && !genreRef.current.contains(event.target)) {
        setShowGenreDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 1) {
        setSuggestions([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get("/novels/search", {
          params: { query: searchQuery.trim() },
        });
        setSuggestions(response.data.slice(0, 5));
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (novel) => {
    setSearchQuery(novel.title);
    setShowSuggestions(false);
    navigate(`/novels/${novel._id}`);
  };

  const handleGenreClick = (genreSlug) => {
    setShowGenreDropdown(false);
    setIsMobileMenuOpen(false);
    navigate(`/search?genre=${encodeURIComponent(genreSlug)}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 ${isDarkMode
          ? "bg-black/100 backdrop-blur-md shadow-lg border-b border-gray-800"
          : "bg-white/80 backdrop-blur-md shadow-lg"
        }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between py-4 px-4 gap-4 md:gap-8 lg:gap-16">
          <Link
            to="/home"
            className={`flex items-center space-x-2 ${isDarkMode
                ? "text-white hover:text-white"
                : "text-black hover:text-black"
              } transition-colors duration-300`}
          >
            <span className="text-2xl font-bold flex items-center space-x-1">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Novel
              </span>
              <span className={isDarkMode ? "text-white" : "text-gray-900"}>
                Nest
              </span>
            </span>
          </Link>

          {/* Search Input Container */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-md lg:max-w-xl relative hidden md:block"
            ref={searchRef}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm tác phẩm, tác giả..."
                className={`w-full py-2.5 pl-11 pr-10 rounded-xl border text-sm transition-all duration-300 ${isDarkMode
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 1 && setShowSuggestions(true)}
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              {isLoading && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              )}

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className={`absolute left-0 right-0 top-full mt-2 rounded-xl shadow-xl overflow-hidden border z-50 ${
                    isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-100"
                  }`}
                >
                  {suggestions.map((novel) => (
                    <div
                      key={novel._id}
                      onClick={() => handleSuggestionClick(novel)}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                        isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"
                      }`}
                    >
                      <img
                        src={novel.coverPhoto?.url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f"}
                        alt={novel.title}
                        className="w-10 h-14 object-cover rounded-lg"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{novel.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {novel.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {/* MENU THỂ LOẠI DROPDOWN */}
            <div className="relative" ref={genreRef}>
              <button
                type="button"
                onClick={() => setShowGenreDropdown(!showGenreDropdown)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  showGenreDropdown
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : isDarkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FaTags className="text-base" />
                <span>Thể loại</span>
                <FaChevronDown
                  className={`text-xs transition-transform duration-300 ${
                    showGenreDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Mega-menu mini cho Thể loại */}
              {showGenreDropdown && (
                <div
                  className={`absolute left-0 mt-2 w-72 lg:w-80 p-3 rounded-2xl shadow-2xl border z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
                    isDarkMode
                      ? "bg-gray-900 border-gray-800 text-white"
                      : "bg-white border-gray-100 text-gray-900 shadow-purple-500/10"
                  }`}
                >
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mb-2 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                    <span>Danh mục thể loại</span>
                    <span className="text-purple-400">{genres.length} thể loại</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-80 overflow-y-auto pr-1">
                    {genres.map((g) => (
                      <button
                        key={g._id || g.slug}
                        type="button"
                        onClick={() => handleGenreClick(g.slug)}
                        className={`flex items-center justify-between p-2 rounded-xl text-left text-xs font-semibold transition-all ${
                          isDarkMode
                            ? "hover:bg-gray-800 text-gray-200"
                            : "hover:bg-purple-50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: g.color || "#8B5CF6" }}
                          />
                          <span className="truncate">{g.name}</span>
                        </div>
                        {g.novelCount !== undefined && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-400">
                            {g.novelCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/rankings")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isDarkMode
                  ? "text-gray-300 hover:text-white hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <FaRankingStar className="text-base" />
              <span>Bảng xếp hạng</span>
            </button>

            <button
              onClick={() => navigate("/forum")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isDarkMode
                  ? "text-gray-300 hover:text-white hover:bg-gray-800"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              <FaComments className="text-base" />
              <span>Diễn đàn</span>
            </button>

            {/* NÚT QUẢN TRỊ VIÊN - ĐẶT CHÍNH XÁC GIỮA DIỄN ĐÀN VÀ HỒ SƠ */}
            {isAuthenticated() && loggedUser?.role === 'admin' && (
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-purple-400 bg-purple-900/30 border border-purple-500/40 hover:bg-purple-800/50 hover:text-purple-300 transition-all duration-300 shadow-sm"
              >
                <FaShieldAlt className="text-base text-purple-400" />
                <span>Quản trị viên</span>
              </button>
            )}

            {isAuthenticated() && (
              <button
                onClick={() => navigate("/profile")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isDarkMode
                    ? "text-gray-300 hover:text-white hover:bg-gray-800"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <FaUser className="text-base" />
                <span>Hồ sơ</span>
              </button>
            )}

            <button
              onClick={toggleDarkMode}
              className={`flex items-center gap-2 p-2.5 rounded-lg transition-all duration-300 ${isDarkMode
                  ? "text-yellow-300 hover:bg-yellow-500/20"
                  : "text-gray-700 hover:bg-yellow-100"
                }`}
              title={isDarkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            >
              {isDarkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
            </button>

            <button
              onClick={isAuthenticated() ? handleLogout : () => navigate("/login")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isDarkMode
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-red-600 hover:bg-red-50"
                }`}
            >
              <FaSignOutAlt className="text-base" />
              <span>{isAuthenticated() ? "Đăng xuất" : "Đăng nhập"}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg"
            >
              {isMobileMenuOpen ? (
                <FaTimes size={24} className={isDarkMode ? "text-white" : "text-black"} />
              ) : (
                <FaBars size={24} className={isDarkMode ? "text-white" : "text-black"} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden ${isDarkMode ? "bg-black" : "bg-white"
            } border-t ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}
        >
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm truyện..."
                className={`w-full py-2 pl-10 pr-4 rounded-lg border ${isDarkMode
                    ? "bg-gray-800 border-gray-800 text-white placeholder-gray-400"
                    : "bg-gray-50 border-gray-200"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="px-4 py-2 space-y-2">
            <Link
              to="/home"
              className="flex items-center space-x-2 p-2 rounded-lg text-black dark:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaHome /> <span>Trang chủ</span>
            </Link>

            {/* Accordion Thể loại trên Mobile */}
            <div>
              <button
                type="button"
                onClick={() => setIsMobileGenreOpen(!isMobileGenreOpen)}
                className="w-full flex items-center justify-between p-2 rounded-lg text-black dark:text-white"
              >
                <div className="flex items-center space-x-2">
                  <FaTags /> <span>Thể loại</span>
                </div>
                {isMobileGenreOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              </button>

              {isMobileGenreOpen && (
                <div className="grid grid-cols-2 gap-2 pl-6 pr-2 py-2">
                  {genres.map((g) => (
                    <button
                      key={g._id || g.slug}
                      type="button"
                      onClick={() => handleGenreClick(g.slug)}
                      className="text-left text-xs p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 truncate flex items-center gap-1.5"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: g.color || "#8B5CF6" }}
                      />
                      <span className="truncate">{g.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/rankings"
              className="flex items-center space-x-2 p-2 rounded-lg text-black dark:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaRankingStar /> <span>Bảng xếp hạng</span>
            </Link>
            <Link
              to="/forum"
              className="flex items-center space-x-2 p-2 rounded-lg text-black dark:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaComments /> <span>Diễn đàn</span>
            </Link>

            {/* NÚT QUẢN TRỊ VIÊN TRÊN MOBILE MENU (GIỮA DIỄN ĐÀN VÀ HỒ SƠ) */}
            {isAuthenticated() && loggedUser?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center space-x-2 p-2 rounded-lg text-purple-400 bg-purple-900/20 border border-purple-500/30"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaShieldAlt className="text-purple-400" />{" "}
                <span className="font-semibold text-purple-400">Quản trị viên</span>
              </Link>
            )}

            {isAuthenticated() && (
              <Link
                to="/profile"
                className="flex items-center space-x-2 p-2 rounded-lg text-black dark:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaUser /> <span>Hồ sơ</span>
              </Link>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  toggleDarkMode();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 p-2 rounded-lg dark:text-white"
              >
                {isDarkMode ? (
                  <>
                    <FaSun className="text-yellow-400" />
                    <span>Chế độ sáng</span>
                  </>
                ) : (
                  <>
                    <FaMoon />
                    <span>Chế độ tối</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => {
                isAuthenticated() ? handleLogout() : navigate("/login");
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2 mt-2"
            >
              <FaSignOutAlt />
              <span>{isAuthenticated() ? "Đăng xuất" : "Đăng nhập"}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
