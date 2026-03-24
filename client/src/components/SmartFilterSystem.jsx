import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import {
    X, ChevronDown, ChevronUp, Star, Search,
    SlidersHorizontal, Sparkles, Check, RefreshCw, Tag, ChevronRight
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ─── Color Swatch Map ─── */
const COLOR_HEX = {
    red:'#ef4444', blue:'#3b82f6', black:'#111827', white:'#f9fafb',
    green:'#22c55e', yellow:'#eab308', purple:'#a855f7', pink:'#ec4899',
    orange:'#f97316', gray:'#9ca3af', grey:'#9ca3af', silver:'#cbd5e1',
    gold:'#f59e0b', brown:'#92400e', navy:'#1e3a5f', maroon:'#7f1d1d',
    'midnight blue':'#1e3a5f', emerald:'#10b981', crimson:'#dc2626',
    'rose gold':'#e8b4b8', beige:'#f5f0e8',
};
const getColorHex = (val) => COLOR_HEX[val.toLowerCase()] || '#94a3b8';

/* ─── Shared sub-components ─── */
const RatingStars = ({ value, size = 14 }) => (
    <span style={{ display:'inline-flex', gap:1 }}>
        {[1,2,3,4,5].map(i => (
            <Star key={i} size={size}
                fill={i <= value ? '#f59e0b' : 'none'}
                color={i <= value ? '#f59e0b' : '#d1d5db'}
                strokeWidth={1.5}
            />
        ))}
    </span>
);

const FilterSection = ({ title, children, defaultOpen = true, count = 0 }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{ borderBottom:'1px solid #f1f5f9', paddingBottom: open ? '1rem' : 0 }}>
            <button onClick={() => setOpen(p => !p)} style={{
                display:'flex', alignItems:'center', width:'100%',
                padding:'0.875rem 0', background:'none', border:'none',
                cursor:'pointer', gap:'0.5rem'
            }}>
                <span style={{ flex:1, fontWeight:800, fontSize:'0.82rem', color:'#0f172a', textTransform:'uppercase', letterSpacing:'.04em' }}>{title}</span>
                {count > 0 && <span style={{ background:'#4f46e5', color:'#fff', borderRadius:999, padding:'1px 7px', fontSize:'0.65rem', fontWeight:800 }}>{count}</span>}
                {open ? <ChevronUp size={14} color="#94a3b8"/> : <ChevronDown size={14} color="#94a3b8"/>}
            </button>
            {open && <div style={{ paddingBottom:'0.5rem' }}>{children}</div>}
        </div>
    );
};

/* Dual-handle price slider */
const PriceSlider = ({ min, max, value, onChange }) => {
    const [local, setLocal] = useState(value || [min, max]);
    useEffect(() => { setLocal(value || [min, max]); }, [value, min, max]);
    const pct = (v) => Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
    const handleMin = (e) => { const v = Math.min(Number(e.target.value), local[1] - 100); const n = [v, local[1]]; setLocal(n); onChange?.(n); };
    const handleMax = (e) => { const v = Math.max(Number(e.target.value), local[0] + 100); const n = [local[0], v]; setLocal(n); onChange?.(n); };
    return (
        <div style={{ padding:'0.25rem 0 0.5rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', fontWeight:700, color:'#0f172a', marginBottom:'0.875rem' }}>
                <span style={{ background:'#f1f5f9', borderRadius:6, padding:'3px 8px' }}>₹{local[0].toLocaleString('en-IN')}</span>
                <span style={{ background:'#f1f5f9', borderRadius:6, padding:'3px 8px' }}>₹{local[1].toLocaleString('en-IN')}</span>
            </div>
            <div style={{ position:'relative', height:4, background:'#e2e8f0', borderRadius:999, margin:'0.5rem 0 0.75rem' }}>
                <div style={{ position:'absolute', left:`${pct(local[0])}%`, right:`${100 - pct(local[1])}%`, top:0, bottom:0, background:'#4f46e5', borderRadius:999 }}/>
                <input type="range" min={min} max={max} step={100} value={local[0]} onChange={handleMin}
                    style={{ position:'absolute', inset:0, opacity:0, width:'100%', cursor:'pointer', zIndex:2 }}/>
                <input type="range" min={min} max={max} step={100} value={local[1]} onChange={handleMax}
                    style={{ position:'absolute', inset:0, opacity:0, width:'100%', cursor:'pointer', zIndex:1 }}/>
                <div style={{ position:'absolute', left:`${pct(local[0])}%`, top:'50%', transform:'translate(-50%,-50%)', width:16, height:16, background:'#fff', border:'2.5px solid #4f46e5', borderRadius:50, boxShadow:'0 1px 4px rgba(79,70,229,.3)', zIndex:3, pointerEvents:'none' }}/>
                <div style={{ position:'absolute', left:`${pct(local[1])}%`, top:'50%', transform:'translate(-50%,-50%)', width:16, height:16, background:'#fff', border:'2.5px solid #4f46e5', borderRadius:50, boxShadow:'0 1px 4px rgba(79,70,229,.3)', zIndex:3, pointerEvents:'none' }}/>
            </div>
        </div>
    );
};

