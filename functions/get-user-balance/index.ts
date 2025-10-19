// functions/get-user-balance/index.ts
import { Request, Response } from '@nhost/functions';
import { gql, GraphQLClient } from 'graphql-request';

// Query GraphQL per ottenere SOLO il saldo e l'ID
const GET_BALANCE_QUERY = gql`
  query GetUserBalance($userId: uuid!) {
    profiles_by_pk(id: $userId) {
      id
      creds_balance  # Saldo dei crediti
      invite_count   # Utile per il bilancio degli inviti
    }
  }
`;

export default async (req: Request, res: Response) => {
  // --- GESTORE CORS ---
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-nhost-webhook-secret');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }
  // --------------------

  // 1. Autenticazione e Recupero ID Utente
  const userId = req.nhost?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User ID not found in request context.' });
  }

  // 2. Inizializza il client GraphQL Admin
  const adminSecret = process.env.NHOST_ADMIN_SECRET;
  const graphqlEndpoint = process.env.NHOST_GRAPHQL_URL;

  if (!graphqlEndpoint || !adminSecret) {
      return res.status(500).json({ error: 'Internal Server Error', message: 'Nhost configuration missing.' });
  }
  
  const client = new GraphQLClient(graphqlEndpoint, {
    headers: { 'x-hasura-admin-secret': adminSecret },
  });

  // 3. Esecuzione della Query
  try {
    const variables = { userId: userId };
    const data = await client.request(GET_BALANCE_QUERY, variables);

    if (!data.profiles_by_pk) {
      // Se il profilo non esiste (molto raro qui), restituisci 0
      return res.status(200).json({ creds_balance: 0, invite_count: 0 });
    }

    // Restituisce i dati del bilancio
    return res.status(200).json(data.profiles_by_pk);

  } catch (error: any) {
    console.error('Errore durante il recupero del bilancio (GraphQL):', error);
    return res.status(500).json({ error: 'GraphQL Query Failed', details: error.message || 'Unknown error' });
  }
};