import { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCoffee, FiLogIn, FiLogOut, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path) => routerLocation.pathname === path;

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo" onClick={() => setMobileOpen(false)}>
          <FiCoffee className="navbar__logo-icon" />
          <span className="navbar__logo-text">BrewMap</span>
        </Link>

        <button className="navbar__mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          {isAuthenticated && (
            <Link
              to="/home"
              className={`navbar__link ${isActive('/home') ? 'navbar__link--active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              Discover
            </Link>
          )}

          {isAuthenticated ? (
            <div className="navbar__auth">
              <span className="navbar__user">
                <FiUser /> {user?.email?.split('@')[0]}
              </span>
              <button className="navbar__btn navbar__btn--logout" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          ) : (
            <div className="navbar__auth">
              <Link
                to="/login"
                className="navbar__btn navbar__btn--ghost"
                onClick={() => setMobileOpen(false)}
              >
                <FiLogIn /> Log In
              </Link>
              <Link
                to="/register"
                className="navbar__btn navbar__btn--primary"
                onClick={() => setMobileOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
