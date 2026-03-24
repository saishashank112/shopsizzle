import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    X, Save, Image as ImageIcon, Menu, 
    LayoutDashboard, ShoppingBag, ListOrdered, Settings, Package
} from 'lucide-react';

// Components
import AdminSidebar from '../components/admin/AdminSidebar';
import DynamicProductForm from '../components/admin/DynamicProductForm'; // Imported Dynamic Form
import DashboardOverview from '../components/admin/DashboardOverview';
import OrdersManagement from '../components/admin/OrdersManagement';
import DeliveryManagement from '../components/admin/DeliveryManagement';
import ProductCatalog from '../components/admin/ProductCatalog';
import InventoryManagement from '../components/admin/InventoryManagement';
import CustomerManagement from '../components/admin/CustomerManagement';
import NotificationsManagement from '../components/admin/NotificationsManagement';
import PromotionsEngine from '../components/admin/PromotionsEngine';
import ReturnsManagement from '../components/admin/ReturnsManagement';
import ReviewModeration from '../components/admin/ReviewModeration';
import AdminSettings from '../components/admin/AdminSettings';
import CatalogConfig from '../components/admin/CatalogConfig';

import './AdminDashboard.css';

// Removed static categoriesList to fetch dynamically

const AdminDashboard = () => {
    const { token, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [returns, setReturns] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [settings, setSettings] = useState({});

    const [isProductModalOpen, setProductModalOpen] = useState(false);
    const [isCouponModalOpen, setCouponModalOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [dynamicFields, setDynamicFields] = useState([]);
    const [dynamicValues, setDynamicValues] = useState({});
    const [categoriesList, setCategoriesList] = useState([]);
    
    const [formData, setFormData] = useState({
        name: '', price: '', old_price: '', category_id: 1, description: '', 
        image_url: '', stock: 50, brand: '', color: '', material: '', rating: 0
    });

    useEffect(() => {
        const fetchFields = async () => {
            if (!formData.category_id) return;
            try {
                const r = await axios.get(`http://localhost:5000/api/products/categories/${formData.category_id}/fields`);
                setDynamicFields(r.data.data || []);
            } catch (e) {
                console.warn('No dynamic fields found or error fetching');
                setDynamicFields([]);
            }
        };
        fetchFields();
    }, [formData.category_id]);

    const [couponForm, setCouponForm] = useState({
        code: '', discount_type: 'percentage', discount_value: '', 
        min_order_amount: 0, target: 'all', expiry: '', usage_limit: -1
    });

    // ── DATA FETCHING ─────────────────────────────────────────────
    const boot = useCallback(async (silent = false) => {
        if (!isAdmin || !token) return;
        if (!silent) setLoading(true);
        
        const fetchWrap = async (url) => {
            try {
                const r = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
                return r.data.data;
            } catch (e) {
                console.warn(`Fetch failed for ${url}:`, e.message);
                return [];
            }
        };

        try {
            const [pItems, pOrders, pCoupons, pReturns, pReviews, pAnalytics, pSettings, pCats] = await Promise.all([
                fetchWrap('http://localhost:5000/api/products'),
                fetchWrap('http://localhost:5000/api/orders/all'),
                fetchWrap('http://localhost:5000/api/coupons/all'),
                fetchWrap('http://localhost:5000/api/returns/all'),
                fetchWrap('http://localhost:5000/api/reviews/pending'),
                fetchWrap('http://localhost:5000/api/tracking/analytics'),
                fetchWrap('http://localhost:5000/api/settings'),
                fetchWrap('http://localhost:5000/api/products/categories') // Fetching Categories
            ]);

            setProducts(pItems || []);
            setOrders(pOrders || []);
            setCoupons(pCoupons || []);
            setReturns(pReturns || []);
            setReviews(pReviews || []);
            setAnalytics(pAnalytics || null);
            setSettings(pSettings || {});
            setCategoriesList(pCats || []);
        } catch {
            console.error('Core Engine Sync Failed');
        } finally {
            if (!silent) setLoading(false);
        }
    }, [isAdmin, token]);

    useEffect(() => { boot(); }, [boot]);

    // ── HANDLERS ──────────────────────────────────────────────
    const openProductModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name, price: product.price, old_price: product.old_price || product.price * 1.2,
                category_id: product.category_id || 1, description: product.description || '', 
                image_url: product.image_url || '', stock: product.stock || 50,
                brand: product.brand || '', color: product.color || '', 
                material: product.material || '', rating: product.rating || 0
            });
            setDynamicValues(product.attributes ? (typeof product.attributes === 'string' ? JSON.parse(product.attributes) : product.attributes) : {});
        } else {
            setEditingProduct(null);
            setFormData({ 
                name: '', price: '', old_price: '', category_id: 1, description: '', 
                image_url: '', stock: 50, brand: '', color: '', material: '', rating: 0 
            });
            setDynamicValues({});
        }
        setProductModalOpen(true);
    };

    const handleProductSubmit = async (payload) => {
        try {
            const url = editingProduct 
                ? `http://localhost:5000/api/products/${editingProduct.id}` 
                : `http://localhost:5000/api/products`;
            const method = editingProduct ? 'put' : 'post';
            
            await axios({
                method, url, data: payload,
                headers: { Authorization: `Bearer ${token}` }
            });
            setProductModalOpen(false);
            setDynamicValues({});
            boot(true);
        } catch {
            alert('Failed to save product changes.');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Purge this artifact? This action cannot be undone.")) return;
        try {
            await axios.delete(`http://localhost:5000/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            boot(true);
        } catch(err) { console.error('Delete failed', err); }
    };

    const handleQuickStock = async (id, currentStock) => {
        const newStock = window.prompt("Settlement Quantity Adjust (Absolute):", currentStock);
        if (newStock === null || isNaN(newStock)) return;
        try {
            await axios.patch(`http://localhost:5000/api/products/quick-edit/${id}`, { stock: parseInt(newStock) }, { headers: { Authorization: `Bearer ${token}` } });
            boot(true);
        } catch(err) { console.error('Quick edit failed', err); }
    };

    const handleUpdateOrderStatus = async (id, newStatus) => {
        try {
            // Optimistic update locally
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
            await axios.patch(`http://localhost:5000/api/orders/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
            boot(true); // silent resync in background
        } catch(err) { console.error('Update status failed', err); }
    };

    const handleCouponSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:5000/api/coupons`, {
                ...couponForm,
                min_order_amount: Number(couponForm.min_order_amount),
                target_user_type: couponForm.target,
                expiry_date: couponForm.expiry
            }, { headers: { Authorization: `Bearer ${token}` } });
            setCouponModalOpen(false);
            boot();
        } catch(err) { console.error('Coupon create error', err); }
    };

    const handleDeleteCoupon = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/coupons/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            boot();
        } catch(err) { console.error('Coupon delete failed', err); }
    };

    const handleSaveSettings = async (newSettings) => {
        try {
            await axios.post('http://localhost:5000/api/settings', newSettings, { headers: { Authorization: `Bearer ${token}` } });
            boot();
        } catch (err) { console.error('Settings save failed', err); }
    };

    const handleReviewAction = async (id, action) => {
        try {
            if (action === 'approve') {
                await axios.patch(`http://localhost:5000/api/reviews/approve/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
                boot();
            }
        } catch (err) { console.error('Review action failed', err); }
    };

    const stats = useMemo(() => {
        const rev = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        const penOrders = orders.filter(o => o.status === 'pending').length;
        const outForDel = orders.filter(o => o.status === 'shipped' || o.status === 'out_for_delivery').length;
        const lowStockProducts = products.filter(p => p.stock < 15);
        const uniqueCustomers = new Set(orders.map(o => o.user_id)).size + 1;
        return { rev, totalOrd: orders.length, penOrders, outForDel, lowStockProducts, uniqueCustomers };
    }, [orders, products]);

    // ── RENDER ────────────────────────────────────────────────
    if (!isAdmin) return <Navigate to="/dashboard" />;
    
    // Redirect /admin to /admin/dashboard
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return (
        <div className="admin-os-root">
            <AdminSidebar logout={logout} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="admin-viewport">
                {!sidebarOpen && (
                    <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(true)}>
                        <Menu size={22} />
                    </button>
                )}
                <Routes>
                    <Route path="dashboard" element={<DashboardOverview stats={stats} analytics={analytics} />} />
                    <Route path="orders" element={<OrdersManagement orders={orders} updateStatus={handleUpdateOrderStatus} />} />
                    <Route path="delivery" element={<DeliveryManagement orders={orders} updateStatus={handleUpdateOrderStatus} />} />
                    <Route path="products" element={<ProductCatalog products={products} onAdd={() => openProductModal()} onEdit={openProductModal} onDelete={handleDeleteProduct} />} />
                    <Route path="inventory" element={<InventoryManagement products={products} stats={stats} onQuickEdit={handleQuickStock} onModify={openProductModal} onPurge={handleDeleteProduct} />} />
                    <Route path="customers" element={<CustomerManagement orders={orders} />} />
                    <Route path="catalog" element={<CatalogConfig />} />
                    <Route path="coupons" element={<PromotionsEngine coupons={coupons} onAdd={() => setCouponModalOpen(true)} onDelete={handleDeleteCoupon} />} />
                    <Route path="returns" element={<ReturnsManagement returns={returns} onAction={() => boot(true)} />} />
                    <Route path="reviews" element={<ReviewModeration reviews={reviews} onAction={handleReviewAction} />} />
                    <Route path="notifications" element={<NotificationsManagement />} />
                    <Route path="settings" element={<AdminSettings settings={settings} onSave={handleSaveSettings} />} />
                </Routes>
            </main>

            {/* FLOATING BOTTOM NAV FOR MOBILE */}
            <div className="mobile-bottom-nav-container">
                <div className="floating-pill-nav">
                    <button 
                        className={`pill-nav-item ${location.pathname.includes('/dashboard') ? 'active' : ''}`}
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        <LayoutDashboard size={18} />
                        <span>HOME</span>
                    </button>
                    <button 
                        className={`pill-nav-item ${location.pathname.includes('/products') || location.pathname.includes('/inventory') ? 'active' : ''}`}
                        onClick={() => navigate('/admin/products')}
                    >
                        <Package size={18} />
                        <span>SHOP</span>
                    </button>
                    <button 
                        className={`pill-nav-item ${location.pathname.includes('/orders') || location.pathname.includes('/delivery') ? 'active' : ''}`}
                        onClick={() => navigate('/admin/orders')}
                    >
                        <ListOrdered size={18} />
                        <span>ORDERS</span>
                    </button>
                    <button 
                        className={`pill-nav-item ${location.pathname.includes('/settings') ? 'active' : ''}`}
                        onClick={() => navigate('/admin/settings')}
                    >
                        <Settings size={18} />
                        <span>USER</span>
                    </button>
                </div>
            </div>

            {/* SHARED PRODUCT MODAL (DYNAMICALLY DRIVEN) */}
            {isProductModalOpen && (
                <DynamicProductForm 
                    categories={categoriesList} 
                    editingProduct={editingProduct} 
                    onClose={() => setProductModalOpen(false)} 
                    onSubmit={handleProductSubmit} 
                />
            )}

            {/* SHARED COUPON MODAL */}
            {isCouponModalOpen && (
                <div className="modal-overlay">
                    <div className="product-modal">
                        <div className="modal-header">
                            <h2>Create Coupon</h2>
                            <button className="modal-close-btn" onClick={() => setCouponModalOpen(false)}><X size={18}/></button>
                        </div>
                        <form className="product-form" onSubmit={handleCouponSubmit}>
                            <div className="form-group full">
                                <label>Coupon Code</label>
                                <input type="text" placeholder="e.g. SUMMER50" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} required style={{fontFamily:'monospace', fontWeight:800, textTransform:'uppercase'}}/>
                            </div>
                            <div className="form-group">
                                <label>Discount Type</label>
                                <select value={couponForm.discount_type} onChange={e => setCouponForm({...couponForm, discount_type: e.target.value})}>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Discount Value</label>
                                <input type="number" value={couponForm.discount_value} onChange={e => setCouponForm({...couponForm, discount_value: e.target.value})} placeholder="0"/>
                            </div>
                            <div className="form-group">
                                <label>Min Order Amount (₹)</label>
                                <input type="number" value={couponForm.min_order_amount} onChange={e => setCouponForm({...couponForm, min_order_amount: e.target.value})} placeholder="0"/>
                            </div>
                            <div className="form-group">
                                <label>Expiry Date</label>
                                <input type="date" value={couponForm.expiry} onChange={e => setCouponForm({...couponForm, expiry: e.target.value})}/>
                            </div>
                            <button type="submit" className="form-submit-btn" style={{background:'#7c3aed'}}>
                                <Save size={16}/> Create Coupon
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Loading...</div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
