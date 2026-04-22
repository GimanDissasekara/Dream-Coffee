import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Decode JWT payload directly as a fallback
function getTokenRole(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))?.role || null;
  } catch {
    return null;
  }
}

export default function AdminRoute({ children }) {
  const { isAuthenticated, user, token } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role from user object first, fall back to reading from JWT directly
  const role = user?.role || getTokenRole(token);

  if (role === 'admin') {
    return children;
  }

  // Authenticated but not admin → send back to home
  return <Navigate to="/home" replace />;
}
