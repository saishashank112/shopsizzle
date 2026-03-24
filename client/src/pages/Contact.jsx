import React from 'react';
import { MessageSquare, Phone, Mail } from 'lucide-react';
import './Pages.css';

const Contact = () => {
    return (
        <div className="dense-contact">
            {/* Left Brand Panorama */}
            <div className="contact-brand-pane">
                <div className="contact-overlay">
                    <h1>Private Concierge.</h1>
                    <p>Access our dedicated support ledger for bespoke inquiries, authenticity verifications, or styling insights.</p>
                </div>
            </div>

            {/* Right Compact Form */}
            <div className="contact-form-pane">
                <div style={{fontSize: '0.65rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem', fontWeight: 700}}>DIRECT CHANNELS</div>
                
                <div className="c-chips">
                    <div className="c-chip"><Phone size={14} color="var(--primary)"/> +91 800 555 0199</div>
                    <div className="c-chip"><MessageSquare size={14} color="var(--primary)"/> WhatsApp Desk</div>
                    <div className="c-chip"><Mail size={14} color="var(--primary)"/> atelier@shopsizzle.com</div>
                </div>

                <div style={{width: '100%', height: 1, background: 'var(--outline)', marginBottom: '3rem'}}></div>

                <form className="dense-form" onSubmit={(e) => { e.preventDefault(); alert("Concierge notified."); }}>
                    <div className="form-grp">
                        <label>Identity</label>
                        <input type="text" className="d-input" placeholder="Your Name" required />
                    </div>
                    <div className="form-grp">
                        <label>Ledger Email</label>
                        <input type="email" className="d-input" placeholder="email@domain.com" required />
                    </div>
                    <div className="form-grp full">
                        <label>Nature of Inquiry</label>
                        <select className="d-input">
                            <option>Piece Authentication</option>
                            <option>Order Traceability</option>
                            <option>Bespoke Commission</option>
                        </select>
                    </div>
                    <div className="form-grp full">
                        <label>Details</label>
                        <textarea className="d-input d-textarea" placeholder="Provide context for our concierge..." required></textarea>
                    </div>
                    
                    <button type="submit" className="btn-submit">Dispatch Transmission</button>
                    <div style={{gridColumn: '1 / -1', fontSize: '0.65rem', color: 'var(--on-surface-variant)', textAlign: 'center', marginTop: '0.5rem'}}>
                        Current Response Window: ~2 Hours.
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Contact;
