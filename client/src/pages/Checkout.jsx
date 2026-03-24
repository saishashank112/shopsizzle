import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
    ShieldCheck, ChevronRight, CreditCard, Truck, MapPin,
    Check, ArrowLeft, Wallet, Phone, AlertCircle
} from 'lucide-react';
import './Checkout.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PAYMENT_METHODS = [
    { id: 'upi',    label: 'UPI',           icon: <Phone size={18}/>,      sub: 'GPay, PhonePe, Paytm, BHIM' },
    { id: 'card',   label: 'Credit / Debit Card', icon: <CreditCard size={18}/>, sub: 'Visa, Mastercard, RuPay' },
    { id: 'wallet', label: 'Wallet',        icon: <Wallet size={18}/>,     sub: 'Paytm, Amazon Pay, Mobikwik' },
    { id: 'cod',    label: 'Cash on Delivery', icon: <Truck size={18}/>,  sub: 'Pay when delivered' },
];

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const { clearCart, cartItems: contextCartItems, total: contextSubtotal } = useCart();

    /* Fallback to context if missing location.state */
    const cartItems = location.state?.cartItems?.length ? location.state.cartItems : contextCartItems;
    const subtotal = location.state?.subtotal || contextSubtotal;
    const discount = location.state?.discount || 0;
    const shipping = location.state?.shipping !== undefined ? location.state.shipping : (subtotal > 499 ? 0 : 40);
    const taxes = location.state?.taxes || (subtotal * 0.18);
    const total = location.state?.total || (subtotal + shipping + taxes - discount);
    const couponCode = location.state?.couponCode || null;

    /* ── Form state ── */
    const [step, setStep] = useState(1); // 1=address 2=payment 3=success
    const [payMethod, setPayMethod] = useState('cod');
    const [placing, setPlacing] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [error, setError] = useState('');

    const [addr, setAddr] = useState({
        full_name: user?.name || '',
        phone: user?.phone || '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
    });

    /* UPI/Card fields */
    const [upiId, setUpiId] = useState('');
    const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });

    if (!cartItems.length && step !== 3) {
        return (
            <div className="chk-empty">
                <AlertCircle size={48} color="#94a3b8"/>
                <h2>Nothing to checkout</h2>
                <Link to="/catalog" className="chk-btn-primary">Continue Shopping</Link>
            </div>
        );
    }

    /* ── Place order ── */
    const placeOrder = async () => {
        setError('');
        setPlacing(true);
        try {
            const shippingAddr = `${addr.full_name}, ${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}, ${addr.city}, ${addr.state} - ${addr.pincode} | Ph: ${addr.phone}`;
            const payload = {
                total_amount: total,
                shipping_address: shippingAddr,
                coupon_code: couponCode,
                discount_amount: discount,
                payment_method: payMethod,
                latitude: addr.latitude || null,
                longitude: addr.longitude || null,
                items: cartItems.map(i => ({
                    product_id: i.id,
                    quantity: i.quantity,
                    price: parseFloat(i.price),
                })),
            };
            const res = await axios.post(`${API}/api/orders/create`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setOrderId(res.data.data.order_id);
                await clearCart();
                setStep(3);
            }
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setPlacing(false);
        }
    };

    /* ── Step 1: Address ── */
    const AddressStep = () => (
        <div className="chk-section">
            <div className="chk-section-header">
                <MapPin size={18} color="#4f46e5"/> Delivery Address
            </div>
            <div className="chk-addr-grid">
                {[
                    { key: 'full_name', label: 'Full Name', placeholder: 'John Doe', half: true },
                    { key: 'phone',     label: 'Phone Number', placeholder: '9876543210', half: true },
                    { key: 'line1',     label: 'Address Line 1', placeholder: 'House/Flat No., Street Name' },
                    { key: 'line2',     label: 'Address Line 2 (Optional)', placeholder: 'Landmark, Area' },
                    { key: 'city',      label: 'City', placeholder: 'Mumbai', half: true },
                    { key: 'state',     label: 'State', placeholder: 'Maharashtra', half: true },
                    { key: 'pincode',   label: 'PIN Code', placeholder: '400001', half: true },
                ].map(f => (
                    <div key={f.key} className={`chk-field ${f.half ? 'half' : ''}`}>
                        <label className="chk-label">{f.label}</label>
                        <input
                            className="chk-input"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder={f.placeholder}
                            value={addr[f.key]}
                            onChange={e => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (f.key === 'phone' || f.key === 'pincode') {
                                    if (f.key === 'phone' && val.length > 10) return;
                                    if (f.key === 'pincode' && val.length > 6) return;
                                }
                                setAddr(p => ({ ...p, [f.key]: val }));
                            }}
                        />

                    </div>
                ))}
            </div>
            <button
                className="chk-btn-primary"
                onClick={() => {
                    const proceedToPayment = () => {
                        if (!addr.full_name || !addr.phone || !addr.line1 || !addr.city || !addr.state || !addr.pincode) {
                            setError('Please fill all required address fields to proceed.');
                            return;
                        }
                        if (addr.phone.length !== 10) {
                            setError('Phone number must be exactly 10 digits.');
                            return;
                        }
                        setError('');
                        setStep(2);
                    };

                    if (window.confirm("🌍 Accurate Delivery Tracking:\n\nWe will request your live GPS position coordinates via your browser securely to guarantee accurate item drop-offs.\n\nPlease click 'OK' to authorize.")) {
                        if (navigator.geolocation) {
                            setError('Obtaining positioning coordinates...');
                            navigator.geolocation.getCurrentPosition(
                                (pos) => {
                                    setAddr(p => ({ ...p, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                                    setError('');
                                    proceedToPayment();
                                },
                                (err) => {
                                    console.error('Geo error', err);
                                    setError('Location fetch failed, continuing with typed address directions.');
                                    setTimeout(() => { setError(''); proceedToPayment(); }, 1500);
                                },
                                { timeout: 10000, enableHighAccuracy: true }
                            );
                        } else {
                            proceedToPayment();
                        }
                    } else {
                        proceedToPayment(); // user cancelled, continue anyway
                    }
                }}
            >
                Continue to Payment <ChevronRight size={16}/>
            </button>
            {error && <p className={`chk-error ${error.includes('Obtaining') || error.includes('Location fetch') ? 'chk-info' : ''}`}>{error}</p>}
        </div>
    );

    /* ── Step 2: Payment ── */
    const PaymentStep = () => (
        <div className="chk-section">
            <div className="chk-section-header">
                <CreditCard size={18} color="#4f46e5"/> Payment Method
            </div>

            <div className="chk-pay-methods">
                {PAYMENT_METHODS.map(m => (
                    <button
                        key={m.id}
                        className={`chk-pay-option ${payMethod === m.id ? 'selected' : ''}`}
                        onClick={() => setPayMethod(m.id)}
                    >
                        <div className="chk-pay-radio">
                            {payMethod === m.id && <div className="chk-pay-dot"/>}
                        </div>
                        <span className="chk-pay-icon">{m.icon}</span>
                        <div>
                            <div className="chk-pay-label">{m.label}</div>
                            <div className="chk-pay-sub">{m.sub}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* UPI input */}
            {payMethod === 'upi' && (
                <div className="chk-pay-extra">
                    <label className="chk-label">UPI ID</label>
                    <input className="chk-input" placeholder="name@upi" value={upiId} onChange={e => setUpiId(e.target.value)}/>
                </div>
            )}

            {/* Card input */}
            {payMethod === 'card' && (
                <div className="chk-pay-extra chk-card-grid">
                    <div className="chk-field" style={{ gridColumn: '1/-1' }}>
                        <label className="chk-label">Card Number</label>
                        <input className="chk-input" placeholder="1234 5678 9012 3456" maxLength={19}
                            value={card.number}
                            onChange={e => setCard(p => ({ ...p, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() }))}
                        />
                    </div>
                    <div className="chk-field">
                        <label className="chk-label">Name on Card</label>
                        <input className="chk-input" placeholder="JOHN DOE" value={card.name} onChange={e => setCard(p => ({ ...p, name: e.target.value.toUpperCase() }))}/>
                    </div>
                    <div className="chk-field">
                        <label className="chk-label">Expiry (MM/YY)</label>
                        <input className="chk-input" placeholder="12/27" maxLength={5} value={card.expiry} onChange={e => setCard(p => ({ ...p, expiry: e.target.value }))}/>
                    </div>
                    <div className="chk-field">
                        <label className="chk-label">CVV</label>
                        <input className="chk-input" placeholder="•••" maxLength={4} type="password" value={card.cvv} onChange={e => setCard(p => ({ ...p, cvv: e.target.value }))}/>
                    </div>
                </div>
            )}

            {payMethod === 'cod' && (
                <div className="chk-cod-note">
                    <Truck size={16}/> Pay ₹{total.toLocaleString('en-IN')} in cash at the time of delivery.
                </div>
            )}

            {error && <p className="chk-error">{error}</p>}

            <div className="chk-pay-actions">
                <button className="chk-btn-outline" onClick={() => { setError(''); setStep(1); }}>
                    <ArrowLeft size={15}/> Back
                </button>
                <button className="chk-btn-primary place-order-btn" onClick={placeOrder} disabled={placing}>
                    {placing ? 'Placing Order...' : `Place Order · ₹${total.toLocaleString('en-IN')}`}
                </button>
            </div>

            <div className="chk-secure-badge">
                <ShieldCheck size={13} color="#4f46e5"/> 256-bit SSL secured checkout
            </div>
        </div>
    );

    /* ── Step 3: Success ── */
    const SuccessStep = () => (
        <div className="chk-success">
            <div className="chk-success-icon">
                <Check size={36} color="#fff" strokeWidth={3}/>
            </div>
            <h2 className="chk-success-title">Order Placed! 🎉</h2>
            <p className="chk-success-sub">
                Your order <strong>#{String(orderId).padStart(6, '0')}</strong> has been confirmed.<br/>
                You'll receive a confirmation shortly.
            </p>
            <div className="chk-success-actions">
                <Link to="/dashboard" className="chk-btn-primary">View My Orders</Link>
                <Link to="/catalog" className="chk-btn-outline">Continue Shopping</Link>
            </div>
        </div>
    );

    return (
        <div className="chk-page container">
            {/* Breadcrumb */}
            {step < 3 && (
                <div className="chk-breadcrumb">
                    <Link to="/cart" className="chk-bc-link"><ArrowLeft size={14}/> Back to Cart</Link>
                    <div className="chk-steps">
                        {['Address', 'Payment', 'Done'].map((s, i) => (
                            <React.Fragment key={s}>
                                <div className={`chk-step ${step > i ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
                                    <div className="chk-step-num">{step > i + 1 ? <Check size={12}/> : i + 1}</div>
                                    <span>{s}</span>
                                </div>
                                {i < 2 && <div className={`chk-step-line ${step > i + 1 ? 'done' : ''}`}/>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            <div className={`chk-layout ${step === 3 ? 'success-layout' : ''}`}>
                {/* Left: form */}
                <div className="chk-left">
                    {step === 1 && AddressStep()}
                    {step === 2 && PaymentStep()}
                    {step === 3 && SuccessStep()}
                </div>

                {/* Right: order summary */}
                {step < 3 && (
                    <div className="chk-right">
                        <div className="chk-summary-card">
                            <div className="chk-summary-title">Order Summary</div>

                            <div className="chk-item-list">
                                {cartItems.map(item => (
                                    <div key={item.id} className="chk-item-row">
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="chk-item-img"
                                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100'; }}
                                        />
                                        <div className="chk-item-info">
                                            <div className="chk-item-name">{item.name}</div>
                                            <div className="chk-item-qty">Qty: {item.quantity}</div>
                                        </div>
                                        <div className="chk-item-price">₹{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="chk-summary-rows">
                                <div className="chk-sum-row"><span>Subtotal</span><span>₹{Math.round(subtotal).toLocaleString('en-IN')}</span></div>
                                {discount > 0 && <div className="chk-sum-row" style={{ color: '#059669' }}><span>Coupon Discount</span><span>−₹{Math.round(discount).toLocaleString('en-IN')}</span></div>}
                                <div className="chk-sum-row"><span>Shipping</span><span style={{ color: shipping === 0 ? '#059669' : 'inherit' }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                                <div className="chk-sum-row"><span>GST (18%)</span><span>₹{Math.round(taxes).toLocaleString('en-IN')}</span></div>
                            </div>

                            <div className="chk-sum-total">
                                <span>Total</span>
                                <span>₹{Math.round(total).toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Checkout;
