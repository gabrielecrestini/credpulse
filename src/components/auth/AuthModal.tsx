// src/components/auth/AuthModal.tsx
"use client";
import { useState, useEffect } from 'react';
import { useNhostClient } from '@nhost/nextjs';
import { Button } from '@/components/ui/button';
import { gql, useMutation } from '@apollo/client'; // Importa se crei il profilo qui

// --- Icona Google (invariata) ---
const GoogleIcon = () => ( <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">...</svg>);

// --- Definiamo la Mutation GraphQL per inserire il profilo ---
// (Serve solo se NON usi la Serverless Function automatica)
/*
const INSERT_PROFILE_MUTATION = gql`
  mutation InsertProfileAfterSignup($id: uuid!, $referral_code: String!) {
    insert_profiles_one(object: {id: $id, referral_code: $referral_code}) { id }
  }
`;
const generateReferralCode = () => 'CP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
*/

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; }) {
  const nhost = useNhostClient();
  const [view, setView] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Inizializza la mutation (solo se NON usi la Serverless Function)
  // const [insertProfile, { loading: insertingProfile, error: insertError }] = useMutation(INSERT_PROFILE_MUTATION);

  useEffect(() => {
    if (!isOpen) { /* Reset stato */ }
  }, [isOpen]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    // Nhost Auth gestisce la registrazione
    const { session, error } = await nhost.auth.signUp({ email, password });

    if (error) {
        setMessage(`Errore registrazione: ${error.message}`);
    } else {
        setMessage('Registrazione completata! Controlla la tua email per la conferma.');
        // La Serverless Function (se configurata) creerà il profilo.
        // Se NON usi la Serverless Function, dovresti chiamare insertProfile qui:
        /*
        if (session?.user) {
            try {
                await insertProfile({ variables: { id: session.user.id, referral_code: generateReferralCode() } });
            } catch (profileError: any) { ... gestione errore ... }
        }
        */
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await nhost.auth.signIn({ email, password });
    if (error) setMessage(`Errore accesso: ${error.message}`);
    else onClose(); // Chiudi il modal, NhostProvider gestirà il redirect
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setMessage('');
    const { error } = await nhost.auth.signIn({ provider: 'google' });
    if (error) {
        setMessage(`Errore Google: ${error.message}`);
        setLoading(false);
    }
    // Nhost gestisce il redirect, la Serverless Function (se configurata) crea il profilo.
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="glass-card p-8 rounded-2xl w-full max-w-md relative animate-fade-in-up">
        {/* ... JSX del modal (titolo, bottoni, form, messaggi) ... */}
        {/* Assicurati che i bottoni submit/click chiamino le funzioni corrette */}
        {/* (handleSignUp, handleSignIn, signInWithGoogle) */}
      </div>
    </div>
  );
}