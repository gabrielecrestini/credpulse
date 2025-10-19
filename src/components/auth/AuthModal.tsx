// src/components/auth/AuthModal.tsx
"use client";
import { useState, useEffect } from 'react';
import { useNhostClient } from '@nhost/nextjs';
import { Button } from '@/components/ui/button';

// --- Icona Google (Assicurati che il codice SVG sia completo) ---
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.804 8.841C34.522 4.982 29.582 3 24 3C12.43 3 3 12.43 3 24s9.43 21 21 21s21-9.43 21-21c0-1.564-.14-3.09-.389-4.584z"/><path fill="#FF3D00" d="M6.306 14.691c-1.946 4.095-1.946 8.917 0 13.012L.39 33.371C-2.05 27.593-2.05 20.407.39 14.629l5.916.062z"/><path fill="#4CAF50" d="M24 48c5.522 0 10.522-1.982 14.498-5.158L32.553 36.99c-2.486 1.68-5.592 2.61-8.553 2.61c-6.627 0-12-5.373-12-12c0-2.961.93-5.746 2.61-8.553l-5.957-5.957C4.982 13.478 3 18.478 3 24c0 11.57 9.43 21 21 21z"/><path fill="#1976D2" d="M43.611 20.083L42 20H24v8h11.303c-.792 2.237-2.231 4.16-4.087 5.571l5.957 5.957C42.018 36.522 45 30.62 45 24c0-1.564-.14-3.09-.389-4.584z"/>
    </svg>
);

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
  const nhost = useNhostClient();
  const [view, setView] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Resetta lo stato quando il modal si chiude
  useEffect(() => {
    if (!isOpen) {
      setView('signIn');
      setMessage('');
      setEmail('');
      setPassword('');
    }
  }, [isOpen]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nhost?.auth) {
        setMessage("Client di autenticazione non pronto.");
        return;
    }
    setLoading(true);
    setMessage('');
    // Nhost Auth gestisce la registrazione. La creazione profilo è gestita altrove.
    const { error } = await nhost.auth.signUp({ email, password });
    if (error) {
        setMessage(`Errore registrazione: ${error.message}`);
    } else {
        setMessage('Registrazione completata! Controlla la tua email per la conferma.');
        // Non chiudiamo il modal, l'utente deve confermare l'email.
        // Potresti voler cambiare la vista o mostrare un messaggio più persistente.
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nhost?.auth) {
        setMessage("Client di autenticazione non pronto.");
        return;
    }
    setLoading(true);
    setMessage('');
    const { error } = await nhost.auth.signIn({ email, password });
    if (error) {
        setMessage(`Errore accesso: ${error.message}`);
    } else {
       // Chiudiamo il modal, il redirect sarà gestito dal listener in AuthRedirectHandler/NhostProvider
       onClose();
    }
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    if (!nhost?.auth) {
        setMessage("Client di autenticazione non pronto.");
        return;
    }
    setLoading(true);
    setMessage('');
    const { error } = await nhost.auth.signIn({ provider: 'google' });
    if (error) {
        setMessage(`Errore Google: ${error.message}`);
        setLoading(false); // Sblocca i pulsanti in caso di errore
    }
    // Se non c'è errore, Nhost gestisce il redirect via browser.
    // La creazione del profilo sarà gestita dal listener (AuthRedirectHandler) che chiama il backend Python
    // o dalla Serverless Function Nhost triggerata dall'evento.
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4"> {/* Aggiunto padding per mobile */}
      <div className="glass-card p-8 rounded-2xl w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">&times;</button>
        <h2 className="font-heading text-4xl text-center text-white tracking-wider mb-6">
          {view === 'signIn' ? 'Accedi a CredPulse' : 'Crea il Tuo Account'}
        </h2>

        {/* Bottone Google */}
        <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
            <GoogleIcon />
            Continua con Google
        </button>

        {/* Separatore */}
        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">oppure</span>
            <div className="flex-grow border-t border-gray-600"></div>
        </div>

        {/* Form Email/Password */}
        {view === 'signIn' ? (
          // --- VISTA ACCEDI ---
          <form onSubmit={handleSignIn}>
            <input
                type="email"
                placeholder="La tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-space-deep border border-white/20 rounded-lg px-4 py-3 mb-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                required
                disabled={loading}
            />
            <input
                type="password"
                placeholder="La tua password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-space-deep border border-white/20 rounded-lg px-4 py-3 mb-6 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                required
                disabled={loading}
            />
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Verifica...' : 'Accedi'}
            </Button>
            {/* Link a Registrati */}
            <p className="text-center text-sm text-gray-400 mt-4">
              Non hai un account?{' '}
              <button type="button" onClick={() => setView('signUp')} className="font-bold text-electric-blue hover:underline disabled:opacity-50" disabled={loading}>
                Registrati
              </button>
            </p>
            {/* Link Password Dimenticata (aggiungeremo la logica se necessario) */}
            {/*
            <p className="text-center text-sm text-gray-400 mt-2">
                <button type="button" onClick={handlePasswordReset} className="hover:text-electric-blue underline disabled:opacity-50" disabled={loading}>
                    Password dimenticata?
                </button>
            </p>
             */}
          </form>
        ) : (
          // --- VISTA REGISTRATI ---
          <form onSubmit={handleSignUp}>
            <input
                type="email"
                placeholder="La tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-space-deep border border-white/20 rounded-lg px-4 py-3 mb-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                required
                disabled={loading}
             />
            <input
                type="password"
                placeholder="Crea una password (min. 6 caratteri)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-space-deep border border-white/20 rounded-lg px-4 py-3 mb-6 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                required
                disabled={loading}
            />
             {/* Rimosso campo referral code - gestione esterna */}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Creazione...' : 'Crea Account'}
            </Button>
            {/* Link ad Accedi */}
            <p className="text-center text-sm text-gray-400 mt-4">
              Hai già un account?{' '}
              <button type="button" onClick={() => setView('signIn')} className="font-bold text-electric-blue hover:underline disabled:opacity-50" disabled={loading}>
                Accedi
              </button>
            </p>
          </form>
        )}

        {/* Messaggio di stato/errore */}
        {message && <p className="text-center mt-4 text-sm text-electric-blue">{message}</p>}
      </div>
    </div>
  );
}