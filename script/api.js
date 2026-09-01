const API_URL = 'https://corisanvito-backend.onrender.com';

export function getToken() {
    return localStorage.getItem('csv_token');
}

export function getUtente() {
    const u = localStorage.getItem('csv_utente');
    return u ? JSON.parse(u) : null;
}

export function saveAuth(token, utente) {
    localStorage.setItem('csv_token', token);
    localStorage.setItem('csv_utente', JSON.stringify(utente));
}

export function clearAuth() {
    localStorage.removeItem('csv_token');
    localStorage.removeItem('csv_utente');
    window.location.href = '/login';
}

export async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...(options.headers || {})
        }
    });

    if (res.status === 401) {
        clearAuth();
        return;
    }

    return res.json();
}

// Funzioni specifiche
export const login = (email, password) => apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => apiCall('/auth/me');
export const getBacheca = () => apiCall('/bacheca');
export const getStatistiche = () => apiCall('/presenze/statistiche');
export const getPresenze = () => apiCall('/presenze');
export const getCanti = () => apiCall('/canti');
export const getCori = () => apiCall('/cori');
export const getCantiSettimana = (coroId) => apiCall(`/canti-settimana/${coroId}`);
// Pubblica — senza auth, usata dalla homepage
export async function getCantiSettimanaPublic(coroId) {
    const res = await fetch(`${API_URL}/canti-settimana/${coroId}`);
    return res.json();
}