// functions/create-profile/index.ts
import { Request, Response } from '@nhost/functions';
import { gql, GraphQLClient, ClientError } from 'graphql-request'; // Import ClientError for better typing

// Funzione Helper per generare codice referral
const generateReferralCode = () => 'CP-' + Math.random().toString(36).substring(2, 8).toUpperCase();

// Mutation GraphQL per inserire il profilo
// Assicurati che i tipi (uuid!, String!) corrispondano a quelli nel tuo schema Hasura
const INSERT_PROFILE_MUTATION = gql`
  mutation InsertProfileOnSignup($id: uuid!, $referral_code: String!) {
    insert_profiles_one(object: {id: $id, referral_code: $referral_code}) {
      id # Puoi chiedere indietro i dati che vuoi, es. created_at
    }
  }
`;

export default async (req: Request, res: Response) => {
  // --- Sicurezza: Verifica il segreto del webhook ---
  const adminSecret = process.env.NHOST_ADMIN_SECRET;
  const requestSecret = req.headers['x-nhost-webhook-secret'];

  // Verifica robusta del segreto
  if (!adminSecret || !requestSecret || requestSecret !== adminSecret) {
    console.error('Tentativo di accesso non autorizzato: segreto webhook invalido o mancante.');
    return res.status(401).send('Unauthorized');
  }

  // --- Estrai l'ID utente dall'evento di Hasura ---
  const userId = req.body.event?.data?.new?.id;
  if (!userId || typeof userId !== 'string') { // Aggiunto controllo tipo
    console.error('ID utente mancante o non valido nel payload dell\'evento:', req.body.event?.data?.new);
    return res.status(400).send('Bad Request: Missing or invalid user ID');
  }

  // --- Genera il codice referral ---
  const referralCode = generateReferralCode();

  // --- Inizializza il client GraphQL ---
  const graphqlEndpoint = process.env.NHOST_GRAPHQL_URL;
  if (!graphqlEndpoint) {
      console.error('Variabile d\'ambiente NHOST_GRAPHQL_URL non trovata.');
      return res.status(500).send('Internal Server Error: GraphQL endpoint configuration missing');
  }

  const client = new GraphQLClient(graphqlEndpoint, {
    headers: { 'x-hasura-admin-secret': adminSecret },
  });

  // --- Esegui la mutation per inserire il profilo ---
  try {
    const variables = {
      id: userId,
      referral_code: referralCode,
    };
    console.log(`Tentativo inserimento profilo per utente: ${userId} con codice: ${referralCode}`);
    const data = await client.request(INSERT_PROFILE_MUTATION, variables);
    console.log(`Profilo creato con successo per l'utente ${userId}`, data);
    // Risposta JSON standard
    return res.status(200).json({ message: 'Profile created successfully', userId: userId });

  } catch (error) {
    console.error('Errore durante l\'inserimento del profilo:', JSON.stringify(error, null, 2)); // Logga l'errore completo

    // Controlla specificamente l'errore di violazione del vincolo (es. profilo già esistente)
    if (error instanceof ClientError && error.response?.errors?.[0]?.extensions?.code === 'constraint-violation') {
        console.warn(`Profilo già esistente per l'utente ${userId} (rilevato durante inserimento).`);
        // Rispondi OK se esiste già, potrebbe succedere se il trigger viene chiamato più volte
        return res.status(200).json({ message: 'Profile already exists', userId: userId });
    }

    // Errore generico
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during profile insertion';
    return res.status(500).json({ error: 'Internal Server Error', details: errorMessage }); // Risposta JSON per errori
  }
};