import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth.js'
import { dbConnect } from '@/lib/db.js'
import PickupRequest from '@/models/PickupRequest.js'
import User from '@/models/User.js'

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

    const { id } = await params
    const { completionNotes } = await request.json()

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
      return NextResponse.json({ ok: false, error: 'Can only request completion for collected items' }, { status: 400 })
    }

    // Update collection status to pending completion
    collection.status = 'pending-completion'
    collection.completionRequestedAt = new Date()
    collection.completionNotes = completionNotes || ''
    
    await collection.save()

    // Fetch the updated collection with populated data
    const updatedCollection = await PickupRequest.findById(id)
      .populate('citizen', 'name email phone')
      .populate('collector', 'name email phone')
      .lean()

    return NextResponse.json({ 
      ok: true, 
      message: 'Completion request sent to citizen successfully',
      collection: updatedCollection
    }, { status: 200 })

  } catch (error) {
    console.error('Error requesting completion:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to request completion' 
    }, { status: 500 })
  }
}


