import { FiStar } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';
import './StarRating.css';

export default function StarRating({ rating = 0, size = 16, showValue = true }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="star-rating">
      <div className="star-rating__stars">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} size={size} className="star-rating__star star-rating__star--full" />
        ))}
        {hasHalf && <FaStarHalfAlt size={size} className="star-rating__star star-rating__star--half" />}
        {[...Array(Math.max(0, emptyStars))].map((_, i) => (
          <FiStar key={`empty-${i}`} size={size} className="star-rating__star star-rating__star--empty" />
        ))}
      </div>
      {showValue && <span className="star-rating__value">{rating?.toFixed(1)}</span>}
    </div>
  );
}
