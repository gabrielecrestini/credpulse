// functions/get-profile/index.ts
import { Request, Response } from '@nhost/functions';
import { gql, GraphQLClient } from 'graphql-request';

// Query GraphQL per ottenere i dati del profilo, incluso il saldo e il codice referral
const GET_PROFILE_QUERY = gql`
  query GetUserProfile($userId: uuid!) {
    profiles_by_pk(id: $userId) {
      id
      # --- Campi richiesti ---
      referral_code  # Codice per il link invita un amico
      creds_balance  # Saldo dei crediti
      # -----------------------
      invite_count
      username
      created_at
    }
  }
`;

export default async (req: Request, res: Response) => {
  // --- 1. Autenticazione e Recupero ID Utente ---
  const userId = req.nhost?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User ID not found in request context.' });
  }

  // --- 2. Inizializza il client GraphQL Admin ---
  const adminSecret = process.env.NHOST_ADMIN_SECRET;
  const graphqlEndpoint = process.env.NHOST_GRAPHQL_URL;

  if (!graphqlEndpoint || !adminSecret) {
      console.error('Configurazione Nhost mancante: GraphQL URL o Admin Secret.');
      return res.status(500).json({ error: 'Internal Server Error', message: 'Nhost configuration missing.' });
  }
  
  const client = new GraphQLClient(graphqlEndpoint, {
    headers: { 'x-hasura-admin-secret': adminSecret },
  });

  // --- 3. Esecuzione della Query GraphQL ---
  try {
    const variables = { userId: userId };
    
    // Esegue la query GraphQL
    const data = await client.request(GET_PROFILE_QUERY, variables);

    // 4. Verifica che il profilo esista
    if (!data.profiles_by_pk) {
      // Restituisce un profilo vuoto ma con 0 crediti e codice nullo in caso di 404
      return res.status(404).json({ 
        error: 'Profile not found', 
        id: userId,
        referral_code: null,
        creds_balance: 0,
        invite_count: 0
      });
    }

    // 5. Restituisce i dati del profilo al frontend
    return res.status(200).json(data.profiles_by_pk);

  } catch (error: any) {
    console.error('Errore durante il recupero del profilo (GraphQL):', JSON.stringify(error, null, 2));
    const errorMessage = error.message || 'Errore sconosciuto durante il fetch del profilo.';
    return res.status(500).json({ error: 'GraphQL Query Failed', details: errorMessage });
  }
};