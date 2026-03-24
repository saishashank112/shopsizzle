import { useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const useTracking = () => {
    const location = useLocation();

    const track = useCallback(async (action, entity_id = null, metadata = {}) => {
        try {
            const session_id = localStorage.getItem('session_id') || Math.random().toString(36).substring(7);
            localStorage.setItem('session_id', session_id);
            
            const token = (sessionStorage.getItem('token') || localStorage.getItem('token'));
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            await axios.post('http://localhost:5000/api/tracking/activity', {
                action,
                entity_id,
                session_id,
                metadata: {
                    ...metadata,
                    path: window.location.pathname,
                    referrer: document.referrer,
                    timestamp: new Date().toISOString()
                }
            }, { headers });
        } catch (err) {
            console.error("Tracking error:", err);
            // Silently fail for tracking
        }
    }, []);

    useEffect(() => {
        track('page_view', null, { path: location.pathname });
    }, [location.pathname, track]);

    return { track };
};

export default useTracking;
