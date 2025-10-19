// src/app/dashboard/offers/page.tsx
export default function OffersPage() {
  return (
    <div className="p-8">
      <h1 className="font-heading text-6xl tracking-wider text-white mb-8">
        Le Tue <span className="text-electric-blue">Offerte</span>
      </h1>
      <div className="glass-card p-10 text-center">
        <p className="text-2xl text-gray-300">Stiamo preparando le migliori offerte per te.</p>
        <p className="text-gray-500 mt-2">Torna a trovarci presto!</p>
      </div>
    </div>
  );
}