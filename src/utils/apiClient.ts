import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

/**
 * Returns an axios instance pre-configured with the Bearer token
 * from localStorage. Use this for all authenticated API calls.
 */
export function getAuthAxios() {
    const token = localStorage.getItem('token');
    return axios.create({
        baseURL: API_BASE,
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        }
    });
}

/** Raw API base URL (for cases where you need it directly) */
export const API = API_BASE;
