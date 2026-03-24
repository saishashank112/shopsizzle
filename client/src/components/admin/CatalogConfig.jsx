import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    FolderTree, SlidersHorizontal, Link2, Plus, Pencil, Trash2,
    ChevronDown, ChevronRight, CheckSquare, ToggleLeft, Sliders,
    Circle, X, Check, Eye, AlertCircle, GripVertical, Loader2,
    Tag, Sparkles, Hash, ArrowRight, RefreshCw, Upload, Search
} from 'lucide-react';
import CategorySchemaManager from './CategorySchemaManager';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ax = axios.create({ baseURL: API, withCredentials: true });

ax.interceptors.request.use(config => {
    const token = sessionStorage.getItem('token') || (sessionStorage.getItem('token') || localStorage.getItem('token'));
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

/* ─── helpers ─────────────────────────────────────── */
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const FILTER_TYPES = [
    { id: 'checkbox', label: 'Checkbox', Icon: CheckSquare, hint: 'Multi-select values (e.g. Brand)' },
    { id: 'radio',    label: 'Radio',    Icon: Circle,      hint: 'Single-select values (e.g. Condition)' },
    { id: 'range',    label: 'Range',    Icon: Sliders,     hint: 'Min/Max slider (e.g. Price)' },
    { id: 'toggle',   label: 'Toggle',   Icon: ToggleLeft,  hint: 'Yes/No switch (e.g. In Stock)' },
];

const PRESET_FILTERS = [
    { name: 'Brand',        type: 'checkbox', values: ['Apple', 'Samsung', 'Sony', 'LG', 'Nike', 'Adidas'] },
    { name: 'Color',        type: 'checkbox', values: ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow'] },
    { name: 'Size',         type: 'radio',    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    { name: 'Price Range',  type: 'range',    values: [] },
    { name: 'Condition',    type: 'radio',    values: ['New', 'Like New', 'Good', 'Fair', 'Used'] },
    { name: 'Availability', type: 'toggle',   values: ['In Stock', 'Out of Stock'] },
    { name: 'Rating',       type: 'radio',    values: ['4★ & above', '3★ & above', '2★ & above'] },
    { name: 'Discount',     type: 'checkbox', values: ['10% off', '20% off', '30% off', '50% off'] },
];

/* ─── sub-components ──────────────────────────────── */

const Toast = ({ message, type = 'success' }) => (
    <div style={{
        position:'fixed', bottom:'2rem', right:'2rem', zIndex:9999,
        background: type === 'success' ? '#0f172a' : '#991b1b',
        color:'#fff', borderRadius:12, padding:'0.875rem 1.5rem',
        display:'flex', alignItems:'center', gap:'0.625rem',
        fontSize:'0.875rem', fontWeight:600, boxShadow:'0 8px 32px rgba(0,0,0,.25)',
        animation:'slideUp 0.25s ease'
    }}>
        {type === 'success' ? <Check size={16}/> : <AlertCircle size={16}/>}
        {message}
    </div>
);

const Panel = ({ title, icon, action, children, color = '#4f46e5' }) => {
    const Ico = icon;
    return (
    <div style={{
        background:'#fff', borderRadius:16, border:'1px solid #e2e8f0',
        overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,.06)', minHeight: 400, display:'flex', flexDirection:'column'
    }}>

        <div style={{
            padding:'1rem 1.25rem', borderBottom:'1px solid #f1f5f9',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            background:'#f8fafc'
        }}>
            <div style={{display:'flex', alignItems:'center', gap:'0.625rem'}}>
                <div style={{width:32, height:32, borderRadius:8, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center'}}>
                    <Ico size={16} color={color}/>
                </div>
                <span style={{fontWeight:800, fontSize:'0.875rem', color:'#0f172a'}}>{title}</span>
            </div>
            {action}
        </div>
        <div style={{flex:1, overflowY:'auto', padding:'1rem'}}>
            {children}
        </div>
    </div>
    );
};

const Chip = ({ label, onRemove, color = '#e0e7ff', textColor = '#4338ca' }) => (
    <span style={{
        display:'inline-flex', alignItems:'center', gap:4,
        background:color, color:textColor, borderRadius:999,
        fontSize:'0.72rem', fontWeight:700, padding:'3px 10px 3px 10px',
        lineHeight:1.5
    }}>
        {label}
        {onRemove && (
            <button
                onClick={onRemove}
                style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:textColor, opacity:0.6, display:'flex', lineHeight:1 }}
            >
                <X size={11}/>
            </button>
        )}
    </span>
);

const TypeIcon = ({ type }) => {
    const TypeEntry = FILTER_TYPES.find(f => f.id === type) || FILTER_TYPES[0];
    return <TypeEntry.Icon size={14} color="#64748b"/>;
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════ */
const CatalogConfig = () => {
    /* ── state ─── */
    const [categories,   setCategories]   = useState([]);
    const [filters,      setFilters]      = useState([]);
    const [mappings,     setMappings]     = useState([]);
    const [selCat,       setSelCat]       = useState(null);   // selected category id

    const [loading,      setLoading]      = useState(false);
    const [toast,        setToast]        = useState(null);
    const [activePanel,  setActivePanel]  = useState('all'); // 'all' | 'preview'

    // Category form
    const [catForm,      setCatForm]      = useState({ name:'', slug:'', parent_id:'', status:'active' });
    const [editingCat,   setEditingCat]   = useState(null);
    const [catFormOpen,  setCatFormOpen]  = useState(false);

    // Filter form
    const [fgForm,       setFgForm]       = useState({ name:'', type:'checkbox' });
    const [editingFg,    setEditingFg]    = useState(null);
    const [fgFormOpen,   setFgFormOpen]   = useState(false);

    // Value input
    const [valInput,     setValInput]     = useState({});     // filterGroupId → text
    const [expandedFg,   setExpandedFg]   = useState(new Set());

    // Search/filter
    const [catSearch,    setCatSearch]    = useState('');
    const [fgSearch,     setFgSearch]     = useState('');
    const [viewTab,      setViewTab]      = useState('filters'); // 'filters' | 'schema'

    /* ── toast helper ─── */
    const notify = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2800);
    }, []);

    /* ── fetchers ─── */
    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [cR, fR] = await Promise.all([
                ax.get('/api/catalog/categories'),
                ax.get('/api/catalog/filters'),
            ]);
            setCategories(cR.data.data || []);
            setFilters(fR.data.data || []);
        } catch { notify('Failed to load catalog data', 'error'); }
        setLoading(false);
    }, [notify]);

    const fetchMappings = useCallback(async (catId) => {
        if (!catId) return;
        try {
            const r = await ax.get(`/api/catalog/mappings/${catId}`);
            setMappings(r.data.data || []);
        } catch { notify('Could not load mappings', 'error'); }
    }, [notify]);

    useEffect(() => { fetchAll(); }, [fetchAll]);
    useEffect(() => {
        if (selCat) fetchMappings(selCat);
        else setMappings([]);
    }, [selCat, fetchMappings]);
    // Re-fetch mappings when filters list changes (new filter added/deleted)
    useEffect(() => {
        if (selCat && filters.length > 0) fetchMappings(selCat);
    }, [filters.length]); // eslint-disable-line

    /* ─────────────────────────────────────────────────
       CATEGORIES
    ─────────────────────────────────────────────────── */
    const handleCatSubmit = async (e) => {
        e.preventDefault();
        if (!catForm.name) return;
        const payload = { ...catForm, slug: catForm.slug || slugify(catForm.name), parent_id: catForm.parent_id || null };
        try {
            if (editingCat) {
                await ax.put(`/api/catalog/categories/${editingCat}`, payload);
                notify('Category updated');
            } else {
                await ax.post('/api/catalog/categories', payload);
                notify('Category created');
            }
            setCatForm({ name:'', slug:'', parent_id:'', status:'active' });
            setEditingCat(null); setCatFormOpen(false);
            fetchAll();
        } catch (e) { notify(e.response?.data?.message || 'Save failed', 'error'); }
    };

    const handleDeleteCat = async (id) => {
        if (!confirm('Delete this category? Assigned filters will also be removed.')) return;
        try {
            await ax.delete(`/api/catalog/categories/${id}`);
            notify('Category deleted');
            if (selCat === id) setSelCat(null);
            fetchAll();
        } catch { notify('Delete failed', 'error'); }
    };

    const startEditCat = (c) => {
        setCatForm({ name:c.name, slug:c.slug, parent_id:c.parent_id || '', status:c.status });
        setEditingCat(c.id);
        setCatFormOpen(true);
    };

    /* ─────────────────────────────────────────────────
       FILTER GROUPS
    ─────────────────────────────────────────────────── */
    const handleFgSubmit = async (e) => {
        e.preventDefault();
        if (!fgForm.name) return;
        try {
            if (editingFg) {
                await ax.put(`/api/catalog/filters/${editingFg}`, fgForm);
                notify('Filter group updated');
            } else {
                await ax.post('/api/catalog/filters', fgForm);
                notify('Filter group created');
            }
            setFgForm({ name:'', type:'checkbox' });
            setEditingFg(null); setFgFormOpen(false);
            fetchAll();
        } catch (e) { notify(e.response?.data?.message || 'Save failed', 'error'); }
    };

    const handleDeleteFg = async (id) => {
        if (!confirm('Delete this filter group and all its values?')) return;
        try {
            await ax.delete(`/api/catalog/filters/${id}`);
            notify('Filter group deleted');
            fetchAll();
        } catch { notify('Delete failed', 'error'); }
    };

    const toggleFgEnabled = async (fg) => {
        try {
            await ax.put(`/api/catalog/filters/${fg.id}`, { ...fg, is_enabled: fg.is_enabled ? 0 : 1 });
            fetchAll();
        } catch { notify('Toggle failed', 'error'); }
    };

    /* ─────────────────────────────────────────────────
       FILTER VALUES
    ─────────────────────────────────────────────────── */
    const handleAddValues = async (groupId) => {
        const raw = valInput[groupId] || '';
        const values = raw.split(',').map(v => v.trim()).filter(Boolean);
        if (!values.length) return;
        try {
            await ax.post(`/api/catalog/filters/${groupId}/values`, { values });
            setValInput(p => ({ ...p, [groupId]: '' }));
            notify(`${values.length} value(s) added`);
            fetchAll();
        } catch (e) { notify(e.response?.data?.message || 'Add failed', 'error'); }
    };

    const handleDeleteValue = async (id) => {
        try {
            await ax.delete(`/api/catalog/filter-values/${id}`);
            fetchAll();
        } catch { notify('Remove failed', 'error'); }
    };

    /* ─────────────────────────────────────────────────
       PRESET FILTER GROUPS
    ─────────────────────────────────────────────────── */
    const addPreset = async (preset) => {
        const existing = filters.find(f => f.name.toLowerCase() === preset.name.toLowerCase());
        if (existing) { notify(`"${preset.name}" already exists`, 'error'); return; }
        try {
            const r = await ax.post('/api/catalog/filters', { name: preset.name, type: preset.type });
            const newId = r.data.data.id;
            if (preset.values.length > 0) {
                await ax.post(`/api/catalog/filters/${newId}/values`, { values: preset.values });
            }
            notify(`"${preset.name}" added with ${preset.values.length} values`);
            fetchAll();
        } catch { notify('Preset import failed', 'error'); }
    };

    /* ─────────────────────────────────────────────────
       MAPPINGS
    ─────────────────────────────────────────────────── */
    const attachFilter = async (filterId) => {
        if (!selCat) { notify('Select a category first', 'error'); return; }
        const already = mappings.find(m => m.filter_group_id === filterId);
        if (already) { notify('Already attached', 'error'); return; }
        try {
            await ax.post('/api/catalog/mappings', { category_id: selCat, filter_group_id: filterId });
            notify('Filter attached');
            fetchMappings(selCat);
        } catch { notify('Attach failed', 'error'); }
    };

    const detachFilter = async (mappingId) => {
        try {
            await ax.delete(`/api/catalog/mappings/${mappingId}`);
            notify('Filter detached');
            fetchMappings(selCat);
        } catch { notify('Detach failed', 'error'); }
    };

    /* ─────────────────────────────────────────────────
       DERIVED
    ─────────────────────────────────────────────────── */
    const filteredCats = categories.filter(c =>
        c.name.toLowerCase().includes(catSearch.toLowerCase())
    );
    const filteredFgs = filters.filter(f =>
        f.name.toLowerCase().includes(fgSearch.toLowerCase())
    );
    const selCatObj = categories.find(c => c.id === selCat);
    const mappedIds = new Set(mappings.map(m => m.filter_group_id));

    /* ─────────────────────────────────────────────────
       RENDER
    ─────────────────────────────────────────────────── */
    return (
        <div style={{ fontFamily:"'Inter', system-ui, sans-serif" }}>
            <style>{`
                @keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
                .cc-row:hover { background:#f8fafc !important; }
                .cc-btn { cursor:pointer; border:none; background:none; padding:0; display:inline-flex; align-items:center; }
                .cc-input { width:100%; padding:0.55rem 0.8rem; border:1.5px solid #e2e8f0; border-radius:8px; font-size:0.85rem; font-weight:500; color:#0f172a; background:#f8fafc; outline:none; font-family:inherit; transition:all .15s; }
                .cc-input:focus { border-color:#4f46e5; background:#fff; box-shadow:0 0 0 3px rgba(79,70,229,.1); }
                .cc-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2364748b' stroke-width='1.5' fill='none'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 0.75rem center; padding-right:2.25rem !important; }
                .cc-tag-btn { cursor:pointer; display:inline-flex; align-items:center; gap:4px; border:1.5px solid #e2e8f0; background:#f8fafc; border-radius:8px; padding:0.4rem 0.75rem; font-size:0.78rem; font-weight:700; color:#475569; transition:all .15s; }
                .cc-tag-btn:hover { border-color:#4f46e5; color:#4f46e5; background:#eef2ff; }
                .cc-cat-item { display:flex; align-items:center; gap:0.5rem; padding:0.6rem 0.75rem; border-radius:10px; cursor:pointer; transition:all .15s; margin-bottom:2px; }
                .cc-cat-item:hover { background:#f1f5f9; }
                .cc-cat-item.selected { background:#eef2ff; }
                .type-pill { display:inline-flex; align-items:center; gap:4px; background:#f1f5f9; border-radius:999px; padding:2px 10px; font-size:0.7rem; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.04em; }
                .attach-btn { cursor:pointer; display:inline-flex; align-items:center; gap:4px; background:#eef2ff; color:#4338ca; border:none; border-radius:8px; padding:0.35rem 0.75rem; font-size:0.75rem; font-weight:700; transition:all .15s; }
                .attach-btn:hover { background:#e0e7ff; }
                .detach-btn { cursor:pointer; background:#fee2e2; color:#b91c1c; border:none; border-radius:6px; padding:0.3rem 0.5rem; font-size:0.72rem; font-weight:700; transition:all .15s; display:inline-flex; align-items:center; gap:3px; }
                .detach-btn:hover { background:#fecaca; }
                .icon-action { cursor:pointer; width:28px; height:28px; border-radius:7px; background:#f1f5f9; display:inline-flex; align-items:center; justify-content:center; color:#64748b; border:none; transition:all .15s; }
                .icon-action:hover { background:#e2e8f0; color:#0f172a; }
                .icon-action.danger:hover { background:#fee2e2; color:#b91c1c; }
                .submit-row { display:flex; gap:0.5rem; margin-top:0.75rem; }
                .cc-submit { flex:1; background:#0f172a; color:#fff; border:none; border-radius:8px; padding:0.65rem; font-size:0.82rem; font-weight:800; cursor:pointer; transition:all .15s; }
                .cc-submit:hover { background:#1e293b; }
                .cc-submit.purple { background:#7c3aed; }
                .cc-submit.purple:hover { background:#6d28d9; }
                .cc-cancel { background:#f1f5f9; color:#475569; border:none; border-radius:8px; padding:0.65rem 1rem; font-size:0.82rem; font-weight:700; cursor:pointer; }
                .preset-card { border:1.5px solid #e2e8f0; border-radius:10px; padding:0.75rem; cursor:pointer; transition:all .15s; display:flex; flex-direction:column; gap:4px; }
                .preset-card:hover { border-color:#818cf8; background:#f5f3ff; }
                .preview-filter { border:1.5px solid #e2e8f0; border-radius:12px; padding:1rem; }
                
                /* Layout Split */
                .catalog-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1.3fr 1.2fr; 
                    gap: 1.25rem; 
                    align-items: start; 
                }
                
                @media (max-width: 1024px) {
                    .catalog-grid { 
                        grid-template-columns: 1fr; 
                        gap: 1rem;
                    }
                }
            `}</style>

            {/* ── PAGE HEADER ── */}
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-line" />
                    <div>
                        <h2>Catalog Configuration</h2>
                        <p>Self-configuring commerce engine — define categories, filters, and their relationships.</p>
                    </div>
                </div>
                <div style={{ display:'flex', gap:'0.75rem' }}>
                    <button
                        onClick={fetchAll}
                        style={{ display:'flex', alignItems:'center', gap:6, background:'#f1f5f9', color:'#475569', border:'1px solid #e2e8f0', borderRadius:8, padding:'0.55rem 1rem', fontSize:'0.82rem', fontWeight:700, cursor:'pointer' }}
                    >
                        <RefreshCw size={14}/> Refresh
                    </button>
                    <button
                        onClick={async () => {
                            const next = activePanel === 'preview' ? 'all' : 'preview';
                            setActivePanel(next);
                            // Refresh mappings when entering preview so data is current
                            if (next === 'preview' && selCat) {
                                await fetchMappings(selCat);
                                await fetchAll();
                            }
                        }}
                        style={{ display:'flex', alignItems:'center', gap:6, background: activePanel === 'preview' ? '#0f172a' : '#f1f5f9', color: activePanel === 'preview' ? '#fff' : '#475569', border:'none', borderRadius:8, padding:'0.55rem 1rem', fontSize:'0.82rem', fontWeight:700, cursor:'pointer' }}
                    >
                        <Eye size={14}/> {activePanel === 'preview' ? 'Exit Preview' : 'Preview'}
                    </button>
                </div>
            </div>

            {/* ── TABS SELECTOR ── */}
            <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1.5rem', borderBottom:'1px solid #e2e8f0', paddingBottom:'0.75rem' }}>
                <button 
                    onClick={() => setViewTab('filters')} 
                    style={{ background: viewTab === 'filters' ? '#4f46e5' : 'transparent', color: viewTab === 'filters' ? '#fff' : '#64748b', padding:'0.5rem 1rem', borderRadius:8, border:viewTab === 'filters' ? 'none' : '1px solid #e2e8f0', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', transition: '0.2s' }}
                >
                    Filter Mappings
                </button>
                <button 
                    onClick={() => setViewTab('schema')} 
                    style={{ background: viewTab === 'schema' ? '#4f46e5' : 'transparent', color: viewTab === 'schema' ? '#fff' : '#64748b', padding:'0.5rem 1rem', borderRadius:8, border:viewTab === 'schema' ? 'none' : '1px solid #e2e8f0', fontSize:'0.85rem', fontWeight:700, cursor:'pointer', transition: '0.2s' }}
                >
                    Category Schema Manager
                </button>
            </div>

            {viewTab === 'schema' ? (
                <CategorySchemaManager />
            ) : (
                <>
            {/* ── PREVIEW MODE ── */}
            {activePanel === 'preview' && (
                <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'1.5rem', marginBottom:'1.5rem', animation:'fadeIn .25s' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.25rem' }}>
                        <Eye size={18} color="#4f46e5"/>
                        <span style={{ fontWeight:800, color:'#0f172a' }}>
                            Filter Preview{selCatObj ? `: ${selCatObj.name}` : ''}
                        </span>
                        <span style={{ fontSize:'0.7rem', fontWeight:700, background:'#e0e7ff', color:'#4338ca', borderRadius:999, padding:'2px 10px' }}>Frontend View</span>
                        {selCat && (
                            <button onClick={async () => { await fetchAll(); await fetchMappings(selCat); }} style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:4, background:'#f1f5f9', border:'none', borderRadius:8, padding:'0.3rem 0.75rem', fontSize:'0.75rem', fontWeight:700, color:'#475569', cursor:'pointer' }}>
                                <RefreshCw size={12}/> Refresh
                            </button>
                        )}
                    </div>
                    {!selCat ? (
                        <div style={{ textAlign:'center', padding:'2.5rem', color:'#94a3b8' }}>
                            <FolderTree size={36} style={{ margin:'0 auto 0.75rem', display:'block', opacity:.3 }}/>
                            <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:4 }}>No Category Selected</div>
                            <div style={{ fontSize:'0.82rem' }}>Click a category in Panel A, then come back to preview its filters</div>
                        </div>
                    ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:'1rem' }}>
                        {mappings.filter(m => m.is_enabled).map(m => {
                            const fg = filters.find(f => f.id === m.filter_group_id);
                            if (!fg) return null;
                            return (
                                <div key={m.id} className="preview-filter">
                                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:'0.75rem' }}>
                                        <TypeIcon type={fg.type}/>
                                        <span style={{ fontWeight:700, fontSize:'0.875rem' }}>{fg.name}</span>
                                        <span className="type-pill">{fg.type}</span>
                                    </div>
                                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                                        {(fg.values || []).map((v, i) => (
                                            <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#f1f5f9', color:'#475569', borderRadius:999, fontSize:'0.72rem', fontWeight:700, padding:'3px 10px' }}>{v.value}</span>
                                        ))}
                                        {fg.type === 'range' && (
                                            <div style={{ width:'100%', height:4, background:'#e2e8f0', borderRadius:999, position:'relative' }}>
                                                <div style={{ position:'absolute', left:'20%', right:'30%', top:0, bottom:0, background:'#4f46e5', borderRadius:999 }}/>
                                            </div>
                                        )}
                                        {fg.type === 'toggle' && (
                                            <div style={{ width:44, height:24, background:'#4f46e5', borderRadius:999, position:'relative' }}>
                                                <div style={{ position:'absolute', right:3, top:3, width:18, height:18, background:'#fff', borderRadius:50 }}/>
                                            </div>
                                        )}
                                        {(fg.values || []).length === 0 && fg.type !== 'range' && fg.type !== 'toggle' && (
                                            <span style={{ fontSize:'0.75rem', color:'#94a3b8', fontStyle:'italic' }}>No values defined</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {mappings.filter(m => m.is_enabled).length === 0 && (
                            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'2rem', color:'#94a3b8' }}>
                                <SlidersHorizontal size={28} style={{ margin:'0 auto 0.5rem', display:'block', opacity:.3 }}/>
                                <p style={{ margin:0, fontSize:'0.875rem', fontWeight:700 }}>No filters mapped to this category</p>
                                <p style={{ margin:'0.25rem 0 0', fontSize:'0.78rem' }}>Go to Panel C and attach some filters</p>
                            </div>
                        )}
                    </div>
                    )}
                </div>
            )}

            {/* ── 3-PANEL GRID ── */}
            <div className="catalog-grid">

                {/* ══ PANEL A: CATEGORIES ══════════════════════════ */}
                <Panel
                    title="Categories"
                    icon={FolderTree}
                    color="#0891b2"
                    action={
                        <button className="attach-btn" onClick={() => { setCatFormOpen(p => !p); setEditingCat(null); setCatForm({ name:'', slug:'', parent_id:'', status:'active' }); }}>
                            <Plus size={13}/> Add
                        </button>
                    }
                >
                    {/* Add/Edit form */}
                    {catFormOpen && (
                        <form onSubmit={handleCatSubmit} style={{ background:'#f8fafc', borderRadius:10, padding:'0.875rem', marginBottom:'0.875rem', border:'1.5px solid #e2e8f0' }}>
                            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                                <label style={{ fontSize:'0.68rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.04em' }}>Name</label>
                                <input className="cc-input" value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name:e.target.value, slug: slugify(e.target.value) }))} placeholder="e.g. Electronics" required/>
                                <label style={{ fontSize:'0.68rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.04em' }}>Slug</label>
                                <input className="cc-input" value={catForm.slug} onChange={e => setCatForm(p => ({ ...p, slug:e.target.value }))} placeholder="auto-generated"/>
                                <label style={{ fontSize:'0.68rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.04em' }}>Parent</label>
                                <select className="cc-input cc-select" value={catForm.parent_id} onChange={e => setCatForm(p => ({ ...p, parent_id:e.target.value }))}>
                                    <option value="">— Root —</option>
                                    {categories.filter(c => c.id !== editingCat).map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <label style={{ fontSize:'0.68rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.04em' }}>Status</label>
                                <select className="cc-input cc-select" value={catForm.status} onChange={e => setCatForm(p => ({ ...p, status:e.target.value }))}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <div className="submit-row">
                                    <button type="submit" className="cc-submit">{editingCat ? 'Update' : 'Create'}</button>
                                    <button type="button" className="cc-cancel" onClick={() => { setCatFormOpen(false); setEditingCat(null); }}>Cancel</button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Search */}
                    <div style={{ position:'relative', marginBottom:'0.75rem' }}>
                        <Search size={13} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}/>
                        <input className="cc-input" style={{ paddingLeft:'2rem' }} placeholder="Search categories..." value={catSearch} onChange={e => setCatSearch(e.target.value)}/>
                    </div>

                    {/* Category List */}
                    {filteredCats.length === 0 && (
                        <div style={{ textAlign:'center', padding:'2rem', color:'#94a3b8', fontSize:'0.85rem' }}>
                            No categories yet. Click Add to start.
                        </div>
                    )}
                    {filteredCats.map(c => (
                        <div
                            key={c.id}
                            className={`cc-cat-item ${selCat === c.id ? 'selected' : ''}`}
                            onClick={() => setSelCat(c.id === selCat ? null : c.id)}
                        >
                            {c.parent_id
                                ? <span style={{ marginLeft:12, color:'#cbd5e1' }}><ArrowRight size={12}/></span>
                                : <FolderTree size={13} color="#0891b2"/>
                            }
                            <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontWeight:700, fontSize:'0.875rem', color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</div>
                                <div style={{ fontSize:'0.68rem', color:'#94a3b8', fontFamily:'monospace' }}>{c.slug}</div>
                            </div>
                            <span style={{
                                fontSize:'0.6rem', fontWeight:800, padding:'1px 8px', borderRadius:999,
                                background: c.status === 'active' ? '#dcfce7' : '#f1f5f9',
                                color: c.status === 'active' ? '#15803d' : '#94a3b8',
                                textTransform:'uppercase', letterSpacing:'.04em', flexShrink:0
                            }}>{c.status}</span>
                            <div style={{ display:'flex', gap:3 }} onClick={e => e.stopPropagation()}>
                                <button className="icon-action" onClick={() => startEditCat(c)} title="Edit"><Pencil size={12}/></button>
                                <button className="icon-action danger" onClick={() => handleDeleteCat(c.id)} title="Delete"><Trash2 size={12}/></button>
                            </div>
                        </div>
                    ))}
                </Panel>

                {/* ══ PANEL B: FILTER GROUPS ═══════════════════════ */}
                <Panel
                    title="Filter Groups"
                    icon={SlidersHorizontal}
                    color="#7c3aed"
                    action={
                        <div style={{ display:'flex', gap:6 }}>
                            <button className="attach-btn" style={{ background:'#f5f3ff', color:'#6d28d9' }} onClick={() => { setFgFormOpen(p => !p); setEditingFg(null); setFgForm({ name:'', type:'checkbox' }); }}>
                                <Plus size={13}/> Add
                            </button>
                        </div>
                    }
                >
                    {/* Add/Edit Form */}
                    {fgFormOpen && (
                        <form onSubmit={handleFgSubmit} style={{ background:'#f8fafc', borderRadius:10, padding:'0.875rem', marginBottom:'0.875rem', border:'1.5px solid #e2e8f0' }}>
                            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                                <label style={{ fontSize:'0.68rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.04em' }}>Filter Name</label>
                                <input className="cc-input" value={fgForm.name} onChange={e => setFgForm(p => ({ ...p, name:e.target.value }))} placeholder="e.g. Brand" required/>
                                <label style={{ fontSize:'0.68rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.04em' }}>Type</label>
                                <select className="cc-input cc-select" value={fgForm.type} onChange={e => setFgForm(p => ({ ...p, type:e.target.value }))}>
                                    {FILTER_TYPES.map(t => <option key={t.id} value={t.id}>{t.label} — {t.hint}</option>)}
                                </select>
                                <div className="submit-row">
                                    <button type="submit" className="cc-submit purple">{editingFg ? 'Update' : 'Create'}</button>
                                    <button type="button" className="cc-cancel" onClick={() => { setFgFormOpen(false); setEditingFg(null); }}>Cancel</button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* Quick presets */}
                    {!fgFormOpen && (
                        <div style={{ marginBottom:'0.875rem' }}>
                            <div style={{ fontSize:'0.7rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:4 }}>
                                <Sparkles size={11}/> Quick Add Presets
                            </div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                                {PRESET_FILTERS.filter(p => !filters.find(f => f.name.toLowerCase() === p.name.toLowerCase())).map(p => (
                                    <button key={p.name} className="cc-tag-btn" onClick={() => addPreset(p)}>
                                        <TypeIcon type={p.type}/> {p.name}
                                    </button>
                                ))}
                                {PRESET_FILTERS.every(p => filters.find(f => f.name.toLowerCase() === p.name.toLowerCase())) && (
                                    <span style={{ fontSize:'0.78rem', color:'#94a3b8', fontStyle:'italic' }}>All presets added ✓</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div style={{ position:'relative', marginBottom:'0.75rem' }}>
                        <Search size={13} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}/>
                        <input className="cc-input" style={{ paddingLeft:'2rem' }} placeholder="Search filter groups..." value={fgSearch} onChange={e => setFgSearch(e.target.value)}/>
                    </div>

                    {/* Filter Group List */}
                    {filteredFgs.length === 0 && (
                        <div style={{ textAlign:'center', padding:'2rem', color:'#94a3b8', fontSize:'0.85rem' }}>
                            No filter groups yet.
                        </div>
                    )}
                    {filteredFgs.map(fg => {
                        const expanded = expandedFg.has(fg.id);
                        return (
                            <div key={fg.id} style={{ border:'1.5px solid #e2e8f0', borderRadius:10, marginBottom:'0.5rem', overflow:'hidden', transition:'all .15s' }}>
                                {/* Header row */}
                                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 0.75rem', background: expanded ? '#f5f3ff' : '#fff', cursor:'pointer' }}
                                    onClick={() => setExpandedFg(p => { const n = new Set(p); n.has(fg.id) ? n.delete(fg.id) : n.add(fg.id); return n; })}
                                >
                                    {expanded ? <ChevronDown size={14} color="#7c3aed"/> : <ChevronRight size={14} color="#94a3b8"/>}
                                    <TypeIcon type={fg.type}/>
                                    <span style={{ fontWeight:700, fontSize:'0.875rem', flex:1 }}>{fg.name}</span>
                                    <span className="type-pill">{fg.type}</span>
                                    <span style={{ fontSize:'0.72rem', color:'#94a3b8', fontWeight:600 }}>{fg.values?.length || 0} vals</span>
                                    <div style={{ display:'flex', gap:3, marginLeft:4 }} onClick={e => e.stopPropagation()}>
                                        {/* Enable toggle */}
                                        <button
                                            className="icon-action"
                                            title={fg.is_enabled ? 'Disable' : 'Enable'}
                                            onClick={() => toggleFgEnabled(fg)}
                                            style={{ background: fg.is_enabled ? '#dcfce7' : '#f1f5f9', color: fg.is_enabled ? '#15803d' : '#94a3b8' }}
                                        >
                                            {fg.is_enabled ? <Check size={12}/> : <X size={12}/>}
                                        </button>
                                        <button className="icon-action" title="Edit" onClick={() => { setFgForm({ name:fg.name, type:fg.type }); setEditingFg(fg.id); setFgFormOpen(true); }}><Pencil size={12}/></button>
                                        <button className="icon-action danger" title="Delete" onClick={() => handleDeleteFg(fg.id)}><Trash2 size={12}/></button>
                                    </div>
                                </div>

                                {/* Expanded: values */}
                                {expanded && (
                                    <div style={{ padding:'0.75rem', borderTop:'1px solid #f1f5f9', background:'#fafafa' }}>
                                        {/* Existing values */}
                                        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'0.625rem' }}>
                                            {(fg.values || []).map(v => (
                                                <Chip
                                                    key={v.id}
                                                    label={v.value}
                                                    color="#f1f5f9"
                                                    textColor="#475569"
                                                    onRemove={() => handleDeleteValue(v.id)}
                                                />
                                            ))}
                                            {(fg.values || []).length === 0 && (
                                                <span style={{ fontSize:'0.78rem', color:'#94a3b8', fontStyle:'italic' }}>No values yet</span>
                                            )}
                                        </div>

                                        {/* Add values */}
                                        <div style={{ display:'flex', gap:6 }}>
                                            <input
                                                className="cc-input"
                                                style={{ flex:1, fontSize:'0.8rem' }}
                                                placeholder="Add values (comma-separated)..."
                                                value={valInput[fg.id] || ''}
                                                onChange={e => setValInput(p => ({ ...p, [fg.id]:e.target.value }))}
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddValues(fg.id); } }}
                                            />
                                            <button
                                                onClick={() => handleAddValues(fg.id)}
                                                style={{ background:'#7c3aed', color:'#fff', border:'none', borderRadius:8, padding:'0.4rem 0.75rem', fontSize:'0.78rem', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}
                                            >
                                                <Plus size={13}/> Add
                                            </button>
                                        </div>
                                        <p style={{ fontSize:'0.68rem', color:'#94a3b8', marginTop:4 }}>
                                            Tip: Add multiple values at once — "Red, Blue, Black"
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </Panel>

                {/* ══ PANEL C: CATEGORY ↔ FILTER MAPPING ══════════ */}
                <Panel
                    title="Category → Filter Mapping"
                    icon={Link2}
                    color="#ea580c"
                    action={null}
                >
                    {!selCat ? (
                        <div style={{ textAlign:'center', padding:'2.5rem 1rem', color:'#94a3b8' }}>
                            <Link2 size={32} style={{ margin:'0 auto .75rem', display:'block', opacity:.3 }}/>
                            <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:4 }}>Select a Category</div>
                            <div style={{ fontSize:'0.82rem' }}>Click any category on the left to manage its assigned filters</div>
                        </div>
                    ) : (
                        <>
                            {/* Context banner */}
                            <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:10, padding:'0.75rem 1rem', marginBottom:'1rem', display:'flex', alignItems:'center', gap:8 }}>
                                <FolderTree size={15} color="#ea580c"/>
                                <div>
                                    <div style={{ fontWeight:800, fontSize:'0.875rem', color:'#0f172a' }}>{selCatObj?.name}</div>
                                    <div style={{ fontSize:'0.72rem', color:'#78350f', fontFamily:'monospace' }}>/{selCatObj?.slug}</div>
                                </div>
                                <span style={{ marginLeft:'auto', fontSize:'0.72rem', fontWeight:700, background:'#fdba74', color:'#7c2d12', borderRadius:999, padding:'2px 10px' }}>
                                    {mappings.length} filters
                                </span>
                            </div>

                            {/* Assigned filters */}
                            <div style={{ marginBottom:'1rem' }}>
                                <div style={{ fontSize:'0.7rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'0.5rem' }}>
                                    Assigned Filters
                                </div>
                                {mappings.length === 0 && (
                                    <div style={{ fontSize:'0.82rem', color:'#94a3b8', fontStyle:'italic', padding:'0.5rem 0' }}>
                                        No filters attached yet.
                                    </div>
                                )}
                                {mappings.map(m => {
                                    return (
                                        <div key={m.id} style={{
                                            display:'flex', alignItems:'center', gap:'0.5rem',
                                            padding:'0.6rem 0.75rem', background:'#fff', border:'1.5px solid #e2e8f0',
                                            borderRadius:10, marginBottom:'0.4rem'
                                        }}>
                                            <GripVertical size={13} color="#cbd5e1" style={{ flexShrink:0 }}/>
                                            <TypeIcon type={m.filter_type}/>
                                            <span style={{ fontWeight:700, fontSize:'0.875rem', flex:1 }}>{m.filter_name}</span>
                                            <span className="type-pill">{m.filter_type}</span>
                                            {!m.is_enabled && <span style={{ fontSize:'0.68rem', color:'#94a3b8', fontWeight:700 }}>DISABLED</span>}
                                            <button className="detach-btn" onClick={() => detachFilter(m.id)}>
                                                <X size={11}/> Remove
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Available to attach */}
                            <div>
                                <div style={{ fontSize:'0.7rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'0.5rem' }}>
                                    Available Filters — Click to Attach
                                </div>
                                {filters.filter(f => !mappedIds.has(f.id)).length === 0 && (
                                    <div style={{ fontSize:'0.82rem', color:'#94a3b8', fontStyle:'italic', padding:'0.5rem 0' }}>
                                        All filter groups are attached.
                                    </div>
                                )}
                                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                                    {filters.filter(f => !mappedIds.has(f.id)).map(f => (
                                        <button key={f.id} className="cc-tag-btn" onClick={() => attachFilter(f.id)} title={`Attach "${f.name}" to ${selCatObj?.name}`}>
                                            <TypeIcon type={f.type}/>
                                            {f.name}
                                            <Plus size={11}/>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Auto-suggest */}
                            {mappings.length === 0 && (
                                <div style={{ marginTop:'1rem', background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, padding:'0.75rem' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:'0.5rem' }}>
                                        <Sparkles size={13} color="#2563eb"/>
                                        <span style={{ fontSize:'0.78rem', fontWeight:800, color:'#1d4ed8' }}>Suggested Filters</span>
                                    </div>
                                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem' }}>
                                        {['Brand', 'Price Range', 'Availability', 'Rating'].filter(n => {
                                            const fg = filters.find(f => f.name === n);
                                            return fg && !mappedIds.has(fg.id);
                                        }).map(n => {
                                            const fg = filters.find(f => f.name === n);
                                            return fg ? (
                                                <button key={n} className="attach-btn" onClick={() => attachFilter(fg.id)}>
                                                    <Sparkles size={11}/>{n}
                                                </button>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Panel>
            </div>
            </>
            )}

            {/* Loading overlay */}
            {loading && (
                <div style={{ position:'fixed', inset:0, background:'rgba(255,255,255,.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:5000 }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
                        <Loader2 size={32} color="#4f46e5" style={{ animation:'spin 0.8s linear infinite' }}/>
                        <span style={{ fontWeight:700, color:'#475569', fontSize:'0.82rem' }}>Loading catalog…</span>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type}/>}
        </div>
    );
};

export default CatalogConfig;
