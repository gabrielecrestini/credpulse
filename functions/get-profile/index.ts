// functions/get-profile/index.ts
import { Request, Response } from '@nhost/functions';
import { gql, GraphQLClient } from 'graphql-request';

// Query GraphQL per ottenere i dati del profilo
const GET_PROFILE_QUERY = gql`
  query GetUserProfile($userId: uuid!) {
    profiles_by_pk(id: $userId) {
      id
      referral_code
      creds_balance
      invite_count
      username
      created_at
      # Aggiungi altri campi se necessario
    }
  }
`;

export default async (req: Request, res: Response) => {
  // --- Ottieni l'ID utente dal contesto Nhost ---
  // Nhost inserisce automaticamente le informazioni sull'utente autenticato
  const userId = req.nhost?.userId; // Controlla la documentazione Nhost per il nome esatto della proprietà
  if (!userId) {
    console.error('Tentativo accesso non autenticato a get-profile.');
    return res.status(401).send('Unauthorized');
  }

  // --- Inizializza il client GraphQL ---
  const adminSecret = process.env.NHOST_ADMIN_SECRET;
  const graphqlEndpoint = process.env.NHOST_GRAPHQL_URL;
  if (!graphqlEndpoint || !adminSecret) {
      console.error('Configurazione GraphQL o Admin Secret mancante per get-profile.');
      return res.status(500).send('Internal Server Error: Configuration missing');
  }
  const client = new GraphQLClient(graphqlEndpoint, {
    headers: { 'x-hasura-admin-secret': adminSecret },
  });

  // --- Esegui la query ---
  try {
    const variables = { userId: userId };
    console.log(`Recupero profilo per utente: ${userId}`);
    const data = await client.request(GET_PROFILE_QUERY, variables);

    if (!data.profiles_by_pk) {
      console.warn(`Profilo non trovato per l'utente ${userId}. Potrebbe non essere ancora stato creato.`);
      // Potresti voler creare il profilo qui se manca (logica "upsert")
      return res.status(404).json({ error: 'Profile not found' });
    }

    console.log(`Profilo recuperato per ${userId}`);
    // Restituisci i dati del profilo
    return res.status(200).json(data.profiles_by_pk);

  } catch (error: any) {
    console.error('Errore durante il recupero del profilo:', JSON.stringify(error, null, 2));
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during profile fetch';
    return res.status(500).json({ error: 'Internal Server Error', details: errorMessage });
  }
};