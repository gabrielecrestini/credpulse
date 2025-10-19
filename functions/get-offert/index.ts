// functions/get-offers/index.ts
import { Request, Response } from '@nhost/functions';
import { gql, GraphQLClient } from 'graphql-request';

const GET_ACTIVE_OFFERS_QUERY = gql`
  query GetActiveOffers {
    offers(where: { is_active: { _eq: true } }) {
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
  // ✅ Gestione CORS PRIMA DI TUTTO
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-nhost-webhook-secret');

  // ✅ Risposta immediata al preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const adminSecret = process.env.NHOST_ADMIN_SECRET;
  const graphqlEndpoint = process.env.NHOST_GRAPHQL_URL;

  if (!graphqlEndpoint || !adminSecret) {
    console.error('Manca configurazione Nhost');
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  const client = new GraphQLClient(graphqlEndpoint, {
    headers: { 'x-hasura-admin-secret': adminSecret },
  });

  try {
    const data = await client.request(GET_ACTIVE_OFFERS_QUERY);
    return res.status(200).json(data.offers);
  } catch (error: any) {
    console.error('Errore GraphQL:', error);
    return res.status(500).json({ error: 'Failed to fetch offers', message: error.message });
  }
};

