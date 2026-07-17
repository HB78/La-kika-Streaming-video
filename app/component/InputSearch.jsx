import { useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoCloseCircle } from "react-icons/io5";

const InputSearch = ({ title, setSearchTerm, searchTerm }) => {
  const [userIsSearching, setUserIsSearching] = useState(false);

  const toggleSearch = () => {
    setUserIsSearching((prev) => !prev);
  };

  if (!title.includes("Series") && !title.includes("Films")) {
    return null;
  }

  return (
    <div>
      {userIsSearching ? (
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={toggleSearch}
            aria-label="Fermer la recherche"
            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <IoCloseCircle
              aria-hidden="true"
              className="mr-2 text-red-500"
              size={22}
            />
          </button>

          <input
            id="search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un film..."
            aria-label="Rechercher un film"
            className="rounded-full bg-gray-700 p-3 text-white focus:border-red-500 focus:outline-none focus:border"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={toggleSearch}
          aria-label="Ouvrir la recherche"
          aria-expanded={userIsSearching}
          aria-controls="search-input"
          className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <CiSearch aria-hidden="true" className="text-white" size={18} />
        </button>
      )}
    </div>
  );
};

export default InputSearch;
