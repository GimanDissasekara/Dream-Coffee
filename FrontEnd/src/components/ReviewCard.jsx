import StarRating from './StarRating';
import { FiUser } from 'react-icons/fi';
import './ReviewCard.css';

export default function ReviewCard({ review }) {
  return (
    <div className="review-card glass-card">
      <div className="review-card__header">
        <div className="review-card__avatar">
          {review.profile_photo_url ? (
            <img src={review.profile_photo_url} alt={review.author_name} />
          ) : (
            <FiUser size={18} />
          )}
        </div>
        <div className="review-card__author-info">
          <span className="review-card__name">{review.author_name || 'Anonymous'}</span>
          <span className="review-card__time">{review.relative_time_description || ''}</span>
        </div>
        <div className="review-card__rating-badge">
          <StarRating rating={review.rating || 0} size={12} showValue={false} />
        </div>
      </div>

      {review.text && (
        <p className="review-card__text">{review.text}</p>
      )}
    </div>
  );
}
