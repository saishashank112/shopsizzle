import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import Deals from './pages/Deals';
import Transactions from './pages/Transactions';
import OrderTracking from './pages/OrderTracking';
import Notifications from './pages/Notifications';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext'; 
import { WishlistProvider } from './context/WishlistContext';
import Wishlist from './pages/Wishlist';

// ── PROTECTED ROUTE ENGINE ─────────────────────────────────────
const ProtectedRoute = ({ children, admin = false }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (admin && !isAdmin) return <Navigate to="/dashboard" />;
  return children;
};

import useTracking from './hooks/useTracking';

const AppContent = () => {
  useTracking();
  const location = useLocation();
  const isCleanPath = location.pathname.startsWith('/admin') || location.pathname === '/login' || location.pathname === '/register';

  // Remove body padding on admin/auth pages
  useEffect(() => {
    if (isCleanPath) {
      document.body.classList.add('no-nav-offset');
    } else {
      document.body.classList.remove('no-nav-offset');
    }
  }, [isCleanPath]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-main relative min-h-screen bg-surface" style={{ display: 'flex', flexDirection: 'column' }}>
      {!isCleanPath && <Navbar />}
      <div className="routes-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute admin={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/categories" element={<Catalog />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/track" element={<OrderTracking />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
      {!isCleanPath && <Footer />}
      {!isCleanPath && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
