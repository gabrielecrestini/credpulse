// src/app/dashboard/account/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useNhostClient, useUserData } from '@nhost/nextjs';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  const nhost = useNhostClient();
  const userData = useUserData(); // Dati base Nhost (email, id)
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // --- STATI PER I DATI DEL PROFILO (dal backend) ---
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  // ----------------------------------------------------


  // --- LOGICA DI RECUPERO DATI PROFILO (Crediti, Referral) ---
  useEffect(() => {
    const fetchProfile = async () => {
        if (!userData?.id) {
            setProfileLoading(false);
            return;
        }
        setProfileLoading(true);
        setProfileError(null);

        try {
            // Chiama la Serverless Function 'get-profile'
            const { res, error: funcError } = await nhost.functions.call('get-profile');

            if (funcError) throw funcError;
            
            if (res.status === 200) {
                setProfileData(await res.json());
            } else {
                const errorData = await res.json();
                throw new Error(errorData.message || `Errore HTTP ${res.status}`);
            }
        } catch (err: any) {
            console.error("Errore recupero profilo:", err);
            setProfileError('Errore nel recupero crediti/codice invito.');
        } finally {
            setProfileLoading(false);
        }
    };
    
    if (userData?.id) { // Esegui il fetch solo se l'ID utente è disponibile
        fetchProfile();
    }
  }, [userData?.id, nhost.functions]);
  // -----------------------------------------------------------


  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) { setMessage('La nuova password deve contenere almeno 6 caratteri.'); return; }
    if (!nhost?.auth) { setMessage('Errore: Client di autenticazione non pronto.'); return; }
    setLoading(true);
    setMessage('');
    const { error } = await nhost.auth.changePassword({ newPassword: newPassword });
    if (error) { setMessage(`Errore: ${error.message}`); }
    else { setMessage('Password aggiornata con successo! Effettua il re-login se necessario.'); setNewPassword(''); }
    setLoading(false);
  };
  
  const handlePasswordReset = async () => {
    const userEmail = userData?.email;
    if (!userEmail) { setMessage('Impossibile resettare la password: email utente non trovata.'); return; }
    const { error } = await nhost.auth.resetPassword({ email: userEmail });
    if (error) { setMessage(`Errore reset: ${error.message}`); }
    else { setMessage('Link di reset password inviato alla tua email. Controlla la posta.'); }
  }

  // Valori per il rendering
  const referralCode = profileData?.referral_code || 'N/A';
  const credsBalance = profileData?.creds_balance !== undefined ? profileData.creds_balance : 'N/A';

  return (
    <div className="p-8">
      <h1 className="font-heading text-6xl tracking-wider text-white mb-8">
        Il Tuo <span className="text-electric-blue">Account</span>
      </h1>
      <div className="glass-card p-10 max-w-lg mx-auto">
        
        {/* --- DETTAGLI UTENTE / DESIGN AGGIUSTATO --- */}
        <h2 className="font-bold text-2xl text-white mb-4">Dettagli Utente</h2>
        <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-bold text-gray-400">Email:</span>
                <span className="text-white text-right">{userData?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-bold text-gray-400">ID Utente:</span>
                <span className="text-gray-500 text-xs text-right break-all">{userData?.id || 'N/A'}</span>
            </div>
            
            {/* Saldo Creds */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2 pt-2">
                <span className="font-bold text-gray-400">Crediti (Creds):</span>
                <span className="text-electric-blue font-bold text-right">
                    {profileLoading ? 'Caricamento...' : (profileError ? 'ERRORE' : credsBalance)}
                </span>
            </div>

            {/* Codice Invito */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-bold text-gray-400">Codice Invito:</span>
                <span className="text-cyber-magenta text-right">
                    {profileLoading ? '...' : (profileError ? 'ERRORE' : referralCode)}
                </span>
            </div>
            {profileError && <p className="text-red-500 text-center text-sm pt-2">{profileError}</p>}
        </div>
        {/* ------------------------------------------- */}

        <h2 className="font-bold text-2xl text-white mb-4 mt-6 border-t border-white/10 pt-4">Cambia Password</h2>
        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="Nuova password (min. 6 caratteri)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-space-deep border border-white/20 rounded-lg px-4 py-3 mb-6 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue"
            disabled={loading}
          />
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva Nuova Password'}
          </Button>
          <button type="button" onClick={handlePasswordReset} className="text-sm text-gray-400 hover:text-electric-blue underline mt-4">
            Ho dimenticato la password (invia link di reset)
          </button>
        </form>
        {message && <p className="text-center mt-4 text-sm text-electric-blue">{message}</p>}
      </div>
    </div>
  );
}