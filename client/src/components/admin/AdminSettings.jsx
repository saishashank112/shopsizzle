import React, { useState } from 'react';
import { Save, Globe, DollarSign, MapPin, Bell, Shield, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const settingsTabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: ImageIcon },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'shipping', label: 'Shipping', icon: MapPin },
    { id: 'security', label: 'Security', icon: Shield },
];

const AdminSettings = ({ settings, onSave }) => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [form, setForm] = useState({
        siteTitle: settings?.siteTitle || 'ShopSizzle',
        currency: settings?.currency || 'INR',
        address: settings?.address || '',
        contactEmail: settings?.contactEmail || '',
        taxRate: settings?.taxRate || '5',
        shippingFee: settings?.shippingFee || '0',
        freeShippingMin: settings?.freeShippingMin || '500',
        featured_title: settings?.featured_title || 'Featured Curation',
        featured_subtitle: settings?.featured_subtitle || 'Artifacts selected for their unparalleled prestige and rarity.',
        featured_products: settings?.featured_products || '[]',
        hero_image: settings?.hero_image || '',
        cta_image: settings?.cta_image || '',
    });

    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
    const [pwMsg, setPwMsg] = useState('');

    const handleSave = (e) => {
        e.preventDefault();
        onSave(form);
        alert('Settings saved successfully!');
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        try {
            const token = (sessionStorage.getItem('token') || localStorage.getItem('token'));
            await axios.put('http://localhost:5000/api/auth/change-password', pwForm, { headers: { Authorization: `Bearer ${token}` } });
            setPwMsg('Password updated successfully. Please log in again.');
            setTimeout(() => {
                logout();
            }, 1500);
        } catch (err) {
            setPwMsg(err.response?.data?.message || 'Failed to update password');
        }
    };

    return (
        <div>
            {/* PAGE HEADER */}
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-line" />
                    <div>
                        <h2>Platform Settings</h2>
                        <p>Configure global store settings and layout.</p>
                    </div>
                </div>
            </div>

            <div className="settings-layout">
                {/* SIDEBAR NAV */}
                <div className="settings-nav">
                    {settingsTabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* PANEL */}
                <div className="settings-panel">
                    {activeTab === 'general' && (
                        <>
                            <div className="settings-panel-header">
                                <h3>General Settings</h3>
                            </div>
                            <form className="settings-form" onSubmit={handleSave}>
                                <div className="form-group">
                                    <label>Site Title</label>
                                    <input type="text" value={form.siteTitle} onChange={e => setForm({ ...form, siteTitle: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Currency</label>
                                    <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                                <div className="form-group full">
                                    <label>Business Address</label>
                                    <textarea rows="3" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                                </div>
                                <div className="form-group full">
                                    <label>Contact Email</label>
                                    <input type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} />
                                </div>
                                <div className="form-group full" style={{ gridColumn: '1 / span 2' }}>
                                    <button type="submit" className="form-submit-btn">
                                        <Save size={16} /> Save Settings
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                    {activeTab === 'appearance' && (
                        <>
                            <div className="settings-panel-header">
                                <h3>Appearance & Landing Page</h3>
                            </div>
                            <form className="settings-form" onSubmit={handleSave}>
                                <div className="form-group">
                                    <label>Hero Image URL</label>
                                    <input type="text" value={form.hero_image} onChange={e => setForm({ ...form, hero_image: e.target.value })} placeholder="https://..." />
                                </div>
                                <div className="form-group">
                                    <label>CTA Section Image URL</label>
                                    <input type="text" value={form.cta_image} onChange={e => setForm({ ...form, cta_image: e.target.value })} placeholder="https://..." />
                                </div>
                                <div className="form-group full">
                                    <label>Featured Section Title</label>
                                    <input type="text" value={form.featured_title} onChange={e => setForm({ ...form, featured_title: e.target.value })} />
                                </div>
                                <div className="form-group full">
                                    <label>Featured Section Subtitle</label>
                                    <textarea rows="2" value={form.featured_subtitle} onChange={e => setForm({ ...form, featured_subtitle: e.target.value })} />
                                </div>
                                <div className="form-group full">
                                    <label>Featured Products (JSON List of IDs or Objects)</label>
                                    <textarea rows="5" value={form.featured_products} onChange={e => setForm({ ...form, featured_products: e.target.value })} placeholder='[{"id": 1, "name": "...", "img": "..."}]' />
                                    <p style={{fontSize: '0.7rem', color: '#64748b', marginTop: 4}}>Leave empty for default. Must be valid JSON.</p>
                                </div>
                                <div className="form-group full">
                                    <button type="submit" className="form-submit-btn">
                                        <Save size={16} /> Save Appearance
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                    {activeTab === 'payments' && (
                        <>
                            <div className="settings-panel-header">
                                <h3>Payment Settings</h3>
                            </div>
                            <form className="settings-form" onSubmit={handleSave}>
                                <div className="form-group">
                                    <label>Tax Rate (%)</label>
                                    <input type="number" value={form.taxRate} onChange={e => setForm({ ...form, taxRate: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Default Currency</label>
                                    <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                    </select>
                                </div>
                                <div className="form-group full">
                                    <button type="submit" className="form-submit-btn">
                                        <Save size={16} /> Save Settings
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                    {activeTab === 'shipping' && (
                        <>
                            <div className="settings-panel-header">
                                <h3>Shipping Settings</h3>
                            </div>
                            <form className="settings-form" onSubmit={handleSave}>
                                <div className="form-group">
                                    <label>Default Shipping Fee (₹)</label>
                                    <input type="number" value={form.shippingFee} onChange={e => setForm({ ...form, shippingFee: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Free Shipping Minimum (₹)</label>
                                    <input type="number" value={form.freeShippingMin} onChange={e => setForm({ ...form, freeShippingMin: e.target.value })} />
                                </div>
                                <div className="form-group full">
                                    <button type="submit" className="form-submit-btn">
                                        <Save size={16} /> Save Settings
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                    {activeTab === 'security' && (
                        <>
                            <div className="settings-panel-header">
                                <h3>Security Settings</h3>
                            </div>
                            <form className="settings-form" onSubmit={handlePasswordChange}>
                                {pwMsg && (
                                    <div className="form-group full" style={{ gridColumn: '1 / span 2' }}>
                                        <div style={{ padding: '0.875rem', borderRadius: '8px', background: pwMsg.includes('success') ? '#dcfce7' : '#fee2e2', color: pwMsg.includes('success') ? '#15803d' : '#b91c1c', fontSize: '0.85rem', fontWeight: 600 }}>
                                            {pwMsg}
                                        </div>
                                    </div>
                                )}
                                <div className="form-group full" style={{ gridColumn: '1 / span 2' }}>
                                    <label>Current Password</label>
                                    <input type="password" required value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
                                </div>
                                <div className="form-group full" style={{ gridColumn: '1 / span 2' }}>
                                    <label>New Password</label>
                                    <input type="password" required minLength={6} value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} />
                                </div>
                                <div className="form-group full" style={{ gridColumn: '1 / span 2' }}>
                                    <button type="submit" className="form-submit-btn">
                                        <Shield size={16} /> Update Password
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
