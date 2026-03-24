import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import StarRating from './StarRating';
import './ShopMap.css';

// Custom coffee-shop marker icon
const shopIcon = new L.DivIcon({
  className: 'shop-marker',
  html: `<div class="shop-marker__pin">☕</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// User location marker
const userIcon = new L.DivIcon({
  className: 'user-marker',
  html: `<div class="user-marker__pin">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Auto-fit map bounds when shops change
function FitBounds({ shops, userLocation }) {
  const map = useMap();
  useMemo(() => {
    const points = shops.map((s) => [s.lat, s.lng]);
    if (userLocation) points.push([userLocation.lat, userLocation.lng]);
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [shops, userLocation, map]);
  return null;
}

/**
 * ShopMap — displays coffee shops as markers on a Leaflet map.
 * Props:
 *   shops: array of { place_id, name, lat, lng, rating, address, photo_url }
 *   userLocation: { lat, lng } or null
 *   height: CSS height string (default '400px')
 *   singleShop: boolean — if true, shows a single-shop detail view
 */
export default function ShopMap({ shops = [], userLocation = null, height = '400px', singleShop = false }) {
  // Default center: user location or first shop or Colombo
  const center = useMemo(() => {
    if (userLocation) return [userLocation.lat, userLocation.lng];
    if (shops.length > 0) return [shops[0].lat, shops[0].lng];
    return [6.9271, 79.8612]; // Colombo fallback
  }, [shops, userLocation]);

  const zoom = singleShop ? 16 : 13;

  return (
    <div className="shop-map" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="shop-map__container"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {!singleShop && <FitBounds shops={shops} userLocation={userLocation} />}

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup className="shop-map__popup">
              <div className="shop-map__popup-content">
                <strong>📍 Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Shop markers */}
        {shops.map((shop) => (
          <Marker
            key={shop.place_id}
            position={[shop.lat, shop.lng]}
            icon={shopIcon}
          >
            <Popup className="shop-map__popup">
              <div className="shop-map__popup-content">
                <strong className="shop-map__popup-name">{shop.name}</strong>
                {shop.rating > 0 && (
                  <div className="shop-map__popup-rating">
                    <StarRating rating={shop.rating} size={12} showValue={true} />
                  </div>
                )}
                {shop.address && (
                  <p className="shop-map__popup-address">{shop.address}</p>
                )}
                {!singleShop && (
                  <Link to={`/shop/${shop.place_id}`} className="shop-map__popup-link">
                    View Details →
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
