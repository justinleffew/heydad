import { createStreamUploadUrl } from '../stream';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return new Response('User ID is required', { status: 400 });
    }

    const result = await createStreamUploadUrl(userId);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in createStreamUploadUrl route:', error);
    return new Response(error.message, { status: 500 });
  }
} 