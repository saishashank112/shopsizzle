import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    ShoppingBag, Heart, Star, ChevronRight, Check, ShieldCheck, 
    Truck, RotateCcw, ThumbsUp, MessageSquare, Zap, BadgeCheck, X, Image as ImageIcon 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './ProductDetail.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ProductDetailSystem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Selections
    const [activeImage, setActiveImage] = useState(0);
    const [selectedVariants, setSelectedVariants] = useState({});
    
    // UI states
    const [zoomStyle, setZoomStyle] = useState({});
    const [isZooming, setIsZooming] = useState(false);
    const [showWriteReview, setShowWriteReview] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });

    // Scroll tracking for sticky bottom bar
    const [showStickyBar, setShowStickyBar] = useState(false);
    const observerRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`${API}/api/products/${id}`);
                setProduct(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        const handleScroll = () => {
            if (observerRef.current) {
                const rect = observerRef.current.getBoundingClientRect();
                // Show sticky bar when the add to cart section implies passing it
                setShowStickyBar(rect.bottom < 0);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (loading) return <div className="pds-loading"><Zap className="pds-spin" size={40} /><span>Loading Engine...</span></div>;
    if (!product) return <div className="pds-loading">Product not found.</div>;

    const images = product.images?.length > 0 ? product.images : [
        product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop'
    ];
    const displayPrice = parseFloat(product.price) || 0;
    const oldPrice = parseFloat(product.old_price) || (displayPrice * 1.25);
    const discountPct = Math.round((1 - displayPrice/oldPrice) * 100);

    // Group variants
    const variantGroups = (product.variants || []).reduce((acc, v) => {
        if (!acc[v.type]) acc[v.type] = [];
        acc[v.type].push(v);
        return acc;
    }, {});

    // Rating maths
    const totalReviews = product.reviewsList?.length || 0;
    const avgRating = totalReviews > 0 
        ? (product.reviewsList.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) 
        : (product.rating || 4.5);

    const ratingBars = [5,4,3,2,1].map(stars => {
        const count = product.reviewsList?.filter(r => r.rating === stars).length || 0;
        const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        return { stars, count, pct };
    });

    const handleZoom = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(1.8)' });
        setIsZooming(true);
    };

    const handleZoomOut = () => {
        setZoomStyle({ transform: 'scale(1)' });
        setIsZooming(false);
    };

    const handleVariantSelect = (type, val) => {
        setSelectedVariants(prev => ({ ...prev, [type]: val }));
    };

    const submitReview = (e) => {
        e.preventDefault();
        alert('Review submitted to the queue!');
        setShowWriteReview(false);
        setReviewForm({ rating: 5, title: '', comment: '' });
    };

    return (
        <div className="pds-root">
            {/* ── BREADCRUMB ── */}
            <div className="pds-breadcrumb">
                <Link to="/">Home</Link> <ChevronRight size={14} />
                <Link to="/catalog">Catalog</Link> <ChevronRight size={14} />
                <Link to={`/catalog?cat=${product.category_name}`}>{product.category_name}</Link> <ChevronRight size={14} />
                <span className="pds-bc-active">{product.name}</span>
            </div>

            {/* ── TOP SECTION: GALLERY + INFO ── */}
            <div className="pds-hero-grid">
                
                {/* Product Gallery */}
                <div className="pds-gallery">
                    <div className="pds-thumbnails">
                        {images.map((img, idx) => (
                            <div key={idx} 
                                 className={`pds-thumb ${activeImage === idx ? 'active' : ''}`}
                                 onClick={() => setActiveImage(idx)}>
                                <img src={img} alt={`Thumb ${idx}`} />
                            </div>
                        ))}
                    </div>
                    <div className="pds-main-image-container" 
                         onMouseMove={handleZoom} 
                         onMouseLeave={handleZoomOut}>
                        <img src={images[activeImage]} alt={product.name} 
                             className="pds-main-image"
                             style={zoomStyle} />
                        {discountPct > 0 && <div className="pds-discount-badge">-{discountPct}%</div>}
                    </div>
                </div>

                {/* Product Info */}
                <div className="pds-info">
                    <div className="pds-brand">
                        <span>{product.brand || 'Premium Brand'}</span>
                    </div>
                    <h1 className="pds-title">{product.name}</h1>
                    
                    <div className="pds-rating-summary">
                        <div className="pds-stars">
                            {[1,2,3,4,5].map(i => (
                                <Star key={i} size={16} fill={i <= Math.round(avgRating) ? '#f59e0b' : 'none'} color={i <= Math.round(avgRating) ? '#f59e0b' : '#d1d5db'} />
                            ))}
                        </div>
                        <span className="pds-rating-score">{avgRating}</span>
                        <a href="#reviews" className="pds-rating-count">({totalReviews} reviews)</a>
                    </div>

                    <div className="pds-pricing">
                        <div className="pds-price-current">₹{displayPrice.toLocaleString('en-IN')}</div>
                        {oldPrice > displayPrice && <div className="pds-price-old">₹{oldPrice.toLocaleString('en-IN')}</div>}
                        <div className="pds-taxes">Inclusive of all taxes</div>
                    </div>

                    {/* Key Highlights */}
                    <ul className="pds-highlights">
                        {product.description && <li><Check size={16}/> {product.description.substring(0, 60)}...</li>}
                        <li><Check size={16}/> Instant dispatch available</li>
                        <li><Check size={16}/> Authenticity guaranteed</li>
                        <li><Check size={16}/> Covered by 1 Year Warranty</li>
                    </ul>

                    {/* Dynamic Variant Selector */}
                    {Object.entries(variantGroups).map(([type, variants]) => (
                        <div key={type} className="pds-variant-group">
                            <div className="pds-v-header">
                                <span className="pds-v-type">{type}</span>
                                <span className="pds-v-selected">{selectedVariants[type] || 'Select'}</span>
                            </div>
                            <div className="pds-v-options">
                                {variants.map(v => {
                                    const isSelected = selectedVariants[type] === v.value;
                                    const outOfStock = v.stock <= 0;
                                    // If type is color, try to draw a swatch
                                    if(type.toLowerCase() === 'color' || type.toLowerCase() === 'colour') {
                                        return (
                                            <button key={v.id} 
                                                    className={`pds-v-swatch ${isSelected ? 'active' : ''} ${outOfStock ? 'oos' : ''}`}
                                                    onClick={() => !outOfStock && handleVariantSelect(type, v.value)}
                                                    style={{ backgroundColor: v.value.toLowerCase() }}
                                                    title={v.value}>
                                                {outOfStock && <div className="pds-swatch-line"></div>}
                                                {isSelected && <Check size={14} color={v.value.toLowerCase() === 'white' ? '#000': '#fff'} style={{mixBlendMode:'difference'}}/>}
                                            </button>
                                        )
                                    }
                                    return (
                                        <button key={v.id} 
                                                className={`pds-v-pill ${isSelected ? 'active' : ''} ${outOfStock ? 'oos' : ''}`}
                                                onClick={() => !outOfStock && handleVariantSelect(type, v.value)}>
                                            {v.value}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}

                    {/* CTA Actions */}
                    <div ref={observerRef} className="pds-cta-engine">
                        <button className="pds-btn-cart" onClick={() => addToCart(product)}>
                            <ShoppingBag size={20} /> Add to Cart
                        </button>
                        <button className="pds-btn-wishlist" onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}>
                            <Heart size={20} fill={isInWishlist(product.id) ? '#ef4444' : 'none'} color={isInWishlist(product.id) ? '#ef4444' : '#111827'} />
                        </button>
                    </div>

                    <button className="pds-btn-buy" onClick={async () => { await addToCart(product); navigate('/checkout'); }}>
                        Buy Now
                    </button>

                    {/* Trust Layer */}
                    <div className="pds-trust-layer">
                        <div className="pds-trust-item"><Truck size={20}/> <span>Free Delivery</span></div>
                        <div className="pds-trust-item"><RotateCcw size={20}/> <span>7 Days Return</span></div>
                        <div className="pds-trust-item"><ShieldCheck size={20}/> <span>1 Year Warranty</span></div>
                        <div className="pds-trust-item"><BadgeCheck size={20}/> <span>Top Brand</span></div>
                    </div>
                </div>
            </div>

            <div className="pds-divider"></div>

            {/* ── BEHAVIORAL STORY TELLING & SPECS ── */}
            <div className="pds-content-grid">
                
                {/* Left: Specs Grid */}
                <div className="pds-specs-section">
                    <h2>Technical Specifications</h2>
                    {product.specs?.length > 0 ? (
                        <div className="pds-specs-grid">
                            {product.specs.map(spec => (
                                <div key={spec.id} className="pds-spec-row">
                                    <div className="pds-spec-key">{spec.key}</div>
                                    <div className="pds-spec-val">{spec.value}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="pds-no-data">No deeper specs available for this edition.</div>
                    )}
                </div>

                {/* Right: Feature Blocks (Generated from Description/Marketing) */}
                <div className="pds-story-section">
                    <h2>Why this matters</h2>
                    <div className="pds-story-block">
                        <div className="pds-sb-icon"><Zap size={24}/></div>
                        <div>
                            <h4>Uncompromised Performance</h4>
                            <p>Engineered to deliver seamless experiences, minimizing latency and maximizing output across all standard applications.</p>
                        </div>
                    </div>
                    <div className="pds-story-block">
                        <div className="pds-sb-icon"><ShieldCheck size={24}/></div>
                        <div>
                            <h4>Designed for Elegance & Durability</h4>
                            <p>Crafted using premium materials that endure daily friction while maintaining a pristine, showroom finish.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pds-divider" id="reviews"></div>

            {/* ── REVIEWS & RATINGS SYSTEM ── */}
            <div className="pds-reviews-system">
                <div className="pds-rs-header">
                    <h2>Customer Reviews</h2>
                    <button className="pds-btn-outline" onClick={() => setShowWriteReview(true)}>Write a Review</button>
                </div>

                <div className="pds-rs-grid">
                    {/* Summary */}
                    <div className="pds-rs-summary">
                        <div className="pds-rs-big-score">
                            <h1>{avgRating}</h1>
                            <div className="pds-stars">
                                {[1,2,3,4,5].map(i => (
                                    <Star key={i} size={20} fill={i <= Math.round(avgRating) ? '#f59e0b' : 'none'} color={i <= Math.round(avgRating) ? '#f59e0b' : '#d1d5db'} />
                                ))}
                            </div>
                            <span>Based on {totalReviews} reviews</span>
                        </div>
                        <div className="pds-rs-bars">
                            {ratingBars.map(row => (
                                <div key={row.stars} className="pds-bar-row">
                                    <span>{row.stars} <Star size={12} fill="#94a3b8" color="#94a3b8"/></span>
                                    <div className="pds-bar-track">
                                        <div className="pds-bar-fill" style={{ width: `${row.pct}%` }}></div>
                                    </div>
                                    <span className="pds-bar-count">{row.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Review List */}
                    <div className="pds-rs-list">
                        {product.reviewsList?.length > 0 ? product.reviewsList.map(review => (
                            <div key={review.id} className="pds-review-card">
                                <div className="pds-rc-header">
                                    <div className="pds-rc-avatar">{review.user_name?.charAt(0) || 'U'}</div>
                                    <div className="pds-rc-meta">
                                        <h4>{review.user_name || 'Anonymous User'}</h4>
                                        <div className="pds-stars">
                                            {[1,2,3,4,5].map(i => (
                                                <Star key={i} size={12} fill={i <= review.rating ? '#f59e0b' : 'none'} color={i <= review.rating ? '#f59e0b' : '#d1d5db'} />
                                            ))}
                                            <span style={{marginLeft:8, fontSize:'0.75rem', color:'#94a3b8'}}>{new Date(review.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <h5 className="pds-rc-title">{review.title || 'Review'}</h5>
                                <p className="pds-rc-comment">{review.comment}</p>
                                <div className="pds-rc-actions">
                                    <button><ThumbsUp size={14}/> Helpful ({review.helpful_count || 0})</button>
                                </div>
                            </div>
                        )) : (
                            <div className="pds-no-reviews">
                                <MessageSquare size={40} color="#cbd5e1"/>
                                <p>No reviews yet. Be the first to review this product!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Q&A SYSTEM ── */}
            <div className="pds-qa-system">
                <div className="pds-rs-header" style={{ marginBottom: '1.5rem' }}>
                    <h2>Questions & Answers</h2>
                    <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                        <input type="text" placeholder="Have a question? Search or ask..." className="pds-qa-input" />
                    </div>
                </div>
                <div className="pds-qa-list">
                    {product.qaList?.length > 0 ? product.qaList.map(qa => (
                        <div key={qa.id} className="pds-qa-card">
                            <div className="pds-q-block">
                                <span>Q:</span> <p>{qa.question}</p>
                            </div>
                            <div className="pds-a-block">
                                <span>A:</span> <p>{qa.answer || 'No answer yet. Our community is working on it!'}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="pds-no-data">No questions asked yet.</div>
                    )}
                </div>
            </div>

            {/* ── Write Review Modal ── */}
            {showWriteReview && (
                <div className="pds-modal-backdrop">
                    <div className="pds-modal-content">
                        <div className="pds-modal-header">
                            <h2>Write a Review</h2>
                            <button onClick={() => setShowWriteReview(false)}><X size={24}/></button>
                        </div>
                        <form onSubmit={submitReview}>
                            <div className="pds-form-group">
                                <label>Overall Rating</label>
                                <div className="pds-star-select">
                                    {[1,2,3,4,5].map(i => (
                                        <Star key={i} size={32} 
                                              fill={i <= reviewForm.rating ? '#f59e0b' : 'none'} 
                                              color={i <= reviewForm.rating ? '#f59e0b' : '#d1d5db'}
                                              onClick={() => setReviewForm({...reviewForm, rating: i})}
                                              style={{ cursor: 'pointer' }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="pds-form-group">
                                <label>Review Title</label>
                                <input type="text" required placeholder="Summarize your experience"
                                       value={reviewForm.title} onChange={e => setReviewForm({...reviewForm, title: e.target.value})} />
                            </div>
                            <div className="pds-form-group">
                                <label>Detailed Review</label>
                                <textarea required rows={4} placeholder="What did you like or dislike?"
                                          value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}></textarea>
                            </div>
                            <div className="pds-form-group pds-photo-upload">
                                <ImageIcon size={20}/>
                                <span>Add Photos (Optional)</span>
                            </div>
                            <button type="submit" className="pds-btn-submit">Post Review</button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── STICKY BOTTOM BAR (MOBILE ONLY) ── */}
            <div className={`pds-sticky-bar ${showStickyBar ? 'visible' : ''}`}>
                <div className="pds-sb-info">
                    <div className="pds-sb-price">₹{displayPrice.toLocaleString('en-IN')}</div>
                    {avgRating && <div className="pds-sb-rating"><Star size={12} fill="#f59e0b" color="#f59e0b"/> {avgRating}</div>}
                </div>
                <button className="pds-sb-btn" onClick={() => addToCart(product)}>Add to Cart</button>
            </div>
            
        </div>
    );
};

export default ProductDetailSystem;