/* Checkbox/brand group — own component so it can use hooks */
const CheckboxGroup = ({ group, activeFilters, toggle, countMap, brandSearch, setBrandSearch }) => {
    const [showAll, setShowAll] = useState(false);
    const { name, values = [] } = group;
    const isBrand = name.toLowerCase().includes('brand');
    const search = brandSearch[group.id] || '';
    const visible = isBrand ? values.filter(v => v.value.toLowerCase().includes(search.toLowerCase())) : values;
    const showMax = 6;
    const displayed = showAll ? visible : visible.slice(0, showMax);
    const isActive = (val) => activeFilters[name]?.has(val);

    return (
        <FilterSection title={name} count={activeFilters[name]?.size || 0}>
            {isBrand && values.length > 5 && (
                <div style={{ position:'relative', marginBottom:'0.625rem' }}>
                    <Search size={13} style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}/>
                    <input value={search} onChange={e => setBrandSearch(p => ({ ...p, [group.id]: e.target.value }))}
                        placeholder={`Search ${name}...`}
                        style={{ width:'100%', padding:'0.45rem 0.75rem 0.45rem 2rem', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:'0.8rem', color:'#0f172a', background:'#f8fafc', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
                    />
                </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                {displayed.map(v => {
                    const active = isActive(v.value);
                    const cnt = countMap[name.toLowerCase() + '::' + v.value];
                    return (
                        <button key={v.id} onClick={() => toggle(name, v.value)}
                            style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:'0.4rem 0.25rem', borderRadius:6, width:'100%', textAlign:'left' }}
                        >
                            <div style={{ width:16, height:16, borderRadius:4, flexShrink:0, background: active ? '#4f46e5' : '#fff', border: active ? '2px solid #4f46e5' : '2px solid #d1d5db', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                {active && <Check size={10} color="#fff" strokeWidth={3}/>}
                            </div>
                            <span style={{ flex:1, fontSize:'0.83rem', fontWeight: active ? 700 : 500, color: active ? '#0f172a' : '#374151' }}>{v.value}</span>
                            {cnt !== undefined && <span style={{ fontSize:'0.7rem', color:'#94a3b8', fontWeight:600 }}>({cnt})</span>}
                        </button>
                    );
                })}
                {visible.length > showMax && (
                    <button onClick={() => setShowAll(p => !p)}
                        style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.75rem', fontWeight:700, color:'#4f46e5', padding:'0.25rem', textAlign:'left' }}
                    >
                        {showAll ? '− Show less' : `+ ${visible.length - showMax} more`}
                    </button>
                )}
            </div>
        </FilterSection>
    );
};

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const SmartFilterSystem = ({
    onFiltersChange,
    onPriceChange,
    activeFilters = {},
    priceRange,
    categoryId = null,
    showMobileDrawer = false,
    onCloseMobile,
    products = [],
}) => {
    const [filterGroups, setFilterGroups]   = useState([]);
    const [fallbackGroups, setFallbackGroups] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [brandSearch, setBrandSearch]     = useState({});

    const loadFilters = useCallback(async () => {
        setLoading(true);
        try {
            if (categoryId) {
                const r = await axios.get(`${API}/api/catalog/preview/${categoryId}`);
                setFilterGroups(r.data.data?.filters || []);
            } else {
                const r = await axios.get(`${API}/api/catalog/filters`);
                setFilterGroups(r.data.data || []);
            }
        } catch { /* silent */ }
        try {
            const r = await axios.get(`${API}/api/catalog/filters`);
            setFallbackGroups(r.data.data || []);
        } catch { setFallbackGroups([]); }
        setLoading(false);
    }, [categoryId]);

    useEffect(() => { loadFilters(); }, [loadFilters]);

    const resolvedGroups = useMemo(() => {
        const g = filterGroups.length > 0 ? filterGroups : fallbackGroups;
        return g.filter(x => x.is_enabled !== 0);
    }, [filterGroups, fallbackGroups]);

    const countMap = useMemo(() => {
        const m = {};
        products.forEach(p => {
            ['brand','color','material','condition'].forEach(f => {
                if (p[f]) { const k = `${f}::${p[f]}`; m[k] = (m[k] || 0) + 1; }
            });
        });
        return m;
    }, [products]);

    const minPrice = useMemo(() => Math.min(...products.map(p => Number(p.price)||0), 0), [products]);
    const maxPrice = useMemo(() => Math.max(...products.map(p => Number(p.price)||0), 100000), [products]);

    const PRICE_PRESETS = [
        { label:'Under ₹1,000',       range:[0,1000] },
        { label:'₹1,000 – ₹5,000',    range:[1000,5000] },
        { label:'₹5,000 – ₹15,000',   range:[5000,15000] },
        { label:'₹15,000 – ₹50,000',  range:[15000,50000] },
        { label:'Above ₹50,000',      range:[50000,999999] },
    ];
    const RATING_OPTIONS = [{ value:4 },{ value:3 },{ value:2 }];
    const DEAL_TAGS = ['On Sale','Trending','New Arrivals','Limited Stock'];

    const totalActive = useMemo(() => {
        let n = Object.values(activeFilters).reduce((s,v) => s + (v?.size || 0), 0);
        if (priceRange) n++;
        return n;
    }, [activeFilters, priceRange]);

    const toggle = useCallback((groupName, value) => {
        const current = new Set(activeFilters[groupName] || []);
        if (current.has(value)) current.delete(value); else current.add(value);
        onFiltersChange?.({ ...activeFilters, [groupName]: current });
    }, [activeFilters, onFiltersChange]);

    const isActive = (groupName, value) => activeFilters[groupName]?.has(value);
    const groupCount = (name) => activeFilters[name]?.size || 0;
    const clearAll = () => { onFiltersChange?.({}); onPriceChange?.(null); };

    /* ── Render dynamic group by type ── */
    const renderDynamicGroup = (group) => {
        const { type, name, values = [] } = group;

        if (type === 'range') {
            return (
                <FilterSection key={group.id} title={name} defaultOpen count={priceRange ? 1 : 0}>
                    <PriceSlider min={minPrice} max={maxPrice} value={priceRange || [minPrice, maxPrice]} onChange={onPriceChange}/>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                        {PRICE_PRESETS.map(p => {
                            const active = priceRange && priceRange[0]===p.range[0] && priceRange[1]===p.range[1];
                            return (
                                <button key={p.label} onClick={() => onPriceChange?.(active ? null : p.range)}
                                    style={{ display:'flex', alignItems:'center', gap:8, background: active ? '#eef2ff' : 'none', border: active ? '1.5px solid #818cf8' : '1.5px solid #e2e8f0', borderRadius:8, padding:'0.45rem 0.75rem', cursor:'pointer', fontSize:'0.8rem', fontWeight: active ? 700 : 500, color: active ? '#4338ca' : '#475569', width:'100%' }}
                                >{active && <Check size={12} color="#4338ca"/>}{p.label}</button>
                            );
                        })}
                    </div>
                </FilterSection>
            );
        }

        if (type === 'toggle') {
            return (
                <FilterSection key={group.id} title={name} count={groupCount(name)}>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                        {values.map(v => {
                            const active = isActive(name, v.value);
                            return (
                                <button key={v.id} onClick={() => toggle(name, v.value)}
                                    style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background: active ? '#f0fdf4' : '#f8fafc', border: active ? '1.5px solid #86efac' : '1.5px solid #e2e8f0', borderRadius:8, padding:'0.5rem 0.75rem', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, color: active ? '#15803d' : '#475569', width:'100%' }}
                                >
                                    {v.value}
                                    <div style={{ width:36, height:20, borderRadius:999, background: active ? '#22c55e' : '#e2e8f0', position:'relative', flexShrink:0, transition:'background .2s' }}>
                                        <div style={{ position:'absolute', top:2, left: active ? 'calc(100% - 18px)' : 2, width:16, height:16, background:'#fff', borderRadius:50, boxShadow:'0 1px 3px rgba(0,0,0,.2)', transition:'left .2s' }}/>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </FilterSection>
            );
        }

        if (name.toLowerCase().includes('color') || name.toLowerCase().includes('colour')) {
            return (
                <FilterSection key={group.id} title={name} count={groupCount(name)}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                        {values.map(v => {
                            const hex = getColorHex(v.value);
                            const active = isActive(name, v.value);
                            const isDark = ['black','navy','midnight blue','maroon'].includes(v.value.toLowerCase());
                            return (
                                <button key={v.id} onClick={() => toggle(name, v.value)} title={v.value}
                                    style={{ width:32, height:32, borderRadius:50, background:hex, cursor:'pointer', border: active ? '3px solid #4f46e5' : '2px solid #e2e8f0', boxShadow: active ? '0 0 0 2px #fff, 0 0 0 4px #4f46e5' : 'none', transition:'all .15s', outline:'none', position:'relative' }}
                                >
                                    {active && <Check size={14} color={isDark ? '#fff':'#1e293b'} style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }}/>}
                                </button>
                            );
                        })}
                    </div>
                    {groupCount(name) > 0 && (
                        <div style={{ marginTop:'0.5rem', display:'flex', flexWrap:'wrap', gap:'0.35rem' }}>
                            {[...(activeFilters[name]||[])].map(v => <span key={v} style={{ fontSize:'0.7rem', fontWeight:700, color:'#4338ca', background:'#eef2ff', borderRadius:999, padding:'2px 8px' }}>{v}</span>)}
                        </div>
                    )}
                </FilterSection>
            );
        }

        if (name.toLowerCase().includes('size')) {
            return (
                <FilterSection key={group.id} title={name} count={groupCount(name)}>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                        {values.map(v => {
                            const active = isActive(name, v.value);
                            return (
                                <button key={v.id} onClick={() => toggle(name, v.value)}
                                    style={{ padding:'0.35rem 0.75rem', borderRadius:8, cursor:'pointer', background: active ? '#0f172a' : '#f8fafc', border: active ? '1.5px solid #0f172a' : '1.5px solid #e2e8f0', color: active ? '#fff' : '#475569', fontSize:'0.82rem', fontWeight:700, transition:'all .15s' }}
                                >{v.value}</button>
                            );
                        })}
                    </div>
                </FilterSection>
            );
        }

        /* Default: checkbox (brand / material / condition / radio) */
        return (
            <CheckboxGroup
                key={group.id}
                group={group}
                activeFilters={activeFilters}
                toggle={toggle}
                countMap={countMap}
                brandSearch={brandSearch}
                setBrandSearch={setBrandSearch}
            />
        );
    };

    /* ── Sidebar inner ── */
    const sidebarInnerContent = (
        <div style={{ fontFamily:"'Inter', system-ui, sans-serif" }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <button className="sfs-mobile-close-btn" onClick={onCloseMobile} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:'#0f172a', display:'none' }}>
                        <ChevronRight size={22} strokeWidth={3} />
                    </button>
                    <SlidersHorizontal size={16} color="#4f46e5"/>
                    <span style={{ fontWeight:900, fontSize:'0.95rem', color:'#0f172a' }}>Filters</span>
                    {totalActive > 0 && <span style={{ background:'#4f46e5', color:'#fff', borderRadius:999, padding:'2px 8px', fontSize:'0.68rem', fontWeight:800 }}>{totalActive}</span>}
                </div>
                <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                    <button onClick={loadFilters} title="Refresh" style={{ background:'none', border:'none', cursor:'pointer', padding:4, color:'#94a3b8', display:'flex' }}><RefreshCw size={13}/></button>
                    {totalActive > 0 && <button onClick={clearAll} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'0.72rem', fontWeight:800, color:'#ef4444', padding:'2px 6px' }}>Clear all</button>}
                </div>
            </div>

            {loading ? (
                <div style={{ padding:'2rem', textAlign:'center', color:'#94a3b8' }}>
                    <RefreshCw size={20} style={{ animation:'sfs-spin 1s linear infinite', display:'block', margin:'0 auto' }}/>
                    <p style={{ fontSize:'0.8rem', marginTop:'0.5rem' }}>Loading filters…</p>
                </div>
            ) : (
                <>
                    {resolvedGroups.map(g => renderDynamicGroup(g))}

                    {/* Static: Rating — only if no rating group in dynamic filters */}
                    {!resolvedGroups.find(g => g.name?.toLowerCase().includes('rating')) && (
                        <FilterSection title="Rating" count={groupCount('Rating')}>
                            <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                                {RATING_OPTIONS.map(opt => {
                                    const active = isActive('Rating', String(opt.value));
                                    return (
                                        <button key={opt.value} onClick={() => toggle('Rating', String(opt.value))}
                                            style={{ display:'flex', alignItems:'center', gap:8, background: active ? '#fffbeb':'none', border:'none', cursor:'pointer', borderRadius:8, padding:'0.5rem', width:'100%' }}
                                        >
                                            <div style={{ width:16, height:16, borderRadius:4, flexShrink:0, background: active ? '#4f46e5':'#fff', border: active ? '2px solid #4f46e5':'2px solid #d1d5db', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                                {active && <Check size={10} color="#fff" strokeWidth={3}/>}
                                            </div>
                                            <RatingStars value={opt.value} size={13}/>
                                            <span style={{ fontSize:'0.78rem', color:'#475569', fontWeight:600 }}>& above</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </FilterSection>
                    )}

                    {/* Static: Deals — only if no deals group in dynamic filters */}
                    {!resolvedGroups.find(g => g.name?.toLowerCase().includes('deal')) && (
                        <FilterSection title="Deals & Offers" count={groupCount('Deals')}>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                                {DEAL_TAGS.map(tag => {
                                    const active = isActive('Deals', tag);
                                    return (
                                        <button key={tag} onClick={() => toggle('Deals', tag)}
                                            style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'0.35rem 0.75rem', borderRadius:999, cursor:'pointer', background: active ? '#0f172a':'#f1f5f9', border: active ? '1.5px solid #0f172a':'1.5px solid #e2e8f0', color: active ? '#fff':'#475569', fontSize:'0.76rem', fontWeight:700, transition:'all .15s' }}
                                        >
                                            {tag === 'On Sale' && <Tag size={11}/>}
                                            {tag === 'Trending' && <Sparkles size={11}/>}
                                            {tag}
                                        </button>
                                    );
                                })}
                            </div>
                        </FilterSection>
                    )}

                    {/* Price range — shown if no range-type dynamic filter */}
                    {!resolvedGroups.find(g => g.type === 'range') && (
                        <FilterSection title="Price Range" count={priceRange ? 1 : 0}>
                            <PriceSlider min={minPrice} max={maxPrice} value={priceRange || [minPrice, maxPrice]} onChange={onPriceChange}/>
                            <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
                                {PRICE_PRESETS.map(p => {
                                    const active = priceRange && priceRange[0]===p.range[0] && priceRange[1]===p.range[1];
                                    return (
                                        <button key={p.label} onClick={() => onPriceChange?.(active ? null : p.range)}
                                            style={{ display:'flex', alignItems:'center', gap:8, background: active ? '#eef2ff':'none', border: active ? '1.5px solid #818cf8':'1.5px solid #e2e8f0', borderRadius:8, padding:'0.45rem 0.75rem', cursor:'pointer', fontSize:'0.8rem', fontWeight: active ? 700:500, color: active ? '#4338ca':'#475569', width:'100%' }}
                                        >{active && <Check size={12} color="#4338ca"/>}{p.label}</button>
                                    );
                                })}
                            </div>
                        </FilterSection>
                    )}
                </>
            )}
        </div>
    );

    return (
        <>
            <style>{`
                @keyframes sfs-spin { to { transform: rotate(360deg); } }
                @keyframes sfs-fadeIn { from{opacity:0} to{opacity:1} }
                @media (max-width: 768px) {
                    .sfs-mobile-close-btn { display: flex !important; margin-right: 0.5rem; }
                }
            `}</style>

            {/* Desktop sticky sidebar */}
            <aside className="sfs-desktop-sidebar" style={{
                width:260, flexShrink:0, position:'sticky', top:90, alignSelf:'flex-start',
                maxHeight:'calc(100vh - 110px)', overflowY:'auto', paddingRight:'0.5rem',
                scrollbarWidth:'thin'
            }}>
                {sidebarInnerContent}
            </aside>

            {/* Mobile backdrop */}
            {showMobileDrawer && (
                <div onClick={onCloseMobile} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:1000, backdropFilter:'blur(2px)', animation:'sfs-fadeIn .2s' }}/>
            )}
            {/* Mobile drawer */}
            <div style={{
                position:'fixed', top:'var(--nav-top-h, 150px)', left:0, bottom:0, width:'70vw', maxWidth:'280px',
                background:'#fff', zIndex:1001, overflowY:'auto', padding:'1rem 1.25rem 5rem',
                transform: showMobileDrawer ? 'translateX(0)' : 'translateX(-100%)',
                transition:'transform .3s cubic-bezier(.4,0,.2,1)',
                boxShadow:'4px 0 24px rgba(0,0,0,0.1)'
            }}>
                {sidebarInnerContent}
            </div>
        </>
    );
};

export default SmartFilterSystem;
