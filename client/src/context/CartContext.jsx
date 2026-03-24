import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const fetchCart = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        // Map backend shape to frontend context shape
        const items = res.data.data.map(item => ({
          cart_id: item.id,
          id: item.product_id,
          name: item.name,
          price: item.price,
          old_price: item.old_price,
          image_url: item.image_url,
          category: item.category,
          brand: item.brand,
          quantity: item.quantity
        }));
        setCartItems(items);
        localStorage.setItem('cart', JSON.stringify(items));
      }
    } catch (err) {
      console.error('Failed to sync cart', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token, fetchCart]);

  useEffect(() => {
    if (!token) {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  }, [token]);

  const addToCart = async (product, quantity = 1) => {
    if (token) {
      try {
        await axios.post('http://localhost:5000/api/cart/add', {
           product_id: product.id,
           quantity
        }, {
           headers: { Authorization: `Bearer ${token}` }
        });
        await fetchCart();
      } catch (e) {
        console.error('Add to cart failed', e);
      }
    } else {
      // Guest adds are disabled per requirement
      alert('Please login to add to selection.');
    }
  };

  const removeFromCart = async (id, cart_id) => {
    if (token && cart_id) {
      try {
        await axios.delete(`http://localhost:5000/api/cart/remove/${cart_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchCart();
      } catch (e) {
        console.error('Remove from cart failed', e);
      }
    } else {
      setCartItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const updateQuantity = async (id, cart_id, quantity) => {
    const qty = Math.max(1, quantity);
    if (token && cart_id) {
      try {
        await axios.patch(`http://localhost:5000/api/cart/${cart_id}`, { quantity: qty }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchCart();
      } catch (e) {
        console.error('Update quantity failed', e);
      }
    } else {
      setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
    }
  };

  const clearCart = async () => {
    if (token) {
       try {
         await axios.delete('http://localhost:5000/api/cart/clear', {
           headers: { Authorization: `Bearer ${token}` }
         });
         setCartItems([]);
       } catch (e) {
         console.error('Clear cart failed', e);
       }
    } else {
       setCartItems([]);
    }
  };

  const total = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) || 0) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
