import React, { useMemo } from 'react';
import { Users } from 'lucide-react';

const CustomerManagement = ({ orders }) => {
    const customers = useMemo(() => {
        const map = {};
        orders.forEach(o => {
            if (!map[o.user_id]) {
                map[o.user_id] = {
                    id: o.user_id,
                    name: o.customer_name || 'Unknown',
                    email: o.customer_email || '—',
                    orders: 0,
                    total: 0,
                };
            }
            map[o.user_id].orders += 1;
            map[o.user_id].total += Number(o.total_amount || 0);
        });
        return Object.values(map).sort((a, b) => b.total - a.total);
    }, [orders]);

    return (
        <div>
            {/* PAGE HEADER */}
            <div className="page-header">
                <div className="page-header-title">
                    <div className="page-header-line" />
                    <div>
                        <h2>Customers</h2>
                        <p>View and manage all your registered buyers.</p>
                    </div>
                </div>
            </div>

            <div className="table-card">
                <div className="table-card-header">
                    <div>

                        <p>{customers.length} unique buyers from all orders</p>
                    </div>
                </div>
                <table className="ss-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Customer</th>
                            <th>Orders</th>
                            <th>Total Spent</th>
                            <th>Tier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.length === 0 && (
                            <tr><td colSpan="5">
                                <div className="empty-state">
                                    <div className="empty-state-icon"><Users size={40} /></div>
                                    <h3>No Customers Yet</h3>
                                    <p>Customers will appear as orders come in.</p>
                                </div>
                            </td></tr>
                        )}
                        {customers.map((c, i) => (
                            <tr key={c.id}>
                                <td style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.82rem' }}>{i + 1}</td>
                                <td>
                                    <div className="customer-cell">
                                        <div className="customer-avatar">{c.name.charAt(0).toUpperCase()}</div>
                                        <div>
                                            <div className="customer-name">{c.name}</div>
                                            <div className="customer-email">{c.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontWeight: 700 }}>{c.orders}</td>
                                <td style={{ fontWeight: 800, color: '#0f172a' }}>₹{c.total.toLocaleString('en-IN')}</td>
                                <td>
                                    <span className={`tier-badge ${c.total >= 5000 ? 'platinum' : 'standard'}`}>
                                        {c.total >= 5000 ? 'Platinum' : 'Standard'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerManagement;
