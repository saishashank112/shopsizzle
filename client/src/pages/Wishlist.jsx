import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Pages.css';

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    return (
        <div className="container" style={{paddingTop: '120px', minHeight: '80vh'}}>
            
            <header style={{marginBottom: '3rem', textAlign: 'center'}}>
                <h1 className="serif" style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>Wishlist Vault</h1>
                <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>{wishlistItems.length} curated items preserved for later.</p>
            </header>

            {wishlistItems.length === 0 ? (
                <div style={{textAlign: 'center', padding: '5rem 0', opacity: 0.6}}>
                    <Heart size={48} strokeWidth={1} style={{marginBottom: '1rem', color: 'var(--accent-gold)'}} />
                    <h3 className="serif">Your Vault is Empty</h3>
                    <p style={{marginBottom: '2rem'}}>Begin curating items inside your list.</p>
                    <Link to="/catalog" className="btn-quick-add" style={{background: 'var(--primary-obsidian)', color: 'white', padding: '1rem 2rem', borderRadius: '8px'}}>Explore Artifacts</Link>
                </div>
            ) : (
                <div className="wishlist-grid">
                    {wishlistItems.map(p => (
                        <div key={p.id} className="wishlist-item-card">
                            <div className="wishlist-img-wrap">
                                <img src={p.image_url || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=400&auto=format&fit=crop"} alt={p.name} />
                                <button className="wishlist-remove-btn" onClick={() => removeFromWishlist(p.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="wishlist-info">
                                <span className="artifact-cat">{p.brand || 'Atelier'}</span>
                                <h3 className="serif">{p.name}</h3>
                                <div className="wishlist-price">₹{Number(p.price).toLocaleString()}</div>
                                <button className="wishlist-add-btn" onClick={() => addToCart(p)}>
                                    <ShoppingBag size={14}/> ADD TO BAG
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default Wishlist;
