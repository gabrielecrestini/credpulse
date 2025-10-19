// functions/get-offers/index.ts
import { Request, Response } from '@nhost/functions';
import { gql, GraphQLClient } from 'graphql-request';

// Query GraphQL per ottenere tutte le offerte attive (is_active = true)
const GET_ACTIVE_OFFERS_QUERY = gql`
  query GetActiveOffers {
    offers(where: {is_active: {_eq: true}}) {
      id
      title
      description
      reward_creds
      affiliate_link
      provider_name
      category
    }
  }
`;

export default async (req: Request, res: Response) => {
  // --- GESTORE CORS: ESSENZIALE PER LO SVILUPPO LOCALE ---
  // Permette al frontend su localhost:3000 di chiamare questa funzione
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permette a TUTTE le origini in sviluppo
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Metodi permessi
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-nhost-webhook-secret');
  
  // Intercetta la richiesta OPTIONS del browser (preflight check)
  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }
  // -------------------------------------------------------------

  // --- Inizializza il client GraphQL Admin ---
  // Recupera le chiavi dall'ambiente (impostate da Nhost)
  const adminSecret = process.env.NHOST_ADMIN_SECRET;
  const graphqlEndpoint = process.env.NHOST_GRAPHQL_URL;

  if (!graphqlEndpoint || !adminSecret) {
      console.error('Configurazione Nhost mancante per GraphQL.');
      return res.status(500).json({ error: 'Internal Server Error', message: 'Nhost configuration missing.' });
  }

  // Il client userà l'Admin Secret per superare le Row Level Security (RLS)
  const client = new GraphQLClient(graphqlEndpoint, {
    headers: { 'x-hasura-admin-secret': adminSecret },
  });

  // --- Esecuzione della Query ---
  try {
    const data = await client.request(GET_ACTIVE_OFFERS_QUERY);

    // Restituisce l'array di offerte (data.offers) al frontend
    return res.status(200).json(data.offers); 

  } catch (error: any) {
    console.error('Errore durante il recupero delle offerte (GraphQL):', error);
    return res.status(500).json({ error: 'Failed to fetch offers', details: error.message || 'Unknown error' });
  }
};