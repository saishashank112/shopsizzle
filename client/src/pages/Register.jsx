import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
    User, 
    Mail, 
    Lock, 
    ArrowRight, 
    ShieldCheck, 
    Sparkles, 
    AlertCircle,
    Zap,
    CheckCircle2
} from 'lucide-react';
import './Login.css'; // Reusing premium login styles

const Register = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            await signup(formData.name, formData.email, formData.password);
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Membership application failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-minimal-root">
            
            {/* Visual Context (Left/Background) */}
            <div className="login-visual-stage">
                <div className="luxury-overlay"></div>
                <img 
                    src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070" 
                    alt="Luxury Retail" 
                    className="visual-bg-img"
                />
                
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="visual-content-box"
                >
                    <div className="brand-logo-white">
                        <Zap size={28} fill="white" />
                        <span>Universe Registry</span>
                    </div>
                    <h1>Create Your Absolute Identity.</h1>
                    <p>Join the inner circle of prestige curators and collectors. Access bespoke artifacts and curated textile legacies.</p>
                </motion.div>
            </div>

            {/* Form Stage (Right) */}
            <div className="login-form-stage">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="form-container-glass"
                >
                    <div className="form-head">
                        <ShieldCheck size={32} color="var(--primary)" />
                        <h2>Curator Registry</h2>
                        <p>Begin your legacy with Shopsizzle Premiere.</p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="error-pill-luxury"
                            >
                                <AlertCircle size={16} /> {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="success-pill-luxury"
                            >
                                <CheckCircle2 size={16} /> Registry Confirmed. Entering Atelier...
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="auth-form-luxury">
                        <div className="input-group-luxury">
                            <label><User size={14}/> Full Designation</label>
                            <input 
                                type="text"
                                placeholder="E.g. Alexander Sterling"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>

                        <div className="input-group-luxury">
                            <label><Mail size={14}/> Communication Channel</label>
                            <input 
                                type="email"
                                placeholder="vanguard@elite.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>

                        <div className="input-group-luxury">
                            <label><Lock size={14}/> Security Credential</label>
                            <input 
                                type="password"
                                placeholder="••••••••"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className={`btn-auth-master ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing Registry...' : (
                                <>Apply for Membership <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="form-foot">
                        <p>Already a registered member? <Link to="/login">Sign In</Link></p>
                    </div>

                    <div className="trust-badges-mini">
                        <div className="trust-item"><Sparkles size={12}/> Curated drops</div>
                        <div className="trust-item"><Sparkles size={12}/> Early Access</div>
                        <div className="trust-item"><Sparkles size={12}/> Secure Vault</div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
