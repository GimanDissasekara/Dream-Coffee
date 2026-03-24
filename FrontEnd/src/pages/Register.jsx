import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUserPlus, FiCoffee } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const { registerUser, loading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter your email address', 'warning');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== confirm) {
      addToast('Passwords do not match', 'error');
      return;
    }
    const result = await registerUser(email, password);
    if (result.success) {
      addToast('Account created! Welcome to BrewMap ☕', 'success');
      navigate('/home', { replace: true });
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
          <h1>Create Account</h1>
          <p>Join BrewMap and find your next favorite spot</p>
        </div>

        <form className="auth-card__form" onSubmit={handleSubmit}>
          <div className="auth-card__field">
            <FiMail className="auth-card__field-icon" />
            <input
              id="register-email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-card__field">
            <FiLock className="auth-card__field-icon" />
            <input
              id="register-password"
              type="password"
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="auth-card__field">
            <FiLock className="auth-card__field-icon" />
            <input
              id="register-confirm"
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
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
                <FiUserPlus /> Create Account
              </>
            )}
          </motion.button>
        </form>

        <p className="auth-card__footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-card__link">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
