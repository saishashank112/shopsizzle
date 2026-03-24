import React from 'react';
import { Printer, Download, X } from 'lucide-react';

const InvoiceModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    const subtotal = (order.items || []).reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = Number(order.shipping_amount || 0);
    const tax = subtotal * 0.05;
    // grandTotal = subtotal + shipping (used in display)

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        alert(`PDF download for #SSA${order.id + 11000} — integrate jsPDF for real PDFs.`);
    };

    return (
        <div className="modal-overlay">
            <div className="invoice-modal-wrap">
                {/* ACTION BAR */}
                <div className="invoice-actions-bar">
                    <button className="invoice-btn print" onClick={handlePrint}>
                        <Printer size={15}/> Print
                    </button>
                    <button className="invoice-btn download" onClick={handleDownload}>
                        <Download size={15}/> Download PDF
                    </button>
                    <button className="invoice-btn close" onClick={onClose}>
                        <X size={15}/> Close
                    </button>
                </div>

                {/* INVOICE DOCUMENT */}
                <div className="invoice-document" id="print-area">
                    {/* Header */}
                    <div className="invoice-doc-header">
                        <div className="invoice-brand">
                            <h1>ShopSizzle</h1>
                            <p>Tax Invoice</p>
                        </div>
                        <div className="invoice-meta">
                            <div className="invoice-meta-item">
                                <label>Invoice No.</label>
                                <span>#SSA{order.id + 11000}</span>
                            </div>
                            <div className="invoice-meta-item">
                                <label>Date</label>
                                <span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div className="invoice-meta-item">
                                <label>Status</label>
                                <span style={{textTransform:'uppercase', color:'#16a34a'}}>{order.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="invoice-addresses">
                        <div>
                            <div className="invoice-address-label">Bill From</div>
                            <div className="invoice-address-name">ShopSizzle</div>
                            <div className="invoice-address-sub">support@shopsizzle.com<br/>India</div>
                        </div>
                        <div>
                            <div className="invoice-address-label">Bill To</div>
                            <div className="invoice-address-name">{order.customer_name || 'Customer'}</div>
                            <div className="invoice-address-sub">
                                {order.customer_email || ''}<br/>
                                {order.shipping_address || 'Address not provided'}
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="invoice-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product</th>
                                <th style={{textAlign:'center'}}>Qty</th>
                                <th style={{textAlign:'right'}}>Unit Price</th>
                                <th style={{textAlign:'right'}}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(order.items || []).map((item, i) => (
                                <tr key={i}>
                                    <td style={{color:'#94a3b8'}}>{i + 1}</td>
                                    <td style={{fontWeight:600}}>{item.name}</td>
                                    <td style={{textAlign:'center'}}>{item.quantity}</td>
                                    <td style={{textAlign:'right'}}>₹{Number(item.price).toLocaleString('en-IN')}</td>
                                    <td style={{textAlign:'right', fontWeight:700}}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                            {(order.items || []).length === 0 && (
                                <tr><td colSpan="5" style={{textAlign:'center', color:'#94a3b8', fontStyle:'italic', padding:'1.5rem 0'}}>No items found.</td></tr>
                            )}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="invoice-totals">
                        <div className="invoice-total-row">
                            <span style={{color:'#64748b'}}>Subtotal</span>
                            <span>₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="invoice-total-row">
                            <span style={{color:'#64748b'}}>Shipping</span>
                            <span>₹{shipping.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="invoice-total-row">
                            <span style={{color:'#64748b'}}>Tax (5%)</span>
                            <span>₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="invoice-total-row invoice-total-grand">
                            <span>Grand Total</span>
                            <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="invoice-footer">
                        <p>Thank you for shopping with us!</p>
                        <strong>ShopSizzle — Quality You Can Trust</strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;
