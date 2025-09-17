import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db.js'
import User from '@/models/User.js'

export async function POST(req) {
  try {
    await dbConnect()
    const body = await req.json()
    const { name, email, phone, address, password } = body || {}

   // Server-side validation
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^\d{7,15}$/;

    if (!name || !email || !phone || !address || !password) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    if (!emailRe.test(email)) {
    return NextResponse.json({ message: 'Invalid email' }, { status: 400 });
    }

    if (!phoneRe.test(phone.replace(/\s|[-()]/g, ''))) {
    return NextResponse.json({ message: 'Enter a valid phone number (7-15 digits)' }, { status: 400 });
    }

    if (password.length < 8) {
    return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase() }).lean()
    if (existing) return NextResponse.json({ message: 'Email already in use' }, { status: 409 })

    const user = new User({
      role: 'citizen',
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      password
    })

    await user.save()

    return NextResponse.json({ message: 'User created', user: user.toJSON() }, { status: 201 })
  } catch (err) {
    console.error('register error', err)
    // duplicate key / unique index error handling
    if (err.code === 11000) {
      return NextResponse.json({ message: 'Email already in use' }, { status: 409 })
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}