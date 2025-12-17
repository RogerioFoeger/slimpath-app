import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Simple pass-through middleware
  // Auth will be handled by individual pages
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
}

