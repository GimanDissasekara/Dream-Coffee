import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiDollarSign } from 'react-icons/fi';
import StarRating from './StarRating';
import './ShopCard.css';

export default function ShopCard({ shop, index = 0 }) {
  const priceLevel = shop.price_level || 0;
  const placeholderImg = `https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop&q=80`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6 }}
      className="shop-card"
    >
      <Link to={`/shop/${shop.place_id}`} className="shop-card__link">
        <div className="shop-card__image-wrap">
          <img
            src={shop.photo_url || placeholderImg}
            alt={shop.name}
            className="shop-card__image"
            loading="lazy"
            onError={(e) => { e.target.src = placeholderImg; }}
          />
          <div className="shop-card__image-overlay" />

          {shop.is_new && (
            <span className="shop-card__badge shop-card__badge--new">✨ NEW</span>
          )}

          {shop.distance_km != null && (
            <span className="shop-card__badge shop-card__badge--distance">
              <FiMapPin size={12} /> {shop.distance_km} km
            </span>
          )}
        </div>

        <div className="shop-card__body">
          <h3 className="shop-card__name">{shop.name}</h3>

          <div className="shop-card__meta">
            <StarRating rating={shop.rating || 0} size={14} />
            <span className="shop-card__reviews">({shop.total_ratings || 0})</span>
          </div>

          {shop.address && (
            <p className="shop-card__address">
              <FiMapPin size={12} /> {shop.address}
            </p>
          )}

          <div className="shop-card__footer">
            <span className="shop-card__price">
              {[...Array(Math.max(1, priceLevel))].map((_, i) => (
                <FiDollarSign key={i} size={12} className="shop-card__price-dot" />
              ))}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
