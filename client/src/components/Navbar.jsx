import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import {
    Search,
    ShoppingCart,
    ChevronDown,
    Heart,
    LogOut,
    Zap,
    LayoutGrid,
    Package,
    User,
    Menu,
    X,
    Bell,
    MapPin,
    ArrowRight
} from 'lucide-react';
import MegaCategoryNav from './MegaCategoryNav';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [alertsOpen, setAlertsOpen] = useState(false);
    const accountRef = useRef(null);
    const alertsRef = useRef(null);

    const isHome = location.pathname === '/';
    const isDeals = location.pathname === '/deals';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    /* Close dropdowns on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
            if (alertsRef.current && !alertsRef.current.contains(e.target)) setAlertsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const r = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setNotifications(r.data.data || []);
        } catch { console.error('Notifications check failed'); }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const hasUnread = notifications.some(n => !n.is_read);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const cartCount = cartItems?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;

    return (
        <>
            <header className={`ss-navbar-root ${(isHome || isDeals) && !scrolled ? 'nav-transparent' : 'nav-scrolled'} ${isDeals ? 'nav-dark' : ''}`}>

                {/* ── TOP ROW ── */}
                <div className="nav-top-utility">
                    <div className="container nav-grid-3">

                        {/* Brand */}
                        <Link to="/" className="nav-brand-stage" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <img src="/logo.png" width={95} height={95} alt="Logo" className="nav-logo-luxe" />
                            <span className="brand-text-luxe">ShopSizzle</span>
                        </Link>

                        {/* Search & Location Hub */}
                        <div className="search-location-hub">
                            <form className="search-hub-large" onSubmit={handleSearch}>
                                <div className="location-bar-mini">
                                    <MapPin size={12} className="loc-pin-icon" />
                                    <span className="location-text"><span className="loc-action">Select delivery location</span></span>
                                    <ChevronDown size={12} className="loc-chevron" />
                                </div>
                                <div className="search-divider-v" />
                                <Search size={18} color="var(--accent-gold)" strokeWidth={2} />
                                <input
                                    placeholder="Search for Products, Brands and More"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" style={{ display: 'none' }} />
                            </form>
                        </div>

                        {/* Actions */}
                        <div className="utility-actions-stack">

                            {/* Account */}
                            {user ? (
                                <div
                                    ref={accountRef}
                                    className="utility-item account-trigger"
                                    onClick={() => setAccountOpen(o => !o)}
                                >
                                    <span className="label-xs">Account</span>
                                    <span className="label-sm flex-row gap-1" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {user.name?.split(' ')[0] || 'Hey!'} <ChevronDown size={13} style={{ transition: 'transform .2s', transform: accountOpen ? 'rotate(180deg)' : 'none' }} />
                                    </span>

                                    {/* Dropdown */}
                                    <div className={`account-dropdown ${accountOpen ? 'open' : ''}`}>
                                        <div className="acct-user-row">
                                            <div className="acct-avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0f172a' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>{user.role} account</div>
                                            </div>
                                        </div>
                                        <div className="acct-divider" />
                                        <button
                                            onClick={() => { logout(); setAccountOpen(false); }}
                                            className="acct-logout"
                                        >
                                            <LogOut size={15} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className="nav-signin-pill">
                                    Sign In
                                </Link>
                            )}


                            {/* Wishlist */}
                            <Link to="/wishlist" className="utility-item hide-mobile nav-link">
                                <span className="label-xs">Saved</span>
                                <span className="label-sm" style={{ display: 'flex', alignItems: 'center' }}>
                                    <Heart size={18} strokeWidth={2.5} />
                                </span>
                            </Link>

                            {/* Notifications Nav */}
                            <div className="utility-item account-trigger" ref={alertsRef} onClick={() => setAlertsOpen(o => !o)}>
                                <span className="label-xs">Alerts</span>
                                <span className="label-sm" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                    <Bell size={18} strokeWidth={2.5} />
                                    {hasUnread && <span className="notification-dot"></span>}
                                </span>

                                <div className={`account-dropdown alerts-dropdown ${alertsOpen ? 'open' : ''}`}>
                                    <div className="dropdown-header">
                                        <h4>Notifications</h4>
                                        <Link to="/notifications" onClick={() => setAlertsOpen(false)}>View All</Link>
                                    </div>
                                    <div className="acct-divider" />
                                    <div className="notifications-list-mini">
                                        {notifications.length === 0 ? (
                                            <div className="empty-notifications">No new alerts.</div>
                                        ) : (
                                            notifications.slice(0, 5).map(n => (
                                                <div key={n.id} className={`mini-notification-item ${!n.is_read ? 'unread' : ''}`}>
                                                    <div className="mini-notif-title">{n.title}</div>
                                                    <div className="mini-notif-text">{n.message}</div>
                                                    <div className="mini-notif-time">{new Date(n.created_at).toLocaleDateString()}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Cart */}
                            <div className="utility-item nav-link">
                                <Link to="/cart" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', textDecoration: 'none' }}>
                                    <span className="label-xs">Cart</span>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <ShoppingCart size={22} strokeWidth={2.5} />
                                        {cartCount > 0 && (
                                            <span className="badge-float">{cartCount > 99 ? '99+' : cartCount}</span>
                                        )}
                                    </div>
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>

                {/* ── MOBILE SEARCH & LOCATION ── */}
                <div className="mobile-utility-hub">
                    <div className="mobile-location-row">
                        <MapPin size={12} /> 500038 <span className="loc-action">Select delivery location <ChevronDown size={10} /></span>
                    </div>
                    <form className="mobile-search-bar" onSubmit={handleSearch}>
                        <Search size={16} color="#94a3b8" />
                        <input
                            placeholder="Search products, brands..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', paddingLeft: '0.75rem', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}
                        />
                        <button type="submit" style={{ display: 'none' }} />
                    </form>
                </div>
            </header>

            {/* ── MEGA CATEGORY NAV (below header, separately sticky) ── */}
            <div className="mcn-wrapper">
                <MegaCategoryNav />
            </div>
        </>
    );
};

export default Navbar;
