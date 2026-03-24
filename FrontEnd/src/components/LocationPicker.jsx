import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCrosshair, FiMapPin, FiSearch, FiX, FiNavigation } from 'react-icons/fi';
import { useLocation } from '../context/LocationContext';
import './LocationPicker.css';

export default function LocationPicker() {
  const {
    location, loading, error,
    detectLocation, searchCity, selectSearchResult,
  } = useLocation();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Debounced auto-search as user types
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await searchCity(query);
      if (res) {
        setResults(res);
        setShowResults(true);
      }
      setSearching(false);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query, searchCity]);

  const handleSelect = (result) => {
    selectSearchResult(result);
    setQuery(result.name.split(',')[0]); // show short name
    setShowResults(false);
    setResults([]);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    const res = await searchCity(query);
    if (res && res.length > 0) {
      // Auto-select the first result
      handleSelect(res[0]);
    }
    setSearching(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="location-picker">
      {/* Search bar */}
      <div className="location-picker__search-section" ref={searchRef}>
        <form className="location-picker__search-form" onSubmit={handleSearchSubmit}>
          <div className="location-picker__search-wrap">
            <FiSearch className="location-picker__search-icon" />
            <input
              type="text"
              className="location-picker__search-input"
              placeholder="Search a city... (e.g. Kegalle, New York, Berlin)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
            />
            {query && (
              <button type="button" className="location-picker__clear" onClick={clearSearch}>
                <FiX />
              </button>
            )}
            {(searching || loading) && (
              <div className="location-picker__search-spinner" />
            )}
          </div>
        </form>

        {/* Autocomplete dropdown */}
        <AnimatePresence>
          {showResults && results.length > 0 && (
            <motion.ul
              className="location-picker__dropdown"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {results.map((r, i) => (
                <li key={`${r.lat}-${r.lng}-${i}`}>
                  <button
                    className="location-picker__dropdown-item"
                    onClick={() => handleSelect(r)}
                    type="button"
                  >
                    <FiMapPin className="location-picker__dropdown-icon" />
                    <span className="location-picker__dropdown-text">
                      {r.name}
                    </span>
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="location-picker__buttons">
        <motion.button
          className="location-picker__btn location-picker__btn--detect"
          onClick={detectLocation}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiCrosshair className={loading ? 'location-picker__spin' : ''} />
          {loading ? 'Locating...' : 'Use My Location'}
        </motion.button>
      </div>

      {/* Current location indicator */}
      {location && (
        <motion.div
          className="location-picker__current"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <FiNavigation className="location-picker__current-icon" />
          <div className="location-picker__current-info">
            <span className="location-picker__current-name">{location.name || 'Selected Location'}</span>
            <span className="location-picker__current-coords">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </div>
        </motion.div>
      )}

      {error && <p className="location-picker__error">{error}</p>}
    </div>
  );
}
