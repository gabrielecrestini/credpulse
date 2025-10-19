// src/components/providers/AuthProvider.tsx
"use client";

import { useEffect } from 'react';
import { useNhostClient } from '@nhost/nextjs';
import { useRouter } from 'next/navigation';
import type { User } from '@nhost/nextjs';

// NON serve più il Context se usiamo solo gli hook Nhost

export default function AuthRedirectHandler() { // Rinominiamo per chiarezza
  const nhost = useNhostClient();
  const router = useRouter();

  useEffect(() => {
    if (nhost && nhost.auth) {
      // Listener solo per i redirect
      const { data: authListener } = nhost.auth.onAuthStateChanged(async (event, session) => {
        const currentUser = nhost.auth.getUser();

        if (event === 'SIGNED_IN' && currentUser) {
          // --- Qui chiameremo il backend Python DOPO aver testato i redirect ---
          console.log("SIGNED_IN event detected, user:", currentUser.id);
          // try {
          //   await fetch('http://localhost:5001/ensure-profile', { /* ... opzioni fetch ... */});
          // } catch (error) { /* ... gestione errore ... */ }
          // --- Fine chiamata backend ---
          router.refresh();
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          router.push('/');
        }
      });

      return () => {
        authListener?.unsubscribe();
      };
    }
  }, [router, nhost]); // Assicurati che nhost sia una dipendenza stabile

  return null; // Questo componente non renderizza nulla, gestisce solo effetti collaterali
}