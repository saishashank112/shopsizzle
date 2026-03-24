import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Filter, Star, Heart, ShoppingBag, Menu,
    Search as SearchIcon, X, Sparkles, Zap, ArrowRight, ChevronDown, SlidersHorizontal, CreditCard
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

import SmartFilterSystem from '../components/SmartFilterSystem';
import ProductCard from '../components/ProductCard';
import './Catalog.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Catalog = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToCart } = useCart();


    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    /* ── Dynamic filter state ── */
    const [activeFilters, setActiveFilters] = useState({});   // { groupName: Set([values]) }
    const [priceRange, setPriceRange] = useState(null); // [min, max] | null

    /* ── Sort state ── */
    const [sortBy, setSortBy] = useState('popular');

    /* ── Search from URL ── */
    const urlSearch = searchParams.get('search') || '';
    const urlCat = searchParams.get('cat') || '';
    const urlMin = searchParams.get('min') || '';
    const urlMax = searchParams.get('max') || '';

    /* ── Fetch products ── */
    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const params = {};
                if (urlSearch) params.search = urlSearch;
                if (urlCat) params.cat = urlCat;
                if (urlMin) params.min = urlMin;
                if (urlMax) params.max = urlMax;
                const res = await axios.get(`${API}/api/products`, { params });
                setProducts(res.data.data || []);
            } catch (err) {
                console.error('Product fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [urlSearch, urlCat, urlMin, urlMax]);

    /* ── Reset filters when category/search changes ── */
    useEffect(() => {
        setActiveFilters({});
        setSortBy('popular');
        // apply URL price range if present
        if (urlMin || urlMax) {
            setPriceRange([Number(urlMin) || 0, Number(urlMax) || 100000]);
        } else {
            setPriceRange(null);
        }
    }, [urlCat, urlSearch, urlMin, urlMax]);

    /* ── Client-side filtering ── */
    const filteredProducts = useMemo(() => {
        let list = [...products];

        // Dynamic group filters
        Object.entries(activeFilters).forEach(([groupName, valSet]) => {
            if (!valSet || valSet.size === 0) return;
            const key = groupName.toLowerCase();
            list = list.filter(p => {
                if (key === 'brand') return valSet.has(p.brand);
                if (key === 'color') return valSet.has(p.color);
                if (key === 'material') return valSet.has(p.material);
                if (key === 'condition') return valSet.has(p.condition);
                if (key === 'size') return valSet.has(p.size);
                if (key === 'availability') {
                    if (valSet.has('In Stock')) return p.stock > 0;
                    if (valSet.has('Out of Stock')) return p.stock <= 0;
                    return true;
                }
                if (key === 'rating') {
                    const minRating = Math.min(...[...valSet].map(Number));
                    return Number(p.rating || 0) >= minRating;
                }
                if (key === 'deals') {
                    if (valSet.has('On Sale')) return Number(p.discount || 0) > 0;
                    if (valSet.has('Limited Stock')) return p.stock > 0 && p.stock < 10;
                    return true;
                }
                return true;
            });
        });

        // Price range
        if (priceRange) {
            list = list.filter(p => {
                const price = Number(p.price || 0);
                return price >= priceRange[0] && price <= priceRange[1];
            });
        }

        // Handle sort=new from URL
        const urlSort = searchParams.get('sort');
        const effectiveSort = urlSort === 'new' ? 'newest' : sortBy;

        // Sort
        switch (effectiveSort) {
            case 'price-asc': list.sort((a, b) => a.price - b.price); break;
            case 'price-desc': list.sort((a, b) => b.price - a.price); break;
            case 'newest': list.sort((a, b) => b.id - a.id); break;
            case 'rating': list.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
            default: list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        return list;
    }, [products, activeFilters, priceRange, sortBy, searchParams]);

    const bestseller = useMemo(() =>
        products.find(p => p.is_bestseller) || products[0]
        , [products]);

    /* ── Page title ── */
    const pageTitle = useMemo(() => {
        if (urlSearch) return `Results for "${urlSearch}"`;
        if (urlCat) return urlCat.charAt(0).toUpperCase() + urlCat.slice(1).replace(/-/g, ' ');
        return 'All Products';
    }, [urlSearch, urlCat]);

    /* ── Active chips ── */
    const activeChips = useMemo(() => {
        const chips = [];
        Object.entries(activeFilters).forEach(([group, valSet]) => {
            (valSet || []).forEach(val => chips.push({ group, val }));
        });
        if (priceRange) chips.push({ group: 'Price', val: `₹${priceRange[0].toLocaleString('en-IN')} – ₹${priceRange[1].toLocaleString('en-IN')}` });
        return chips;
    }, [activeFilters, priceRange]);

    const removeChip = (group, val) => {
        if (group === 'Price') { setPriceRange(null); return; }
        const next = { ...activeFilters };
        const s = new Set(next[group]);
        s.delete(val);
        next[group] = s;
        setActiveFilters(next);
    };

    const clearAll = () => { setActiveFilters({}); setPriceRange(null); };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [urlCat, urlSearch, activeFilters, priceRange]);

    return (
        <div className="catalog-root-luxe">
            {/* ── FILTER SIDEBAR (desktop) ── */}
            <div style={{ display: 'none' }} className="sfs-desktop-sidebar-wrapper">
                {/* rendered by SmartFilterSystem itself */}
            </div>

            <SmartFilterSystem
                products={products}
                activeFilters={activeFilters}
                priceRange={priceRange}
                onFiltersChange={setActiveFilters}
                onPriceChange={setPriceRange}
                showMobileDrawer={mobileFilterOpen}
                onCloseMobile={() => setMobileFilterOpen(false)}
            />

            {/* ── MAIN CONTENT ── */}
            <main className="catalog-main-contents">

                {/* Page Title */}
                <div style={{ marginBottom: '0.75rem' }}>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, margin: 0 }}>
                        {pageTitle}
                    </h1>
                    {(urlCat || urlSearch) && (
                        <Link
                            to="/catalog"
                            style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4 }}
                        >
                            ← All Products
                        </Link>
                    )}
                </div>

                {/* Top bar */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    marginBottom: '1.25rem', flexWrap: 'wrap'
                }}>
                    {/* Mobile filter trigger (3 lines) */}
                    <button
                        className="sfs-mobile-filter-btn"
                        onClick={() => setMobileFilterOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0f172a', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: 10, fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.15)' }}
                    >
                        <Menu size={18} /> Filter
                        {activeChips.length > 0 && (
                            <span style={{ background: '#f59e0b', color: '#78350f', borderRadius: 50, width: 18, height: 18, display: 'grid', placeItems: 'center', fontSize: '0.65rem', fontWeight: 900 }}>
                                {activeChips.length}
                            </span>
                        )}
                    </button>

                    <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 600, flex: 1 }}>
                        <strong style={{ color: '#0f172a', fontWeight: 900 }}>{filteredProducts.length}</strong> products
                        {activeChips.length > 0 && ` (filtered from ${products.length})`}
                    </span>

                    {/* Sort */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8' }}>Sort:</span>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            style={{
                                border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '0.45rem 2rem 0.45rem 0.75rem',
                                fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', background: '#fff',
                                cursor: 'pointer', outline: 'none', appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2364748b' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.6rem center',
                                fontFamily: 'inherit'
                            }}
                        >
                            <option value="popular">Most Popular</option>
                            <option value="newest">Newest First</option>
                            <option value="price-asc">Price: Low → High</option>
                            <option value="price-desc">Price: High → Low</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                    </div>
                </div>

                {/* Active Filter Chips */}
                {activeChips.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                        {activeChips.map(({ group, val }) => (
                            <div key={`${group}-${val}`} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                background: '#f1f5f9', border: '1.5px solid #e2e8f0', borderRadius: 999,
                                padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: '#0f172a'
                            }}>
                                <span style={{ color: '#64748b', fontSize: '0.68rem' }}>{group}:</span> {val}
                                <button
                                    onClick={() => removeChip(group, val)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8', display: 'flex', lineHeight: 1 }}
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={clearAll}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', padding: '0.3rem 0.5rem' }}
                        >
                            Clear all
                        </button>
                    </div>
                )}

                {/* Hero Banner */}
                {!urlCat && !activeChips.length && bestseller && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={{
                            position: 'relative', borderRadius: 16, overflow: 'hidden',
                            height: 260, marginBottom: '1.5rem', background: '#0f172a',
                            display: 'flex', alignItems: 'center'
                        }}
                    >
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(15,23,42,.95) 0%, rgba(15,23,42,.4) 60%, transparent 100%)', zIndex: 1 }} />
                        <img src={bestseller.image_url} alt={bestseller.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .7 }} />
                        <div style={{ position: 'relative', zIndex: 2, padding: '2rem' }}>
                            <span style={{ display: 'inline-block', background: '#f59e0b', color: '#78350f', borderRadius: 999, padding: '3px 12px', fontSize: '0.68rem', fontWeight: 900, letterSpacing: '.08em', marginBottom: '0.75rem' }}>PREMIER PICK</span>
                            <h4 style={{ color: '#f59e0b', fontSize: '0.875rem', fontWeight: 800, letterSpacing: '.1em', marginBottom: '0.25rem', textTransform: 'uppercase' }}>{bestseller.brand}</h4>
                            <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.625rem', lineHeight: 1.2 }}>{bestseller.name}</h2>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <Link to={`/product/${bestseller.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 800, fontSize: '0.875rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    View Product <ArrowRight size={16} />
                                </Link>
                                <button 
                                    onClick={async () => {
                                        await addToCart(bestseller);
                                        navigate('/checkout');
                                    }}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f59e0b', color: '#78350f', padding: '0.75rem 1.5rem', borderRadius: 10, fontWeight: 800, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
                                >
                                    <CreditCard size={16} /> Buy Now
                                </button>
                            </div>

                        </div>
                    </motion.div>
                )}

                {/* Product Grid */}
                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '3rem' }}>
                        {Array(8).fill(0).map((_, i) => (
                            <div key={i} style={{ height: 460, borderRadius: 28, background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#94a3b8' }}>
                        <Zap size={48} strokeWidth={1} style={{ margin: '0 auto 1rem', display: 'block' }} />
                        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#475569', marginBottom: '0.5rem' }}>No products match your filters</h3>
                        <p style={{ fontSize: '0.875rem' }}>Try adjusting or clearing your filters</p>
                        <button onClick={clearAll} style={{ marginTop: '1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="catalog-product-grid cinematic-grid">
                        <AnimatePresence>
                            {filteredProducts.map((p, idx) => (
                                <ProductCard key={p.id} product={p} index={idx} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            <style>{`
                @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
                .sfs-mobile-filter-btn { display: none !important; }
                @media (max-width: 900px) {
                    .sfs-desktop-sidebar { display: none !important; }
                    .sfs-mobile-filter-btn {
                        display: flex !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Catalog;
