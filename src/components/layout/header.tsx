// src/components/layout/header.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react'; // Aggiunto useEffect
import AuthModal from '../auth/AuthModal';
import { useAuthenticationStatus, useUserData, useNhostClient } from '@nhost/nextjs';

export default function Header() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const userData = useUserData();
  const nhost = useNhostClient();

  // --- NUOVO: Stato per gestire il rendering client-side ---
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Questo useEffect viene eseguito SOLO nel browser dopo il montaggio
    setIsClient(true);
  }, []);
  // --- FINE NUOVO ---


  const handleSignOut = async () => {
    await nhost.auth.signOut();
  };

  return (
    <>
      <header className="py-4 px-8 flex justify-between items-center">
        <Link href="/">
          <h1 className="font-heading text-4xl tracking-wider text-white hover:text-electric-blue transition-colors duration-300">
            CREDPULSE
          </h1>
        </Link>
        <nav className="hidden md:flex items-center gap-4">
          {/* --- MODIFICA LOGICA RENDERING --- */}
          {/* Mostra uno placeholder finché non siamo sicuri di essere nel browser E il caricamento è finito */}
          {!isClient || isLoading ? (
             <span className="text-gray-400 text-sm h-10"> </span> // Placeholder vuoto o spinner semplice
             // <div className="animate-pulse h-10 w-48 bg-gray-700 rounded"></div> // Alternativa: skeleton loader
          ) : isAuthenticated ? (
            // --- UTENTE LOGGATO (Renderizzato solo sul client dopo caricamento) ---
            <>
              <span className="text-gray-300 text-sm">
                Ciao, {userData?.displayName || userData?.email}
              </span>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button onClick={handleSignOut} variant="destructive">Logout</Button>
            </>
          ) : (
            // --- UTENTE NON LOGGATO (Renderizzato solo sul client dopo caricamento) ---
            <>
              <button onClick={() => setAuthModalOpen(true)} className="font-bold text-gray-300 hover:text-white transition-colors">
                Login
              </button>
              <Button onClick={() => setAuthModalOpen(true)}>
                Inizia Ora
              </Button>
            </>
          )}
           {/* --- FINE MODIFICA --- */}
        </nav>
      </header>
      {/* Mostra il modal solo se siamo sul client, non stiamo caricando e l'utente non è autenticato */}
      {isClient && !isLoading && !isAuthenticated && <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />}
    </>
  );
}