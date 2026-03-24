import React, { useEffect, useState } from 'react';
import { Bell, Truck, Gift, ShoppingBag, Info } from 'lucide-react';
import axios from 'axios';
import './Notifications.css';

const Notifications = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const token = (sessionStorage.getItem('token') || localStorage.getItem('token'));
            const res = await axios.get('http://localhost:5000/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
            setAlerts(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className="container notify-root" style={{ paddingTop: '5rem', minHeight: '80vh' }}>
            <div className="welcome-header">
                <h1>Notices & Broadcasts</h1>
                <p>Stay updated with official announcements and alerts.</p>
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading announcements...</div>}

            {!loading && alerts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    <Bell size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
                    <h5>No Notifications Yet</h5>
                    <p>When admin sends a broadcast, it will appear here.</p>
                </div>
            )}

            <div className="alerts-feed flex-column gap-1">
                {alerts.map(a => (
                    <div key={a.id} className="alert-card info" style={{ padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', gap: '12px', marginBottom: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                        <div className="alert-icon-box" style={{ background: '#f1f5f9', color: '#0f172a', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bell size={18} />
                        </div>
                        <div className="alert-body">
                            <h4 className="alert-head" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>{a.title}</h4>
                            <p className="alert-desc" style={{ fontSize: '0.82rem', color: '#475569', marginBottom: 6 }}>{a.message || a.desc}</p>
                            <span className="alert-date" style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{new Date(a.created_at).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Notifications;
