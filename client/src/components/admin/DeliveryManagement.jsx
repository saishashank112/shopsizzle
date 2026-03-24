import React, { useState } from 'react';
import { X, Printer, MapPin } from 'lucide-react';
import InvoiceModal from './InvoiceModal';

const DeliveryManagement = ({ orders, updateStatus }) => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isInvoiceOpen, setInvoiceOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    const [mapOrder, setMapOrder] = useState(null);
    const [isMapOpen, setMapOpen] = useState(false);

    const filtered = statusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    return (
        <div>
            {/* PAGE HEADER */}
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-line" />
                    <div>
                        <h2>Delivery Operations</h2>
                        <p>Track delivery logs and update tracking triggers correctly.</p>
                    </div>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="filter-bar">
                <div className="filter-select-wrap">
                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">PENDING PAYMENT</option>
                        <option value="confirmed">CONFIRMED</option>
                        <option value="processing">PROCESSING</option>
                        <option value="shipped">SHIPPED</option>
                        <option value="out_for_delivery">OUT FOR DELIVERY</option>
                        <option value="delivered">DELIVERED</option>
                        <option value="completed">COMPLETED</option>
                        <option value="cancelled">CANCELLED</option>
                    </select>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                    {filtered.length} deliveries shown
                </span>
            </div>

            {/* TABLE */}
            <div className="table-card">

                <table className="ss-table">
                    <thead>
                        <tr>
                            <th>Delivery ID</th>
                            <th>Order Ref</th>
                            <th>Customer</th>
                            <th>Status</th>
                            <th>Shipping</th>
                            <th>Address</th>
                            <th>Map</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No deliveries found.</td></tr>
                        )}
                        {filtered.map(o => (
                            <tr key={'del-' + o.id}>
                                <td>
                                    <span className="delivery-id">DEL-{String(o.id + 11000).substring(1)}</span>
                                </td>
                                <td>
                                    <span className="order-id">#SSA{o.id + 11000}</span>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.customer_name || 'Customer'}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{o.customer_email || ''}</div>
                                </td>
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
                                <td style={{ fontWeight: 700 }}>₹{o.shipping_amount || 300}</td>
                                <td style={{ fontSize: '0.8rem', color: '#475569', maxWidth: '180px' }}>
                                    <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={o.shipping_address}>
                                        {o.shipping_address || 'N/A'}
                                    </span>
                                </td>
                                <td>
                                    {o.latitude && o.longitude ? (
                                        <button
                                            onClick={() => { setMapOrder(o); setMapOpen(true); }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: 'none', color: '#4f46e5', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                                            <MapPin size={14} /> View Map
                                        </button>
                                    ) : (
                                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>No GPS</span>
                                    )}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                        <button
                                            className="action-icon-btn print"
                                            onClick={() => { setSelectedOrder(o); setInvoiceOpen(true); }}
                                            title="View Invoice"
                                        ><Printer size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <InvoiceModal isOpen={isInvoiceOpen} onClose={() => setInvoiceOpen(false)} order={selectedOrder} />

            {/* MAP MODAL */}
            {isMapOpen && mapOrder && (
                <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div className="modal-content" style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', width: '90%', maxWidth: '600px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <button onClick={() => setMapOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                        <h3 style={{ marginBottom: '0.5rem', fontWeight: 800 }}>Live Order Location</h3>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1.5rem' }}>#SSA{mapOrder.id + 11000} — User's Precise Delivery Coordinates</p>

                        <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <iframe
                                title="Map View"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                src={`https://maps.google.com/maps?q=${mapOrder.latitude},${mapOrder.longitude}&z=15&output=embed`}
                            ></iframe>
                        </div>

                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                            <a
                                href={`https://www.google.com/maps?q=${mapOrder.latitude},${mapOrder.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ padding: '0.75rem 1rem', background: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', textAlign: 'center', flex: 1 }}
                            >
                                Open in Google Maps
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryManagement;
