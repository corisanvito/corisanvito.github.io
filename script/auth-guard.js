import { getToken, getUtente, clearAuth } from './api.js';

// Chiama questo in cima a ogni pagina del portale
export function requireAuth(ruoliConsentiti = []) {
    const token = getToken();
    const utente = getUtente();

    if (!token || !utente) {
        window.location.href = '/login.html';
        return null;
    }

    if (ruoliConsentiti.length > 0 && !ruoliConsentiti.includes(utente.ruolo)) {
        window.location.href = '/portale/index.html';
        return null;
    }

    return utente;
}

export function logout() {
    clearAuth();
}