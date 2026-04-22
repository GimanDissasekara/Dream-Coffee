import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import ToastContainer from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ShopDetail from './pages/ShopDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import './App.css';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <LocationProvider>
          <ToastProvider>
            <div className="app">
              <Navbar />
              <main className="app__main">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Landing />} />

                    {/* Guest-only routes — redirect to /home if already logged in */}
                    <Route path="/login" element={
                      <GuestRoute><Login /></GuestRoute>
                    } />
                    <Route path="/register" element={
                      <GuestRoute><Register /></GuestRoute>
                    } />

                    {/* Protected routes — redirect to /login if not authenticated */}
                    <Route path="/home" element={
                      <ProtectedRoute><Home /></ProtectedRoute>
                    } />
                    <Route path="/shop/:placeId" element={
                      <ProtectedRoute><ShopDetail /></ProtectedRoute>
                    } />

                    {/* Admin only routes */}
                    <Route path="/admin" element={
                      <AdminRoute><AdminDashboard /></AdminRoute>
                    } />
                  </Routes>
                </AnimatePresence>
              </main>
              <ToastContainer />
            </div>
          </ToastProvider>
        </LocationProvider>
      </AuthProvider>
    </Router>
  );
}
