// src/app/dashboard/account/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useNhostClient, useUserData } from '@nhost/nextjs';
import { Button } from '@/components/ui/button';
import { getErrorMessage } from '@/lib/errorUtils'; // Importa la funzione helper

export default function AccountPage() {
  const nhost = useNhostClient();
  const userData = useUserData();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Stati per i dati del profilo
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // --- LOGICA DI RECUPERO DATI PROFILO ---
  useEffect(() => {
    const fetchProfile = async () => {
        if (!userData?.id) { setProfileLoading(false); return; }
        setProfileLoading(true);
        setProfileError(null);

        try {
            const { res, error: funcError } = await nhost.functions.call('get-profile');

            if (funcError) throw funcError;
            
            if (res.status === 200) {
                setProfileData(await res.json());
            } else {
                const errorData = await res.json();
                throw errorData; // Lanciamo l'oggetto errore per essere catturato
            }
        } catch (err: any) {
            setProfileError(getErrorMessage(err)); // Correzione: Converte l'oggetto in stringa
        } finally {
            setProfileLoading(false);
        }
    };
    
    if (userData?.id) { fetchProfile(); }
  }, [userData?.id, nhost.functions]);
  // -----------------------------------------------------------

  // ... (Logica handlePasswordReset e handleChangePassword invariata) ...
  const handleChangePassword = async (e: React.FormEvent) => { /* ... */ };
  const handlePasswordReset = async () => { /* ... */ };

  // Valori per il rendering
  const referralCode = profileData?.referral_code || 'N/A';
  const credsBalance = profileData?.creds_balance !== undefined ? profileData.creds_balance : 'N/A';

  return (
    <div className="p-8">
      {/* ... (Header e glass-card) ... */}
      <div className="glass-card p-10 max-w-lg mx-auto">
        
        {/* --- DETTAGLI UTENTE --- */}
        <h2 className="font-bold text-2xl text-white mb-4">Dettagli Utente</h2>
        <div className="space-y-3 mb-6">
            {/* ... (Email, ID Utente) ... */}
            
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
        {/* ... (Form Cambio Password e bottoni) ... */}
        
        {/* Codice per il form di cambio password */}
        <h2 className="font-bold text-2xl text-white mb-4 mt-6 border-t border-white/10 pt-4">Cambia Password</h2>
        <form onSubmit={handleChangePassword}>
          <input type="password" placeholder="Nuova password (min. 6 caratteri)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-space-deep border border-white/20 rounded-lg px-4 py-3 mb-6 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue" disabled={loading} />
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