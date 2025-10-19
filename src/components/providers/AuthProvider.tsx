// src/components/providers/AuthProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useNhostClient } from '@nhost/nextjs';
import { useRouter } from 'next/navigation';
import type { User } from '@nhost/nextjs'; // Assicurati che User sia importato da @nhost/nextjs

const AuthContext = createContext<{ user: User | null }>({ user: null });

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const nhost = useNhostClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null); // Inizializza sempre a null

  useEffect(() => {
    // Controlla se nhost e nhost.auth sono pronti prima di usarli
    if (nhost && nhost.auth) {
      // Recupera l'utente iniziale in modo sicuro
      const initialUser = nhost.auth.getUser();
      setUser(initialUser);

      // Listener di Nhost per i cambiamenti di stato
      const { data: authListener } = nhost.auth.onAuthStateChanged(async (event, session) => {
        const currentUser = nhost.auth.getUser();
        setUser(currentUser);

        if (event === 'SIGNED_IN' && currentUser) {
          // Chiama il backend Python per assicurarsi che il profilo esista
          try {
            await fetch('http://localhost:5001/ensure-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: currentUser.id }),
            });
            console.log("Controllo/Creazione profilo richiesto al backend Python.");
          } catch (error) {
            console.error("Errore chiamata al backend Python:", error);
          }

          router.refresh(); // Forza refresh
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          router.push('/');
        }
      });

      // Funzione di cleanup per il listener
      return () => {
        authListener?.unsubscribe();
      };
    } else {
        // Se nhost non è pronto, assicurati che l'utente sia null
        setUser(null);
    }
  }, [router, nhost]); // Aggiorna la dipendenza a 'nhost'

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);