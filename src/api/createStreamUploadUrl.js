import { supabase } from '../lib/supabase'

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const CLOUDFLARE_ACCOUNT_ID = process.env.VITE_CLOUDFLARE_ACCOUNT_ID
  const CLOUDFLARE_API_TOKEN = process.env.VITE_CLOUDFLARE_API_TOKEN

  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    console.error('Missing Cloudflare config:', {
      hasAccountId: !!CLOUDFLARE_ACCOUNT_ID,
      hasApiToken: !!CLOUDFLARE_API_TOKEN
    })
    return res.status(500).json({ error: 'Missing Cloudflare config' })
  }

  try {
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    console.log('Requesting Cloudflare upload URL with:', {
      accountId: CLOUDFLARE_ACCOUNT_ID,
      hasToken: !!CLOUDFLARE_API_TOKEN,
      userId
    })

    const createResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`
        },
        body: JSON.stringify({
          maxDurationSeconds: 1800, // 30min limit per video
          creator: userId
        })
      }
    )

    const responseText = await createResponse.text()
    console.log('Cloudflare response:', {
      status: createResponse.status,
      body: responseText
    })

    if (!createResponse.ok) {
      return res.status(createResponse.status).json({
        error: `Cloudflare API error: ${createResponse.status}`,
        details: responseText
      })
    }

    const payload = JSON.parse(responseText)
    
    if (!payload.success) {
      console.error('Cloudflare error:', payload)
      return res.status(createResponse.status).json(payload)
    }

    return res.status(200).json({
      uploadURL: payload.result.uploadURL,
      cloudflareVideoId: payload.result.uid
    })
  } catch (err) {
    console.error('Fetch to Cloudflare failed:', err)
    return res.status(500).json({ error: 'Unable to contact Cloudflare' })
  }
} 