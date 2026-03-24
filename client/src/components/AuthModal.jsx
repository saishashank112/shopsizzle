import React, { useState } from 'react';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { X } from 'lucide-react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
    const [tab, setTab] = useState('login'); // 'login' or 'register'

    if (!isOpen) return null;

    return (
        <div className="auth-modal-overlay" onClick={onClose}>
            <div className="auth-modal-content" onClick={e => e.stopPropagation()}>
                <button className="auth-modal-close" onClick={onClose}><X size={20}/></button>
                
                <div className="auth-modal-tabs">
                    <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>Sign In</button>
                    <button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')}>Join Vault</button>
                </div>

                <div className="auth-modal-body">
                    {tab === 'login' ? <Login embed={true} onSuccess={onClose} /> : <Register embed={true} onSuccess={() => setTab('login')} />}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
