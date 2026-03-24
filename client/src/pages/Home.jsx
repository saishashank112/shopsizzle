import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    ShieldCheck,
    Leaf,
    PenTool,
    ArrowRight,
    Heart,
    Sparkles,
    Zap,
    TrendingUp,
    Volume2,
    VolumeX,
    LayoutGrid
} from 'lucide-react';
import RadialCategories from '../components/RadialCategories';
import CategoryIconStrip from '../components/CategoryIconStrip';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './Home.css';

const Home = () => {
    const [settings, setSettings] = useState({});
    const [currentVid, setCurrentVid] = useState(0);
    const navigate = useNavigate();
    const [isMuted, setIsMuted] = useState(true);
    const { addToCart } = useCart();
    const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();

    const videos = [
        '/videos/Luxury_Dress_Video_Prompt_and_Generation.mp4',
        '/videos/Luxury_Glassmorphism_Video_Prompt.mp4',
        '/videos/Luxury_Motion_System_Design.mp4',
        '/videos/Luxury_Shoe_Video_Prompt_and_Generation.mp4'
    ];

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/settings');
                setSettings(res.data);
            } catch (err) { console.error('Site settings offline', err); }
        };
        fetchSettings();

        const interval = setInterval(() => {
            setCurrentVid(prev => (prev + 1) % videos.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [videos.length]);

    // System Artifact Fallbacks
    const images = {

        watch: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800",
        saree: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800",
        signature: "https://images.unsplash.com/photo-1549439602-43ebcb232811?q=80&w=1920"
    };

    return (
        <div className="home-dense">

            {/* ── CINEMATIC VISUAL ENGINE (Hero) ── */}
            <section className="hero-fullscreen">
                <div className="hero-video-bg">
                    <div className="video-overlay"></div>
                    <img src={images.main} className="hero-static-bg" alt="Hero" />

                    {videos.map((vid, i) => (
                        <video
                            key={vid}
                            src={vid}
                            autoPlay
                            loop
                            muted={isMuted}
                            playsInline
                            style={{
                                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                                opacity: i === currentVid ? 0.6 : 0, transition: 'opacity 2s ease', zIndex: 0
                            }}
                        />
                    ))}
                </div>

                <div className="hero-content-centered">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hero-badge"
                    >
                        <Zap size={14} fill="gold" stroke="none" /> Universe Premiere 2026
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    >
                        Acquisition of<br />
                        <i>Artifacts.</i>
                    </motion.h1>
                    <p className="hero-desc">
                        A high-velocity luxury engine catering to global connoisseurs of horology, heritage textiles, and advanced electronics.
                    </p>
                    <div className="hero-cta-group">
                        <Link to="/catalog" className="btn-primary">
                            Enter the Atelier <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>

                <button className="video-mute-toggle" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </section>

            {/* ── DYNAMIC CATEGORY STRIP ── */}
            <CategoryIconStrip />



            {/* ── CURATED ATELIER (High Performance Grid) ── */}
            <section className="premium-curated-section">
                <div className="container">
                    <div className="curated-header">
                        <div className="curated-title-group">
                            <h2 className="serif">{settings.featured_title || "Featured Curation"}</h2>
                            <p>{settings.featured_subtitle || "Artifacts selected for their unparalleled prestige and rarity."}</p>
                        </div>
                        <Link to="/catalog" className="btn-clean">View Full Vault <ArrowRight size={14} /></Link>
                    </div>

                    <div className="premium-artifact-grid">
                        {(settings.featured_products ? JSON.parse(settings.featured_products) : [
                            { id: 1, name: 'Midnight Royale Chronograph', cat: 'Watches', brand: 'Chronos', price: 14999, img: images.watch },
                            { id: 4, name: 'Banarasi Zari Silk Saree', cat: 'Fashion', brand: 'Varanasi', price: 24999, img: images.saree },
                            { id: 10, name: 'Italian Leather Loafers', cat: 'Shoes', brand: 'Tuscany', price: 12500, img: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4" },
                            { id: 13, name: 'Titanium Sound Deck', cat: 'Electronics', brand: 'B&O', price: 85000, img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b" }
                        ]).map((item, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className="artifact-card"
                            >
                                <div className="artifact-card-inner">
                                    <Link to={`/catalog`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className="artifact-img-wrap">
                                            <div 
                                                className={`artifact-wishlist ${isInWishlist(item.id) ? 'active' : ''}`}
                                                onClick={(e) => { 
                                                    e.preventDefault(); 
                                                    e.stopPropagation();
                                                    isInWishlist(item.id) ? removeFromWishlist(item.id) : addToWishlist(item); 
                                                }}
                                            >
                                                <Heart size={18} fill={isInWishlist(item.id) ? "currentColor" : "none"} />
                                            </div>
                                            <img src={item.img} alt={item.name} />
                                        </div>
                                        <div className="artifact-info">
                                            <span className="artifact-cat">{item.cat}</span>
                                            <h3 className="artifact-title serif">{item.name}</h3>
                                            <span className="artifact-price">₹{item.price.toLocaleString()}</span>
                                        </div>
                                    </Link>
                                    <div className="artifact-actions-row" style={{ padding: '0 1rem 1rem' }}>
                                        <button type="button" className="artifact-action-btn add-btn" onClick={(e) => { 
                                            e.preventDefault(); 
                                            e.stopPropagation();
                                            addToCart({ id: item.id, name: item.name, price: item.price, image_url: item.img }); 
                                        }}>Add to Cart</button>
                                        <button type="button" className="artifact-action-btn buy-btn" onClick={(e) => { 
                                            e.preventDefault(); 
                                            e.stopPropagation();
                                            addToCart({ id: item.id, name: item.name, price: item.price, image_url: item.img }); 
                                            navigate('/checkout');
                                        }}>Buy Now</button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>




            <RadialCategories settings={settings} />

            {/* ── INNER CIRCLE NEWSLETTER (Conversion Focus) ── */}
            <section className="inner-circle-newsletter text-center">
                <div className="container newsletter-container">
                    <div className="newsletter-visual-flare"></div>
                    <div className="newsletter-box">
                        <h2 className="serif">The Inner Circle.</h2>
                        <p>Join the global network of collectors and receive early access to bespoke artifact drops.</p>
                        <form className="newsletter-form-luxe">
                            <input type="email" placeholder="Acquire Membership (Email)" />
                            <button type="submit" style={{ height: "50px" }}>SUBSCRIBE</button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
