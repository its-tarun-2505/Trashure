import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { dbConnect } from '@/lib/db.js'
import User from '@/models/User.js'

export async function POST(req) {
  try {
    await dbConnect()
    const body = await req.json()
    const { role, email, password } = body || {}

    if (!role || !email || !password) {
      return NextResponse.json({ message: 'Role, email and password are required' }, { status: 400 })
    }

    // normalize
    const normalizedEmail = String(email).trim().toLowerCase()
    let requestedRole = String(role).trim()

    // map any UI-only roles to real roles (if you used demo_collector)
    if (requestedRole === 'demo_collector') requestedRole = 'collector'

    const user = await User.findOne({ email: normalizedEmail }).lean()
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // enforce role match
    if (user.role !== requestedRole) {
      return NextResponse.json({ message: 'Role does not match account' }, { status: 403 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    // decide redirect based on role
    const redirectMap = {
      citizen: '/citizen',
      collector: '/collector',
      admin: '/admin'
    }
    const redirect = redirectMap[user.role] || '/'

    // NOTE: This endpoint currently only authenticates and returns redirect.
    // For production you should create a session / set an HttpOnly cookie or return a JWT.
    return NextResponse.json({ message: 'Authenticated', redirect }, { status: 200 })
  } catch (err) {
    console.error('login error', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}