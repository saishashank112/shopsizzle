import React, { useState } from 'react';
import { Printer, Download, ChevronDown, ChevronUp, Package, Truck, Map, CreditCard, ShoppingBag, AlertTriangle } from 'lucide-react';
import InvoiceModal from './InvoiceModal';

const OrdersManagement = ({ orders, updateStatus }) => {
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isInvoiceOpen, setInvoiceOpen] = useState(false);

    const toggleExpand = (id) => {
        const next = new Set(expandedRows);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedRows(next);
    };

    const handlePrint = (order) => { setSelectedOrder(order); setInvoiceOpen(true); };
    const handleDownload = (order) => { alert(`Downloading invoice for #SSA${order.id + 11000}...`); };

    return (
        <div>
            {/* PAGE HEADER */}
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-line" />
                    <div>
                        <h2>Orders Management</h2>
                        <p>Track, manage and fulfill all customer orders globally.</p>
                    </div>
                </div>
            </div>

            {/* MINI STATS */}
            <div className="mini-stats-grid">
                <div className="mini-stat-card">
                    <div className="mini-stat-icon indigo"><Package size={20}/></div>
                    <div>
                        <div className="mini-stat-label">Total Orders</div>
                        <div className="mini-stat-value">{orders.length}</div>
                    </div>
                </div>
                <div className="mini-stat-card">
                    <div className="mini-stat-icon orange"><AlertTriangle size={20}/></div>
                    <div>
                        <div className="mini-stat-label">Pending</div>
                        <div className="mini-stat-value">{orders.filter(o => o.status === 'pending').length}</div>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="table-card">
                <div className="table-card-header">
                    <div>
                        <h4>All Orders</h4>
                        <p>Manage and track all customer orders</p>
                    </div>
                </div>
                <table className="ss-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>GPS</th>
                            <th style={{textAlign:'right'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 && (
                            <tr><td colSpan="8">
                                <div className="empty-state">
                                    <div className="empty-state-icon"><Package size={40}/></div>
                                    <h3>No Orders Yet</h3>
                                    <p>Orders from customers will appear here.</p>
                                </div>
                            </td></tr>
                        )}
                        {orders.map(o => (
                            <React.Fragment key={o.id}>
                                <tr>
                                    <td>
                                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                            <button
                                                className={`chevron-btn ${expandedRows.has(o.id) ? 'open' : ''}`}
                                                onClick={() => toggleExpand(o.id)}
                                                title="View Details"
                                            >
                                                {expandedRows.has(o.id) ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
                                            </button>
                                            <span className="order-id">#SSA{o.id + 11000}</span>
                                        </div>
                                    </td>
                                    <td style={{color:'#64748b', fontSize:'0.82rem'}}>{new Date(o.created_at).toLocaleDateString()}</td>
                                    <td style={{fontWeight:600}}>{o.customer_name || 'Customer'}</td>
                                    <td style={{fontWeight:800, color:'#0f172a'}}>₹{Number(o.total_amount).toLocaleString('en-IN')}</td>
                                    <td>
                                        <select
                                            className={`status-select status-${o.status}`}
                                            value={o.status}
                                            onChange={e => updateStatus(o.id, e.target.value)}
                                        >
                                            <option value="pending">PENDING PAYMENT</option>
                                            <option value="confirmed">CONFIRMED</option>
                                            <option value="processing">PROCESSING</option>
                                            <option value="shipped">SHIPPED</option>
                                            <option value="out_for_delivery">OUT FOR DELIVERY</option>
                                            <option value="delivered">DELIVERED</option>
                                            <option value="completed">COMPLETED</option>
                                            <option value="cancelled">CANCELLED</option>
                                        </select>
                                    </td>
                                    <td style={{fontSize:'0.8rem', fontWeight:600, color:'#64748b', textTransform:'uppercase'}}>{o.payment_method || 'N/A'}</td>
                                    <td>
                                        {o.latitude && o.longitude ? (
                                            <div style={{display:'flex', alignItems:'center', gap:'4px', color:'#0ea5e9', fontWeight:600, fontSize:'0.75rem'}}>
                                                <Map size={14}/> {Number(o.latitude).toFixed(4)}, {Number(o.longitude).toFixed(4)}
                                            </div>
                                        ) : (
                                            <span style={{color:'#cbd5e1', fontSize:'0.75rem', fontWeight:600}}>No GPS</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{display:'flex', gap:'6px', justifyContent:'flex-end'}}>
                                            <button className="action-icon-btn print" onClick={() => handlePrint(o)} title="Print Invoice"><Printer size={15}/></button>
                                            <button className="action-icon-btn download" onClick={() => handleDownload(o)} title="Download Invoice"><Download size={15}/></button>
                                            <button className={`action-icon-btn details ${expandedRows.has(o.id) ? 'active' : ''}`} onClick={() => toggleExpand(o.id)} title="Order Details"><ShoppingBag size={15}/></button>
                                        </div>
                                    </td>
                                </tr>

                                {/* EXPANDED ROW */}
                                {expandedRows.has(o.id) && (
                                    <tr>
                                        <td colSpan="8" style={{padding:0}}>
                                            <div className="expanded-row-content">
                                                <div className="expanded-inner">
                                                    {/* Items */}
                                                    <div className="expanded-card">
                                                        <div className="expanded-card-title">
                                                            <Package size={16} color="#4f46e5"/> Order Items
                                                        </div>
                                                        <table className="order-items-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Product</th>
                                                                    <th style={{textAlign:'center'}}>Qty</th>
                                                                    <th style={{textAlign:'right'}}>Price</th>
                                                                    <th style={{textAlign:'right'}}>Subtotal</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {(o.items || []).length === 0 && (
                                                                    <tr><td colSpan="4" style={{textAlign:'center', color:'#94a3b8', fontStyle:'italic', padding:'1rem 0'}}>No item details.</td></tr>
                                                                )}
                                                                {(o.items || []).map((item, i) => (
                                                                    <tr key={i}>
                                                                        <td style={{fontWeight:600}}>{item.name} <span className="uid-chip">#{item.product_id}</span></td>
                                                                        <td style={{textAlign:'center', fontWeight:700}}>{item.quantity}</td>
                                                                        <td style={{textAlign:'right'}}>₹{Number(item.price).toLocaleString()}</td>
                                                                        <td style={{textAlign:'right', fontWeight:800}}>₹{(item.price * item.quantity).toLocaleString()}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>

                                                    {/* Shipping + Summary */}
                                                    <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                                                        <div className="expanded-card">
                                                            <div className="expanded-card-title">
                                                                <Truck size={16} color="#ea580c"/> Shipping & Payment
                                                            </div>
                                                            <div className="address-row">
                                                                <Map size={15} className="address-icon"/>
                                                                <div>
                                                                    <div className="address-label">Delivery Address</div>
                                                                    <div className="address-value">{o.shipping_address || 'Not provided'}</div>
                                                                </div>
                                                            </div>
                                                            <div className="address-row">
                                                                <CreditCard size={15} className="address-icon"/>
                                                                <div>
                                                                    <div className="address-label">Payment Method</div>
                                                                    <div className="address-value" style={{color:'#16a34a', fontWeight:700}}>{(o.payment_method || 'N/A').toUpperCase()} — Paid</div>
                                                                </div>
                                                            </div>
                                                            {o.latitude && o.longitude && (
                                                                <div className="address-row" style={{ marginTop: '1rem' }}>
                                                                    <Map size={15} className="address-icon"/>
                                                                    <div style={{ width: '100%' }}>
                                                                        <div className="address-label">Exact GPS Location</div>
                                                                        <div className="address-value" style={{marginBottom: '0.5rem'}}>
                                                                            {o.latitude}, {o.longitude}
                                                                        </div>
                                                                        <iframe 
                                                                            title="Order Location"
                                                                            width="100%" 
                                                                            height="150" 
                                                                            frameBorder="0" 
                                                                            scrolling="no" 
                                                                            marginHeight="0" 
                                                                            marginWidth="0" 
                                                                            src={`https://maps.google.com/maps?q=${o.latitude},${o.longitude}&z=15&output=embed`}
                                                                            style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                                                        ></iframe>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="summary-box">
                                                            <div className="summary-box-row" style={{opacity:0.7}}>
                                                                <span>Subtotal</span>
                                                                <span>₹{(Number(o.total_amount) * 0.95).toFixed(0)}</span>
                                                            </div>
                                                            <div className="summary-box-row" style={{opacity:0.7}}>
                                                                <span>Shipping</span>
                                                                <span>₹{o.shipping_amount || 300}</span>
                                                            </div>
                                                            <div className="summary-box-row total">
                                                                <span className="summary-total-label">Grand Total</span>
                                                                <span className="summary-total-value">₹{Number(o.total_amount).toLocaleString('en-IN')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <InvoiceModal isOpen={isInvoiceOpen} onClose={() => setInvoiceOpen(false)} order={selectedOrder}/>
        </div>
    );
};

export default OrdersManagement;
