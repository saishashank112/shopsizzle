import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import './Transactions.css';

const Transactions = () => {
    const { isAdmin } = useAuth();
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        // Dummy Data simulation
        const dummy = [
            { id: 'TXN12345', user: 'naga', amount: 2499, status: 'SUCCESS', method: 'UPI', date: '3/18/2026' },
            { id: 'TXN12346', user: 'naga', amount: 999, status: 'FAILED', method: 'Card', date: '3/19/2026' },
            { id: 'TXN12347', user: 'shashank', amount: 5200, status: 'REFUNDED', method: 'UPI', date: '3/20/2026' },
            { id: 'TXN12348', user: 'naga', amount: 15400, status: 'SUCCESS', method: 'COD', date: '3/21/2026' }
        ];
        setTransactions(dummy);
    }, []);

    const StatusBadge = ({ status }) => {
        const maps = {
            'SUCCESS': { icon: CheckCircle, className: 'success' },
            'FAILED': { icon: XCircle, className: 'danger' },
            'REFUNDED': { icon: AlertCircle, className: 'warning' }
        };
        const active = maps[status] || { icon: AlertCircle, className: 'other' };
        return (
            <span className={`txn-badge ${active.className}`}>
                <active.icon size={12}/> {status}
            </span>
        );
    };

    return (
        <div className="container txn-root">
            <div className="welcome-header">
                <h1>{isAdmin ? 'Global Ledger' : 'My Spendings'}</h1>
                <p>{isAdmin ? 'Reconcile transaction registries here.' : 'Archived electronic receipts of past acquisitions.'}</p>
            </div>

            <table className="luxe-table">
                <thead>
                    <tr>
                        <th>TXN ID</th>
                        {isAdmin && <th>COLLECTOR</th>}
                        <th>AMOUNT (₹)</th>
                        <th>GATEWAY</th>
                        <th>STATUS</th>
                        <th>TEMPORAL FLOW</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(t => (
                        <tr key={t.id}>
                            <td><div style={{fontWeight: 800}}>#{t.id}</div></td>
                            {isAdmin && <td>{t.user}</td>}
                            <td>₹{t.amount.toLocaleString()}</td>
                            <td>{t.method}</td>
                            <td><StatusBadge status={t.status} /></td>
                            <td>{t.date}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Transactions;
