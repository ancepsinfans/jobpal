// Function to check if token is expired
export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const { exp } = JSON.parse(jsonPayload);
        return exp * 1000 < Date.now();
    } catch (e) {
        return true;
    }
};

// Base URL for API calls
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://10.0.0.9:7315';

// Function to refresh token
export const refreshToken = async () => {
    try {
        const currentToken = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            return data.access_token;
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw error;
    }
};

// Function to make authenticated API calls
export const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('token');

    if (isTokenExpired(token)) {
        token = await refreshToken();
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        },
    });

    if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    return response;
}; 