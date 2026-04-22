import { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiLogIn, FiCoffee } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { loginUser, loading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  // Where to redirect after successful login
  const from = routerLocation.state?.from || '/home';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      addToast('Please enter your username', 'warning');
      return;
    }
    if (!password) {
      addToast('Please enter your password', 'warning');
      return;
    }
    const result = await loginUser(username, password);
    if (result.success) {
      addToast('Welcome back! ☕', 'success');
      if (result.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } else {
      addToast(result.error, 'error');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg">
        <div className="auth-page__orb auth-page__orb--1" />
        <div className="auth-page__orb auth-page__orb--2" />
      </div>

      <motion.div
        className="auth-card glass-card"
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-card__header">
          <FiCoffee className="auth-card__icon" />
          <h1>Welcome Back</h1>
          <p>Sign in to discover curated coffee spots</p>
        </div>

        <form className="auth-card__form" onSubmit={handleSubmit}>
          <div className="auth-card__field">
            <FiUser className="auth-card__field-icon" />
            <input
              id="login-username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="auth-card__field">
            <FiLock className="auth-card__field-icon" />
            <input
              id="login-password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <motion.button
            type="submit"
            className="auth-card__submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span className="auth-card__spinner" />
            ) : (
              <>
                <FiLogIn /> Sign In
              </>
            )}
          </motion.button>
        </form>

        <p className="auth-card__footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-card__link">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
