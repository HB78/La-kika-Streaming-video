import { useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoCloseCircle } from "react-icons/io5";

const InputSearch = ({ title, setSearchTerm, searchTerm }) => {
  const [userIsSearchin, setUserIsSearching] = useState(false);

  const toggleSearch = () => {
    setUserIsSearching(!userIsSearchin);
  };

  if (title.includes("Series") || title.includes("Films")) {
    return (
      <div>
        {" "}
        {/* Wrap the JSX expressions inside a parent element */}
        {userIsSearchin ? (
          <div className="flex justify-center items-center">
            <IoCloseCircle
              title="Fermer la recherche"
              onClick={toggleSearch}
              style={{
                color: "red",
                fontSize: "22px",
                marginRight: "10px",
                cursor: "pointer",
              }}
              aria-label="Fermer la recherche"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un film..."
              className="p-3 mr-2 bg-gray-700 text-white rounded-full focus:border-red-500 focus:outline-none focus:border"
              aria-label="Rechercher un film"
            />
          </div>
        ) : (
          <CiSearch
            title="Rechercher un film"
            onClick={toggleSearch}
            style={{
              color: "white",
              fontSize: "18px",
              marginRight: "10px",
              cursor: "pointer",
            }}
            aria-label="Ouvrir la recherche"
            aria-expanded={userIsSearchin ? "true" : "false"}
          />
        )}
      </div>
    );
  }
};

export default InputSearch;
