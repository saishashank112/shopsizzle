import React from 'react';
import { Link } from 'react-router-dom';
import {
    Instagram,
    Twitter,
    Linkedin,
    Facebook,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    Sparkles,
    PenTool,
    CheckCircle2
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="ss-footer-root">
            <div className="container">

                {/* 🚀 LAYER 1: BRAND HUB */}
                <div className="footer-top-grid">

                    <div className="footer-brand">
                        <h2 className="serif">Shopsizzle Universe.</h2>
                        <p>Discovering, preserving, and curating the world's most distinct artifacts for a high-velocity global elite. From Swiss horology to heritage silks.</p>
                        <div className="flex-row gap-2" style={{ color: 'var(--accent-gold)' }}>
                            <ShieldCheck size={18} /> <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>VERIFIED ATELIER 2026</span>
                        </div>
                    </div>



                    <div className="footer-col">
                        <h6 className="footer-col-title">The Inner Circle</h6>
                        <ul className="footer-links">
                            <li className="footer-link"><Link to="/about">Our Philosophy</Link></li>
                            <li className="footer-link"><Link to="/contact">Conciege Desk</Link></li>
                            <li className="footer-link"><Link to="/register">Apply for Membership</Link></li>
                            <li className="footer-link"><Link to="/terms">Provenance Ledger</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h6 className="footer-col-title">Global Presence</h6>
                        <div className="footer-contact-item">
                            <MapPin size={18} />
                            <span>Atelier HQ<br />Universe Way, Silk Road, 2026</span>
                        </div>
                        <div className="footer-contact-item">
                            <Mail size={18} />
                            <span>concierge@shopsizzle.com</span>
                        </div>
                        <div className="footer-contact-item">
                            <Phone size={18} />
                            <span>+91 80000 12345 (Priority Only)</span>
                        </div>
                    </div>

                </div>

                {/* 🚀 LAYER 2: SYSTEM BAND */}
                <div className="footer-bottom-luxe">


                    <div className="footer-socials">
                        <a href="#" className="footer-social-link"><Instagram size={20} /></a>
                        <a href="#" className="footer-social-link"><Twitter size={20} /></a>
                        <a href="#" className="footer-social-link"><Linkedin size={20} /></a>
                        <a href="#" className="footer-social-link"><Facebook size={20} /></a>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', opacity: 0.05 }}>
                    <Sparkles size={300} strokeWidth={0.5} color="var(--accent-gold)" />
                </div>
            </div>
        </footer>
    );
};

export default Footer;
