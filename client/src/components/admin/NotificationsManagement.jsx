import React, { useState } from 'react';
import { Bell, Send, CheckCircle } from 'lucide-react';
import axios from 'axios';

const NotificationsManagement = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!title || !message) return;
        setLoading(true);
        setSuccess(false);

        try {
            const token = (sessionStorage.getItem('token') || localStorage.getItem('token'));
            await axios.post('http://localhost:5000/api/notifications/broadcast', {
                title, message
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setTitle('');
            setMessage('');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            alert('Failed to send notification broadcast');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', padding: '1.5rem', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>

            {/* PAGE HEADER */}
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-line" />
                    <div>
                        <h2>Notifications</h2>
                        <p>Manage automated alerts and broadcasts.</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                <Bell size={24} style={{ color: '#0f172a' }} />
                <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Send BroadCast Notification</h4>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>This will be pushed to ALL registered user dashboards instantly or when they log in</p>
                </div>
            </div>

            {success && (
                <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: 8, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1rem' }}>
                    <CheckCircle size={16} /> Notification Broadcasted Successfully!
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#445164', display: 'block', marginBottom: 4 }}>Notification Title</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} placeholder="e.g. 🚨 Weekend Flash Sale is Live!" />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#445164', display: 'block', marginBottom: 4 }}>Message / Content</label>
                    <textarea rows="4" value={message} onChange={e => setMessage(e.target.value)} required style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} placeholder="e.g. Enjoy FLAT 20% off across all items starting now. Use code WEEKEND20" />
                </div>

                <button type="submit" disabled={loading} style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: 8, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Send size={16} /> {loading ? 'Sending Broadcast...' : 'Broadcast to All Members'}
                </button>
            </form>
        </div>
    );
};

export default NotificationsManagement;
