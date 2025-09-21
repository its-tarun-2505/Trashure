import crypto from 'crypto'

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-insecure-secret-change-me'
const COOKIE_NAME = 'trashure_auth'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + COOKIE_MAX_AGE
  const fullPayload = { ...payload, iat, exp }

  const headerB64 = base64url(JSON.stringify(header))
  const payloadB64 = base64url(JSON.stringify(fullPayload))
  const data = `${headerB64}.${payloadB64}`
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${data}.${signature}`
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [headerB64, payloadB64, signature] = parts
  const data = `${headerB64}.${payloadB64}`
  const expected = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  if (signature !== expected) return null
  try {
    const json = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'))
    if (json.exp && Math.floor(Date.now() / 1000) > json.exp) return null
    return json
  } catch {
    return null
  }
}

export function createAuthCookie(value) {
  const maxAge = COOKIE_MAX_AGE
  const cookie = `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
  return cookie
}

export function parseAuthCookie(cookieHeader) {
  if (!cookieHeader) return null
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...rest] = c.trim().split('=')
      return [k, rest.join('=')]
    })
  )
  return cookies[COOKIE_NAME] || null
}

export const authConstants = { COOKIE_NAME, COOKIE_MAX_AGE }

