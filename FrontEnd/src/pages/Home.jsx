import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiCoffee, FiRefreshCw, FiGrid, FiMap } from 'react-icons/fi';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import { getRecommendations } from '../services/api';
import ShopCard from '../components/ShopCard';
import SkeletonCard from '../components/SkeletonCard';
import LocationPicker from '../components/LocationPicker';
import ShopMap from '../components/ShopMap';
import './Home.css';

export default function Home() {
  const { location } = useLocation();
  const { addToast } = useToast();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  const fetchShops = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await getRecommendations(location.lat, location.lng);
      setShops(res.data.recommendations || []);
      if (res.data.recommendations?.length === 0) {
        addToast('No coffee shops found nearby. Try a different location.', 'info');
      }
    } catch (err) {
      addToast('Failed to load recommendations. Is the backend running?', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [location, addToast]);

  useEffect(() => {
    if (location) {
      fetchShops();
    }
  }, [location, fetchShops]);

  return (
    <div className="home">
      <section className="home__header container">
        <motion.div
          className="home__title-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="home__title">
            <FiCoffee className="home__title-icon" /> Discover Coffee Shops
          </h1>
          <p className="home__subtitle">
            Set your location to get AI-powered recommendations for the top 8 coffee shops near you
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <LocationPicker />
        </motion.div>
      </section>

      <section className="home__results container">
        {loading && (
          <div className="home__grid">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && shops.length > 0 && (
          <>
            <div className="home__results-header">
              <h2 className="home__results-title">
                Top {shops.length} Recommendations
              </h2>
              <div className="home__results-actions">
                {/* View toggle */}
                <div className="home__view-toggle">
                  <button
                    className={`home__view-btn ${viewMode === 'grid' ? 'home__view-btn--active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                  >
                    <FiGrid />
                  </button>
                  <button
                    className={`home__view-btn ${viewMode === 'map' ? 'home__view-btn--active' : ''}`}
                    onClick={() => setViewMode('map')}
                    title="Map view"
                  >
                    <FiMap />
                  </button>
                </div>
                <button className="home__refresh" onClick={fetchShops}>
                  <FiRefreshCw /> Refresh
                </button>
              </div>
            </div>

            {viewMode === 'map' && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="home__map-container"
              >
                <ShopMap
                  shops={shops}
                  userLocation={location}
                  height="480px"
                />
              </motion.div>
            )}

            {viewMode === 'grid' && (
              <div className="home__grid">
                {shops.map((shop, i) => (
                  <ShopCard key={shop.place_id} shop={shop} index={i} />
                ))}
              </div>
            )}
          </>
        )}

        {!loading && hasSearched && shops.length === 0 && (
          <motion.div
            className="home__empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="home__empty-emoji">🔍</span>
            <h3>No shops found</h3>
            <p>Try adjusting your location or search radius</p>
          </motion.div>
        )}

        {!loading && !hasSearched && (
          <motion.div
            className="home__empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="home__empty-emoji">📍</span>
            <h3>Set your location to start</h3>
            <p>Use the location picker above to discover amazing coffee near you</p>
          </motion.div>
        )}
      </section>
    </div>
  );
}
