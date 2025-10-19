// src/app/layout.tsx
"use client"; // Obbligatorio per NhostProvider

import './globals.css';
import { NhostProvider, NhostClient } from '@nhost/nextjs';
import { NhostApolloProvider } from '@nhost/react-apollo';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer'; // Assumendo che tu abbia il footer
import { Bangers, Poppins } from 'next/font/google'; // Importa i tuoi font

// Configura il client Nhost con le variabili d'ambiente
const nhost = new NhostClient({
  backendUrl: process.env.NEXT_PUBLIC_NHOST_BACKEND_URL!
  // Subdomain e Region sono spesso inferiti dal backendUrl con le versioni più recenti,
  // ma puoi aggiungerli esplicitamente se necessario:
  // subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN,
  // region: process.env.NEXT_PUBLIC_NHOST_REGION,
});

// Configurazione Font (come prima)
const fontBangers = Bangers({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bangers',
});
const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-poppins',
});


// Non esportare 'metadata' da un client component. Gestiscilo nelle singole 'page.tsx' se necessario.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={`${fontBangers.variable} ${fontPoppins.variable} bg-space-deep text-white font-body antialiased`}>
        <NhostProvider nhost={nhost}>
          <NhostApolloProvider nhost={nhost}>
              <div className="relative min-h-screen">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,191,255,0.3),rgba(255,255,255,0))]"></div>
                  <div className="relative z-10 flex flex-col min-h-screen">
                      <Header />
                      <main className="flex-grow">{children}</main>
                      <Footer />
                  </div>
              </div>
          </NhostApolloProvider>
        </NhostProvider>
      </body>
    </html>
  );
}