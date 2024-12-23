export const dynamic = "force-dynamic";


export async function GET(request: any) {
    // Get the search parameters from the request URL
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
  
    // Create a response
    const message = username ? `Hello ${username}` : 'Hello guest';
  
    return new Response(JSON.stringify({ message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  