import React from 'react';
import { motion } from 'framer-motion';
import { 
    Smartphone, 
    Watch, 
    Zap, 
    Gamepad2, 
    Shirt, 
    Utensils, 
    Compass, 
    Sparkles, 
    ChevronRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './CategoryIconStrip.css';

const CategoryIconStrip = () => {
    const categories = [
        { name: 'Mobiles', icon: <Smartphone size={24} />, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', path: '/catalog?cat=electronics' },
        { name: 'Watches', icon: <Watch size={24} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', path: '/catalog?cat=watches' },
        { name: 'Fashion', icon: <Shirt size={24} />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)', path: '/catalog?cat=fashion' },
        { name: 'Deals', icon: <Zap size={24} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', path: '/deals' },
        { name: 'Gaming', icon: <Gamepad2 size={24} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', path: '/catalog?cat=gaming' },
        { name: 'Grocery', icon: <Utensils size={24} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', path: '/catalog?cat=home' },
        { name: 'Travel', icon: <Compass size={24} />, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', path: '/catalog?cat=travel' },
        { name: 'New Arrv', icon: <Sparkles size={24} />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', path: '/catalog?sort=newest' },
    ];

    return (
        <div className="category-strip-container">
            <div className="category-strip-scroll">
                {categories.map((cat, i) => (
                    <motion.div 
                        key={cat.name}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        className="cat-strip-item-wrapper"
                    >
                        <Link to={cat.path} className="cat-strip-item">
                            <div className="cat-icon-box" style={{ backgroundColor: cat.bg, color: cat.color }}>
                                {cat.icon}
                            </div>
                            <span className="cat-name-label">{cat.name}</span>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default CategoryIconStrip;
