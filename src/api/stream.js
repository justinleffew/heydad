import { supabase } from '../lib/supabaseClient';

const CLOUDFLARE_ACCOUNT_ID = import.meta.env.VITE_CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = import.meta.env.VITE_CLOUDFLARE_API_TOKEN;

export async function createStreamUploadUrl(userId) {
  try {
    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('User not found');
    }

    // Request upload URL from Cloudflare
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          maxDurationSeconds: 1800, // 30min limit per video
          creator: userId
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudflare API error: ${response.status} ${errorText}`);
    }

    const { result } = await response.json();

    return {
      uploadURL: result.uploadURL,
      cloudflareVideoId: result.uid
    };
  } catch (error) {
    console.error('Error creating stream upload URL:', error);
    throw error;
  }
} 