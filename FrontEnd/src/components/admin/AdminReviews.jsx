import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiFlag, FiTrash2 } from 'react-icons/fi';
import * as api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.adminGetReviews();
      setReviews(res.data);
    } catch (err) {
      addToast('Failed to load reviews', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.adminUpdateReview(id, { status });
      addToast(`Review marked as ${status}`, 'success');
      fetchReviews();
    } catch (err) {
      addToast('Failed to update review', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.adminDeleteReview(id);
      addToast('Review deleted', 'success');
      fetchReviews();
    } catch (err) {
      addToast('Failed to delete review', 'error');
    }
  };

  if (loading) return <div className="admin-loading">Loading reviews...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="admin-section"
    >
      <div className="admin-header">
        <h2>Review Moderation</h2>
        <p>Monitor and moderate user reviews.</p>
      </div>

      <div className="admin-table-container glass-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Author</th>
              <th>Shop ID</th>
              <th>Rating</th>
              <th>Content</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className={r.status === 'deleted' ? 'row-suspended' : ''}>
                <td>{r.id}</td>
                <td>{r.author_name || 'Anonymous'}</td>
                <td>{r.shop_id}</td>
                <td>{r.rating} ⭐</td>
                <td className="review-text-cell" title={r.text}>
                  {r.text ? (r.text.length > 50 ? r.text.substring(0, 50) + '...' : r.text) : 'No comment'}
                </td>
                <td>
                  <span className={`admin-badge status-${r.status}`}>
                    {r.status}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    {r.status !== 'active' && (
                      <button 
                        className="btn-icon btn-success"
                        onClick={() => handleUpdateStatus(r.id, 'active')}
                        title="Approve"
                      >
                        <FiCheckCircle />
                      </button>
                    )}
                    {r.status !== 'flagged' && r.status !== 'deleted' && (
                      <button 
                        className="btn-icon btn-warning"
                        onClick={() => handleUpdateStatus(r.id, 'flagged')}
                        title="Flag"
                      >
                        <FiFlag />
                      </button>
                    )}
                    {r.status !== 'deleted' && (
                      <button 
                        className="btn-icon btn-danger"
                        onClick={() => handleDelete(r.id)}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
