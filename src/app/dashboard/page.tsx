// src/app/dashboard/page.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useNhostClient, useAuthenticationStatus } from "@nhost/nextjs";
// Importa la funzione helper per la gestione degli errori
import { getErrorMessage } from "@/lib/errorUtils"; 

// Assumi che StatCard sia definito in un altro file o qui sopra
const StatCard = ({ value, label }: { value: string | number, label: string }) => (
  <div className="glass-card p-6 text-center rounded-xl">
    <p className="font-heading text-6xl text-electric-blue tracking-wider">{value}</p>
    <p className="text-gray-400 uppercase text-sm font-bold">{label}</p>
  </div>
);

export default function DashboardPage() {
  const nhost = useNhostClient();
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();
  
  // Stato per i dati del profilo/bilancio
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      // Non eseguire se lo stato di autenticazione non è definito o non siamo loggati
      if (!isAuthenticated) return; 

      setIsLoading(true);
      setError(null);
      
      try {
        // --- CHIAMATA ALLA FUNZIONE BILANCIO (get-user-balance) ---
        const { res, error: funcError } = await nhost.functions.call('get-user-balance'); 
        // ---------------------------------------------------------

        if (funcError) throw funcError;
        
        if (res.status === 200) {
          setProfileData(await res.json());
        } else {
           const errorData = await res.json();
           throw errorData; // Lancia l'oggetto errore per il blocco catch
        }
      } catch (err: any) {
        // Usa la funzione helper per convertire l'oggetto errore in una stringa
        setError(getErrorMessage(err)); 
      } finally {
        setIsLoading(false);
      }
    };

    // Esegui il fetch solo quando lo stato di autenticazione è stabile e loggato
    if (!authLoading && isAuthenticated) {
        fetchProfile();
    }

  }, [isAuthenticated, authLoading, nhost.functions]); // Dipendenze corrette

  // Valori per il rendering delle StatCard
  const credsBalance = isLoading ? "..." : (error ? "ERR" : (profileData?.creds_balance || 0));
  const inviteCount = isLoading ? "..." : (error ? "ERR" : (profileData?.invite_count || 0));

  return (
    <div>
      <h1 className="font-heading text-6xl tracking-wider text-white mb-8">
        La Tua <span className="text-electric-blue">Dashboard</span>
      </h1>
      
      {/* Sezione Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard value={credsBalance} label="Creds Guadagnati" />
        <StatCard value={inviteCount} label="Amici Invitati" />
        <StatCard value="0" label="Missioni Completate" /> 
      </div>

      {/* Messaggio di errore in cima alla sezione azioni */}
      {error && <p className="text-red-500 mt-4 text-center glass-card p-3 mb-6">Errore recupero dati: {error}</p>}

      {/* Sezione Azioni Rapide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/offers" className="glass-card p-8 text-center transform hover:-translate-y-2 transition-transform duration-300 hover:border-electric-blue border-2 border-transparent">
          <p className="text-5xl mb-4">🚀</p>
          <h2 className="font-bold text-2xl text-white">Scopri le Offerte</h2>
          <p className="text-gray-400">Inizia una nuova missione e guadagna Creds.</p>
        </Link>
        <Link href="/dashboard/invite" className="glass-card p-8 text-center transform hover:-translate-y-2 transition-transform duration-300 hover:border-cyber-magenta border-2 border-transparent">
          <p className="text-5xl mb-4">🤝</p>
          <h2 className="font-bold text-2xl text-white">Invita i Tuoi Amici</h2>
          <p className="text-gray-400">Guadagnate entrambi un bonus speciale.</p>
        </Link>
      </div>
    </div>
  );
}