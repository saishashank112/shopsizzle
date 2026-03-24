import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ChevronDown, ChevronRight, Sparkles, TrendingUp, Zap,
    Star, Tag, ArrowRight, X, Menu, Grid3X3
} from 'lucide-react';
import './MegaCategoryNav.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── Static featured content per slug (fallback if no dynamic data) ── */
const FEATURED_CONTENT = {
    electronics: {
        trending: ['Smartphones Under ₹15K', 'True Wireless Earbuds', 'Gaming Laptops', '5G Ready Phones'],
        brands: ['Apple', 'Samsung', 'OnePlus', 'Sony', 'boAt'],
        banner: { label: 'Season Pick', title: 'Premium Tech Drops', sub: 'New arrivals every week', color: '#0f172a', accent: '#818cf8' }
    },
    fashion: {
        trending: ['Ethnic Festive Wear', 'Sustainable Fabrics', 'Designer Sneakers', 'Street Wear'],
        brands: ['Zara', 'H&M', 'FabIndia', 'Puma', 'Nike'],
        banner: { label: 'New Season', title: 'Style Curated', sub: 'From runway to wardrobe', color: '#1a0a2e', accent: '#f59e0b' }
    },
    default: {
        trending: ['Best Sellers', 'New Arrivals', 'Trending Now', 'Top Rated'],
        brands: ['Premium', 'Verified', 'Certified', 'Exclusive'],
        banner: { label: 'ShopSizzle', title: 'Discover More', sub: 'Explore our full catalog', color: '#0f172a', accent: '#f59e0b' }
    }
};

const getFeatured = (slug) => FEATURED_CONTENT[slug] || FEATURED_CONTENT[slug?.split('/')[0]] || FEATURED_CONTENT.default;

/* ── BY-SECTION data for column 2 ── */
const DEEP_SECTIONS = {
    electronics: [
        { heading: 'By Budget', items: ['Under ₹5,000', '₹5K – ₹20K', '₹20K – ₹50K', 'Premium (₹50K+)'] },
        { heading: 'By Use', items: ['Gaming', 'Photography', 'Business', 'Student'] },
    ],
    fashion: [
        { heading: 'By Occasion', items: ['Casual Daily', 'Office Formal', 'Party & Evening', 'Wedding & Festive'] },
        { heading: 'By Style', items: ['Western', 'Ethnic', 'Fusion', 'Athleisure'] },
    ],
    default: [
        { heading: 'By Rating', items: ['Top Rated 4.5+', 'Editor\'s Choice', 'Most Reviewed'] },
        { heading: 'By Value', items: ['Best Deals', 'Free Shipping', 'Cash on Delivery'] },
    ]
};

