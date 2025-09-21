import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbConnect } from '@/lib/db.js'
import { verifyToken } from '@/lib/auth.js'
import User from '@/models/User.js'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('trashure_auth')?.value
    const payload = verifyToken(token)
    if (!payload?.sub) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    await dbConnect()
    const user = await User.findById(payload.sub).lean()
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })
    const { password, ...safe } = user
    return NextResponse.json({ ok: true, user: safe }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}