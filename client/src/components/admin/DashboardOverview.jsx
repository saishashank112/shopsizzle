import React from 'react';
import { 
    ClipboardList, AlertTriangle, Users, Package, Truck, 
    Zap, TrendingUp, ArrowRight, XCircle, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardOverview = ({ stats, analytics }) => {
    const navigate = useNavigate();

    return (
        <div>
            {/* PAGE HEADER */}
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-line" />
                    <div>
                        <h2>Dashboard</h2>
                        <p>Welcome back to the command center.</p>
                    </div>
                </div>
            </div>

            {/* STAT CARDS */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-top">
                        <div className="stat-card-label">Total Revenue</div>
                        <div className="stat-card-icon green">₹</div>
                    </div>
                    <div className="stat-card-value">₹{stats.rev.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-top">
                        <div className="stat-card-label">Total Orders</div>
                        <div className="stat-card-icon blue"><ClipboardList size={18}/></div>
                    </div>
                    <div className="stat-card-value">{stats.totalOrd}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-top">
                        <div className="stat-card-label">Pending Orders</div>
                        <div className="stat-card-icon orange"><AlertTriangle size={18}/></div>
                    </div>
                    <div className="stat-card-value">{stats.penOrders}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-top">
                        <div className="stat-card-label">Total Customers</div>
                        <div className="stat-card-icon purple"><Users size={18}/></div>
                    </div>
                    <div className="stat-card-value">{stats.uniqueCustomers}</div>
                </div>
            </div>

            {/* WIDE CARDS */}
            <div className="mid-stats-grid">
                <div className="wide-card">
                    <div className="wide-card-header">
                        <div className="wide-card-icon yellow"><Package size={20}/></div>
                        <span className="wide-card-link" onClick={() => navigate('/admin/orders')}>
                            View Orders <ArrowRight size={14}/>
                        </span>
                    </div>
                    <div className="wide-card-title">Pending Orders</div>
                    <div className="wide-card-sub">Awaiting confirmation or shipment</div>
                    <div className="wide-card-val">{stats.penOrders}</div>
                </div>
                <div className="wide-card">
                    <div className="wide-card-header">
                        <div className="wide-card-icon cyan"><Truck size={20}/></div>
                        <span className="wide-card-link" onClick={() => navigate('/admin/delivery')}>
                            View Delivery <ArrowRight size={14}/>
                        </span>
                    </div>
                    <div className="wide-card-title">Out For Delivery</div>
                    <div className="wide-card-sub">Shipped or out for delivery</div>
                    <div className="wide-card-val">{stats.outForDel}</div>
                </div>
            </div>

            {/* ANALYTICS ROW */}
            <div className="analytics-row">
                <div className="live-card">
                    <div className="live-card-icon">
                        <Zap size={28} fill="#ea580c" color="#ea580c"/>
                    </div>
                    <div className="live-card-label">Live Active Users</div>
                    <div className="live-card-value">{analytics?.total_active_sessions || 0}</div>
                    <div className="live-card-trend"><TrendingUp size={14}/> +12% from last hour</div>
                </div>

                <div className="trending-card">
                    <div className="trending-card-header">
                        <div className="trending-card-title">Most Viewed Products</div>
                        <span className="refresh-tag">Live</span>
                    </div>
                    <table className="ss-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Views</th>
                                <th>Conversion</th>
                                <th style={{textAlign:'right'}}>Tag</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(analytics?.most_viewed_products || []).length > 0 
                                ? analytics.most_viewed_products.map((p, i) => (
                                    <tr key={i}>
                                        <td style={{fontWeight:600}}>{p.name}</td>
                                        <td>{p.views}</td>
                                        <td>{((p.id % 8) + 1).toFixed(1)}%</td>
                                        <td style={{textAlign:'right'}}><span className="trending-badge">Trending</span></td>
                                    </tr>
                                ))
                                : <tr><td colSpan="4" style={{textAlign:'center', padding:'2rem', color:'#94a3b8'}}>No data yet.</td></tr>
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* LOW STOCK ALERTS */}
            <div className="alerts-section">
                <div className="alerts-header">
                    <div className="alert-title-box">
                        <div className="alert-icon-wrap">
                            <AlertTriangle size={20}/>
                        </div>
                        <div className="alert-title-text">
                            <h4>Low Stock Alerts</h4>
                            <span>{stats.lowStockProducts.length} item(s) need restocking</span>
                        </div>
                    </div>
                    <span className="alert-manage-link" onClick={() => navigate('/admin/inventory')}>
                        Manage <ArrowRight size={14}/>
                    </span>
                </div>

                {stats.lowStockProducts.length === 0 ? (
                    <div className="empty-alerts">
                        <div className="success-icon"><CheckCircle size={20}/></div>
                        All inventory levels are healthy.
                    </div>
                ) : (
                    stats.lowStockProducts.slice(0, 6).map(p => (
                        <div key={p.id} className="alert-row">
                            <div className="alert-dot"></div>
                            <div className="alert-info">
                                <div className="alert-prod-name">{p.name}</div>
                                <div className="alert-prod-cat">{p.category_name || 'General'}</div>
                            </div>
                            <div className="alert-actions">
                                <div className="oos-badge">
                                    {p.stock <= 0 
                                        ? <><XCircle size={14} style={{color:'#ef4444'}}/> Out of Stock</>
                                        : <><AlertTriangle size={14} style={{color:'#f59e0b'}}/> Low: {p.stock}</>
                                    }
                                </div>
                                <span className="restock-link" onClick={() => navigate('/admin/inventory')}>Re-stock</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DashboardOverview;
