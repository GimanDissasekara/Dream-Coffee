import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMapPin, FiStar, FiCoffee } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing">
      {/* Ambient background */}
      <div className="landing__bg">
        <div className="landing__orb landing__orb--1" />
        <div className="landing__orb landing__orb--2" />
        <div className="landing__orb landing__orb--3" />
      </div>

      <section className="landing__hero container">
        <motion.div
          className="landing__content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.span
            className="landing__badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FiCoffee /> AI-Powered Recommendations
          </motion.span>

          <h1 className="landing__title">
            Discover Your{' '}
            <span className="landing__title-accent">Perfect</span>
            <br />
            Coffee Experience
          </h1>

          <p className="landing__subtitle">
            BrewMap uses intelligent scoring — blending ratings, reviews, atmosphere, and proximity —
            to recommend the 8 best coffee shops near you. Every visit, perfectly curated.
          </p>

          <div className="landing__cta">
            {isAuthenticated ? (
              <Link to="/home" className="landing__btn landing__btn--primary">
                Explore Near Me <FiArrowRight />
              </Link>
            ) : (
              <>
                <Link to="/register" className="landing__btn landing__btn--primary">
                  Get Started Free <FiArrowRight />
                </Link>
                <Link to="/login" className="landing__btn landing__btn--ghost">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          className="landing__visual"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="landing__card-stack">
            <motion.div
              className="landing__demo-card"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="landing__demo-img">☕</div>
              <div className="landing__demo-info">
                <span className="landing__demo-name">The Brew Lab</span>
                <span className="landing__demo-rating"><FiStar /> 4.8</span>
              </div>
              <span className="landing__demo-distance"><FiMapPin /> 0.5 km</span>
            </motion.div>

            <motion.div
              className="landing__demo-card landing__demo-card--offset"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <div className="landing__demo-img">🫘</div>
              <div className="landing__demo-info">
                <span className="landing__demo-name">Roast Origin</span>
                <span className="landing__demo-rating"><FiStar /> 4.6</span>
              </div>
              <span className="landing__demo-distance"><FiMapPin /> 1.2 km</span>
            </motion.div>

            <motion.div
              className="landing__demo-card landing__demo-card--offset-2"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              <div className="landing__demo-img">🍵</div>
              <div className="landing__demo-info">
                <span className="landing__demo-name">Morning Ritual</span>
                <span className="landing__demo-rating"><FiStar /> 4.9</span>
              </div>
              <span className="landing__demo-distance"><FiMapPin /> 0.3 km</span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Feature pills */}
      <motion.section
        className="landing__features container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="landing__feature glass-card">
          <FiMapPin className="landing__feature-icon" />
          <h3>Location Aware</h3>
          <p>Finds shops near your exact location with distance-based scoring</p>
        </div>
        <div className="landing__feature glass-card">
          <FiStar className="landing__feature-icon" />
          <h3>Smart Ranking</h3>
          <p>Combines Google ratings, review sentiment, and popularity signals</p>
        </div>
        <div className="landing__feature glass-card">
          <FiCoffee className="landing__feature-icon" />
          <h3>Personalized</h3>
          <p>Learns from your interactions to improve recommendations over time</p>
        </div>
      </motion.section>
    </div>
  );
}
