import React, { useState } from 'react';
import { RotateCcw, CheckCircle, XCircle, Eye, Save, X } from 'lucide-react';
import axios from 'axios';

const ReturnsManagement = ({ returns = [], onAction }) => {
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [actionNotes, setActionNotes] = useState('');
    const [actionStatus, setActionStatus] = useState('approved'); // 'approved' | 'rejected' | 'refunded'
    
    // Modal state for Picture preview
    const [previewImg, setPreviewImg] = useState(null);

    const handleActionSubmit = async (e) => {
        e.preventDefault();
        if (!selectedReturn) return;
        try {
            const token = (sessionStorage.getItem('token') || localStorage.getItem('token'));
            await axios.patch(`http://localhost:5000/api/returns/${selectedReturn.id}`, {
                status: actionStatus,
                admin_notes: actionNotes
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setSelectedReturn(null);
            setActionNotes('');
            if (onAction) onAction(); // Trigger boot reload inside AdminDashboard!
        } catch (err) {
            alert('Failed to update return status');
        }
    };

    return (
        <div>

            {/* PAGE HEADER */}
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-line" />
                    <div>
                        <h2>Returns & Refunds</h2>
                        <p>Process customer returns flexibly.</p>
                    </div>
                </div>
            </div>

            <div className="table-card">
                <div className="table-card-header">
                    <div>
                        <h4>Returns & Refunds</h4>
                        <p>Handle customer return requests, view item images, and send instructions</p>
                    </div>
                </div>
                <table className="ss-table">
                    <thead>
                        <tr>
                            <th>Return ID</th>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Reason</th>
                            <th>Picture</th>
                            <th>Refund Amount</th>
                            <th>Status & Notes</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {returns.length === 0 && (
                            <tr><td colSpan="8">
                                <div className="empty-state">
                                    <div className="empty-state-icon"><RotateCcw size={40}/></div>
                                    <h3>No Returns Yet</h3>
                                    <p>Return requests will appear here.</p>
                                </div>
                            </td></tr>
                        )}
                        {returns.map(r => (
                            <tr key={r.id}>
                                <td><span className="order-id">RTN-{r.id}</span></td>
                                <td><span className="order-id">#SSA{r.order_id + 11000}</span></td>
                                <td style={{fontWeight:600}}>{r.user_name || 'Customer'}</td>
                                <td style={{fontSize:'0.82rem', color:'#475569', maxWidth:160}}>
                                    <span style={{display:'block', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                        {r.reason || '—'}
                                    </span>
                                </td>
                                <td>
                                    {r.product_pic ? (
                                        <div onClick={() => setPreviewImg(r.product_pic)} style={{ width: 40, height: 40, overflow: 'hidden', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'zoom-in' }}>
                                            <img src={r.product_pic} alt="return trigger item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ) : <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No Photo</span>}
                                </td>
                                <td style={{fontWeight:800, color:'#0f172a'}}>₹{Number(r.refund_amount || 0).toLocaleString('en-IN')}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <span className="status-pill" style={
                                            r.status === 'approved' ? {background:'#dcfce7', color:'#15803d'}
                                            : r.status === 'rejected' ? {background:'#fee2e2', color:'#b91c1c'}
                                            : r.status === 'refunded' ? {background:'#dbeafe', color:'#1e40af'}
                                            : {background:'#fef3c7', color:'#92400e'}
                                        }>
                                            {r.status || 'Pending'}
                                        </span>
                                        {r.admin_notes && <span style={{ fontSize: '0.65rem', color: '#64748b', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Note: {r.admin_notes}</span>}
                                    </div>
                                </td>
                                <td>
                                    {r.status === 'requested' || r.status === 'Pending' ? (
                                        <button className="attach-btn" onClick={() => { setSelectedReturn(r); setActionStatus('approved'); }} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>
                                            Review
                                        </button>
                                    ) : <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Processed</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ACTION REVIEW MODAL */}
            {selectedReturn && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(2px)' }}>
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 12, width: 450, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Review Return Request RTN-{selectedReturn.id}</h4>
                            <button onClick={() => setSelectedReturn(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                        <form onSubmit={handleActionSubmit}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                                {selectedReturn.product_pic && (
                                    <div style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                        <img src={selectedReturn.product_pic} alt="Review pic" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                                <div>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Reason:</span>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginTop: 2 }}>{selectedReturn.reason || 'No reason provided'}</p>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Refund Amount:</span>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>₹{Number(selectedReturn.refund_amount || 0).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                            
                            <div style={{ marginBottom: '0.75rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Set Status</label>
                                <select value={actionStatus} onChange={e => setActionStatus(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: 6 }}>
                                    <option value="approved">Approve & Send Instructions</option>
                                    <option value="rejected">Reject Return</option>
                                    <option value="refunded">Mark as Refunded</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Instructions for customer (Return Location, Policy)</label>
                                <textarea rows="3" value={actionNotes} onChange={e => setActionNotes(e.target.value)} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: 6 }} placeholder="e.g. Return item to store layout, Or drop near local point" />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" style={{ flex: 1, background: '#0f172a', color: '#fff', border: 'none', padding: '0.65rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <Save size={14} /> Update Return
                                </button>
                                <button type="button" onClick={() => setSelectedReturn(null)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.65rem', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PREVIEW IMAGE LIGHTBOX */}
            {previewImg && (
                <div onClick={() => setPreviewImg(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, cursor: 'zoom-out' }}>
                    <div style={{ maxWidth: '90%', maxHeight: '90%' }}>
                        <img src={previewImg} alt="Preview element item" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReturnsManagement;
