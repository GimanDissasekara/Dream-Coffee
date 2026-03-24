import './SkeletonCard.css';

export default function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card__image skeleton-shimmer" />
      <div className="skeleton-card__body">
        <div className="skeleton-card__line skeleton-card__line--title skeleton-shimmer" />
        <div className="skeleton-card__line skeleton-card__line--subtitle skeleton-shimmer" />
        <div className="skeleton-card__row">
          <div className="skeleton-card__line skeleton-card__line--sm skeleton-shimmer" />
          <div className="skeleton-card__line skeleton-card__line--sm skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
