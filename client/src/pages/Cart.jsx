import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Minus, Plus, ArrowRight, ShieldCheck, Tag, Check, Trash2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Cart.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Cart = () => {
    const { cartItems: cart, removeFromCart, updateQuantity, clearCart } = useCart();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    const subtotal = cart.reduce((total, item) =>
        total + (parseFloat(item.price) || 0) * (item.quantity || 1), 0
    );

    const handleApplyCoupon = async () => {
        setCouponError('');
        setCouponSuccess('');
        if (!couponCode.trim()) return;

        if (!token) {
            setCouponError('Please log in to apply a coupon');
            return;
        }

        setApplyingCoupon(true);
        try {
            const res = await axios.post(`${API}/api/coupons/validate`, {
                code: couponCode.trim().toUpperCase(),
                cart_total: subtotal,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                const c = res.data.data;
                let discAmount = 0;
                if (c.discount_type === 'percentage') {
                    discAmount = (subtotal * c.discount_value) / 100;
                    if (c.max_discount_amount) discAmount = Math.min(discAmount, c.max_discount_amount);
                } else {
                    discAmount = c.discount_value;
                }
                discAmount = Math.min(discAmount, subtotal);
                setDiscount(discAmount);
                setAppliedCoupon(c);
                setCouponSuccess(`✓ ${c.description || `${c.discount_type === 'percentage' ? c.discount_value + '%' : '₹' + c.discount_value} off applied!`}`);
            }
        } catch (err) {
            setCouponError(err.response?.data?.message || 'Invalid coupon code');
            setDiscount(0);
            setAppliedCoupon(null);
        } finally {
            setApplyingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setDiscount(0);
        setCouponCode('');
        setCouponSuccess('');
        setCouponError('');
    };

    const shipping = subtotal > 0 ? (subtotal > 20000 ? 0 : 500) : 0;
    const taxes = Math.round((subtotal - discount) * 0.18);
    const total = Math.round(subtotal - discount + shipping + taxes);

    const handleCheckout = () => {
        if (!user) { navigate('/login'); return; }
        navigate('/checkout', {
            state: {
                cartItems: cart,
                subtotal,
                discount,
                shipping,
                taxes,
                total,
                couponCode: appliedCoupon?.code || null,
            }
        });
    };

    return (
        <div className="dense-cart-page container">
            <header className="dense-cart-header">
                <div>Your Bag</div>
                <div className="header-caption">{cart.length} item{cart.length !== 1 ? 's' : ''}</div>
            </header>

            {cart.length === 0 ? (
                <div className="empty-curation">
                    <h3>Your bag is empty</h3>
                    <p>Add items to your bag to continue shopping.</p>
                    <Link to="/catalog" className="btn-primary" style={{ padding: '1rem 2rem' }}>
                        Shop Now
                    </Link>
                </div>
            ) : (
                <div className="cart-split">
                    {/* Left Items Pane */}
                    <div className="cart-items-pane">
                        {cart.map((item) => (
                            <div key={item.cart_id || item.id} className="dense-cart-item">
                                <div className="c-img">
                                    <img src={item.image_url} alt={item.name}
                                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200'; }}
                                    />
                                </div>
                                <div className="c-info">
                                    <div className="c-brand">{item.category || item.brand || 'PRODUCT'}</div>
                                    <h3 className="c-title">{item.name}</h3>
                                    <div className="c-specs">Verified Authentic • Free Returns</div>

                                    <div className="c-controls">
                                        <div className="qty-control">
                                            <button className="qty-btn"
                                                onClick={() => updateQuantity(item.id, item.cart_id, Math.max(1, item.quantity - 1))}>
                                                <Minus size={13}/>
                                            </button>
                                            <span className="qty-num">{item.quantity}</span>
                                            <button className="qty-btn"
                                                onClick={() => updateQuantity(item.id, item.cart_id, item.quantity + 1)}>
                                                <Plus size={13}/>
                                            </button>
                                        </div>
                                        <div className="c-price">
                                            ₹{((parseFloat(item.price) || 0) * item.quantity).toLocaleString('en-IN')}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id, item.cart_id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            background: 'none', border: 'none', color: '#dc2626',
                                            fontSize: '0.72rem', textTransform: 'uppercase',
                                            letterSpacing: '0.06em', marginTop: '0.5rem',
                                            alignSelf: 'flex-start', cursor: 'pointer', fontWeight: 700
                                        }}
                                    >
                                        <Trash2 size={12}/> Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Summary Sticky Pane */}
                    <div className="cart-summary-pane">
                        <h4 className="summary-title">Order Summary</h4>

                        <div className="summary-row">
                            <span>Subtotal ({cart.length} items)</span>
                            <span>₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
                        </div>
                        {discount > 0 && (
                            <div className="summary-row" style={{ color: '#059669' }}>
                                <span>Coupon Discount ({appliedCoupon?.code})</span>
                                <span>−₹{Math.round(discount).toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span style={{ color: shipping === 0 ? '#059669' : 'inherit' }}>
                                {shipping === 0 ? '🎉 FREE' : `₹${shipping}`}
                            </span>
                        </div>
                        <div className="summary-row">
                            <span>GST (18%)</span>
                            <span>₹{taxes.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="summary-total">
                            <span>Total</span>
                            <span>₹{total.toLocaleString('en-IN')}</span>
                        </div>

                        {/* COUPON ENGINE */}
                        <div className="coupon-box">
                            <div style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.75rem', color: '#374151', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Tag size={14} color="#4f46e5"/> PROMO CODE
                            </div>

                            {appliedCoupon ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 8, padding: '0.625rem 0.875rem' }}>
                                    <Check size={16} color="#16a34a"/>
                                    <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 800, color: '#15803d' }}>{appliedCoupon.code}</span>
                                    <button onClick={removeCoupon} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                                        <X size={14}/>
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter code (e.g. WELCOME10)"
                                        value={couponCode}
                                        onChange={e => {
                                            setCouponCode(e.target.value.toUpperCase());
                                            setCouponError('');
                                        }}

                                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                        className="coupon-input"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={applyingCoupon}
                                        className="coupon-btn"
                                        style={{ opacity: applyingCoupon ? 0.7 : 1 }}
                                    >
                                        {applyingCoupon ? '...' : 'APPLY'}
                                    </button>
                                </div>
                            )}

                            {couponError && (
                                <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600 }}>
                                    ✗ {couponError}
                                </p>
                            )}
                            {couponSuccess && !appliedCoupon && (
                                <p style={{ color: '#16a34a', fontSize: '0.75rem', marginTop: '0.4rem', fontWeight: 600 }}>
                                    {couponSuccess}
                                </p>
                            )}
                            {appliedCoupon && (
                                <p style={{ color: '#16a34a', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>
                                    ✓ Saving ₹{Math.round(discount).toLocaleString('en-IN')} on this order
                                </p>
                            )}

                            {/* Hint codes */}
                            {!appliedCoupon && (
                                <div style={{ marginTop: '0.75rem', fontSize: '0.68rem', color: '#94a3b8' }}>
                                    Try: <button onClick={() => setCouponCode('WELCOME10')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontWeight: 700, fontSize: '0.68rem', textDecoration: 'underline' }}>WELCOME10</button>
                                    {' · '}
                                    <button onClick={() => setCouponCode('FLAT500')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontWeight: 700, fontSize: '0.68rem', textDecoration: 'underline' }}>FLAT500</button>
                                    {' · '}
                                    <button onClick={() => setCouponCode('SAVE20')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontWeight: 700, fontSize: '0.68rem', textDecoration: 'underline' }}>SAVE20</button>
                                </div>
                            )}
                        </div>

                        <button
                            className="btn-secondary checkout-btn"
                            style={{ marginTop: '1.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout <ArrowRight size={16}/>
                        </button>

                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.65rem', color: '#94a3b8', justifyContent: 'center' }}>
                            <ShieldCheck size={13} color="#4f46e5"/> 256-bit SSL Encrypted Checkout
                        </div>

                        {shipping > 0 && (
                            <div style={{ marginTop: '0.75rem', background: '#fef9c3', borderRadius: 8, padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#92400e', fontWeight: 700, textAlign: 'center' }}>
                                Add ₹{Math.round(20000 - subtotal).toLocaleString('en-IN')} more for FREE shipping 🚀
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
