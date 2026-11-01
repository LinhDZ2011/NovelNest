import { Link } from "react-router-dom";
import { useContext } from "react";
import DarkModeContext from "../context/DarkModeContext";

const Book = ({ _id, title, description, coverPhoto, genres, genre }) => {
  const imageUrl = coverPhoto
    ? coverPhoto.url
    : "/ink-logo-outline.png";
  const { isDarkMode } = useContext(DarkModeContext);

  const displayGenre = (genres && genres.length > 0)
    ? (typeof genres[0] === 'object' ? genres[0] : { name: genres[0] })
    : (genre ? (typeof genre === 'object' ? genre : { name: genre }) : null);

  return (
    <Link
      to={`/novels/${_id}`}
      className={
        `block ${isDarkMode ? "bg-black/100" : "bg-white"} rounded-xl overflow-hidden max-w-xs w-52 m-2 transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:rotate-1
        ${isDarkMode
          ? "shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20"
          : "shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20"
        } relative before:absolute before:inset-0 before:z-[-1] before:transition-all before:duration-500
        ${isDarkMode
          ? "before:bg-gradient-to-r before:from-black/100 before:to-gray-700"
          : "before:bg-gradient-to-r before:from-gray-300 before:to-white"
        }
        hover:before:scale-105
        hover:before:opacity-75
      `}
    >
      <div className="flex flex-col h-full relative z-10">
        <div className="relative overflow-hidden">
          {displayGenre && (
            <span
              className="absolute top-2.5 left-2.5 z-20 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md text-white backdrop-blur-sm"
              style={{ backgroundColor: displayGenre.color || '#8B5CF6' }}
            >
              {displayGenre.name}
            </span>
          )}
          <img
            className="w-full h-72 object-cover transition-transform duration-500 hover:scale-110"
            src={imageUrl}
            alt={title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/ink-logo-outline.png";
            }}
          />
          <div
            className={`absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100
            ${isDarkMode
                ? "bg-gradient-to-t from-gray-900/80 to-transparent"
                : "bg-gradient-to-t from-black/30 to-transparent"
              }
          `}
          />
        </div>
        <div className="p-4 flex-grow backdrop-blur-sm">
          <h2
            className={`text-lg font-semibold mb-2 line-clamp-2 min-h-[3.5rem] transition-colors duration-300
              ${isDarkMode
                ? "text-white hover:text-yellow-300"
                : "text-gray-800 hover:text-blue-600"
              }
            `}
          >
            {title}
          </h2>
          <p
            className={`text-sm line-clamp-3 transition-colors duration-300
              ${isDarkMode
                ? "text-gray-300 hover:text-gray-100"
                : "text-gray-600 hover:text-gray-800"
              }
            `}
          >
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default Book;
