// src/app/page.tsx
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import AuthModal from '@/components/auth/AuthModal';

const MissionCategoryCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => (
    <div className="glass-card p-8 flex flex-col items-center text-center transform hover:-translate-y-3 transition-transform duration-300 border-2 border-transparent hover:border-electric-blue">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="font-heading text-4xl text-white tracking-wider">{title}</h3>
        <p className="text-gray-400 mt-2 font-light">{description}</p>
        <div className="mt-6 bg-cyber-magenta/80 text-white text-xs font-bold py-1 px-4 rounded-full">
            IN ARRIVO
        </div>
    </div>
);

export default function HomePage() {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  return (
    <>
      <section className="relative text-center pt-20 pb-32 px-4 overflow-hidden">
        {/* ... (Elementi grafici rimangono invariati) ... */}
        <div className="relative z-10">
          <h1 className="font-heading text-7xl md:text-9xl tracking-wider text-white uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
            Trasforma i Task
          </h1>
          <h2 className="font-heading text-7xl md:text-9xl tracking-wider text-electric-blue uppercase drop-shadow-[0_4px_4px_rgba(0,191,255,0.4)]">
            In Crediti
          </h2>
          <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-300">
            Benvenuto in <strong>CredPulse</strong>, la piattaforma dove completare missioni nel mondo crypto, conti e carte ti premia con ricompense reali.
          </p>
          <div className="mt-10">
            <Button size="lg" onClick={() => setAuthModalOpen(true)}>
              Crea il tuo Account
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <h2 className="text-center font-heading text-6xl tracking-wider mb-16">
            Le <span className="text-electric-blue">Missioni</span>
        </h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <MissionCategoryCard 
                icon="💳" 
                title="Conti & Carte"
                description="Attiva conti e carte innovative dai migliori provider e ricevi bonus di benvenuto esclusivi."
            />
            <MissionCategoryCard 
                icon="💎" 
                title="Crypto & Exchange"
                description="Esplora il mondo delle crypto. Iscriviti agli exchange, completa task e accumula Creds."
            />
            <MissionCategoryCard 
                icon="🌐" 
                title="SIM Digitali & Tech"
                description="Rimani connesso e scopri servizi tech rivoluzionari. Guadagna cashback per ogni attivazione."
            />
        </div>
      </section>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}