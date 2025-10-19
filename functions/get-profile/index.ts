// functions/get-profile/index.ts
import { Request, Response } from '@nhost/functions'
import { gql, GraphQLClient } from 'graphql-request'

// ✅ Query GraphQL per ottenere i dati del profilo
const GET_PROFILE_QUERY = gql`
  query GetUserProfile($userId: uuid!) {
    profiles_by_pk(id: $userId) {
      id
      referral_code
      creds_balance
      invite_count
      username
      created_at
    }
  }
`

export default async (req: Request, res: Response) => {
  // 🌐 --- GESTIONE CORS ---
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-nhost-webhook-secret')

  // Risposta immediata al preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  // 🧑 --- AUTENTICAZIONE ---
  const userId = req.nhost?.userId

  if (!userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token non valido o utente non autenticato.',
    })
  }

  // 🔐 --- CONFIGURAZIONE NHOST ---
  const graphqlEndpoint = process.env.NHOST_GRAPHQL_URL
  const adminSecret = process.env.NHOST_ADMIN_SECRET

  if (!graphqlEndpoint || !adminSecret) {
    console.error('❌ Configurazione Nhost mancante.')
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Nhost GraphQL URL o Admin Secret mancanti.',
    })
  }

  const client = new GraphQLClient(graphqlEndpoint, {
    headers: {
      'x-hasura-admin-secret': adminSecret,
    },
  })

  // 🧾 --- ESECUZIONE QUERY ---
  try {
    const variables = { userId }
    const data = await client.request(GET_PROFILE_QUERY, variables)

    if (!data.profiles_by_pk) {
      // ✅ Risposta pulita per utenti nuovi senza profilo
      return res.status(200).json({
        id: userId,
        referral_code: null,
        creds_balance: 0,
        invite_count: 0,
        username: null,
        created_at: null,
        isNewProfile: true,
      })
    }

    // ✅ Restituisci il profilo esistente
    return res.status(200).json(data.profiles_by_pk)
  } catch (error: any) {
    console.error('❌ Errore GraphQL get-profile:', JSON.stringify(error, null, 2))
    return res.status(500).json({
      error: 'GraphQL Query Failed',
      message: error.message || 'Errore sconosciuto durante il fetch del profilo.',
    })
  }
}
