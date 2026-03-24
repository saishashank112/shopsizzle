import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shirt, Watch, Shield as Leather, Gem, Diamond, Heart } from 'lucide-react';
import MobileProductShowcase from './MobileProductShowcase';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './RadialCategories.css';

const images = {
    saree: "https://images.unsplash.com/photo-1596455607563-ad6193f76b19?q=80&w=600&auto=format&fit=crop",
    watch1: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600&auto=format&fit=crop",
    watch2: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400&auto=format&fit=crop",
    bag: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop",
    ring: "https://images.unsplash.com/photo-1605100804763-247f67b2548e?q=80&w=400&auto=format&fit=crop",
    shoes: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=600&auto=format&fit=crop"
};

const categoryData = {
    Dresses: {
        heroImg: images.saree,
        heroTitle: "Heritage Silk Textiles",
        heroDesc: "Generations of loom mastery woven into modern elegance.",
        products: [
            { id: 101, name: 'Kanjeevaram Gold Silk', cat: 'Dresses', price: 42000, img: images.saree },
            { id: 102, name: 'Banarasi Zari Drape', cat: 'Dresses', price: 24999, img: images.saree },
            { id: 103, name: 'Crimson Heritage Saree', cat: 'Dresses', price: 32000, img: images.saree }
        ]
    },
    Shoes: {
        heroImg: images.shoes,
        heroTitle: "Statement Footwear",
        heroDesc: "A masterclass in pure silhouette and high-grade Italian leather.",
        products: [
            { id: 104, name: 'The Obsidian Derby', cat: 'Shoes', price: 21000, img: images.shoes },
            { id: 105, name: 'Tuscan Leather Loafer', cat: 'Shoes', price: 18500, img: images.shoes },
            { id: 106, name: 'Estate Chelsea Boot', cat: 'Shoes', price: 24000, img: images.shoes }
        ]
    },
    Watches: {
        heroImg: images.watch2,
        heroTitle: "Precision Horology",
        heroDesc: "Timeless craftsmanship driving mechanical perfection.",
        products: [
            { id: 107, name: 'Oyster Perpetual Azure', cat: 'Watches', price: 765000, img: images.watch1 },
            { id: 108, name: 'Chronos Diver Model T', cat: 'Watches', price: 412000, img: images.watch2 },
            { id: 109, name: 'Midnight Royale', cat: 'Watches', price: 14999, img: images.watch1 }
        ]
    },
    Leather: {
        heroImg: images.bag,
        heroTitle: "Curated Leather Pieces",
        heroDesc: "Timeless craftsmanship meets modern utility.",
        products: [
            { id: 110, name: 'The Diplomat Briefcase', cat: 'Leather', price: 84000, img: images.bag },
            { id: 111, name: 'Artisan Tan Holdall', cat: 'Leather', price: 42500, img: images.bag },
            { id: 112, name: 'Midnight Weekender', cat: 'Leather', price: 55000, img: images.bag }
        ]
    },
    Jewelry: {
        heroImg: images.ring,
        heroTitle: "Conflict-Free Artisan Jewels",
        heroDesc: "Precious stones set within hand-forged noble metals.",
        products: [
            { id: 113, name: 'Onyx Solitaire Ring', cat: 'Jewelry', price: 150000, img: images.ring },
            { id: 114, name: 'Sapphire Drop Earrings', cat: 'Jewelry', price: 85000, img: images.ring },
            { id: 115, name: 'Diamond Tennis Bracelet', cat: 'Jewelry', price: 225000, img: images.ring }
        ]
    }
};

const nodes = [
    { id: 'Dresses', icon: Shirt, top: '84px', left: '125px' },
    { id: 'Shoes', icon: Watch, top: '175px', left: '216px' }, 
    { id: 'Watches', icon: Diamond, top: '300px', left: '250px' },
    { id: 'Leather', icon: Leather, top: '425px', left: '216px' },
    { id: 'Jewelry', icon: Gem, top: '516px', left: '125px' },
];

const RadialCategories = ({ settings = {} }) => {
    const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    
    const dynamicData = settings.radial_categories ? JSON.parse(settings.radial_categories) : categoryData;
    const [activeCategory, setActiveCategory] = useState(Object.keys(dynamicData)[0] || 'Dresses');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (isMobile) {
        return <MobileProductShowcase />;
    }

    const data = dynamicData[activeCategory] || dynamicData[Object.keys(dynamicData)[0]];

    return (
        <section className="luxury-radial-section">
            <div className="radial-container">
                <div className="radial-left">
                    <div className="radial-arc"></div>
                    {Object.keys(dynamicData).map((catId, index) => {
                        const node = nodes[index] || nodes[0];
                        const Icon = node.icon;
                        const isActive = activeCategory === catId;
                        return (
                            <div 
                                key={catId}
                                className={`radial-node ${isActive ? 'active' : ''}`}
                                style={{ top: node.top, left: node.left }}
                                onClick={() => setActiveCategory(catId)}
                            >
                                <div className="node-icon"><Icon size={18} /></div>
                                <span className="node-label">{catId}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="radial-right">
                    <div className="radial-content-wrapper" key={activeCategory}>
                        <div className="radial-hero">
                            <img src={data.heroImg} alt={data.heroTitle} />
                            <div className="radial-hero-overlay">
                                <h2>{data.heroTitle}</h2>
                                <p>{data.heroDesc}</p>
                            </div>
                        </div>

                        <div className="radial-products">
                            {data.products.map((p, i) => (
                                <div key={p.id || i} className="artifact-card">
                                    <Link to={`/catalog`} style={{textDecoration: 'none', color: 'inherit'}}>
                                        <div className="artifact-img-wrap">
                                            <div 
                                                className={`artifact-wishlist ${isInWishlist(p.id) ? 'active' : ''}`}
                                                onClick={(e) => { 
                                                    e.preventDefault(); 
                                                    e.stopPropagation();
                                                    isInWishlist(p.id) ? removeFromWishlist(p.id) : addToWishlist(p); 
                                                }}
                                            >
                                                <Heart size={18} fill={isInWishlist(p.id) ? "currentColor" : "none"} />
                                            </div>
                                            <img src={p.img} alt={p.name} />
                                        </div>
                                        <div className="artifact-info">
                                            <span className="artifact-cat">{p.cat}</span>
                                            <h3 className="artifact-title serif">{p.name}</h3>
                                            <span className="artifact-price">₹{p.price.toLocaleString()}</span>
                                        </div>
                                    </Link>
                                    <div className="artifact-actions-row" style={{ padding: '0 1rem 1rem' }}>
                                        <button type="button" className="artifact-action-btn add-btn" onClick={(e) => { 
                                            e.preventDefault(); 
                                            e.stopPropagation();
                                            addToCart({ id: p.id, name: p.name, price: p.price, image_url: p.img }); 
                                        }}>Add to Bag</button>
                                        <button type="button" className="artifact-action-btn buy-btn" onClick={(e) => { 
                                            e.preventDefault(); 
                                            e.stopPropagation();
                                            addToCart({ id: p.id, name: p.name, price: p.price, image_url: p.img }); 
                                            navigate('/checkout');
                                        }}>Buy Now</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RadialCategories;
