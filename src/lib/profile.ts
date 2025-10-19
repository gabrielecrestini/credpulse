// src/lib/profile.ts
import { supabase } from '@/lib/supabaseClient'

export async function getUserProfile() {
  // Ottiene l'utente corrente dalla sessione
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Se non c'è un utente loggato, non possiamo fare nulla
    return null;
  }

  // Cerca il profilo corrispondente all'ID dell'utente
  const { data, error } = await supabase
    .from('profiles')
    .select('referral_code, creds_balance, invite_count') // Seleziona i dati che ci servono
    .eq('id', user.id)
    .single() // Ci aspettiamo un solo risultato

  if (error) {
    console.error('Errore nel recupero del profilo utente:', error)
    return null
  }

  return data
}