import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiCoffee, FiMessageSquare, FiSettings, FiActivity } from 'react-icons/fi';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import AdminUsers from '../components/admin/AdminUsers';
import AdminShops from '../components/admin/AdminShops';
import AdminReviews from '../components/admin/AdminReviews';
import AdminConfig from '../components/admin/AdminConfig';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');

  // Component selection logic is now rendered directly

  return (
    <motion.div 
      className="admin-dashboard page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="admin-title">Admin Dashboard</h1>
      
      <div className="admin-layout">
        <aside className="admin-sidebar glass-card">
          <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
            <FiActivity /> Analytics
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            <FiUsers /> Users
          </button>
          <button className={activeTab === 'shops' ? 'active' : ''} onClick={() => setActiveTab('shops')}>
            <FiCoffee /> Coffee Shops
          </button>
          <button className={activeTab === 'reviews' ? 'active' : ''} onClick={() => setActiveTab('reviews')}>
            <FiMessageSquare /> Reviews
          </button>
          <button className={activeTab === 'config' ? 'active' : ''} onClick={() => setActiveTab('config')}>
            <FiSettings /> Configuration
          </button>
        </aside>

        <main className="admin-content glass-card">
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'shops' && <AdminShops />}
          {activeTab === 'reviews' && <AdminReviews />}
          {activeTab === 'config' && <AdminConfig />}
        </main>
      </div>
    </motion.div>
  );
}
