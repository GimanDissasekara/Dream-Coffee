import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiShield } from 'react-icons/fi';
import * as api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.adminGetUsers();
      setUsers(res.data);
    } catch (err) {
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.adminUpdateUser(id, { role: newRole });
      addToast('User role updated', 'success');
      fetchUsers();
    } catch (err) {
      addToast('Failed to update role', 'error');
    }
  };

  const handleSuspend = async (id, currentStatus) => {
    try {
      if (currentStatus === 'suspended') {
        // Unsuspend
        await api.adminUpdateUser(id, { status: 'active' });
        addToast('User reactivated', 'success');
      } else {
        await api.adminDeleteUser(id);
        addToast('User suspended', 'warning');
      }
      fetchUsers();
    } catch (err) {
      addToast('Action failed', 'error');
    }
  };

  if (loading) return <div className="admin-loading">Loading users...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="admin-section"
    >
      <div className="admin-header">
        <h2>User Management</h2>
        <p>Manage user roles and account statuses.</p>
      </div>

      <div className="admin-table-container glass-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={u.status === 'suspended' ? 'row-suspended' : ''}>
                <td>{u.id}</td>
                <td className="fw-600">{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <select 
                    className={`admin-select role-${u.role}`}
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`admin-badge status-${u.status}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    <button 
                      className={`btn-icon ${u.status === 'suspended' ? 'btn-success' : 'btn-danger'}`}
                      onClick={() => handleSuspend(u.id, u.status)}
                      title={u.status === 'suspended' ? 'Reactivate User' : 'Suspend User'}
                    >
                      {u.status === 'suspended' ? <FiShield /> : <FiTrash2 />}
                    </button>
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
