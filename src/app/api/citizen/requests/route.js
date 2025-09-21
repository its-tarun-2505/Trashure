import { NextResponse } from 'next/server'
import { dbConnect } from '../../../../lib/db.js'
import Request from '../../../../models/PickupRequest.js'
import fs from 'fs'
import path from 'path'

// run in node runtime to allow fs
export const runtime = 'nodejs'


// POST
export async function POST(req) {
  try {
    await dbConnect()
    
    // Get user from auth token
    const { cookies } = await import('next/headers')
    const { verifyToken } = await import('@/lib/auth.js')
    const cookieStore = await cookies()
    const token = cookieStore.get('trashure_auth')?.value
    const payload = verifyToken(token)
    
    if (!payload?.sub) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const { category, address, scheduledAt, images = [] } = body || {}

    if (!category || !address || !scheduledAt) {
      return NextResponse.json({ message: 'Category, address and scheduledAt are required' }, { status: 400 })
    }

    // decode & save images (base64 data URLs) to public/uploads/requests
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'requests')
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

    const savedFiles = []
    for (const img of images) {
      // img: { name, data, type } where data is dataURL (data:<mime>;base64,...)
      try {
        if (!img.data || typeof img.data !== 'string') continue
        const matches = img.data.match(/^data:(.+);base64,(.*)$/)
        if (!matches) continue
        const mime = matches[1]
        const b64 = matches[2]
        const ext = mime.split('/')[1] || 'jpg'
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`
        const filepath = path.join(uploadDir, filename)
        const buffer = Buffer.from(b64, 'base64')
        // write file
        fs.writeFileSync(filepath, buffer)
        // save relative path for DB (accessible at /uploads/requests/<filename>)
        savedFiles.push(`/uploads/requests/${filename}`)
      } catch (err) {
        // continue on error for individual images
        console.error('image save error', err)
      }
    }

    const reqDoc = new Request({
      citizen: payload.sub,
      category,
      address,
      scheduledAt: new Date(scheduledAt),
      images: savedFiles,
      status: 'pending' // Explicitly set initial status
    })

    await reqDoc.save()
    return NextResponse.json({ message: 'Request created', requestId: reqDoc._id }, { status: 201 })
  } catch (err) {
    console.error('requests route error', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// GET
export async function GET(req) {
  try {
    await dbConnect()
    
    // Get user from auth token
    const { cookies } = await import('next/headers')
    const { verifyToken } = await import('@/lib/auth.js')
    const cookieStore = await cookies()
    const token = cookieStore.get('trashure_auth')?.value
    const payload = verifyToken(token)
    
    if (!payload?.sub) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    // Only return requests for the authenticated user
    const items = await Request.find({ citizen: payload.sub }).sort({ createdAt: -1 }).lean()
    return NextResponse.json(items, { status: 200 })
  } catch (err) {
    console.error('requests GET error', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}