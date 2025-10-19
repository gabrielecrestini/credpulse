// functions/get-offers/index.ts
import { Request, Response } from '@nhost/functions';
import { gql, GraphQLClient } from 'graphql-request';

// Query GraphQL per ottenere tutte le offerte attive
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
  // NOTA: Non richiediamo autenticazione Nhost qui, se le offerte sono pubbliche.
  // Se vuoi che solo gli utenti loggati vedano le offerte, usa req.nhost.userId
  
  const adminSecret = process.env.NHOST_ADMIN_SECRET;
  const graphqlEndpoint = process.env.NHOST_GRAPHQL_URL;

  if (!graphqlEndpoint || !adminSecret) {
      return res.status(500).send('Internal Server Error: Configuration missing');
  }

  const client = new GraphQLClient(graphqlEndpoint, {
    headers: { 'x-hasura-admin-secret': adminSecret }, // Usiamo l'admin secret per bypassare i permessi utente
  });

  try {
    const data = await client.request(GET_ACTIVE_OFFERS_QUERY);

    // Restituisce l'array di offerte
    return res.status(200).json(data.offers); 
  } catch (error: any) {
    console.error('Errore durante il recupero delle offerte:', error);
    return res.status(500).json({ error: 'Failed to fetch offers', details: error.message });
  }
};