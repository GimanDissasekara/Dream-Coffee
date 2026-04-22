import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCoffee, FiMessageSquare } from 'react-icons/fi';
import * as api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.adminGetAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      addToast('Failed to fetch analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading analytics...</div>;
  if (!analytics) return <div className="admin-error">No data available</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="admin-section"
    >
      <div className="admin-header">
        <h2>Analytics Overview</h2>
        <p>A high-level view of system metrics.</p>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <FiUsers className="admin-card-icon" />
          <h3>Total Users</h3>
          <p className="admin-card-stat">{analytics.total_users}</p>
        </div>
        <div className="admin-card">
          <FiCoffee className="admin-card-icon" />
          <h3>Total Shops</h3>
          <p className="admin-card-stat">{analytics.total_shops}</p>
        </div>
        <div className="admin-card">
          <FiMessageSquare className="admin-card-icon" />
          <h3>Total Reviews</h3>
          <p className="admin-card-stat">{analytics.total_reviews}</p>
        </div>
      </div>
    </motion.div>
  );
}
