import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Heart, ShoppingCart, Star, Zap, CreditCard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

import { useWishlist } from '../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product, index }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    
    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);
    
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

    
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };
    
    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const isWishlisted = isInWishlist(product.id);

    return (
        <motion.div
            className="anti-gravity-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
                duration: 0.8, 
                delay: index * 0.1,
                ease: [0.21, 1.11, 0.81, 0.99]
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
        >
            <div className="card-glass-base">
                {/* Floating Shadow */}
                <div className="anti-gravity-shadow" />

                <Link to={`/product/${product.id}`} className="card-media-wrapper" style={{ transform: "translateZ(50px)" }}>
                    {product.discount > 0 && (
                        <div className="glow-badge">
                            <Zap size={10} fill="currentColor" /> {product.discount}% OFF
                        </div>
                    )}
                    
                    <motion.div 
                        className="wishlist-trigger"
                        onClick={(e) => {
                            e.preventDefault();
                            isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Heart 
                            size={18} 
                            fill={isWishlisted ? "var(--accent-red)" : "none"} 
                            color={isWishlisted ? "var(--accent-red)" : "#475569"} 
                            className={isWishlisted ? "heart-pulse" : ""}
                        />

                    </motion.div>

                    <div className="product-image-stage">
                        <img src={product.image_url} alt={product.name} className="main-artifact-img" />
                        <div className="image-aura" />
                    </div>
                </Link>

                <div className="card-info-stage" style={{ transform: "translateZ(30px)" }}>
                    <div className="brand-elite-tag">{product.brand || 'Premium Artifact'}</div>
                    <h3 className="artifact-name-h3">{product.name}</h3>
                    
                    <div className="rating-micro-row">
                        <div className="stars-mini">
                            {[...Array(5)].map((_, i) => (
                                <Star 
                                    key={i} 
                                    size={10} 
                                    fill={i < Math.round(product.rating || 0) ? "var(--accent-gold)" : "none"} 
                                    color={i < Math.round(product.rating || 0) ? "var(--accent-gold)" : "rgba(255,255,255,0.2)"} 
                                />
                            ))}
                        </div>
                        <span className="rating-count">({product.reviews_count || 0})</span>
                    </div>

                    <div className="pricing-dynamic-tier">
                        <span className="current-price-tag">₹{Number(product.price).toLocaleString('en-IN')}</span>
                        {product.discount > 0 && (
                            <span className="old-price-tag">₹{Math.round(Number(product.price) / (1 - product.discount/100)).toLocaleString('en-IN')}</span>
                        )}
                    </div>

                    <div className="card-action-hub">
                        <motion.button 
                            type="button"
                            className="btn-add-to-vault"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart(product);
                            }}
                            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <ShoppingCart size={14} /> Add to Cart
                        </motion.button>

                        <motion.button 
                            type="button"
                            className="btn-buy-instant"
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                await addToCart(product);
                                navigate('/checkout');
                            }}
                            whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(245, 158, 11, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <CreditCard size={14} /> Buy Now
                        </motion.button>
                    </div>


                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
