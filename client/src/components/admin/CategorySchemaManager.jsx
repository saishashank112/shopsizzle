import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    FolderTree, Plus, Pencil, Trash2, 
    Check, AlertCircle, RefreshCw, Sliders, ToggleLeft, 
    Image, Type, Hash, List, CheckSquare
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ax = axios.create({ baseURL: API, withCredentials: true });

ax.interceptors.request.use(config => {
    const token = (sessionStorage.getItem('token') || localStorage.getItem('token'));
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, error => Promise.reject(error));

const FIELD_TYPES = [
    { id: 'text', label: 'Text Input', Icon: Type },
    { id: 'number', label: 'Number Input', Icon: Hash },
    { id: 'select', label: 'Dropdown Select', Icon: ArrowDownCircle },
    { id: 'multiselect', label: 'Multi Select', Icon: List },
    { id: 'boolean', label: 'Toggle/Boolean', Icon: ToggleLeft },
    { id: 'color', label: 'Color Picker', Icon: Sliders },
    { id: 'image', label: 'Image Upload', Icon: Image },
    { id: 'textarea', label: 'Textarea', Icon: FileText }
];

function ArrowDownCircle(props) { return <List {...props} />; }
function FileText(props) { return <Type {...props} />; }

const CategorySchemaManager = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCat, setSelectedCat] = useState(null);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [form, setForm] = useState({
        field_name: '',
        field_key: '',
        field_type: 'text',
        group_name: 'Specifications',
        options: '',
        is_required: false,
        is_filterable: false,
        is_variant: false
    });

    const loadCategories = useCallback(async () => {
        try {
            const r = await ax.get('/api/products/categories');
            setCategories(r.data.data || []);
        } catch (e) { console.error(e); }
    }, []);

    const loadFields = useCallback(async (catId) => {
        if (!catId) return;
        setLoading(true);
        try {
            const r = await ax.get(`/api/products/categories/${catId}/fields`);
            setFields(r.data.data || []);
        } catch (e) { console.error(e); }
        setLoading(false);
    }, []);

    useEffect(() => { loadCategories(); }, [loadCategories]);
    useEffect(() => { loadFields(selectedCat); }, [selectedCat, loadFields]);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleAddField = async (e) => {
        e.preventDefault();
        const payload = {
            category_id: selectedCat,
            field_name: form.field_name,
            field_key: form.field_key || form.field_name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            field_type: form.field_type,
            group_name: form.group_name,
            options_json: form.options ? form.options.split(',').map(s => s.trim()).filter(Boolean) : [],
            is_required: form.is_required,
            is_filterable: form.is_filterable,
            is_variant: form.is_variant
        };

        try {
            await ax.post('/api/products/category-fields', payload);
            setIsModalOpen(false);
            setForm({ field_name:'', field_key:'', field_type:'text', group_name:'Specifications', options:'', is_required:false, is_filterable:false, is_variant:false });
            loadFields(selectedCat);
        } catch {
            alert('Failed to save field');
        }
    };

    return (
        <div style={{ padding: isMobile ? '1rem' : '1.5rem', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', gap: isMobile ? '1rem' : '1.5rem', background: '#f8fafc', minHeight: '100%' }}>
            {/* Sidebar Categories */}
            {!isMobile && (
                <div style={{ background: '#fff', padding: '1rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                        <FolderTree size={18} color="#4f46e5" />
                        <h4 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Categories</h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {categories.map(c => (
                            <div key={c.id} 
                                 onClick={() => setSelectedCat(c.id)}
                                 style={{
                                     padding: '0.6rem 0.75rem', borderRadius: 8, cursor: 'pointer',
                                     background: selectedCat === c.id ? '#eef2ff' : 'transparent',
                                     color: selectedCat === c.id ? '#4338ca' : '#475569',
                                     fontWeight: selectedCat === c.id ? 700 : 500, fontSize: '0.85rem',
                                     transition: '0.2s'
                                 }}>
                                {c.name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Fields Schema Manager */}
            <div style={{ background: '#fff', padding: isMobile ? '1rem' : '1.5rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                {isMobile && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>Selected Category</label>
                        <select 
                            value={selectedCat || ''} 
                            onChange={(e) => setSelectedCat(e.target.value ? Number(e.target.value) : null)}
                            style={{ 
                                width: '100%', padding: '0.75rem', borderRadius: 8, border: '1.5px solid #e2e8f0', 
                                background: '#fff', fontWeight: 600, fontSize: '0.9rem', outline: 'none' 
                            }}
                        >
                            <option value="">-- Choose Category --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                )}
                {!selectedCat ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                        <Sliders size={36} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
                        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#64748b' }}>Select a Category</h3>
                        <p style={{ fontSize: '0.8rem' }}>Click any category to build its dynamic attribute definitions</p>
                    </div>
                ) : (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Schema Definitions</h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Define the custom form inputs required for this item listing.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(true)} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Plus size={16} /> Add Field
                            </button>
                        </div>

                        {loading ? <p>Loading fields...</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {fields.map(f => (
                                    <div key={f.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{f.field_name}</span>
                                                <span style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: 20, color: '#64748b', fontWeight: 600 }}>{f.field_type}</span>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>Key: <code style={{ color: '#ec4899' }}>{f.field_key}</code> | Group: {f.group_name}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            {f.is_required === 1 && <span style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>Required</span>}
                                            {f.is_filterable === 1 && <span style={{ fontSize: '0.65rem', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>Filter</span>}
                                            {f.is_variant === 1 && <span style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>Variant</span>}
                                            <button style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ADD FIELD MODAL */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 16, width: 440, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', animation: 'slideUp 0.15s' }}>
                        <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.25rem', color: '#0f172a' }}>Create Field Descriptor</h3>
                        <form onSubmit={handleAddField} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Field Name</label>
                                <input style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, outline: 'none' }} placeholder="e.g. RAM" value={form.field_name} onChange={e => setForm(p => ({ ...p, field_name: e.target.value }))} required />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Field Type</label>
                                <select style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} value={form.field_type} onChange={e => setForm(p => ({ ...p, field_type: e.target.value }))}>
                                    {FIELD_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                            </div>

                            {(form.field_type === 'select' || form.field_type === 'multiselect') && (
                                <div>
                                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Options (Comma Separated)</label>
                                    <input style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} placeholder="e.g. 4GB, 8GB, 16GB" value={form.options} onChange={e => setForm(p => ({ ...p, options: e.target.value }))} required />
                                </div>
                            )}

                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>Group Name</label>
                                <select style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8 }} value={form.group_name} onChange={e => setForm(p => ({ ...p, group_name: e.target.value }))}>
                                    <option value="Basic Info">Basic Info</option>
                                    <option value="Specifications">Specifications</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                                    <input type="checkbox" checked={form.is_required} onChange={e => setForm(p => ({ ...p, is_required: e.target.checked }))} /> Required
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                                    <input type="checkbox" checked={form.is_filterable} onChange={e => setForm(p => ({ ...p, is_filterable: e.target.checked }))} /> Filterable
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                                    <input type="checkbox" checked={form.is_variant} onChange={e => setForm(p => ({ ...p, is_variant: e.target.checked }))} /> Variant
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <button type="submit" style={{ flex: 1, background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>Save Field</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: '0.65rem', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategorySchemaManager;
