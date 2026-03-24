import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, ShoppingBag, Heart, SlidersHorizontal, ChevronRight, 
    Zap, Star, X, Tag, Smartphone, Tv, Watch, ArrowDownAZ, Home 
} from 'lucide-react';
import './MobileLandingExperience.css';

// Mock Data
const CATEGORIES = [
    { id: 'all', name: 'All', icon: <Tag size={14}/> },
    { id: 'mobiles', name: 'Mobiles', icon: <Smartphone size={14}/> },
    { id: 'electronics', name: 'Electronics', icon: <Tv size={14}/> },
    { id: 'fashion', name: 'Fashion', icon: <Star size={14}/> },
    { id: 'watches', name: 'Watches', icon: <Watch size={14}/> }
];

const QUICK_FILTERS = ['Brand', 'Price', 'Rating', 'Color', 'Availability'];

const MOCK_PRODUCTS = [
    { id: 1, name: "iPhone 15 Pro Max - Titanium", price: 129000, old_price: 159000, rating: 4.8, type: 'trending', image: "https://images.unsplash.com/photo-1696509528129-c2936a71ab15?auto=format&fit=crop&q=80&w=400" },
    { id: 2, name: "Sony WH-1000XM5 Noise Canceling", price: 29990, old_price: 34990, rating: 4.9, type: 'trending', image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400" },
    { id: 3, name: "Samsung Galaxy S24 Ultra", price: 129999, old_price: 134999, rating: 4.9, type: 'premium', image: "https://images.unsplash.com/photo-1707166127201-9a9ecfaccb22?auto=format&fit=crop&q=80&w=400" },
    { id: 4, name: "MacBook Pro M3 14-inch", price: 169900, old_price: 180000, rating: 5.0, type: 'premium', image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400" },
    { id: 5, name: "Nike Air Force 1 '07", price: 7495, old_price: 9995, rating: 4.7, type: 'deals', image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=400" },
    { id: 6, name: "Apple Watch Series 9", price: 39900, old_price: 41900, rating: 4.8, type: 'deals', image: "https://images.unsplash.com/photo-1434493789847-2902a52dda56?auto=format&fit=crop&q=80&w=400" },
    { id: 7, name: "Dyson Airwrap Multi-styler", price: 44900, old_price: 49900, rating: 4.6, type: 'trending', image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=400" },
    { id: 8, name: "PlayStation 5 Console", price: 49990, old_price: 54990, rating: 4.9, type: 'trending', image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=400" }
];

const ProductCard = ({ product }) => (
    <div className="mle-product-card">
        <div className="mle-product-img-wrap">
            <button className="mle-wishlist-btn"><Heart size={16}/></button>
            <div className="mle-discount-badge">
                {Math.round(((product.old_price - product.price) / product.old_price) * 100)}%
            </div>
            <img src={product.image} alt={product.name} loading="lazy" />
        </div>
        <div className="mle-product-info">
            <h3 className="mle-product-title">{product.name}</h3>
            <div className="mle-product-rating">
                <Star size={10} fill="#f59e0b" color="#f59e0b"/>
                <span>{product.rating}</span>
            </div>
            <div className="mle-product-pricing">
                <span className="mle-price">₹{product.price.toLocaleString()}</span>
                <span className="mle-old-price">₹{product.old_price.toLocaleString()}</span>
            </div>
        </div>
    </div>
);

const MobileLandingExperience = () => {
    const [scrolled, setScrolled] = useState(false);
    const [scrollDirection, setScrollDirection] = useState('up');
    const [activeCategory, setActiveCategory] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const lastScrollY = useRef(0);

    // Scroll Observer for header hide/show logic
    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;
            if (currentY > 40) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }

            if (currentY > lastScrollY.current + 10 && currentY > 50) {
                setScrollDirection('down');
            } else if (currentY < lastScrollY.current - 10) {
                setScrollDirection('up');
            }
            lastScrollY.current = currentY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent body scroll when filter is open
    useEffect(() => {
        if (isFilterOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isFilterOpen]);

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN').format(val);

    return (
        <div className="mle-container">
            {/* 1. STICKY TOP BAR */}
            <header className={`mle-header ${scrolled ? 'mle-header-scrolled' : ''} ${scrollDirection === 'down' ? 'mle-header-hidden' : ''}`}>
                <div className="mle-header-top">
                    <div className="mle-logo">ShopSizzle</div>
                    <div className="mle-header-actions">
                        <button className="mle-icon-btn"><Search size={22}/></button>
                        <button className="mle-icon-btn mle-cart-btn">
                            <ShoppingBag size={22}/>
                            <span className="mle-cart-badge">2</span>
                        </button>
                    </div>
                </div>
                {/* Expandable search simulation when at top */}
                {!scrolled && (
                    <div className="mle-search-bar">
                        <Search size={16} color="#94a3b8"/>
                        <input type="text" placeholder="Search for products, brands..." readOnly />
                    </div>
                )}
            </header>

            <main className="mle-main">
                {/* 3. HERO SECTION */}
                <section className="mle-hero">
                    <div className="mle-hero-bg">
                        <img src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800" alt="Hero" />
                        <div className="mle-hero-overlay"></div>
                    </div>
                    <div className="mle-hero-content">
                        <span className="mle-hero-tag">NEW COLLECTION</span>
                        <h1 className="mle-hero-title">Upgrade Your<br/>Everyday Tech</h1>
                        <button className="mle-hero-cta">Explore Now <ChevronRight size={18}/></button>
                    </div>
                </section>

                {/* 2. HORIZONTAL CATEGORY SCROLL */}
                <div className="mle-categories-scroll">
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat.id} 
                            className={`mle-category-chip ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            <span className="mle-cat-icon">{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* 4. QUICK FILTERS */}
                <div className="mle-quick-filters">
                    <button className="mle-filter-trigger" onClick={() => setIsFilterOpen(true)}>
                        <SlidersHorizontal size={14}/> Filters
                    </button>
                    <div className="mle-filter-chips">
                        {QUICK_FILTERS.map(f => (
                            <button key={f} className="mle-filter-chip" onClick={() => setIsFilterOpen(true)}>
                                {f} <ChevronRight size={12}/>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 7. SMART SECTIONS: Trending */}
                <section className="mle-smart-section">
                    <div className="mle-section-header">
                        <h2>🔥 Trending Now</h2>
                        <button className="mle-view-all">View All</button>
                    </div>
                    {/* 5. PRODUCT GRID (2-Column) */}
                    <div className="mle-product-grid">
                        {MOCK_PRODUCTS.filter(p => p.type === 'trending').map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>

                {/* 7. SMART SECTIONS: Premium Picks (Horizontal Scroll) */}
                <section className="mle-smart-section mle-dark-section">
                    <div className="mle-section-header">
                        <h2 style={{color:'#fff'}}>💎 Premium Picks</h2>
                    </div>
                    <div className="mle-horizontal-products">
                        {MOCK_PRODUCTS.filter(p => p.type === 'premium').map(product => (
                            <div key={product.id} className="mle-h-card">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Deals for you */}
                <section className="mle-smart-section">
                    <div className="mle-section-header">
                        <h2>⚡ Deals for You</h2>
                    </div>
                    <div className="mle-product-grid">
                        {MOCK_PRODUCTS.filter(p => p.type === 'deals').map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>

                {/* Bottom padding for FAB */}
                <div style={{height: 100}}></div>
            </main>

            {/* 8. BOTTOM STICKY CTA BAR (Scroll activated) */}
            <div className={`mle-floating-actions ${scrolled ? 'visible' : ''}`}>
                <button className="mle-action-btn" onClick={() => setIsFilterOpen(true)}>
                    <SlidersHorizontal size={18} /> Filters
                </button>
                <div className="mle-action-divider"></div>
                <button className="mle-action-btn">
                    <ArrowDownAZ size={18} /> Sort
                </button>
            </div>

            {/* 10. NAVIGATION PATTERN - Bottom Nav (Visible if not scrolling down) */}
            {/* The user wants a clean, no clutter nav. We replace site's bottom nav with native-feeling one */}
            <nav className={`mle-bottom-nav ${scrollDirection === 'down' ? 'mle-nav-hidden' : ''}`}>
                <button className="mle-nav-item active"><Home size={22}/><span>Home</span></button>
                <button className="mle-nav-item"><Search size={22}/><span>Explore</span></button>
                <button className="mle-nav-item"><Heart size={22}/><span>Wishlist</span></button>
                <button className="mle-nav-item"><ShoppingBag size={22}/><span>Cart</span></button>
                <button className="mle-nav-item"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg><span>Profile</span></button>
            </nav>

            {/* 9. FILTER EXPERIENCE (Full Screen Bottom Sheet) */}
            <div className={`mle-filter-sheet-overlay ${isFilterOpen ? 'open' : ''}`} onClick={() => setIsFilterOpen(false)}>
                <div className={`mle-filter-sheet ${isFilterOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
                    <div className="mle-sheet-header">
                        <h2>Filter & Sort</h2>
                        <button className="mle-close-btn" onClick={() => setIsFilterOpen(false)}><X size={24}/></button>
                    </div>
                    <div className="mle-sheet-content">
                        <div className="mle-filter-block">
                            <h3>Category</h3>
                            <div className="mle-chip-grid">
                                {CATEGORIES.map(c => <button key={c.id} className={`mle-filter-opt ${activeCategory===c.id?'selected':''}`}>{c.name}</button>)}
                            </div>
                        </div>
                        <div className="mle-filter-block">
                            <h3>Brand</h3>
                            <input type="text" className="mle-brand-search" placeholder="Search brands..." />
                            <div className="mle-chip-grid">
                                <button className="mle-filter-opt selected">Apple</button>
                                <button className="mle-filter-opt">Samsung</button>
                                <button className="mle-filter-opt">Sony</button>
                                <button className="mle-filter-opt">Nike</button>
                            </div>
                        </div>
                        <div className="mle-filter-block">
                            <h3>Price Range</h3>
                            <div className="mle-price-slider">
                                <input type="range" min="0" max="200000" defaultValue="50000" />
                                <div className="mle-price-labels">
                                    <span>₹0</span>
                                    <span>₹2,00,000+</span>
                                </div>
                            </div>
                        </div>
                        <div className="mle-filter-block">
                            <h3>Color</h3>
                            <div className="mle-color-swatches">
                                <div className="mle-swatch" style={{background:'#000'}}><X size={12} color="#fff"/></div>
                                <div className="mle-swatch" style={{background:'#fff', border:'1px solid #e2e8f0'}}></div>
                                <div className="mle-swatch" style={{background:'#ef4444'}}></div>
                                <div className="mle-swatch" style={{background:'#3b82f6'}}></div>
                            </div>
                        </div>
                    </div>
                    <div className="mle-sheet-footer">
                        <button className="mle-btn-secondary" onClick={() => setIsFilterOpen(false)}>Clear All</button>
                        <button className="mle-btn-primary" onClick={() => setIsFilterOpen(false)}>Apply Filters <span className="mle-badge">124</span></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileLandingExperience;
