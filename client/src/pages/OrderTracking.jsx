import React from 'react';
import { CheckCircle, Truck, Package, PackageOpen } from 'lucide-react';
import './OrderTracking.css';

const OrderTracking = () => {
    const steps = [
        { label: 'Ordered', status: 'completed', icon: CheckCircle, date: 'Mar 18' },
        { label: 'Packed', status: 'completed', icon: Package, date: 'Mar 19' },
        { label: 'Shipped', status: 'completed', icon: Truck, date: 'Mar 20' },
        { label: 'Out for Delivery', status: 'active', icon: PackageOpen, date: 'Today' },
        { label: 'Delivered', status: 'pending', icon: CheckCircle, date: 'Expected tomorrow' }
    ];

    return (
        <div className="container tracking-root">
            <div className="welcome-header">
                <h1>Tracking Order #12345</h1>
                <p>Arrival expected by <strong>Tuesday, Mar 24</strong>.</p>
            </div>

            <div className="timeline-container">
                {steps.map((s, idx) => (
                    <div key={idx} className={`timeline-step ${s.status}`}>
                        <div className="timeline-icon">
                            <s.icon size={18} />
                        </div>
                        <div className="timeline-content">
                            <h4 className="timeline-label">{s.label}</h4>
                            <span className="timeline-date">{s.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderTracking;
