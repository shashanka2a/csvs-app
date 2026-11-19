import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');

  if (!fileId) {
    return new NextResponse('Missing video file id', { status: 400 });
  }

  const range = request.headers.get('range');
  const targetUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download`;

  try {
    const fetchHeaders: Record<string, string> = {
      'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
    };

    if (range) {
      fetchHeaders['Range'] = range;
    }

    const upstreamRes = await fetch(targetUrl, {
      headers: fetchHeaders,
      redirect: 'follow',
      cache: 'no-store',
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      return new NextResponse('Failed to load video stream from storage', {
        status: upstreamRes.status,
      });
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', upstreamRes.headers.get('content-type') || 'video/mp4');
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'public, max-age=7200, s-maxage=7200');

    if (upstreamRes.headers.get('content-range')) {
      responseHeaders.set('Content-Range', upstreamRes.headers.get('content-range')!);
    }
    if (upstreamRes.headers.get('content-length')) {
      responseHeaders.set('Content-Length', upstreamRes.headers.get('content-length')!);
    }

    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.warn('[Video Stream Proxy Error]:', error);
    return new NextResponse('Internal video streaming error', { status: 500 });
  }
}
