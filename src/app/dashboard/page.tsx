// src/app/dashboard/page.tsx
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const StatCard = ({ value, label }) => (
  <div className="glass-card p-6 text-center rounded-xl">
    <p className="font-heading text-6xl text-electric-blue tracking-wider">{value}</p>
    <p className="text-gray-400 uppercase text-sm font-bold">{label}</p>
  </div>
);

export default function DashboardPage() {
  const [credsBalance, setCredsBalance] = useState("0");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("creds_balance")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          setCredsBalance(profile.creds_balance.toString());
        }
      }
    };
    fetchProfile();
  }, []);

  return (
    <div>
      <h1 className="font-heading text-6xl tracking-wider text-white mb-8">
        La Tua <span className="text-electric-blue">Dashboard</span>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard value={credsBalance} label="Creds Guadagnati" />
        <StatCard value="0" label="Missioni Completate" />
        <StatCard value="0" label="Amici Invitati" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/offers" className="glass-card p-8 text-center transform hover:-translate-y-2 transition-transform duration-300 hover:border-electric-blue border-2 border-transparent">
          <p className="text-5xl mb-4">🚀</p>
          <h2 className="font-bold text-2xl text-white">Scopri le Offerte</h2>
          <p className="text-gray-400">Inizia una nuova missione e guadagna Creds.</p>
        </Link>
        <Link href="/dashboard/invite" className="glass-card p-8 text-center transform hover:-translate-y-2 transition-transform duration-300 hover:border-cyber-magenta border-2 border-transparent">
          <p className="text-5xl mb-4">🤝</p>
          <h2 className="font-bold text-2xl text-white">Invita i Tuoi Amici</h2>
          <p className="text-gray-400">Guadagnate entrambi un bonus speciale.</p>
        </Link>
      </div>
    </div>
  );
}