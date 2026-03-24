import React from 'react';
import './Pages.css';

const About = () => {
    return (
        <div className="dense-about">
            {/* Minimal High-Density Hero */}
            <header className="about-hero container">
                <div style={{fontSize: '0.65rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1rem', fontWeight: 700}}>The Standard</div>
                <h1>Artifacts Rooted In Time. Engineered For Tomorrow.</h1>
                <p>ShopSizzle is not an ecommerce platform. It is a highly curated acquisition ledger. We eliminate the noise of modern capitalism, restoring dignity and intent to the pieces you choose to possess.</p>
            </header>

            {/* Horizontal Timeline Strip */}
            <section className="timeline-strip-section">
                <div className="ts-track">
                    <div className="ts-node">
                        <div className="ts-year">PHASE 01 / 2018</div>
                        <h4 className="ts-title">The First Atelier</h4>
                        <p className="ts-desc">Established our initial artisan guild in Varanasi, securing 10 multi-generational weavers.</p>
                    </div>
                    <div className="ts-node">
                        <div className="ts-year">PHASE 02 / 2021</div>
                        <h4 className="ts-title">Ledger Authenticity</h4>
                        <p className="ts-desc">Pioneered the transparent sourcing ledger, guaranteeing genuine materials without markup.</p>
                    </div>
                    <div className="ts-node">
                        <div className="ts-year">PHASE 03 / 2024</div>
                        <h4 className="ts-title">Precision Horology</h4>
                        <p className="ts-desc">Expanded the portfolio into high-grade titanium and sapphire crystal timepieces.</p>
                    </div>
                    <div className="ts-node">
                        <div className="ts-year">PHASE 04 / 2026</div>
                        <h4 className="ts-title">AI Curation Mode</h4>
                        <p className="ts-desc">Introduced the predictive Personal Style Concierge within the acquisition framework.</p>
                    </div>
                </div>
            </section>

            {/* Visual Story Split */}
            <section className="story-split">
                <div className="story-text">
                    <h2 style={{fontFamily: 'var(--font-hero)', fontSize: '2.5rem', marginBottom: '1.5rem', lineHeight: 1.1}}>We do not subscribe to seasons.</h2>
                    <p style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)', marginBottom: '1.5rem'}}>
                        The concept of seasonal fashion is inherently flawed. A masterpiece constructed of Grade 5 Titanium or 24k Zari Silk does not expire in three months. 
                    </p>
                    <p style={{fontSize: '0.85rem', color: 'var(--on-surface-variant)'}}>
                        We commission pieces that outlive their makers. 
                    </p>
                </div>
                <div className="story-img">
                    <img src="https://images.unsplash.com/photo-1620242277864-70daaa076a08?q=80&w=1000&auto=format&fit=crop" alt="Crafting" />
                </div>
            </section>

            {/* Artisan Spotlight Grid */}
            <section className="spotlight-grid">
                <div className="artisan-card">
                    <div className="artisan-img"><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" alt="Artisan" /></div>
                    <div style={{fontSize: '0.65rem', color: 'var(--primary)', letterSpacing: '0.15em', marginBottom: '0.5rem'}}>LEAD HOROLOGIST</div>
                    <h4 style={{fontFamily: 'var(--font-hero)', fontSize: '1.25rem'}}>Elena Rostova</h4>
                </div>
                <div className="artisan-card">
                    <div className="artisan-img"><img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" alt="Artisan" /></div>
                    <div style={{fontSize: '0.65rem', color: 'var(--primary)', letterSpacing: '0.15em', marginBottom: '0.5rem'}}>MASTER WEAVER</div>
                    <h4 style={{fontFamily: 'var(--font-hero)', fontSize: '1.25rem'}}>Arjun Singh</h4>
                </div>
                <div className="artisan-card">
                    <div className="artisan-img"><img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" alt="Artisan" /></div>
                    <div style={{fontSize: '0.65rem', color: 'var(--primary)', letterSpacing: '0.15em', marginBottom: '0.5rem'}}>LEATHER PROPRIETOR</div>
                    <h4 style={{fontFamily: 'var(--font-hero)', fontSize: '1.25rem'}}>Sofia Rossi</h4>
                </div>
            </section>

        </div>
    );
};

export default About;
