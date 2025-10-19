// src/components/layout/header.tsx
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assumendo che tu abbia questo
import { useState } from 'react';
import AuthModal from '../auth/AuthModal';
import { useAuthenticationStatus, useUserData, useNhostClient } from '@nhost/nextjs'; // Hook Nhost

export default function Header() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuthenticationStatus(); // Stato auth
  const userData = useUserData(); // Dati utente (email, id, etc.)
  const nhost = useNhostClient(); // Client per il logout

  const handleSignOut = async () => {
    await nhost.auth.signOut();
    // Il reindirizzamento è gestito dal listener in NhostProvider (o AuthProvider se lo mantieni)
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
          {isLoading ? (
            <span className="text-gray-400">Caricamento...</span>
          ) : isAuthenticated ? (
            // --- UTENTE LOGGATO ---
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
            // --- UTENTE NON LOGGATO ---
            <>
              <button onClick={() => setAuthModalOpen(true)} className="font-bold text-gray-300 hover:text-white transition-colors">
                Login
              </button>
              <Button onClick={() => setAuthModalOpen(true)}>
                Inizia Ora
              </Button>
            </>
          )}
        </nav>
      </header>
      {/* Mostra il modal solo se l'utente non è autenticato */}
      {!isAuthenticated && !isLoading && <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />}
    </>
  );
}