// src/components/providers/AuthRedirectHandler.tsx
"use client";

import { useEffect } from 'react';
import { useNhostClient } from '@nhost/nextjs';
import { useRouter } from 'next/navigation';

export default function AuthRedirectHandler() { 
  const nhost = useNhostClient();
  const router = useRouter();

  useEffect(() => {
    if (nhost && nhost.auth) {
      // Listener che gestisce i reindirizzamenti
      const { data: authListener } = nhost.auth.onAuthStateChange(async (event, session) => {
        const currentUser = nhost.auth.getUser();

        if (event === 'SIGNED_IN' && currentUser) {
          // Dopo l'accesso, reindirizza alla dashboard
          router.refresh(); 
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          // Dopo il logout, reindirizza alla home
          router.push('/');
        }
      });

      return () => {
        authListener?.unsubscribe();
      };
    }
  }, [router, nhost]); 

  return null; // Componente senza rendering
}