import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave } from 'react-icons/fi';
import * as api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminConfig() {
  const [configs, setConfigs] = useState({
    enable_recommendations: true,
    enable_ratings: true,
    enable_notifications: false
  });
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await api.adminGetConfig();
      // Map array of {key, value} to object
      const configObj = { ...configs };
      res.data.forEach(item => {
        if (configObj.hasOwnProperty(item.key)) {
          configObj[item.key] = item.value;
        }
      });
      setConfigs(configObj);
    } catch (err) {
      addToast('Failed to load system config', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key) => {
    const newValue = !configs[key];
    setConfigs(prev => ({ ...prev, [key]: newValue }));
    try {
      await api.adminUpdateConfig(key, { value: newValue });
      addToast('Configuration updated', 'success');
    } catch (err) {
      // Revert on failure
      setConfigs(prev => ({ ...prev, [key]: !newValue }));
      addToast('Failed to update configuration', 'error');
    }
  };

  if (loading) return <div className="admin-loading">Loading configuration...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="admin-section"
    >
      <div className="admin-header">
        <h2>System Configuration</h2>
        <p>Enable or disable core system features dynamically.</p>
      </div>

      <div className="admin-config-list glass-card">
        <div className="config-item">
          <div className="config-info">
            <h3>Recommendation Engine</h3>
            <p>Allow the system to generate AI-driven hybrid recommendations.</p>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={configs.enable_recommendations} 
              onChange={() => handleToggle('enable_recommendations')} 
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="config-item">
          <div className="config-info">
            <h3>User Ratings & Reviews</h3>
            <p>Allow users to post reviews and adjust coffee shop ratings.</p>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={configs.enable_ratings} 
              onChange={() => handleToggle('enable_ratings')} 
            />
            <span className="slider round"></span>
          </label>
        </div>

        <div className="config-item">
          <div className="config-info">
            <h3>System Notifications</h3>
            <p>Enable broadcasting of system-wide notifications.</p>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={configs.enable_notifications} 
              onChange={() => handleToggle('enable_notifications')} 
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </motion.div>
  );
}
