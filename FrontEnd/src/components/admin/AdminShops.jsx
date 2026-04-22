import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMap, FiPlus, FiTrash2, FiSave, FiX, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import * as api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const EMPTY_FORM = { name: '', address: '', lat: '', lng: '', rating: '', description: '', recommendation: '', photo_urls: '' };

export default function AdminShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const { addToast } = useToast();

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const res = await api.adminGetShops();
      setShops(res.data);
    } catch (err) {
      addToast('Failed to load shops', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        rating: parseFloat(formData.rating) || 0,
        description: formData.description,
        recommendation: formData.recommendation,
        photo_urls: formData.photo_urls ? formData.photo_urls.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      await api.adminAddShop(payload);
      addToast('Shop added successfully ☕', 'success');
      setShowAddForm(false);
      setFormData(EMPTY_FORM);
      fetchShops();
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to add shop', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (shop) => {
    const newStatus = shop.status === 'active' ? 'inactive' : 'active';
    try {
      if (newStatus === 'inactive') {
        await api.adminDeleteShop(shop.id);
      } else {
        await api.adminUpdateShop(shop.id, { status: 'active' });
      }
      addToast(`Shop marked as ${newStatus}`, 'success');
      fetchShops();
    } catch (err) {
      addToast('Failed to update shop status', 'error');
    }
  };

  const openMapSearch = () => {
    const query = formData.name ? encodeURIComponent(formData.name) : 'Coffee Shop Sri Lanka';
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="admin-section"
    >
      <div className="admin-header flex-between">
        <div>
          <h2>Coffee Shop Management</h2>
          <p>Add and manage coffee shops in the recommender system.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? <><FiX /> Cancel</> : <><FiPlus /> Add Shop</>}
        </button>
      </div>

      {showAddForm && (
        <div className="admin-form-card glass-card">
          <h3>Add New Coffee Shop</h3>
          <form onSubmit={handleAddSubmit} className="admin-form">
            <div className="form-group-row">
              <div className="form-group">
                <label>Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Barista Coffee" required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Full address" />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Latitude *</label>
                <input type="number" step="any" name="lat" value={formData.lat} onChange={handleInputChange} placeholder="6.9271" required />
              </div>
              <div className="form-group">
                <label>Longitude *</label>
                <input type="number" step="any" name="lng" value={formData.lng} onChange={handleInputChange} placeholder="79.8612" required />
              </div>
              <div className="form-group map-btn-group">
                <label style={{ opacity: 0 }}>.</label>
                <button type="button" className="btn-secondary" onClick={openMapSearch} title="Search on Google Maps to find coordinates">
                  <FiMap /> Search on Map
                </button>
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Rating (0–5)</label>
                <input type="number" step="0.1" min="0" max="5" name="rating" value={formData.rating} onChange={handleInputChange} placeholder="4.5" />
              </div>
              <div className="form-group flex-2">
                <label>Photo URLs (comma-separated)</label>
                <input type="text" name="photo_urls" value={formData.photo_urls} onChange={handleInputChange} placeholder="https://..." />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Describe the coffee shop atmosphere, specialties..." />
            </div>

            <div className="form-group">
              <label>Admin Recommendation Message (Optional)</label>
              <textarea name="recommendation" value={formData.recommendation} onChange={handleInputChange} rows="2" placeholder="Why you recommend this place..." />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={submitting}>
                <FiSave /> {submitting ? 'Saving...' : 'Save Shop'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-container glass-card">
        {loading ? (
          <div className="admin-loading">Loading shops...</div>
        ) : shops.length === 0 ? (
          <p className="p-2 text-center text-secondary">No shops found. Add one using the button above.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>Rating</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops.map(shop => (
                <tr key={shop.id} className={shop.status !== 'active' ? 'row-suspended' : ''}>
                  <td>{shop.id}</td>
                  <td className="fw-600">{shop.name}</td>
                  <td>{shop.address || '—'}</td>
                  <td>{shop.rating ? `${shop.rating.toFixed(1)} ⭐` : '—'}</td>
                  <td>
                    <span className={`admin-badge ${shop.is_manual ? 'status-pending' : 'status-active'}`}>
                      {shop.is_manual ? 'Manual' : 'Google Maps'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge status-${shop.status}`}>{shop.status}</span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className={`btn-icon ${shop.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => handleToggleStatus(shop)}
                        title={shop.status === 'active' ? 'Deactivate Shop' : 'Reactivate Shop'}
                      >
                        {shop.status === 'active' ? <FiTrash2 /> : <FiToggleRight />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
