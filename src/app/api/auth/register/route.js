import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db.js'
import User from '@/models/User.js'

export async function POST(req) {
  try {
    await dbConnect()

    const body = await req.json()
    const { role, name, email, phone, address, password, latitude, longitude } = body || {}

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

    // For collectors, validate latitude and longitude
    if (role === 'collector') {
      if (!latitude || !longitude) {
        return NextResponse.json({ message: 'Latitude and longitude are required for collectors' }, { status: 400 });
      }
      
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json({ message: 'Invalid latitude or longitude values' }, { status: 400 });
      }
      
      if (lat < -90 || lat > 90) {
        return NextResponse.json({ message: 'Latitude must be between -90 and 90' }, { status: 400 });
      }
      
      if (lng < -180 || lng > 180) {
        return NextResponse.json({ message: 'Longitude must be between -180 and 180' }, { status: 400 });
      }
    }

    const existing = await User.findOne({ email: email.toLowerCase() }).lean()
    if (existing) return NextResponse.json({ message: 'Email already in use' }, { status: 409 })
    
    // Create user object with conditional fields
    const userData = {
      role,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      password
    }

    // Add latitude and longitude for collectors
    if (role === 'collector') {
      userData.latitude = parseFloat(latitude);
      userData.longitude = parseFloat(longitude);
    }

    const user = new User(userData)
    
    await user.save()

    return NextResponse.json({ message: 'User created', user: user.toJSON() }, { status: 201 })
  } catch (err) {
    
    console.log('register error', err)
    // duplicate key / unique index error handling
    if (err.code === 11000) {
      return NextResponse.json({ message: 'Email already in use' }, { status: 409 })
    }
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}