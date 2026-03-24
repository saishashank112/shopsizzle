import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Package, LogOut, ChevronRight, Settings, History, LayoutDashboard, Key, Bell } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Return Request State
    const [selectedReturnOrder, setSelectedReturnOrder] = useState(null);
    const [returnForm, setReturnForm] = useState({ reason: '', refund_method: 'store_credit', product_pic: '' });

    // Notifications State
    const [alerts, setAlerts] = useState([]);

    // Password state
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
    const [pwStatus, setPwStatus] = useState({ message: '', type: '' });

    const fetchOrders = async () => {
        try {
            const token = (sessionStorage.getItem('token') || localStorage.getItem('token'));
            const res = await axios.get('http://localhost:5000/api/orders', { headers: { Authorization: `Bearer ${token}` }});
            setOrders(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = (sessionStorage.getItem('token') || localStorage.getItem('token'));
            const res = await axios.get('http://localhost:5000/api/notifications', { headers: { Authorization: `Bearer ${token}` }});
            setAlerts(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if(user) { fetchOrders(); fetchNotifications(); }
    }, [user]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            const token = (sessionStorage.getItem('token') || localStorage.getItem('token'));
            await axios.put('http://localhost:5000/api/auth/change-password', passwordForm, { headers: { Authorization: `Bearer ${token}` } });
            setPwStatus({ message: 'Password updated securely.', type: 'success' });
            setPasswordForm({ currentPassword: '', newPassword: '' });
        } catch(err) {
            setPwStatus({ message: err.response?.data?.message || 'Failed to update password', type: 'error' });
        }
    };

    const handleReturnSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = (sessionStorage.getItem('token') || localStorage.getItem('token'));
            await axios.post('http://localhost:5000/api/returns/request', {
                order_id: selectedReturnOrder.id,
                reason: returnForm.reason,
                refund_method: returnForm.refund_method,
                product_pic: returnForm.product_pic
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            alert('Return request submitted successfully');
            setSelectedReturnOrder(null);
            setReturnForm({ reason: '', refund_method: 'store_credit', product_pic: '' });
            fetchOrders(); // Reload orders in UI!
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit return request');
        }
    };

    if (!user) return <Navigate to="/login" />;

    return (
        <div className="dense-dash">
            <div className="container dash-grid">
                
                {/* Left Profile Pane */}
                <aside className="dash-col">
                    <div className="glass-pane profile-card">
                        <div className="avatar-ring">
                            <img src={`https://ui-avatars.com/api/?name=${user.name}&background=1a1a1a&color=fff`} alt="User" />
                        </div>
                        <h2 className="profile-name">{user.name}</h2>
                        <div className="profile-email">{user.email}</div>
                        
                        <div className="dash-nav-menu" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                            <button onClick={() => setActiveTab('overview')} className={`dash-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}>
                                <LayoutDashboard size={14}/> Dashboard Overview
                            </button>
                            <button onClick={() => setActiveTab('history')} className={`dash-tab-btn ${activeTab === 'history' ? 'active' : ''}`}>
                                <History size={14}/> Transaction History
                            </button>
                            <button onClick={() => setActiveTab('notifications')} className={`dash-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}>
                                <Bell size={14}/> Notices & Broadcasts
                            </button>
                            <button onClick={() => setActiveTab('settings')} className={`dash-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}>
                                <Settings size={14}/> Account Details
                            </button>
                        </div>
                        
                        <button onClick={logout} className="btn-secondary" style={{width: '100%', fontSize: '0.65rem'}}>
                            <LogOut size={12}/> Sign Out from Ledger
                        </button>

                        <div className="ai-profile">
                            <h4><Sparkles size={12}/> AI Style Insight</h4>
                            <p>Your acquisition ledger indicates a strong affinity for understated elegance. You favor monochrome palettes and intricate artisan detailing.</p>
                            <div className="tag-cloud">
                                <span className="p-tag">Minimalist</span>
                                <span className="p-tag">Heritage</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Right Content Pane */}
                <main className="dash-col">
                    
                    {activeTab === 'overview' && (
                        <>
                            <div className="glass-pane mb-4">
                                <div className="pane-title" style={{display:'flex', justifyContent:'space-between'}}>
                                    <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><Package size={16}/> Recent Acquisitions </div>
                                </div>
                                
                                {orders.length === 0 ? (
                                    <div style={{padding: '2rem 0', color: 'var(--on-surface-variant)', fontSize: '0.8rem'}}>No artifacts acquired yet.</div>
                                ) : (
                                    <div className="dense-order-list">
                                        {orders.slice(0, 3).map(o => (
                                            <div key={o.id} className="order-row">
                                                <div>
                                                    <div className="o-id">TX-{o.id.toString().padStart(6, '0')}</div>
                                                    <div className="o-date">{new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</div>
                                                </div>
                                                <div>₹{Number(o.total_amount).toLocaleString('en-IN')}</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                                 <div className={`o-status ${o.status === 'delivered' ? 'del' : 'pen'}`}>{o.status.replace(/_/g, ' ').toUpperCase()}</div>
                                                 {o.status === 'delivered' && (
                                                     <button onClick={() => setSelectedReturnOrder(o)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.6rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}>
                                                         Request Return
                                                     </button>
                                                 )}
                                             </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="glass-pane">
                                <div className="pane-title" style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><Sparkles size={16}/> Next Best Picks</div>
                                <p style={{fontSize: '0.75rem', color: 'var(--on-surface-variant)'}}>Curated matching accessories to complete your existing portfolio.</p>
                                
                                <div className="picks-grid">
                                    <div className="pick-card">
                                        <div className="pc-img"><img src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=200&auto=format&fit=crop" alt="Watch"/></div>
                                        <div className="pc-info"><h5>The Chronos Cuff</h5><p>₹4,500</p></div>
                                        <ChevronRight size={14} style={{marginLeft: 'auto', color: '#ccc'}}/>
                                    </div>
                                    <div className="pick-card">
                                        <div className="pc-img"><img src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=200&auto=format&fit=crop" alt="Bag"/></div>
                                        <div className="pc-info"><h5>Pebble Key Fob</h5><p>₹1,200</p></div>
                                        <ChevronRight size={14} style={{marginLeft: 'auto', color: '#ccc'}}/>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'history' && (
                        <div className="glass-pane">
                            <div className="pane-title" style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><History size={16}/> Complete Transaction History</div>
                            {orders.length === 0 ? (
                                <div style={{padding: '2rem 0', color: 'var(--on-surface-variant)', fontSize: '0.8rem'}}>No artifacts acquired yet.</div>
                            ) : (
                                <div className="dense-order-list">
                                    {orders.map(o => (
                                        <div key={o.id} className="order-row">
                                            <div>
                                                <div className="o-id">TX-{o.id.toString().padStart(6, '0')}</div>
                                                <div className="o-date">{new Date(o.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</div>
                                                <div style={{fontSize: '0.65rem', marginTop: '4px', color: '#666'}}>{o.items?.length || 0} Items</div>
                                            </div>
                                            <div style={{textAlign: 'right'}}>
                                                <div style={{fontWeight: 700}}>₹{Number(o.total_amount).toLocaleString('en-IN')}</div>
                                                <div style={{fontSize: '0.65rem', color: '#666', marginTop: '2px'}}>{o.payment_method?.toUpperCase()}</div>
                                            </div>
                                            <div className={`o-status ${o.status === 'delivered' ? 'del' : 'pen'}`}>{o.status.replace(/_/g, ' ').toUpperCase()}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="glass-pane">
                            <div className="pane-title" style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><History size={16}/> Notices & Broadcasts</div>
                            {alerts.length === 0 ? (
                                <div style={{padding: '2rem 0', color: 'var(--on-surface-variant)', fontSize: '0.8rem'}}>No broadcasts received yet.</div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {alerts.map(a => (
                                        <div key={a.id} style={{ padding: '0.85rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                                            <h5 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>{a.title}</h5>
                                            <p style={{ fontSize: '0.75rem', color: '#475569', marginBottom: 4 }}>{a.message}</p>
                                            <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{new Date(a.created_at).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="glass-pane">
                            <div className="pane-title" style={{display:'flex', alignItems:'center', gap:'0.5rem'}}><Key size={16}/> Security & Identity</div>
                            
                            <div style={{marginBottom: '2rem'}}>
                                <p style={{fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '1rem'}}>
                                    Update your encryption key for the ledger securely.
                                </p>

                                {pwStatus.message && (
                                    <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700,
                                        background: pwStatus.type === 'success' ? '#dcfce7' : '#fee2e2',
                                        color: pwStatus.type === 'success' ? '#16a34a' : '#ef4444' }}>
                                        {pwStatus.message}
                                    </div>
                                )}

                                <form onSubmit={handlePasswordChange} style={{display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px'}}>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                        <label style={{fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#334155'}}>Current Password</label>
                                        <input type="password" required
                                            value={passwordForm.currentPassword} 
                                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                            style={{padding: '0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', outline: 'none'}} />
                                    </div>
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                        <label style={{fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#334155'}}>New Password</label>
                                        <input type="password" required minLength={6}
                                            value={passwordForm.newPassword} 
                                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                            style={{padding: '0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', outline: 'none'}} />
                                    </div>
                                    <button type="submit" className="btn-primary" style={{marginTop: '0.5rem', alignSelf: 'flex-start'}}>
                                        Update Password
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </main>

            </div>
            {selectedReturnOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(2px)' }}>
                    <div className="glass-pane" style={{ width: 400, padding: '1.5rem', background: '#fff', border: '1px solid #e2e8f0', color: '#0f172a' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Request Return for TX-{selectedReturnOrder.id.toString().padStart(6, '0')}</h4>
                            <button onClick={() => setSelectedReturnOrder(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>X</button>
                        </div>
                        <form onSubmit={handleReturnSubmit}>
                            <div style={{ marginBottom: '0.75rem' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Reason for Return</label>
                                <textarea rows="2" value={returnForm.reason} onChange={e => setReturnForm({ ...returnForm, reason: e.target.value })} required style={{ width: '100%', padding: '0.5rem', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: '0.8rem' }} placeholder="e.g. Size didn't fit, Item damaged" />
                            </div>

                            <div style={{ marginBottom: '0.75rem' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Refund Method</label>
                                <select value={returnForm.refund_method} onChange={e => setReturnForm({ ...returnForm, refund_method: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: '0.8rem' }}>
                                    <option value="store_credit">Store Credit</option>
                                    <option value="bank_transfer">Original Payment Method</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Product Image URL (Proof)</label>
                                <input type="text" value={returnForm.product_pic} onChange={e => setReturnForm({ ...returnForm, product_pic: e.target.value })} required style={{ width: '100%', padding: '0.5rem', border: '1.5px solid #e2e8f0', borderRadius: 6, fontSize: '0.8rem' }} placeholder="https://image-url-proof..." />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" style={{ flex: 1, background: '#0f172a', color: '#fff', border: 'none', padding: '0.65rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Submit Request</button>
                                <button type="button" onClick={() => setSelectedReturnOrder(null)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.65rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