const getDeepSections = (slug) => DEEP_SECTIONS[slug] || DEEP_SECTIONS.default;

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const MegaCategoryNav = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [activeSlug, setActiveSlug] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileExpanded, setMobileExpanded] = useState(null);
    const hoverTimer = useRef(null);
    const menuRef = useRef(null);

    /* ── Load categories from catalog API ── */
    useEffect(() => {
        axios.get(`${API}/api/catalog/categories`)
            .then(r => setCategories(r.data.data || []))
            .catch(() => {
                // Fallback hardcoded categories
                setCategories([
                    { id: 1, name: 'Electronics', slug: 'electronics', parent_id: null, status: 'active' },
                    { id: 2, name: 'Fashion', slug: 'fashion', parent_id: null, status: 'active' },
                    { id: 3, name: 'Watches', slug: 'watches', parent_id: null, status: 'active' },
                    { id: 4, name: 'Home & Living', slug: 'home', parent_id: null, status: 'active' },
                    { id: 5, name: 'Beauty', slug: 'beauty', parent_id: null, status: 'active' },
                ]);
            });
    }, []);

    /* ── Only show root (parent_id = null) in top bar ── */
    const rootCats = categories.filter(c => !c.parent_id && c.status === 'active');

    /* ── children by parent id ── */
    const getChildren = (parentId) => categories.filter(c => c.parent_id === parentId);

    /* ── Hover with delay to avoid flicker ── */
    const handleMouseEnter = useCallback((slug) => {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => setActiveSlug(slug), 80);
    }, []);

    const handleMouseLeave = useCallback(() => {
        clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => setActiveSlug(null), 120);
    }, []);

    /* ── Close on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setActiveSlug(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── Navigation helpers ── */
    const goToCategory = (slug) => {
        navigate(`/catalog?cat=${slug}`);
        setActiveSlug(null);
        setMobileOpen(false);
    };

    const activeCategory = categories.find(c => c.slug === activeSlug);
    const children = activeCategory ? getChildren(activeCategory.id) : [];
    const featured = activeSlug ? getFeatured(activeSlug) : null;
    const deepSections = activeSlug ? getDeepSections(activeSlug) : [];

    /* ══════════════════════════
       RENDER
    ══════════════════════════ */
    return (
        <>
            {/* ── DESKTOP BAR ── */}
            <nav className="mcn-bar" ref={menuRef}>
                <div className="mcn-inner">
                    {/* All Products link */}
                    <Link to="/catalog" className="mcn-all-link">
                        <Grid3X3 size={13} /> All
                    </Link>

                    {/* Category tabs */}
                    <ul className="mcn-list">
                        {rootCats.map(cat => (
                            <li
                                key={cat.id}
                                className={`mcn-item ${activeSlug === cat.slug ? 'active' : ''}`}
                                onMouseEnter={() => handleMouseEnter(cat.slug)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <button onClick={() => goToCategory(cat.slug)} className="mcn-tab-btn">
                                    {cat.name}
                                    <ChevronDown size={12} className="mcn-chevron" />
                                </button>
                            </li>
                        ))}
                        <li className="mcn-item">
                            <Link to="/deals" className="mcn-tab-btn mcn-deals-link">
                                <Zap size={12} fill="currentColor" /> Deals
                            </Link>
                        </li>
                        <li className="mcn-item">
                            <Link to="/catalog?sort=new" className="mcn-tab-btn">New Arrivals</Link>
                        </li>
                    </ul>

                    {/* Mobile toggle */}
                    <button className="mcn-mobile-toggle" onClick={() => setMobileOpen(true)}>
                        <Menu size={20} />
                    </button>
                </div>

                {/* ── MEGA MENU PANEL ── */}
                {rootCats.map(cat => (
                    <div
                        key={cat.id}
                        className={`mcn-mega-panel ${activeSlug === cat.slug ? 'visible' : ''}`}
                        onMouseEnter={() => handleMouseEnter(cat.slug)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <div className="mcn-mega-inner">

                            {/* Column 1: Subcategories */}
                            <div className="mcn-col mcn-col-sub">
                                <div className="mcn-col-header">Browse {cat.name}</div>
                                <ul className="mcn-sub-list">
                                    <li>
                                        <button onClick={() => goToCategory(cat.slug)} className="mcn-sub-link mcn-sub-all">
                                            All {cat.name} <ArrowRight size={12} />
                                        </button>
                                    </li>
                                    {getChildren(cat.id).map(child => (
                                        <li key={child.id}>
                                            <button onClick={() => goToCategory(child.slug)} className="mcn-sub-link">
                                                <ChevronRight size={11} /> {child.name}
                                            </button>
                                        </li>
                                    ))}
                                    {getChildren(cat.id).length === 0 && (
                                        <>
                                            {['Top Picks', 'New Arrivals', 'Best Sellers', 'Sale Items'].map(s => (
                                                <li key={s}>
                                                    <button onClick={() => navigate(`/catalog?cat=${cat.slug}&search=${s}`)} className="mcn-sub-link">
                                                        <ChevronRight size={11} /> {s}
                                                    </button>
                                                </li>
                                            ))}
                                        </>
                                    )}
                                </ul>
                            </div>

                            {/* Column 2: Deep sections (By Budget, By Use, etc.) */}
                            <div className="mcn-col mcn-col-deep">
                                {getDeepSections(cat.slug).map((section, i) => (
                                    <div key={i} className="mcn-deep-section">
                                        <div className="mcn-deep-heading">{section.heading}</div>
                                        <ul className="mcn-deep-list">
                                            {section.items.map(item => {
                                                // Build smart URL based on section heading
                                                const heading = section.heading.toLowerCase();
                                                let url = `/catalog?cat=${cat.slug}`;
                                                if (heading.includes('budget')) {
                                                    // Parse price ranges
                                                    if (item.includes('Under') || item.toLowerCase().includes('under')) {
                                                        const match = item.match(/[\d,]+/);
                                                        if (match) url += `&max=${match[0].replace(/,/g, '')}`;
                                                    } else if (item.includes('–') || item.includes('-')) {
                                                        const parts = item.match(/[\d,]+/g);
                                                        if (parts && parts.length >= 2) {
                                                            url += `&min=${parts[0].replace(/,/g, '')}&max=${parts[1].replace(/,/g, '')}`;
                                                        }
                                                    } else if (item.toLowerCase().includes('premium') || item.includes('+')) {
                                                        const match = item.match(/[\d,]+/);
                                                        if (match) url += `&min=${match[0].replace(/,/g, '')}`;
                                                    }
                                                } else {
                                                    // Use item as search term
                                                    url += `&search=${encodeURIComponent(item)}`;
                                                }
                                                return (
                                                    <li key={item}>
                                                        <button onClick={() => { navigate(url); setActiveSlug(null); setMobileOpen(false); }} className="mcn-deep-link">
                                                            {item}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Column 3: Trending */}
                            <div className="mcn-col mcn-col-trending">
                                <div className="mcn-col-header">
                                    <TrendingUp size={13} /> Trending Now
                                </div>
                                <ul className="mcn-trending-list">
                                    {getFeatured(cat.slug).trending.map((item, i) => (
                                        <li key={item}>
                                            <button onClick={() => { navigate(`/catalog?cat=${cat.slug}&search=${encodeURIComponent(item)}`); setActiveSlug(null); setMobileOpen(false); }} className="mcn-trending-link">
                                                <span className="mcn-trend-rank">#{i + 1}</span>
                                                {item}
                                                {i === 0 && <span className="mcn-hot-badge">🔥</span>}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mcn-col-header" style={{ marginTop: '1.25rem' }}>
                                    <Sparkles size={13} /> Top Brands
                                </div>
                                <div className="mcn-brands-row">
                                    {getFeatured(cat.slug).brands.map(b => (
                                        <button key={b} onClick={() => { navigate(`/catalog?search=${encodeURIComponent(b)}`); setActiveSlug(null); setMobileOpen(false); }} className="mcn-brand-pill">
                                            {b}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Column 4: Visual campaign card */}
                            <div className="mcn-col mcn-col-banner">
                                {(() => {
                                    const f = getFeatured(cat.slug);
                                    return (
                                        <div className="mcn-campaign-card" style={{ background: f.banner.color }}>
                                            <div className="mcn-campaign-badge" style={{ background: f.banner.accent, color: f.banner.color }}>
                                                <Tag size={10} /> {f.banner.label}
                                            </div>
                                            <h3 className="mcn-campaign-title">{f.banner.title}</h3>
                                            <p className="mcn-campaign-sub">{f.banner.sub}</p>
                                            <div className="mcn-campaign-stars">
                                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} fill={f.banner.accent} color={f.banner.accent} />)}
                                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,.6)', marginLeft: 4 }}>Editor's Choice</span>
                                            </div>
                                            <button onClick={() => goToCategory(cat.slug)} className="mcn-campaign-cta" style={{ borderColor: f.banner.accent, color: f.banner.accent }}>
                                                Explore Collection <ArrowRight size={13} />
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>

                        </div>
                    </div>
                ))}
            </nav>

            {/* ── MOBILE FULL-SCREEN DRAWER ── */}
            {mobileOpen && (
                <div className="mcn-mobile-backdrop" onClick={() => setMobileOpen(false)} />
            )}
            <div className={`mcn-mobile-drawer ${mobileOpen ? 'open' : ''}`}>
                <div className="mcn-mobile-header">
                    <span className="mcn-mobile-title">Shop Categories</span>
                    <button onClick={() => setMobileOpen(false)} className="mcn-mobile-close"><X size={20} /></button>
                </div>
                <div className="mcn-mobile-body">
                    {/* Static quick links */}
                    <div className="mcn-mobile-quick">
                        <Link to="/catalog" onClick={() => setMobileOpen(false)} className="mcn-mobile-quick-link">All Products</Link>
                        <Link to="/deals" onClick={() => setMobileOpen(false)} className="mcn-mobile-quick-link mcn-mobile-deals"><Zap size={12} fill="currentColor" /> Deals</Link>
                        <Link to="/catalog?sort=new" onClick={() => setMobileOpen(false)} className="mcn-mobile-quick-link">New Arrivals</Link>
                    </div>

                    {/* Accordion categories */}
                    {rootCats.map(cat => {
                        const kids = getChildren(cat.id);
                        const expanded = mobileExpanded === cat.id;
                        return (
                            <div key={cat.id} className="mcn-mobile-cat">
                                <button
                                    className="mcn-mobile-cat-btn"
                                    onClick={() => {
                                        if (kids.length === 0) { goToCategory(cat.slug); return; }
                                        setMobileExpanded(expanded ? null : cat.id);
                                    }}
                                >
                                    {cat.name}
                                    {kids.length > 0 && <ChevronDown size={16} className={`mcn-mobile-chevron ${expanded ? 'rotated' : ''}`} />}
                                </button>
                                {expanded && kids.length > 0 && (
                                    <div className="mcn-mobile-children">
                                        <button onClick={() => goToCategory(cat.slug)} className="mcn-mobile-child-link" style={{ fontWeight: 700, color: '#4f46e5' }}>
                                            All {cat.name}
                                        </button>
                                        {kids.map(child => (
                                            <button key={child.id} onClick={() => goToCategory(child.slug)} className="mcn-mobile-child-link">
                                                {child.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default MegaCategoryNav;
