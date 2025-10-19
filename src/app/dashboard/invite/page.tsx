// src/app/dashboard/invite/page.tsx
"use client";
import { gql, useQuery } from '@apollo/client';
import { useUserId } from '@nhost/nextjs';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// Query GraphQL per recuperare il profilo
const GET_MY_PROFILE_QUERY = gql`
  query GetMyProfile($userId: uuid!) {
    profiles_by_pk(id: $userId) {
      referral_code
      # Puoi aggiungere altri campi qui, es. invite_count
    }
  }
`;

export default function InvitePage() {
  const userId = useUserId();
  const { data, loading, error } = useQuery(GET_MY_PROFILE_QUERY, {
    variables: { userId },
    skip: !userId,
  });
  const [message, setMessage] = useState("");

  const referralCode = loading ? "CARICAMENTO..." : (error ? "ERRORE" : data?.profiles_by_pk?.referral_code || "NON TROVATO");
  // Assicurati che il tuo dominio sia corretto qui
  const shareLink = loading || error || !referralCode ? "" : `https://credpulse.it/?ref=${referralCode}`;

  const copyToClipboard = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setMessage("Link copiato!");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  return (
    <div className="p-8 text-center">
      <h1 className="font-heading text-6xl tracking-wider text-white mb-4">
        Invita un <span className="text-electric-blue">Amico</span>
      </h1>
      <p className="text-gray-300 max-w-xl mx-auto mb-8">
        Condividi il tuo link di invito. Per ogni amico che si iscrive e completa una missione, riceverete entrambi un bonus in Creds!
      </p>
      <div className="glass-card p-10 inline-flex flex-col items-center">
        <p className="text-gray-400 mb-2">Il tuo link di invito unico:</p>
        <p className="font-heading text-xl md:text-3xl text-cyber-magenta break-all mb-6 min-h-[40px]">
          {loading ? "..." : (error ? "Errore caricamento link" : shareLink)}
        </p>
        <Button onClick={copyToClipboard} disabled={loading || error || !shareLink}>
          {loading ? "Caricamento..." : "Copia Link"}
        </Button>
        {message && <p className="text-center mt-4 text-sm text-electric-blue">{message}</p>}
      </div>
    </div>
  );
}