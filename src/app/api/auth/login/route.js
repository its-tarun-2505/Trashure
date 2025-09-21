import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { dbConnect } from '@/lib/db.js'
import User from '@/models/User.js'
import { signToken, createAuthCookie } from '@/lib/auth.js'

export async function POST(req) {
  try {
    await dbConnect()
    const body = await req.json()
    const { role, email, password } = body || {}

    if (!role || !email || !password) {
      return NextResponse.json({ message: 'Role, email and password are required' }, { status: 400 })
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    let requestedRole = String(role).trim()

    // if (requestedRole === 'demo_collector') requestedRole = 'collector'

    const user = await User.findOne({ email: normalizedEmail }).lean()
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // role match
    if (user.role !== requestedRole) {
      return NextResponse.json({ message: 'Role does not match account' }, { status: 403 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // set auth cookie
    const token = signToken({ sub: String(user._id), role: user.role, email: user.email })
    const res = NextResponse.json({ message: 'Authenticated' }, { status: 200 })
    res.headers.append('Set-Cookie', createAuthCookie(token))

    // decide redirect based on role (client can redirect after success)
    const redirectMap = {
      citizen: '/citizen/dashboard',
      collector: '/collector/dashboard',
      admin: '/admin'
    }
    const redirect = redirectMap[user.role] || '/'
    res.headers.set('x-redirect', redirect)
    return res
  } catch (err) {
    console.error('login error', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}