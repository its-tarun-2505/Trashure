import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbConnect } from '@/lib/db.js'
import { verifyToken } from '@/lib/auth.js'
import Notification from '@/models/Notification.js'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('trashure_auth')?.value
    const payload = verifyToken(token)
    
    if (!payload?.sub) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const notifications = await Notification.find({ 
      user: payload.sub 
    }).sort({ createdAt: -1 }).lean()

    return NextResponse.json(notifications, { status: 200 })
  } catch (err) {
    console.error('notifications GET error', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('trashure_auth')?.value
    const payload = verifyToken(token)
    
    if (!payload?.sub) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, message, type = 'info' } = body || {}

    if (!title || !message) {
      return NextResponse.json({ message: 'Title and message are required' }, { status: 400 })
    }

    await dbConnect()
    const notification = new Notification({
      user: payload.sub,
      title,
      message,
      type,
      read: false
    })

    await notification.save()
    return NextResponse.json({ message: 'Notification created', notification }, { status: 201 })
  } catch (err) {
    console.error('notifications POST error', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

