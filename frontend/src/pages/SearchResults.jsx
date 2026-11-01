import { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import DarkModeContext from "../context/DarkModeContext";
import { FaBookOpen, FaHeart, FaSearch } from "react-icons/fa";
import Footer from "../utils/Footer";
import api from "../services/api";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();

  const query = searchParams.get("q") || "";
  const genreParam = searchParams.get("genre") || "";

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await api.get("/genres");
        if (Array.isArray(res.data)) {
          setGenres(res.data);
        }
      } catch (err) {
        console.error("Error fetching genres in SearchResults:", err);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        const hasQuery = Boolean(query && query.trim().length >= 1);
        const hasGenre = Boolean(genreParam && genreParam.trim().length >= 1);

        if (hasQuery || hasGenre) {
          const params = {};
          if (hasQuery) params.query = query.trim();
          if (hasGenre) params.genre = genreParam.trim();

          const response = await api.get('/novels/search', { params });
          setResults(response.data);
        } else {
          setResults([]);
        }
      } catch (err) {
        setError("Không thể tải kết quả tìm kiếm");
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, genreParam]);

  const handleGenreFilterChange = (selectedSlug) => {
    const newParams = new URLSearchParams();
    if (query.trim()) {
      newParams.set("q", query.trim());
    }
    if (selectedSlug && selectedSlug !== "all") {
      newParams.set("genre", selectedSlug);
    }
    navigate(`/search?${newParams.toString()}`);
  };

  const currentGenreObj = genres.find(
    (g) => g.slug === genreParam || g._id === genreParam
  );

  const getPageTitle = () => {
    if (query && genreParam) {
      return (
        <span>
          Kết quả tìm kiếm cho &quot;<span className="text-blue-500">{query}</span>&quot; trong thể loại{" "}
          <span className="text-purple-400">[{currentGenreObj?.name || genreParam}]</span>
        </span>
      );
    }
    if (genreParam) {
      return (
        <span>
          Danh mục tác phẩm thể loại:{" "}
          <span className="text-purple-400">{currentGenreObj?.name || genreParam}</span>
        </span>
      );
    }
    if (query) {
      return (
        <span>
          Kết quả tìm kiếm cho &quot;<span className="text-blue-500">{query}</span>&quot;
        </span>
      );
    }
    return <span>Khám phá tác phẩm</span>;
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-black/100" : "bg-gray-50"
        } flex items-center justify-center`}
      >
        <Navbar />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-black/100" : "bg-gray-50"
        } flex items-center justify-center`}
      >
        <Navbar />
        <div
          className={`text-center ${
            isDarkMode ? "text-red-400" : "text-red-500"
          }`}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`min-h-screen ${
          isDarkMode ? "bg-black/100" : "bg-gray-50"
        } flex flex-col items-center`}
      >
        <Navbar />
        <div className="container mx-auto px-4 pt-28 pb-16 flex flex-col items-center max-w-7xl">
          {/* Header Title */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-2xl md:text-3xl font-extrabold mb-8 text-center ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {getPageTitle()}
          </motion.h1>

          {results.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center py-16 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <FaSearch size={24} />
              </div>
              <p className="text-xl font-bold mb-2">Không tìm thấy tác phẩm phù hợp</p>
              <p className="text-sm max-w-md mx-auto text-gray-500 mb-6">
                Không có truyện nào khớp với các tiêu chí tìm kiếm hiện tại. Hãy thử từ khóa khác hoặc chuyển sang thể loại khác.
              </p>
              {genreParam && (
                <button
                  type="button"
                  onClick={() => handleGenreFilterChange("all")}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all"
                >
                  Xóa bộ lọc thể loại
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="w-full"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
                {results.map((novel) => (
                  <motion.div
                    key={novel._id}
                    variants={item}
                    whileHover={{ scale: 1.03 }}
                    className={`${
                      isDarkMode
                        ? "bg-gray-900 border-gray-800 hover:border-gray-700"
                        : "bg-white border-gray-200 hover:shadow-xl"
                    } border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between`}
                    onClick={() => navigate(`/novels/${novel._id}`)}
                  >
                    <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={novel.coverPhoto?.url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f"}
                        alt={novel.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                      {/* Genre Tags on Novel Cover Card */}
                      {novel.genres && novel.genres.length > 0 && (
                        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5 z-10">
                          {novel.genres.map((g) => (
                            <span
                              key={g._id || g.slug}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenreFilterChange(g.slug);
                              }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-md backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform"
                              style={{ backgroundColor: g.color || "#8B5CF6" }}
                            >
                              #{g.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h2
                          className={`text-base font-bold mb-1.5 line-clamp-1 ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {novel.title}
                        </h2>
                        <p className="text-xs text-purple-400 font-semibold mb-2">
                          Tác giả: {novel.author?.penName || "Ẩn danh"}
                        </p>
                        <p
                          className={`text-xs mb-3 line-clamp-2 leading-relaxed ${
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {novel.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <FaHeart className="text-red-500 mr-1.5" />
                            <span>{novel.likes?.length || 0}</span>
                          </div>
                          <div className="flex items-center">
                            <FaBookOpen className="text-blue-500 mr-1.5" />
                            <span>{novel.chapters?.length || 0} chương</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SearchResults;
