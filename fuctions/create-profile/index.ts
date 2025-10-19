// functions/create-profile/index.ts
import { Request, Response } from '@nhost/functions';
import { gql, GraphQLClient } from 'graphql-request';

const generateReferralCode = () => 'CP-' + Math.random().toString(36).substring(2, 8).toUpperCase();

const INSERT_PROFILE_MUTATION = gql`
  mutation InsertProfileOnSignup($id: uuid!, $referral_code: String!) {
    insert_profiles_one(object: {id: $id, referral_code: $referral_code}) {
      id
    }
  }
`;

export default async (req: Request, res: Response) => {
  const adminSecret = process.env.NHOST_ADMIN_SECRET;
  const requestSecret = req.headers['x-nhost-webhook-secret'];
  if (!adminSecret || requestSecret !== adminSecret) {
    return res.status(401).send('Unauthorized');
  }

  const userId = req.body.event?.data?.new?.id;
  if (!userId) {
    return res.status(400).send('Bad Request: Missing user ID');
  }

  const referralCode = generateReferralCode();
  const graphqlEndpoint = process.env.NHOST_GRAPHQL_URL;
  if (!graphqlEndpoint) {
      return res.status(500).send('Internal Server Error: GraphQL URL missing');
  }
  const client = new GraphQLClient(graphqlEndpoint, {
    headers: { 'x-hasura-admin-secret': adminSecret },
  });

  try {
    const variables = { id: userId, referral_code: referralCode };
    await client.request(INSERT_PROFILE_MUTATION, variables);
    return res.status(200).json({ message: 'Profile created successfully' });
  } catch (error: any) {
    console.error('Error inserting profile:', error);
     if (error.response?.errors?.[0]?.extensions?.code === 'constraint-violation') {
        return res.status(200).json({ message: 'Profile already exists' });
    }
    return res.status(500).send(`Internal Server Error: ${error.message || 'Unknown error'}`);
  }
};