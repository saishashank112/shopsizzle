import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, User, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './BottomNav.css';

const BottomNav = () => {
    const { user } = useAuth();
    const location = useLocation();
    
    // Hide bottom nav on admin panel or empty frames
    if (location.pathname.startsWith('/admin')) return null;

    return (
        <div className="bottom-nav-root">
            <Link to="/" className={`bnav-item ${location.pathname === '/' ? 'active' : ''}`}>
                <Home size={22} />
                <span>Home</span>
            </Link>
            <Link to="/catalog" className={`bnav-item ${location.pathname === '/catalog' ? 'active' : ''}`}>
                <ShoppingBag size={22} />
                <span>Catalog</span>
            </Link>
            <Link to="/deals" className={`bnav-item ${location.pathname === '/deals' ? 'active' : ''}`}>
                <Zap size={22} />
                <span>Deals</span>
            </Link>
            {!user ? (
                <Link to="/login" className={`bnav-item ${location.pathname === '/login' ? 'active' : ''}`}>
                    <User size={22} />
                    <span>Login</span>
                </Link>
            ) : (
                <Link to="/dashboard" className={`bnav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                    <User size={22} />
                    <span>{user.name?.split(' ')[0] || 'Profile'}</span>
                </Link>
            )}
        </div>
    );
};

export default BottomNav;
