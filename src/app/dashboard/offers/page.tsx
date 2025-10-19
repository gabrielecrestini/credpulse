// src/app/dashboard/offers/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useNhostClient } from "@nhost/nextjs";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/errorUtils"; // Importa la funzione helper

interface Offer {
    id: string;
    title: string;
    description: string;
    reward_creds: number;
    affiliate_link: string;
    provider_name: string;
    category: string;
}

const OfferCard = ({ offer }: { offer: Offer }) => (
    // ... (JSX dell'OfferCard invariato) ...
    <div className="glass-card p-6 flex flex-col justify-between h-full hover:shadow-neon-glow transition-shadow duration-300">
        <div>
            <h2 className="font-heading text-3xl text-electric-blue mb-2">{offer.title}</h2>
            <p className="text-xs uppercase text-cyber-magenta font-bold mb-3">{offer.category} / {offer.provider_name}</p>
            <p className="text-gray-300 text-sm mb-4">{offer.description}</p>
        </div>
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
            <span className="font-bold text-lg text-white">{offer.reward_creds} Creds</span>
            <a href={offer.affiliate_link} target="_blank" rel="noopener noreferrer">
                <Button>Vai all'Offerta</Button>
            </a>
        </div>
    </div>
);


export default function OffersPage() {
  const nhost = useNhostClient();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { res, error: funcError } = await nhost.functions.call('get-offers');

        if (funcError) throw funcError;
        if (res.status === 200) {
          setOffers(await res.json()); 
        } else {
           const errorData = await res.json();
           throw errorData; // Lancia l'oggetto errore
        }
      } catch (err: any) {
        setError(getErrorMessage(err)); // Correzione: Converte l'oggetto in stringa
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOffers();
  }, [nhost.functions]);

  return (
    <div className="p-8">
      <h1 className="font-heading text-6xl tracking-wider text-white mb-8">
        Le Migliori <span className="text-electric-blue">Offerte</span>
      </h1>
      
      {isLoading && <p className="text-gray-400">Caricamento offerte...</p>}
      {error && <p className="text-red-500">Errore: {error}</p>}
      
      {!isLoading && offers.length === 0 && !error && (
        <p className="text-gray-400">Nessuna offerta attiva in questo momento. Torna presto!</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}