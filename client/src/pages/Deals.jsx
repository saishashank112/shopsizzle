import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import './Deals.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Deals = () => {
    const { isAdmin } = useAuth();

    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchDeals = async () => {
            try {
                setLoading(true);

                const res = await axios.get(`${API}/api/products`, {
                    signal: controller.signal,
                });

                const products = res?.data?.data ?? [];

                // More defensive + flexible logic
                const discounted = products.filter(
                    (p) => Number(p?.discount) > 0
                );

                setDeals(discounted);
            } catch (err) {
                if (err.name !== 'CanceledError') {
                    console.error('Deals fetch failed:', err);
                    setError('Failed to load deals');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDeals();

        return () => controller.abort();
    }, []);

    return (
        <div className="deals-root-futuristic deals-dark-theme-active">
            <div className="deals-hero-glitch">
                <div className="hero-noise-overlay" />
                <div className="hero-content-stage">
                    <h1
                        className="glitch-title"
                        data-text="CYBER REDUCTIONS"
                    >
                        DEALS OF THE DAY
                    </h1>
                </div>
            </div>

            <div className="deals-container">

                {loading && (
                    <div className="deals-loading-stage">
                        <div className="scanning-line" />
                        <p>DECRYPTING EXCLUSIVE MARKDOWNS...</p>
                    </div>
                )}

                {error && (
                    <div className="no-deals-void">
                        <Flame size={32} className="void-icon" />
                        <h3>SYSTEM FAILURE</h3>
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <div className="cinematic-grid">
                        {deals.length > 0 ? (
                            deals.map((d, i) => (
                                <ProductCard
                                    key={d.id || i}
                                    product={d}
                                    index={i}
                                />
                            ))
                        ) : (
                            <div className="no-deals-void">
                                <Flame size={32} className="void-icon" />
                                <h3>NO ACTIVE SIGNALS</h3>
                                <p>
                                    Deep space scan returned 0 discounts.
                                    Return for next cycle.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Deals;