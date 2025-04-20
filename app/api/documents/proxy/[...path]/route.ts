import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { API_BASE_URL } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruct the path from the catch-all segments
    const path = params.path.join('/');
    console.log('Proxying document request for:', path);

    // Construct the backend URL
    const backendUrl = `${API_BASE_URL}/api/documents/${path}`;
    
    // Enhanced retry logic with exponential backoff
    let response;
    let retries = 0;
    const maxRetries = 5;
    const initialTimeout = 5000; // Start with 5 seconds
    const maxTimeout = 30000; // Max 30 seconds
    
    while (retries < maxRetries) {
      try {
        const timeout = Math.min(
          initialTimeout * Math.pow(2, retries),
          maxTimeout
        );
        
        response = await fetch(backendUrl, {
          headers: {
            'Accept': 'application/pdf,application/octet-stream,text/*',
          },
          signal: AbortSignal.timeout(timeout)
        });
        
        if (response.ok) break;
        
        // If response not OK but not timeout, throw immediately
        throw new Error(`Request failed with status ${response.status}`);
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          console.error(`Final retry failed after ${maxRetries} attempts`);
          throw error;
        }
        
        const waitTime = Math.min(
          1000 * Math.pow(2, retries),
          10000 // Max 10 seconds between retries
        );
        
        console.log(`Retry ${retries} failed, waiting ${waitTime}ms before next attempt`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    if (!response || !response.ok) {
      console.error('Backend response not OK:', response?.status, response?.statusText);
      return new NextResponse(
        JSON.stringify({
          error: 'Failed to fetch document',
          message: 'The request timed out after multiple retries',
          status: response?.status || 504
        }),
        {
          status: response?.status || 504,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const blob = await response.blob();

    // Return the proxied response with appropriate headers
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}