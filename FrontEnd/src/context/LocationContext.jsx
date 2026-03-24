import { createContext, useContext, useState, useCallback } from 'react';

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null); // { lat, lng, name? }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: 'Current Location',
        });
        setLoading(false);
      },
      (err) => {
        setError('Unable to retrieve your location. Please search for a city instead.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const setManualLocation = useCallback((lat, lng, name = '') => {
    setLocation({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      name: name || `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`,
    });
    setError(null);
  }, []);

  const searchCity = useCallback(async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const results = await res.json();

      if (results.length === 0) {
        setError(`No results found for "${query}". Try a different search.`);
        setLoading(false);
        return [];
      }

      setLoading(false);
      return results.map((r) => ({
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        name: r.display_name,
        type: r.type,
      }));
    } catch (err) {
      setError('Search failed. Please check your internet connection.');
      setLoading(false);
      return [];
    }
  }, []);

  const selectSearchResult = useCallback((result) => {
    setLocation({
      lat: result.lat,
      lng: result.lng,
      name: result.name,
    });
    setError(null);
  }, []);

  return (
    <LocationContext.Provider value={{
      location,
      loading,
      error,
      detectLocation,
      setManualLocation,
      searchCity,
      selectSearchResult,
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
};
