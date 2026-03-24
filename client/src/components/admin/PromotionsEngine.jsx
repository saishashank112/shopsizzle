import React from 'react';
import { Ticket, Plus, Trash2 } from 'lucide-react';

const PromotionsEngine = ({ coupons, onAdd, onDelete }) => {
    return (
        <div>

            {/* PAGE HEADER */}
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-line" />
                    <div>
                        <h2>Coupons & Deals</h2>
                        <p>Create and manage promotional campaigns.</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <button className="btn-primary purple" onClick={onAdd}>
                    <Plus size={16} /> Create Coupon
                </button>
            </div>

            <div className="table-card">

                <table className="ss-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Type</th>
                            <th>Value</th>
                            <th>Min Order</th>
                            <th>Usage</th>
                            <th>Expires</th>
                            <th>Status</th>
                            <th style={{textAlign:'right'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.length === 0 && (
                            <tr><td colSpan="8">
                                <div className="empty-state">
                                    <div className="empty-state-icon"><Ticket size={40} /></div>
                                    <h3>No Coupons Yet</h3>
                                    <p>Create a discount code to get started.</p>
                                </div>
                            </td></tr>
                        )}
                        {coupons.map(c => {
                            const usagePct = c.usage_limit > 0 ? Math.min((c.used_count / c.usage_limit) * 100, 100) : 0;
                            const isExpired = c.expiry_date && new Date(c.expiry_date) < new Date();
                            return (
                                <tr key={c.id}>
                                    <td><span className="coupon-code">{c.code}</span></td>
                                    <td style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'capitalize' }}>{c.discount_type}</td>
                                    <td style={{ fontWeight: 800, color: '#4f46e5' }}>
                                        {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                                    </td>
                                    <td style={{ fontSize: '0.82rem' }}>₹{c.min_order_amount || 0}</td>
                                    <td style={{ minWidth: 120 }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                                            {c.used_count || 0} / {c.usage_limit > 0 ? c.usage_limit : '∞'}
                                        </div>
                                        {c.usage_limit > 0 && (
                                            <div className="usage-bar-wrap">
                                                <div className="usage-bar-fill" style={{ width: `${usagePct}%` }}></div>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                                        {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : 'No expiry'}
                                    </td>
                                    <td>
                                        <span className="status-pill" style={
                                            !c.is_active || isExpired
                                                ? { background: '#fee2e2', color: '#b91c1c' }
                                                : { background: '#dcfce7', color: '#15803d' }
                                        }>
                                            {!c.is_active ? 'Inactive' : isExpired ? 'Expired' : 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="icon-action danger" 
                                            title="Delete Coupon"
                                            onClick={() => {
                                                if (window.confirm('Delete this coupon?')) {
                                                    onDelete(c.id);
                                                }
                                            }}
                                        >
                                            <Trash2 size={14}/>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PromotionsEngine;
