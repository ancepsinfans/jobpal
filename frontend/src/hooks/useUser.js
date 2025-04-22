import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/auth';

export const useUser = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetchWithAuth('http://localhost:7315/api/auth/me');
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