import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChevronDown, Sparkles, Zap, Star } from 'lucide-react';
import './MobileProductShowcase.css';

// Mock Data reusing RadialCategories imagery
const images = {
    saree: "https://images.unsplash.com/photo-1596455607563-ad6193f76b19?q=80&w=600&auto=format&fit=crop",
    watch1: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600&auto=format&fit=crop",
    watch2: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400&auto=format&fit=crop",
    bag: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop",
    ring: "https://images.unsplash.com/photo-1605100804763-247f67b2548e?q=80&w=400&auto=format&fit=crop",
    shoes: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop"
};

const CATEGORIES = [
    { id: 'Mobiles', name: 'Mobiles', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format&fit=crop' },
    { id: 'Laptops', name: 'Laptops', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=200&auto=format&fit=crop' },
    { id: 'Dresses', name: 'Dresses', img: 'https://images.unsplash.com/photo-1596455607563-ad6193f76b19?q=80&w=200&auto=format&fit=crop' },
    { id: 'Beauty', name: 'Beauty', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200&auto=format&fit=crop' }
];

const PRODUCTS = [
    { id: 1, name: 'Kanjeevaram Gold Silk', cat: 'Dresses', price: '₹42,000', img: images.saree, label: 'Trending' },
    { id: 2, name: 'Banarasi Zari Drape', cat: 'Dresses', price: '₹24,999', img: images.saree, label: 'New Arrival' },
    { id: 3, name: 'The Obsidian Derby', cat: 'Shoes', price: '₹21,000', img: images.shoes, label: 'Top Pick' },
    { id: 4, name: 'Oyster Perpetual Azure', cat: 'Watches', price: '₹7,65,000', img: images.watch1, label: 'Premium' },
    { id: 5, name: 'Chronos Diver Model T', cat: 'Watches', price: '₹4,12,000', img: images.watch2, label: 'Trending' },
    { id: 6, name: 'The Diplomat Briefcase', cat: 'Leather', price: '₹84,000', img: images.bag, label: 'Top Pick' },
    { id: 7, name: 'Onyx Solitaire Ring', cat: 'Jewelry', price: '₹1,50,000', img: images.ring, label: 'Premium' },
    { id: 8, name: 'iPhone 15 Pro Max', cat: 'Mobiles', price: '₹1,49,900', img: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=400', label: 'Bestseller' },
    { id: 9, name: 'MacBook Air M3', cat: 'Laptops', price: '₹1,14,900', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400', label: 'New' },
    { id: 10, name: 'Guerlain Rouge G', cat: 'Beauty', price: '₹3,500', img: 'https://images.unsplash.com/photo-1586776977607-310e9c725c37?q=80&w=400', label: 'Luxury' }
];

/* ── REUSABLE COMPONENTS ── */

const MobileCategoryRail = ({ activeCategory, setActiveCategory }) => (
    <div className="mps-category-rail">
        <button
            className={`mps-circle-pill ${activeCategory === 'All' ? 'active' : ''}`}
            onClick={() => setActiveCategory('All')}
        >
            <div className="mps-category-image-circle">
                <Sparkles size={20} />
            </div>
        </button>
        {CATEGORIES.map(cat => (
            <button
                key={cat.id}
                className={`mps-circle-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
            >
                <div className="mps-category-image-circle">
                    <img src={cat.img} alt={cat.name} />
                </div>
            </button>
        ))}
    </div>
);

const FloatingCategorySelector = ({ activeCategory, categories }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mps-floating-selector-container">
            <button className="mps-floating-selector-btn" onClick={() => setIsOpen(!isOpen)}>
                {activeCategory === 'All' ? 'Categories' : activeCategory} <ChevronDown size={14} />
            </button>

            {/* Bottom Sheet overlay */}
            <div className={`mps-bottom-sheet-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}>
                <div className={`mps-bottom-sheet ${isOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
                    <div className="mps-sheet-header">
                        <div className="mps-sheet-drag-handle"></div>
                        <h3>Select Category</h3>
                    </div>
                    <div className="mps-sheet-body">
                        {['All', ...categories].map(c => (
                            <button key={c} className="mps-sheet-option" onClick={() => setIsOpen(false)}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProductCard = ({ product }) => (
    <Link to="/catalog" className="mps-product-card">
        <div className="mps-card-image-wrap">
            <button className="mps-wishlist-btn" onClick={(e) => e.preventDefault()}>
                <Heart size={16} />
            </button>
            {product.label && <div className="mps-product-badge">{product.label}</div>}
            <img src={product.img} alt={product.name} loading="lazy" />
        </div>
        <div className="mps-card-details">
            <span className="mps-card-cat">{product.cat}</span>
            <h4 className="mps-card-title">{product.name}</h4>
            <div className="mps-card-price">{product.price}</div>
        </div>
    </Link>
);

const ProductGrid = ({ products }) => (
    <div className="mps-product-grid">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
);

/* ── MAIN COMPONENT ── */

const MobileProductShowcase = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    
    const getFilteredProducts = () => {
        if(activeCategory === 'All') return PRODUCTS;
        return PRODUCTS.filter(p => p.cat === activeCategory);
    };

    return (
        <div className="mps-root" style={{ background: '#0a0a0a' }}>
            <div className="mps-header-sticky">
                <div className="mps-header-inner">
                    <h2 className="mps-section-title">Explore Artifacts</h2>
                    <MobileCategoryRail activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
                </div>
            </div>

            <main className="mps-content-area">
                <div className="mps-micro-section curation-section" style={{ background: '#141414', margin: '0 -16px 0', padding: '24px 16px', borderRadius: '32px 32px 0 0' }}>
                    <div className="mps-micro-header">
                        <h3 style={{ color: '#fff' }}>
                            {activeCategory === 'All' ? 'Trending & New Curations' : `${activeCategory} Curations`}
                        </h3>
                    </div>
                    <ProductGrid products={getFilteredProducts().slice(0, 10)} />
                </div>
            </main>
        </div>
    );
};

export default MobileProductShowcase;
