import React, { useState, useMemo } from 'react';
import { Search, Filter, Pencil, Trash2, Zap, Package } from 'lucide-react';

const InventoryManagement = ({ products, onQuickEdit, onModify, onPurge }) => {
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');

    const categories = useMemo(() => {
        const cats = [...new Set(products.map(p => p.category_name).filter(Boolean))];
        return cats;
    }, [products]);

    const filtered = useMemo(() => {
        return products.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
            const matchCat = catFilter === 'all' || p.category_name === catFilter;
            const matchStock = stockFilter === 'all'
                || (stockFilter === 'low' && p.stock < 15 && p.stock > 0)
                || (stockFilter === 'out' && p.stock <= 0)
                || (stockFilter === 'ok' && p.stock >= 15);
            return matchSearch && matchCat && matchStock;
        });
    }, [products, search, catFilter, stockFilter]);

    return (
        <div>
            {/* PAGE HEADER */}
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-line" />
                    <div>
                        <h2>Inventory Control</h2>
                        <p>Track product stock and set reorder alerts.</p>
                    </div>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="filter-bar">
                <div className="search-input-wrap">
                    <Search size={16} className="search-input-icon" />
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-select-wrap">
                    <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                        <option value="all">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="filter-select-wrap">
                    <select className="filter-select" value={stockFilter} onChange={e => setStockFilter(e.target.value)}>
                        <option value="all">All Stock Levels</option>
                        <option value="ok">In Stock (≥15)</option>
                        <option value="low">Low Stock (&lt;15)</option>
                        <option value="out">Out of Stock</option>
                    </select>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                    {filtered.length} of {products.length} items
                </span>
            </div>

            {/* TABLE */}
            <div className="table-card">

                <table className="ss-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr><td colSpan="6">
                                <div className="empty-state">
                                    <div className="empty-state-icon"><Package size={40} /></div>
                                    <h3>No Products Found</h3>
                                    <p>Try adjusting your search or filters.</p>
                                </div>
                            </td></tr>
                        )}
                        {filtered.map(p => (
                            <tr key={p.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {p.image_url
                                            ? <img src={p.image_url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0', flexShrink: 0 }} />
                                            : <div style={{ width: 40, height: 40, borderRadius: 8, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Package size={16} color="#94a3b8" /></div>
                                        }
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>ID: {p.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>{p.category_name || '—'}</td>
                                <td style={{ fontWeight: 800, color: '#0f172a' }}>₹{Number(p.price).toLocaleString('en-IN')}</td>
                                <td>
                                    <span className={`stock-count ${p.stock < 15 ? 'warning' : ''}`}>{p.stock}</span>
                                </td>
                                <td>
                                    <span className={`avail-badge ${p.stock > 0 ? 'ok' : 'low'}`}>
                                        {p.stock <= 0 ? 'Out of Stock' : p.stock < 15 ? 'Low Stock' : 'In Stock'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>

                                        <button className="action-icon-btn edit" onClick={() => onModify(p)} title="Edit Product">
                                            <Pencil size={15} />
                                        </button>
                                        <button className="action-icon-btn danger" onClick={() => onPurge(p.id)} title="Delete Product">
                                            <Trash2 size={15} />
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

export default InventoryManagement;
