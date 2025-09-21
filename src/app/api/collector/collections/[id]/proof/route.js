import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth.js'
import { dbConnect } from '@/lib/db.js'
import PickupRequest from '@/models/PickupRequest.js'
import User from '@/models/User.js'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function POST(request, { params }) {
  try {
    // Verify authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('trashure_auth')?.value
    const payload = verifyToken(token)
    
    if (!payload?.sub) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Get the collector's information
    const collector = await User.findById(payload.sub).lean()
    if (!collector || collector.role !== 'collector') {
      return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 })
    }

    const { id } = params

    // Find the collection
    const collection = await PickupRequest.findById(id)
    if (!collection) {
      return NextResponse.json({ ok: false, error: 'Collection not found' }, { status: 404 })
    }

    // Check if the collection belongs to this collector
    if (collection.collector.toString() !== payload.sub) {
      return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 })
    }

    // Check if collection is in collected status
    if (collection.status !== 'collected') {
      return NextResponse.json({ ok: false, error: 'Can only upload proof for collected items' }, { status: 400 })
    }

    // Parse form data
    const formData = await request.formData()
    const proofImages = formData.getAll('proofImages')

    if (proofImages.length === 0) {
      return NextResponse.json({ ok: false, error: 'No images provided' }, { status: 400 })
    }

    // Create upload directory for proof images
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'proof')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const savedFiles = []
    for (const image of proofImages) {
      if (image && image.size > 0) {
        try {
          // Generate unique filename
          const filename = `proof-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${image.name.split('.').pop()}`
          const filepath = path.join(uploadDir, filename)
          
          // Convert to buffer and save
          const buffer = Buffer.from(await image.arrayBuffer())
          fs.writeFileSync(filepath, buffer)
          
          // Save relative path for DB
          savedFiles.push(`/uploads/proof/${filename}`)
        } catch (err) {
          console.error('Error saving proof image:', err)
        }
      }
    }

    if (savedFiles.length === 0) {
      return NextResponse.json({ ok: false, error: 'Failed to save images' }, { status: 500 })
    }

    // Update collection with proof images
    collection.proofImages = [...(collection.proofImages || []), ...savedFiles]
    await collection.save()

    return NextResponse.json({ 
      ok: true, 
      message: 'Proof images uploaded successfully',
      proofImages: collection.proofImages
    }, { status: 200 })

  } catch (error) {
    console.error('Error uploading proof images:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to upload proof images' 
    }, { status: 500 })
  }
}


