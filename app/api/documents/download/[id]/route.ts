import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const response = await fetch(`https://ijgapis.onrender.com/api/documents/download/${id}`);

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition') || '';
    
    // Forward the file from the backend
    const blob = await response.blob();
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return new NextResponse('Failed to download document', { status: 500 });
  }
}