import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { dbConnect } from '@/lib/db.js'
import { verifyToken } from '@/lib/auth.js'
import User from '@/models/User.js'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function PATCH(req) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('trashure_auth')?.value
    const payload = verifyToken(token)
    if (!payload?.sub) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Parse multipart form
    const form = await req.formData()
    const updates = {
      name: (form.get('name') || '').toString(),
      email: (form.get('email') || '').toString(),
      phone: (form.get('phone') || '').toString(),
      address: (form.get('address') || '').toString()
    }

    // Optional: handle photo upload
    const file = form.get('photo')
    if (file && typeof file === 'object' && 'arrayBuffer' in file) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'users')
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
      const ab = await file.arrayBuffer()
      const buffer = Buffer.from(ab)
      const ext = (file.type?.split('/')?.[1] || 'jpg')
      const filename = `${payload.sub}-${Date.now()}.${ext}`
      const filepath = path.join(uploadDir, filename)
      fs.writeFileSync(filepath, buffer)
      updates.photoUrl = `/uploads/users/${filename}`
    }

    // Save
    const user = await User.findByIdAndUpdate(payload.sub, updates, { new: true }).lean()
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })
    const { password, ...safe } = user
    return NextResponse.json({ ok: true, user: safe }, { status: 200 })
  } catch (e) {
    console.error('Profile update error', e)
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}