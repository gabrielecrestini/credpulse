// src/app/dashboard/account/page.tsx
"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setMessage(`Errore: ${error.message}`);
    else setMessage('Password aggiornata con successo!');
    setNewPassword('');
    setLoading(false);
  };
  
  return (
    <div className="p-8">
      <h1 className="font-heading text-6xl tracking-wider text-white mb-8">
        Il Tuo <span className="text-electric-blue">Account</span>
      </h1>
      <div className="glass-card p-10 max-w-lg mx-auto">
        <h2 className="font-bold text-2xl text-white mb-4">Cambia Password</h2>
        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="Nuova password (min. 6 caratteri)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-space-deep border border-white/20 rounded-lg px-4 py-3 mb-6 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue"
          />
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva Nuova Password'}
          </Button>
        </form>
        {message && <p className="text-center mt-4 text-sm text-electric-blue">{message}</p>}
      </div>
    </div>
  );
}