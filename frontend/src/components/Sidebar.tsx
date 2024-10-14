import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationArrow, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";

interface SidebarProps {
  getCurrentLocationWeather: () => void;
  searchWeather: (city: string, country: string) => void;
  recentSearches: { city: string; country: string }[];
  isNight: boolean; // Accept the isNight prop
}

const Sidebar: React.FC<SidebarProps> = ({
  getCurrentLocationWeather,
  searchWeather,
  recentSearches,
  isNight, // Destructure isNight
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchCity, setSearchCity] = useState<string>("");
  const [searchCountry, setSearchCountry] = useState<string>("");

  const handleSearch = () => {
    const newSearch = { city: searchCity, country: searchCountry };
    const isDuplicate = recentSearches.some(
      (location) => location.city === newSearch.city && location.country === newSearch.country
    );

    if (!isDuplicate && newSearch.city && newSearch.country) {
      const updatedSearches = [...recentSearches, newSearch];
      const limitedSearches = updatedSearches.slice(-8);

      // Assuming a setRecentSearches function exists to update recent searches
      // setRecentSearches(limitedSearches);
    }

    searchWeather(searchCity, searchCountry);
    setSearchCity("");
    setSearchCountry("");
  };

  return (
    <div>
      {/* Hamburger button */}
      <button
        className="hamburger-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          left: isOpen ? "260px" : "25px", // Adjust left positioning based on sidebar width
        }}
      >
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </button>

      {/* Sidebar */}
      <div
        className={`sidebar ${isOpen ? "open" : ""}`}
        style={{
          backgroundColor: isNight ? "rgb(11, 0, 28)" : "rgb(95, 150, 192)", // Conditional background color
        }}
      >
        {/* Location arrow and hamburger button on the same row */}
        <button className="top-row-icons" onClick={getCurrentLocationWeather}>
          <FontAwesomeIcon icon={faLocationArrow} className="location-icon" />
          <span className="tooltip">Get current location</span>
        </button>

        {/* Search inputs and button */}
        <div className="search-container">
          <label className="search-label">Search for Weather</label>
          <div className="search-inputs">
            <input
              type="text"
              placeholder="City"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
            <input
              type="text"
              placeholder="Country"
              value={searchCountry}
              onChange={(e) => setSearchCountry(e.target.value)}
            />
            <div className="search-button" onClick={handleSearch}>
              <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
            </div>
          </div>
        </div>

        {/* Recent searches header */}
        <div className="recent-searches-header">Recent Searches</div>

        {/* Display recent searches */}
        {recentSearches.map((location, index) => (
          <button
            key={index}
            onClick={() => searchWeather(location.city, location.country)}
          >
            {location.city}, {location.country}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
