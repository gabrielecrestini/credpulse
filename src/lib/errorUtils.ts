// src/lib/errorUtils.ts
// Funzione robusta per convertire qualsiasi errore in una stringa leggibile
export const getErrorMessage = (err: any): string => {
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    
    // Tenta di estrarre messaggi da oggetti di errore comuni (fetch, API)
    if (err && typeof err === 'object') {
        if (err.message) return err.message;
        if (err.details) return err.details;
        if (err.error) return err.error;
        // Se è una risposta di fetch e non un oggetto JSON, restituisci lo stato
        if (err.status) return `Errore HTTP ${err.status}`;
    }
    return 'Errore di connessione o formato dati non valido.';
};