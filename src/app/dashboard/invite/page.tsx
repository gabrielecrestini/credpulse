// src/app/dashboard/invite/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNhostClient, useAuthenticationStatus } from '@nhost/nextjs'; // Importa hook Nhost

export default function InvitePage() {
  const nhost = useNhostClient();
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();
  const [profileData, setProfileData] = useState<any>(null); // Stato per i dati del profilo
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
          setIsLoading(false); // Se non autenticato, finisci il caricamento
          return;
      }
      setIsLoading(true);
      setError(null);
      try {
        // Chiama la Serverless Function
        const { res, error: funcError } = await nhost.functions.call('get-profile');

        if (funcError) {
          throw funcError; // Lancia l'errore per il blocco catch
        }
        if (res.status === 200) {
          setProfileData(await res.json());
        } else {
           const errorData = await res.json();
           throw new Error(errorData.details || `Errore ${res.status}`);
        }
      } catch (err: any) {
        console.error("Errore chiamata funzione get-profile:", err);
        setError(err.message || "Errore sconosciuto nel recupero profilo");
        setProfileData(null); // Resetta i dati in caso di errore
      } finally {
        setIsLoading(false);
      }
    };

    // Esegui solo se lo stato auth non è in caricamento
    if (!authLoading) {
        fetchProfile();
    }

  }, [isAuthenticated, authLoading, nhost.functions]); // Aggiunto nhost.functions

  const referralCode = isLoading || authLoading ? "CARICAMENTO..." : (error ? "ERRORE" : profileData?.referral_code || "NON TROVATO");
  const shareLink = isLoading || authLoading || error || !referralCode ? "" : `https://credpulse.it/?ref=${referralCode}`;

  const copyToClipboard = () => { /* ... come prima ... */ };

  return (
    <div className="p-8 text-center">
      {/* ... Titolo e descrizione ... */}
      <div className="glass-card p-10 inline-flex flex-col items-center">
        {/* ... Codice/Link ... */}
        <p className="font-heading text-xl md:text-3xl text-cyber-magenta break-all mb-6 min-h-[40px]">
          {referralCode} {/* Mostra solo il codice o il link come preferisci */}
        </p>
        <Button onClick={copyToClipboard} disabled={isLoading || authLoading || error || !shareLink}>
          {isLoading || authLoading ? "Caricamento..." : "Copia Link"}
        </Button>
        {message && <p className="text-center mt-4 text-sm text-electric-blue">{message}</p>}
        {error && <p className="text-center mt-4 text-sm text-red-500">Errore: {error}</p>}
      </div>
    </div>
  );
}