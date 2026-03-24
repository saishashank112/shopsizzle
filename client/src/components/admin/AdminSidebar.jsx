import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard, ClipboardList, Truck, Package, Archive, Users, Ticket,
    RotateCcw, MessageSquare, Settings as SettingsIcon, LogOut, LayoutGrid, Bell
} from 'lucide-react';

import { X } from 'lucide-react';

const navSchema = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'orders', label: 'Orders', icon: ClipboardList, path: '/admin/orders' },
    { id: 'delivery', label: 'Delivery', icon: Truck, path: '/admin/delivery' },
    { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
    { id: 'inventory', label: 'Inventory', icon: Archive, path: '/admin/inventory' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/admin/customers' },
    { id: 'catalog', label: 'Catalog Config', icon: LayoutGrid, path: '/admin/catalog' },
    { id: 'coupons', label: 'Coupons', icon: Ticket, path: '/admin/coupons' },
    { id: 'returns', label: 'Returns', icon: RotateCcw, path: '/admin/returns' },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare, path: '/admin/reviews' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/admin/notifications' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/admin/settings' },
];

const AdminSidebar = ({ logout, isOpen, onClose }) => {
    return (
        <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>

            {/* TOP */}
            <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/logo.png" alt="ShopSizzle" style={{ height: '85px', width: 'auto' }} /><span style={{ fontSize: '20px', fontWeight: 'bold', marginLeft: '10px', fontFamily: '"Times New Roman", Times, serif' }}>Admin</span>
                <button className="sidebar-close-btn" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            {/* MIDDLE */}
            <nav className="sidebar-nav">
                {navSchema.map(item => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        onClick={onClose}
                    >
                        <item.icon size={18} strokeWidth={2} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* BOTTOM */}
            <div className="sidebar-footer">
                <div className="nav-item logout" onClick={logout}>
                    <LogOut size={18} strokeWidth={2} />
                    <span>Logout</span>
                </div>
            </div>

        </aside>
    );
};

export default AdminSidebar;
