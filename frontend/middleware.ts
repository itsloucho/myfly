import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Extract subdomain
  const parts = hostname.split('.');
  
  // For local development (e.g., agency1.localhost:3000)
  if (parts.length >= 2) {
    const subdomain = parts[0];
    
    // Skip if it's www or localhost or IP
    if (subdomain !== 'www' && subdomain !== 'localhost' && !subdomain.match(/^\d/)) {
      // Store subdomain in header for API calls
      const response = NextResponse.next();
      response.headers.set('x-tenant-slug', subdomain);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

