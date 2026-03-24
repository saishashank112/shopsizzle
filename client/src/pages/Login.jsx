import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const { login, signup, user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    React.useEffect(() => {
        if (user) {
            navigate(user.role === 'admin' ? '/admin' : '/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg(null);
        try {
            if (isRegistering) {
                await signup(name, email, password);
                navigate('/dashboard');
            } else {
                const res = await login(email, password);
                if (res.data.user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Authentication failed. Check credentials.';
            setErrorMsg(msg);
            
            // Smart UX: Auto-switch to login if email is already registered
            if (isRegistering && msg.toLowerCase().includes('registered')) {
                setTimeout(() => {
                    setIsRegistering(false);
                    setErrorMsg('Please sign in to your existing account.');
                }, 2500);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-layout">
            <div className="bg-shape-1" />
            <div className="bg-shape-2" />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="login-card"
            >
                <div className="login-header">
                    <h1>{isRegistering ? 'Join the Atelier' : 'Welcome Back'}</h1>
                    <p>{isRegistering ? 'Curate your aesthetic profile' : 'Access your curated collections'}</p>
                </div>

                {errorMsg && (
                    <motion.div 
                        initial={{ opacity:0, x:-10 }}
                        animate={{ opacity:1, x:0 }}
                        className="auth-error-alert" 
                        style={{ background:'#fef2f2', border:'1px solid #fee2e2', color:'#b91c1c', padding:'0.75rem', borderRadius:10, fontSize:'0.85rem', marginBottom:'1.5rem', fontWeight:600, textAlign:'center' }}
                    >
                        {errorMsg}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    {isRegistering && (
                        <div className="input-group">
                            <input 
                                type="text" 
                                required
                                className="styled-input" 
                                placeholder="Full Name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <User className="input-icon" size={18} />
                        </div>
                    )}
                    <div className="input-group">
                        <input 
                            type="email" 
                            required
                            className="styled-input" 
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Mail className="input-icon" size={18} />
                    </div>
                    <div className="input-group">
                        <input 
                            type="password" 
                            required
                            className="styled-input" 
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Lock className="input-icon" size={18} />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="btn-primary login-btn"
                    >
                        {isLoading ? 'Authenticating...' : (isRegistering ? 'Register' : 'Sign In')} 
                        <ArrowRight size={18} style={{marginLeft: '0.5rem'}} />
                    </button>

                    <div style={{textAlign: 'center', marginTop: '2rem'}}>
                        <Link to="/" style={{color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                            <span>← Back to Website</span>
                        </Link>
                    </div>
                </form>

                <div className="login-footer">
                    <button 
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="toggle-mode"
                    >
                        {isRegistering ? 'Already a member? Sign in' : "Don't have an account? Join us"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
