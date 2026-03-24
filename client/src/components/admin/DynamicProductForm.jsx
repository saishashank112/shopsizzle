import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Save, X, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';

const DynamicProductForm = ({ onSubmit, onClose, editingProduct = null, categories = [] }) => {
    const [loading, setLoading] = useState(false);
    const [fields, setFields] = useState([]);
    
    // Core Fields (Globals)
    const [coreData, setCoreData] = useState({
        name: '',
        category_id: '',
    });

    // Dynamic Fields Data
    const [dynamicValues, setDynamicValues] = useState({});
    
    // Variant state
    const [variants, setVariants] = useState([]);

    // Quick Add Category State
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [quickCat, setQuickCat] = useState({ name: '', parent_id: '' });

    // 1. WATCH CATEGORY ID
    useEffect(() => {
        const fetchSchema = async () => {
            if (!coreData.category_id) {
                setFields([]);
                return;
            }
            setLoading(true);
            try {
                const r = await axios.get(`http://localhost:5000/api/products/categories/${coreData.category_id}/fields`);
                setFields(r.data.data || []);
            } catch (e) {
                console.error(e);
                setFields([]);
            }
            setLoading(false);
        };
        fetchSchema();
    }, [coreData.category_id]);

    // 2. SETUP EDIT MODE
    useEffect(() => {
        if (editingProduct) {
            setCoreData({
                name: editingProduct.name || '',
                category_id: editingProduct.category_id || '',
            });
            // Initial dynamic load
            const initialVals = {
                price: editingProduct.price || '',
                brand: editingProduct.brand || '',
                discount: editingProduct.discount || 0,
                stock: editingProduct.stock || 0,
                rating: editingProduct.rating || 0
            };
            // Attributes parsing
            if (editingProduct.attributes) {
                const attrs = typeof editingProduct.attributes === 'string' ? JSON.parse(editingProduct.attributes) : editingProduct.attributes;
                setDynamicValues({ ...initialVals, ...attrs });
            } else {
                setDynamicValues(initialVals);
            }

            // Variants parsing
            if (editingProduct.variants) {
                setVariants(typeof editingProduct.variants === 'string' ? JSON.parse(editingProduct.variants) : editingProduct.variants);
            }
        }
    }, [editingProduct]);

    const handleQuickCatSubmit = async (e) => {
        e.preventDefault();
        if (!quickCat.name) return;
        try {
            const slug = quickCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            await axios.post('http://localhost:5000/api/catalog/categories', {
                name: quickCat.name,
                slug: slug,
                parent_id: quickCat.parent_id || null,
                status: 'active'
            });
            setIsCatModalOpen(false);
            setQuickCat({ name: '', parent_id: '' });
            // Window location reload or prop trigger? 
            // We can just alert user or pass a refresh prop!
            alert('Category created! Refresh the modal to select it');
        } catch (err) {
            alert('Failed to save category');
        }
    };

    // 3. VARIANT MATRIX GENERATOR (Cartesian Product)
    const variantFields = useMemo(() => fields.filter(f => f.is_variant === 1), [fields]);

    useEffect(() => {
        if (variantFields.length === 0) {
            setVariants([]);
            return;
        }

        // Gather all variant options arrays
        const variantOptions = variantFields.map(f => {
            const val = dynamicValues[f.field_key];
            if (!val) return [];
            // Assuming dynamicValues[key] is comma-separated text or array
            return String(val).split(',').map(s => s.trim()).filter(Boolean);
        });

        // Check if any variant dimension has values to multiply
        if (variantOptions.every(opts => opts.length === 0)) {
            setVariants([]);
            return;
        }

        // Cartesian product multiplying
        const cartesian = (arrays) => {
            return arrays.reduce((acc, curr) => {
                return acc.flatMap(d => curr.map(e => [...d, e]));
            }, [[]]);
        };

        const combinations = cartesian(variantOptions);

        const newVariants = combinations.map(comb => {
            const key = comb.join('-');
            // Keep existing variant prices/stock if keys match to avoid clearing user data
            const existing = variants.find(v => v.variant_key === key);
            
            const variantData = {};
            variantFields.forEach((f, index) => {
                variantData[f.field_key] = comb[index];
            });

            return {
                variant_key: key,
                price: existing?.price || '',
                stock: existing?.stock || '',
                image_url: existing?.image_url || '',
                ...variantData
            };
        });

        setVariants(newVariants);

    }, [dynamicValues, variantFields]); // Re-run when options text input changes

    // 4. SUBMIT payload
    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            name: coreData.name,
            category_id: coreData.category_id,
            price: Number(dynamicValues.price) || 0,
            discount: Number(dynamicValues.discount) || 0,
            stock: Number(dynamicValues.stock) || 0,
            rating: Number(dynamicValues.rating) || 0,
            brand: dynamicValues.brand || '',
            description: dynamicValues.description || '',
            image_url: dynamicValues.image_url || '',
            attributes: dynamicValues,
            variants: variants
        };

        onSubmit(payload);
    };

    // Grouping helper
    const groupedFields = useMemo(() => {
        const groups = {};
        fields.forEach(f => {
            const gn = f.group_name || 'Specifications';
            if (!groups[gn]) groups[gn] = [];
            groups[gn].push(f);
        });
        return groups;
    }, [fields]);

    return (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div className="product-modal" style={{ 
                background: '#fff', 
                borderRadius: 16, 
                width: '94%', 
                maxWidth: 680, 
                maxHeight: '94vh', 
                overflowY: 'auto', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)', 
                animation: 'slideUp 0.15s',
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10000 
            }}>




                <div className="modal-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{editingProduct ? 'Edit Product Attributes' : 'Add New Category Product'}</h2>
                    <button className="modal-close-btn" onClick={onClose} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                </div>

                <form className="product-form" onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* GLOBAL FIELDS */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Product Name</label>
                            <input type="text" value={coreData.name} onChange={e => setCoreData({ ...coreData, name: e.target.value })} required style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} placeholder="e.g. iPhone 15" />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>
                                Category 
                                <button type="button" onClick={() => setIsCatModalOpen(true)} style={{ float: 'right', background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>+ Quick Add</button>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select value={coreData.category_id} onChange={e => setCoreData({ ...coreData, category_id: e.target.value })} required style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }}>
                                    <option value="">Select Category...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* GLOBAL CORE FIELDS (SMART ROWS) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Price (₹)</label>
                            <input type="number" value={dynamicValues['price'] || ''} onChange={e => setDynamicValues({ ...dynamicValues, price: e.target.value })} required style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} placeholder="0" />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Discount (%)</label>
                            <input type="number" value={dynamicValues['discount'] || ''} onChange={e => setDynamicValues({ ...dynamicValues, discount: e.target.value })} style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} placeholder="e.g. 15" min="0" max="100" />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Stock Level</label>
                            <input type="number" value={dynamicValues['stock'] || ''} onChange={e => setDynamicValues({ ...dynamicValues, stock: e.target.value })} style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} placeholder="e.g. 50" />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Rating (0-5)</label>
                            <input type="number" step="0.1" min="0" max="5" value={dynamicValues['rating'] || ''} onChange={e => setDynamicValues({ ...dynamicValues, rating: e.target.value })} style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} placeholder="e.g. 4.5" />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Brand</label>
                        <input type="text" value={dynamicValues['brand'] || ''} onChange={e => setDynamicValues({ ...dynamicValues, brand: e.target.value })} style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} placeholder="Brand Name" />
                    </div>


                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Main Image URL</label>
                        <input type="text" value={dynamicValues['image_url'] || ''} onChange={e => setDynamicValues({ ...dynamicValues, image_url: e.target.value })} required style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} placeholder="https://image-url..." />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Description</label>
                        <textarea rows="2" value={dynamicValues['description'] || ''} onChange={e => setDynamicValues({ ...dynamicValues, description: e.target.value })} style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} placeholder="Brief description..."></textarea>
                    </div>

                    {/* DYNAMIC SHADOW LOADER */}
                    {loading && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <Loader2 size={18} className="spin" /> Building category schema tree...
                        </div>
                    )}

                    {/* NO SCHEMA ALERT */}
                    {!loading && coreData.category_id && fields.length === 0 && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: 8, color: '#b91c1c', textAlign: 'center', fontSize: '0.85rem' }}>
                            No schema found. Please define dynamic fields for this category inside <b>Catalog Config Panel</b> first.
                        </div>
                    )}

                    {/* DYNAMIC FIELDS MAPPER */}
                    {!loading && Object.entries(groupedFields).map(([groupName, groupFields]) => (
                        <div key={groupName} style={{ border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: 12, marginTop: '0.5rem' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                                {groupName}
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                {groupFields.map(f => {
                                    const value = dynamicValues[f.field_key] || '';
                                    const renderInput = () => {
                                        if (f.field_type === 'select') {
                                            return (
                                                <select value={value} onChange={e => setDynamicValues({ ...dynamicValues, [f.field_key]: e.target.value })} style={{ width: '100%', padding: '0.55rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} required={f.is_required === 1}>
                                                    <option value="">Select...</option>
                                                    {(f.options_json || []).map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            );
                                        }
                                        if (f.field_type === 'textarea') {
                                            return <textarea value={value} onChange={e => setDynamicValues({ ...dynamicValues, [f.field_key]: e.target.value })} style={{ width: '100%', padding: '0.55rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} rows="2" required={f.is_required === 1} />;
                                        }
                                        if (f.field_type === 'boolean') {
                                            return <input type="checkbox" checked={value === true} onChange={e => setDynamicValues({ ...dynamicValues, [f.field_key]: e.target.checked })} style={{ width: 18, height: 18 }} />;
                                        }
                                        // For multi-select triggers, treat as comma-separated text input array
                                        return (
                                            <input 
                                                type={f.field_type === 'number' ? 'number' : 'text'} 
                                                value={value} 
                                                onChange={e => setDynamicValues({ ...dynamicValues, [f.field_key]: e.target.value })} 
                                                style={{ width: '100%', padding: '0.55rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} 
                                                placeholder={f.is_variant === 1 ? 'e.g. Red, Blue, Black (comma separated)' : ''} 
                                                required={f.is_required === 1} 
                                            />
                                        );
                                    };

                                    return (
                                        <div key={f.id} style={{ display: f.field_type === 'boolean' ? 'flex' : 'block', alignItems: 'center', gap: 8 }}>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: f.field_type === 'boolean' ? 0 : 4 }}>
                                                {f.field_name} {f.is_required === 1 && <span style={{ color: '#ef4444' }}>*</span>}
                                                {f.is_variant === 1 && <span style={{ fontSize: '0.6rem', background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: 4, marginLeft: 4 }}>Variant</span>}
                                            </label>
                                            {renderInput()}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* VARIANTS MATRIX SECTION */}
                    {variants.length > 0 && (
                        <div style={{ border: '1px solid #ea580c', padding: '1rem', borderRadius: 12, marginTop: '0.5rem', background: '#fffcfb' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ea580c', marginBottom: '0.75rem' }}>Variant Inventory Management</h4>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Combination</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Price (₹)</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Stock</th>
                                            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Image URL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {variants.map((v, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '0.5rem', fontWeight: 700, color: '#0f172a' }}>{v.variant_key}</td>
                                                <td style={{ padding: '0.3rem' }}>
                                                    <input type="number" value={v.price} onChange={e => {
                                                        const fresh = [...variants];
                                                        fresh[i].price = e.target.value;
                                                        setVariants(fresh);
                                                    }} style={{ width: 80, padding: 4, border: '1px solid #cbd5e1', borderRadius: 4 }} placeholder="Price" required />
                                                </td>
                                                <td style={{ padding: '0.3rem' }}>
                                                    <input type="number" value={v.stock} onChange={e => {
                                                        const fresh = [...variants];
                                                        fresh[i].stock = e.target.value;
                                                        setVariants(fresh);
                                                    }} style={{ width: 80, padding: 4, border: '1px solid #cbd5e1', borderRadius: 4 }} placeholder="Stock" required />
                                                </td>
                                                <td style={{ padding: '0.3rem' }}>
                                                    <input type="text" value={v.image_url} onChange={e => {
                                                        const fresh = [...variants];
                                                        fresh[i].image_url = e.target.value;
                                                        setVariants(fresh);
                                                    }} style={{ width: '100%', minWidth: 120, padding: 4, border: '1px solid #cbd5e1', borderRadius: 4 }} placeholder="https://..." />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="form-submit-btn" style={{ flex: 1, background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <Save size={16} /> {editingProduct ? 'Save Product Changes' : 'Publish Product'}
                        </button>
                    </div>
                </form>
            </div>

            {isCatModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, backdropFilter: 'blur(2px)' }}>
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 12, width: 350, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a' }}>Create Category</h4>
                        <form onSubmit={handleQuickCatSubmit}>
                            <div style={{ marginBottom: '0.75rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Name</label>
                                <input type="text" value={quickCat.name} onChange={e => setQuickCat({ ...quickCat, name: e.target.value })} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: 6 }} placeholder="e.g. Shoes" />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Parent (Optional)</label>
                                <select value={quickCat.parent_id} onChange={e => setQuickCat({ ...quickCat, parent_id: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: 6 }}>
                                    <option value="">None</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button type="submit" style={{ flex: 1, background: '#0f172a', color: '#fff', border: 'none', padding: '0.6rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Create</button>
                                <button type="button" onClick={() => setIsCatModalOpen(false)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.6rem', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DynamicProductForm;
