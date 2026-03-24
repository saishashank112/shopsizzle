import React from 'react';
import { MessageSquare, CheckCircle, Trash2, Star } from 'lucide-react';

const ReviewModeration = ({ reviews, onAction }) => {
    const renderStars = (rating) => (
        <span style={{color:'#f59e0b', fontSize:'0.85rem', letterSpacing:1}}>
            {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
        </span>
    );

    return (
        <div>

            {/* PAGE HEADER */}
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-line" />
                    <div>
                        <h2>Product Reviews</h2>
                        <p>Moderate customer feedback and ratings.</p>
                    </div>
                </div>
            </div>

            <div className="table-card">
                <div className="table-card-header">
                    <div>
                        <h4>Review Moderation</h4>
                        <p>Approve or remove pending customer reviews</p>
                    </div>
                </div>
                <table className="ss-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Customer</th>
                            <th>Rating</th>
                            <th>Review</th>
                            <th>Status</th>
                            <th style={{textAlign:'right'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.length === 0 && (
                            <tr><td colSpan="6">
                                <div className="empty-state">
                                    <div className="empty-state-icon"><MessageSquare size={40}/></div>
                                    <h3>No Pending Reviews</h3>
                                    <p>All reviews are moderated.</p>
                                </div>
                            </td></tr>
                        )}
                        {reviews.map(r => (
                            <tr key={r.id}>
                                <td style={{fontWeight:600, fontSize:'0.875rem', maxWidth:140}}>
                                    <span style={{display:'block', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                        {r.product_name || `Product #${r.product_id}`}
                                    </span>
                                </td>
                                <td style={{fontWeight:600}}>{r.user_name || 'Anonymous'}</td>
                                <td>{renderStars(r.rating)}</td>
                                <td style={{fontSize:'0.82rem', color:'#475569', maxWidth:200}}>
                                    <span style={{display:'block', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                        {r.comment || '—'}
                                    </span>
                                </td>
                                <td>
                                    <span className="status-pill" style={
                                        r.status === 'approved' ? {background:'#dcfce7', color:'#15803d'}
                                        : {background:'#fef3c7', color:'#92400e'}
                                    }>
                                        {r.status || 'Pending'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{display:'flex', gap:'6px', justifyContent:'flex-end'}}>
                                        {r.status !== 'approved' && (
                                            <button className="action-icon-btn" style={{color:'#16a34a', borderColor:'#86efac', background:'#f0fdf4'}} onClick={() => onAction(r.id, 'approve')} title="Approve">
                                                <CheckCircle size={15}/>
                                            </button>
                                        )}
                                        <button className="action-icon-btn danger" onClick={() => onAction(r.id, 'reject')} title="Remove">
                                            <Trash2 size={15}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReviewModeration;
