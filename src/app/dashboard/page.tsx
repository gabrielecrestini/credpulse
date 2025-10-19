// src/app/dashboard/page.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useNhostClient, useAuthenticationStatus } from "@nhost/nextjs";

const StatCard = ({ value, label }: { value: string | number, label: string }) => (
  <div className="glass-card p-6 text-center rounded-xl">
    <p className="font-heading text-6xl text-electric-blue tracking-wider">{value}</p>
    <p className="text-gray-400 uppercase text-sm font-bold">{label}</p>
  </div>
);

export default function DashboardPage() {
  const nhost = useNhostClient();
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      setError(null);
      try {
        // Chiama la Serverless Function 'get-profile'
        const { res, error: funcError } = await nhost.functions.call('get-profile');

        if (funcError) throw funcError;
        if (res.status === 200) {
          setProfileData(await res.json());
        } else {
           const errorData = await res.json();
           throw new Error(errorData.error || `Errore ${res.status}`);
        }
      } catch (err: any) {
        console.error("Errore chiamata funzione get-profile:", err);
        setError("Errore nel recupero dati profilo.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
        fetchProfile();
    }

  }, [isAuthenticated, authLoading, nhost.functions]);

  const credsBalance = isLoading ? "..." : (error ? "ERR" : (profileData?.creds_balance || 0));

  return (
    <div>
      <h1 className="font-heading text-6xl tracking-wider text-white mb-8">
        La Tua <span className="text-electric-blue">Dashboard</span>
      </h1>
      
      {/* Sezione Stats - Ora il saldo è dinamico */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard value={credsBalance} label="Creds Guadagnati" />
        <StatCard value={profileData?.invite_count || 0} label="Amici Invitati" />
        <StatCard value="0" label="Missioni Completate" /> {/* Questo campo richiede logica separata */}
      </div>

      {/* Sezione Azioni Rapide (invariata) */}
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
      {error && <p className="text-red-500 mt-4">Errore: {error}</p>}
    </div>
  );
}