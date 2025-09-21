import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ message: 'Logged out' }, { status: 200 })
  // Expire the cookie immediately
  res.headers.append(
    'Set-Cookie',
    'trashure_auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
  )
  return res
}


