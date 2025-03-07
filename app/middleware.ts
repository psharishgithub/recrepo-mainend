import { withAuth } from "next-auth/middleware"
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname
    const isAuthenticated = !!req.nextauth.token

    // Block unauthenticated users from accessing protected routes
    if (!isAuthenticated && (
      path.startsWith('/dashboard') || 
      path.startsWith('/library') || 
      path.startsWith('/upload')
    )) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Redirect authenticated users from login to dashboard
    if (isAuthenticated && path === '/') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/', '/dashboard(.*)']
}