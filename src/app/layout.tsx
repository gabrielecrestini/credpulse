// src/app/layout.tsx
"use client";

import './globals.css';
import { NhostProvider, NhostClient } from '@nhost/nextjs';
// RIMOSSO: import { NhostApolloProvider } from '@nhost/react-apollo';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Bangers, Poppins } from 'next/font/google'; // Importa i tuoi font

// Configurazione Nhost Semplificata (CORRETTA)
const nhost = new NhostClient({
  subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN!,
  region: process.env.NEXT_PUBLIC_NHOST_REGION!,
});

// Configurazione Font
const fontBangers = Bangers({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bangers',
  display: 'swap',
});
const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <title>CredPulse - Guadagna Crediti</title>
        <meta name="description" content="Completa missioni nel mondo crypto, conti e carte. Guadagna ricompense reali in Creds." />
      </head>
      <body className={`${fontBangers.variable} ${fontPoppins.variable} bg-space-deep text-white font-body antialiased`}>
        {/* Solo NhostProvider - Niente Apollo */}
        <NhostProvider nhost={nhost}>
            <div className="relative min-h-screen">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,191,255,0.3),rgba(255,255,255,0))]"></div>
                <div className="relative z-10 flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-grow">{children}</main>
                    <Footer />
                </div>
            </div>
        </NhostProvider>
      </body>
    </html>
  );
}