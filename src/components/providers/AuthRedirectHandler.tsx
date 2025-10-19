// src/components/providers/AuthRedirectHandler.tsx
"use client";

import { useEffect, useCallback } from 'react';
import { useNhostClient, User } from '@nhost/nextjs';
import { useRouter } from 'next/navigation';
// Non abbiamo più bisogno di gql e Apollo qui, il che semplifica molto!

// Funzione Helper per generare un codice referral unico
const generateReferralCode = () => 'CP-' + Math.random().toString(36).substring(2, 8).toUpperCase();

// Funzione Helper per eseguire una Mutation GraphQL con privilegi di admin
const executeProfileCreation = async (nhostClient: any, user: User) => {
    // Definizione della Mutation GraphQL per inserire il profilo
    const INSERT_PROFILE_MUTATION = `
        mutation InsertProfileOnSignup($id: uuid!, $referral_code: String!) {
            insert_profiles_one(object: {id: $id, referral_code: $referral_code}) {
                id 
            }
        }
    `;

    // Headers di autorizzazione con il segreto di amministrazione
    const headers = { 
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': process.env.NHOST_ADMIN_SECRET // Usiamo il secret dal .env per il server
    };

    const variables = {
        id: user.id,
        referral_code: generateReferralCode(),
    };

    const graphqlEndpoint = process.env.NEXT_PUBLIC_NHOST_BACKEND_URL + '/v1/graphql';

    try {
        const response = await fetch(graphqlEndpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                query: INSERT_PROFILE_MUTATION,
                variables: variables,
            }),
        });

        const result = await response.json();

        if (result.errors) {
            // Controlla se è un errore di violazione di vincolo (profilo già esistente)
            const isConstraintViolation = result.errors.some((err: any) => 
                err.extensions?.code === 'constraint-violation'
            );
            if (isConstraintViolation) {
                console.warn(`[Profile Auto-Create] Profile already exists for user ${user.id}. Skipping.`);
                return true; // Considera successo se il profilo esiste già
            }
            throw new Error(result.errors[0].message || 'GraphQL insertion failed.');
        }

        console.log(`[Profile Auto-Create] Profile created successfully for user ${user.id}`);
        return true;

    } catch (error: any) {
        console.error("[Profile Auto-Create] FATAL ERROR:", error.message);
        // Potresti voler forzare un logout se il profilo non può essere creato
        // await nhostClient.auth.signOut();
        return false;
    }
};


export default function AuthRedirectHandler() {
  const nhost = useNhostClient();
  const router = useRouter();

  // Utilizza useCallback per memoizzare la funzione di gestione dell'accesso
  const handleSignInLogic = useCallback(async (user: User) => {
      // 1. Esegui la creazione/verifica del profilo
      const profileCreated = await executeProfileCreation(nhost, user);

      if (profileCreated) {
          // 2. Completa il reindirizzamento solo se il profilo è stato creato con successo
          router.refresh();
          router.push('/dashboard');
      } else {
          // 3. Fallimento: reindirizza alla home (o una pagina di errore)
          router.push('/');
      }
  }, [nhost, router]);


  useEffect(() => {
    if (nhost && nhost.auth) {
      // Listener di Nhost per i cambiamenti di stato
      const { data: authListener } = nhost.auth.onAuthStateChange(async (event, session) => {
        const currentUser = nhost.auth.getUser();

        if (event === 'SIGNED_IN' && currentUser) {
            // Se l'utente ha appena effettuato l'accesso, avvia la logica di creazione profilo
            // Chiamata asincrona per evitare di bloccare il listener
            handleSignInLogic(currentUser); 

        } else if (event === 'SIGNED_OUT') {
            router.push('/');
        }
      });

      return () => {
        authListener?.unsubscribe();
      };
    }
  }, [nhost, handleSignInLogic]);

  return null; // Questo componente non renderizza nulla, gestisce solo effetti collaterali
}