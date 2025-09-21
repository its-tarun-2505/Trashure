import { NextResponse } from 'next/server'

const COOKIE_NAME = 'trashure_auth'
const AUTH_SECRET = process.env.AUTH_SECRET

function base64url(input) {
  return btoa(input)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

async function verifyToken(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [headerB64, payloadB64, signature] = parts
  const data = `${headerB64}.${payloadB64}`
  
  // Use Web Crypto API instead of Node.js crypto
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(AUTH_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  const expected = base64url(String.fromCharCode(...new Uint8Array(signatureBuffer)))

  if (signature !== expected) return null
  try {
    const json = JSON.parse(atob(payloadB64))
    if (json.exp && Math.floor(Date.now() / 1000) > json.exp) return null
    return json
  } catch {
    return null
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/citizen')) {
    const token = req.cookies.get(COOKIE_NAME)?.value
    const payload = await verifyToken(token)

    if (!payload) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    if (payload.role !== 'citizen') {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('next', pathname)
      url.searchParams.set('error', 'role')
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith('/collector')) {
    const token = req.cookies.get(COOKIE_NAME)?.value
    const payload = await verifyToken(token)

    if (!payload) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }

    if (payload.role !== 'collector') {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('next', pathname)
      url.searchParams.set('error', 'role')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/citizen', '/citizen/:path*', '/collector', '/collector/:path*']
}