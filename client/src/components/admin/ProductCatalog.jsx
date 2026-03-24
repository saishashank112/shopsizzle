import React, { useState, useMemo } from 'react';
import { Search, Pencil, Trash2, Plus, Package } from 'lucide-react';

const ProductCatalog = ({ products, onAdd, onEdit, onDelete }) => {
    const [search, setSearch] = useState('');
    const [catFilter, setCatFilter] = useState('all');

    const categories = useMemo(() => {
        return [...new Set(products.map(p => p.category_name).filter(Boolean))];
    }, [products]);

    const filtered = useMemo(() => {
        return products.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
            const matchCat = catFilter === 'all' || p.category_name === catFilter;
            return matchSearch && matchCat;
        });
    }, [products, search, catFilter]);

    return (
        <div>
            {/* PAGE HEADER */}
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-line" />
                    <div>
                        <h2>Products Catalog</h2>
                        <p>Manage all your products, variations, and categorise inventory.</p>
                    </div>
                </div>
                <button className="btn-primary" onClick={onAdd}>
                    <Plus size={16} /> Add Product
                </button>
            </div>

            {/* FILTER BAR */}
            <div className="filter-bar">
                <div className="search-input-wrap">
                    <Search size={16} className="search-input-icon"/>
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
                {/* Removed floating button layout to match screenshot */}
            </div>

            {/* GRID */}
            {filtered.length === 0 ? (
                <div className="empty-state" style={{background:'#fff', borderRadius:16, border:'1px solid #e2e8f0'}}>
                    <div className="empty-state-icon"><Package size={44}/></div>
                    <h3>No Products Found</h3>
                    <p>Add your first product or adjust the filters.</p>
                </div>
            ) : (
                <div className="product-grid">
                    {filtered.map(p => (
                        <div className="product-card" key={p.id}>
                            <div className="product-card-img-wrap">
                                {p.image_url
                                    ? <img 
                                        src={String(p.image_url).split(/,\s*(?=http)/)[0].trim()} 
                                        alt={p.name} 
                                        referrerPolicy="no-referrer"
                                      />
                                    : <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center'}}><Package size={32} color="#cbd5e1"/></div>
                                }
                                <div className="product-card-actions">
                                    <button className="action-icon-btn edit" onClick={() => onEdit(p)} title="Edit"><Pencil size={14}/></button>
                                    <button className="action-icon-btn danger" onClick={() => onDelete(p.id)} title="Delete"><Trash2 size={14}/></button>
                                </div>
                                {p.stock <= 0 && <span className="product-card-badge">Out of Stock</span>}
                                {p.stock > 0 && p.stock < 15 && <span className="product-card-badge" style={{background:'rgba(234,88,12,0.75)'}}>Low Stock</span>}
                            </div>
                            <div className="product-card-body">
                                <div className="product-card-cat">{p.category_name || 'General'}</div>
                                <div className="product-card-name">{p.name}</div>
                                <div className="product-card-footer">
                                    <div className="product-card-price">₹{Number(p.price).toLocaleString('en-IN')}</div>
                                    <div className={`product-card-stock ${p.stock > 0 ? 'ok' : 'low'}`}>
                                        {p.stock > 0 ? `${p.stock} in stock` : 'Sold out'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductCatalog;
