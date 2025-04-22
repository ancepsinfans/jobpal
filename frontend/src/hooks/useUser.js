import { useState, useEffect } from 'react';
import { fetchWithAuth, API_BASE_URL } from '../utils/auth';

export const useUser = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetchWithAuth(`${API_BASE_URL}/api/auth/me`);
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    setError('Failed to fetch user data');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, loading, error };
}; 