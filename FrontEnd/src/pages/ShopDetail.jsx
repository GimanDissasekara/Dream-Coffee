import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiMapPin, FiPhone, FiGlobe, FiNavigation,
  FiClock, FiDollarSign, FiStar, FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import { getShopDetail, getDirections } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import ShopMap from '../components/ShopMap';
import './ShopDetail.css';

export default function ShopDetail() {
  const { placeId } = useParams();
  const { location } = useLocation();
  const { addToast } = useToast();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [directionsLoading, setDirectionsLoading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getShopDetail(placeId);
        setShop(res.data);
      } catch (err) {
        addToast('Failed to load shop details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [placeId, addToast]);

  const handleDirections = async () => {
    if (!location) {
      addToast('Please set your location first to get directions', 'warning');
      return;
    }
    setDirectionsLoading(true);
    try {
      const res = await getDirections(placeId, location.lat, location.lng);
      window.open(res.data.directions_url, '_blank');
    } catch (err) {
      addToast('Failed to get directions', 'error');
    } finally {
      setDirectionsLoading(false);
    }
  };

  const nextPhoto = () => {
    if (shop?.photo_urls?.length) {
      setPhotoIndex((prev) => (prev + 1) % shop.photo_urls.length);
    }
  };

  const prevPhoto = () => {
    if (shop?.photo_urls?.length) {
      setPhotoIndex((prev) => (prev - 1 + shop.photo_urls.length) % shop.photo_urls.length);
    }
  };

  const placeholderImg = `https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&h=600&fit=crop&q=80`;

  if (loading) {
    return (
      <div className="shop-detail__loading">
        <div className="shop-detail__loading-spinner" />
        <p>Loading shop details...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="shop-detail__loading">
        <p>Shop not found</p>
        <Link to="/home" className="shop-detail__back-btn">← Back to Home</Link>
      </div>
    );
  }

  const photoUrls = shop.photo_urls?.length ? shop.photo_urls : [placeholderImg];
  const openingHours = shop.opening_hours?.weekday_text || [];

  return (
    <div className="shop-detail">
      {/* Photo Gallery */}
      <div className="shop-detail__gallery">
        <motion.img
          key={photoIndex}
          src={photoUrls[photoIndex]}
          alt={shop.name}
          className="shop-detail__photo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          onError={(e) => { e.target.src = placeholderImg; }}
        />
        <div className="shop-detail__gallery-overlay" />

        <Link to="/home" className="shop-detail__back">
          <FiArrowLeft /> Back
        </Link>

        {photoUrls.length > 1 && (
          <>
            <button className="shop-detail__gallery-nav shop-detail__gallery-nav--prev" onClick={prevPhoto}>
              <FiChevronLeft />
            </button>
            <button className="shop-detail__gallery-nav shop-detail__gallery-nav--next" onClick={nextPhoto}>
              <FiChevronRight />
            </button>
            <div className="shop-detail__gallery-dots">
              {photoUrls.map((_, i) => (
                <span
                  key={i}
                  className={`shop-detail__gallery-dot ${i === photoIndex ? 'shop-detail__gallery-dot--active' : ''}`}
                  onClick={() => setPhotoIndex(i)}
                />
              ))}
            </div>
          </>
        )}

        {shop.is_new && (
          <span className="shop-detail__new-badge">✨ NEW</span>
        )}
      </div>

      {/* Content */}
      <div className="shop-detail__content container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Header */}
          <div className="shop-detail__header">
            <div className="shop-detail__header-left">
              <h1 className="shop-detail__name">{shop.name}</h1>
              <div className="shop-detail__rating-row">
                <StarRating rating={shop.rating || 0} size={18} />
                <span className="shop-detail__rating-count">
                  ({shop.total_ratings || 0} reviews)
                </span>
              </div>
              {shop.business_status && (
                <span className={`shop-detail__status ${
                  shop.business_status === 'OPERATIONAL' ? 'shop-detail__status--open' : 'shop-detail__status--closed'
                }`}>
                  {shop.business_status === 'OPERATIONAL' ? '● Open' : '● ' + shop.business_status}
                </span>
              )}
            </div>

            <motion.button
              className="shop-detail__directions-btn"
              onClick={handleDirections}
              disabled={directionsLoading}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FiNavigation /> {directionsLoading ? 'Loading...' : 'Get Directions'}
            </motion.button>
          </div>

          {/* Mini Map */}
          <div className="shop-detail__map-section">
            <h2 className="shop-detail__section-title">
              <FiMapPin /> Location
            </h2>
            <ShopMap
              shops={[{
                place_id: shop.place_id,
                name: shop.name,
                lat: shop.lat,
                lng: shop.lng,
                rating: shop.rating,
                address: shop.address,
              }]}
              userLocation={location}
              height="280px"
              singleShop={true}
            />
          </div>

          {/* Info Grid */}
          <div className="shop-detail__info-grid">
            {shop.address && (
              <div className="shop-detail__info-item glass-card">
                <FiMapPin className="shop-detail__info-icon" />
                <div>
                  <span className="shop-detail__info-label">Address</span>
                  <span className="shop-detail__info-value">{shop.address}</span>
                </div>
              </div>
            )}

            {shop.phone_number && (
              <div className="shop-detail__info-item glass-card">
                <FiPhone className="shop-detail__info-icon" />
                <div>
                  <span className="shop-detail__info-label">Phone</span>
                  <a href={`tel:${shop.phone_number}`} className="shop-detail__info-value shop-detail__info-link">
                    {shop.phone_number}
                  </a>
                </div>
              </div>
            )}

            {shop.website && (
              <div className="shop-detail__info-item glass-card">
                <FiGlobe className="shop-detail__info-icon" />
                <div>
                  <span className="shop-detail__info-label">Website</span>
                  <a href={shop.website} target="_blank" rel="noreferrer" className="shop-detail__info-value shop-detail__info-link">
                    Visit Website
                  </a>
                </div>
              </div>
            )}

            {shop.price_level > 0 && (
              <div className="shop-detail__info-item glass-card">
                <FiDollarSign className="shop-detail__info-icon" />
                <div>
                  <span className="shop-detail__info-label">Price Level</span>
                  <span className="shop-detail__info-value">
                    {'$'.repeat(shop.price_level)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Opening Hours */}
          {openingHours.length > 0 && (
            <div className="shop-detail__hours glass-card">
              <h2><FiClock /> Opening Hours</h2>
              <ul className="shop-detail__hours-list">
                {openingHours.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Types/Tags */}
          {shop.types?.length > 0 && (
            <div className="shop-detail__tags">
              {shop.types.map((type) => (
                <span key={type} className="shop-detail__tag">{type.replace(/_/g, ' ')}</span>
              ))}
            </div>
          )}

          {/* Reviews */}
          {shop.reviews?.length > 0 && (
            <div className="shop-detail__reviews">
              <h2 className="shop-detail__section-title">
                <FiStar /> Reviews ({shop.reviews.length})
              </h2>
              <div className="shop-detail__reviews-grid">
                {shop.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
