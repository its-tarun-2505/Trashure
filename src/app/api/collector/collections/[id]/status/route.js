import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth.js'
import { dbConnect } from '@/lib/db.js'
import PickupRequest from '@/models/PickupRequest.js'
import User from '@/models/User.js'

export async function PATCH(request, { params }) {
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
    const { status } = await request.json()

    // Validate status
    const validStatuses = ['accepted', 'on-the-way', 'collected', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 })
    }

    // Find the collection
    const collection = await PickupRequest.findById(id)
    if (!collection) {
      return NextResponse.json({ ok: false, error: 'Collection not found' }, { status: 404 })
    }

    // Check if the collection belongs to this collector
    if (collection.collector.toString() !== payload.sub) {
      return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 })
    }

    // Update the collection status
    collection.status = status
    
    // Set timestamps for different statuses
    if (status === 'on-the-way') {
      collection.onTheWayAt = new Date()
    } else if (status === 'collected') {
      collection.collectedAt = new Date()
    } else if (status === 'completed') {
      collection.completedAt = new Date()
    }
    
    await collection.save()

    // Fetch the updated collection with populated citizen data
    const updatedCollection = await PickupRequest.findById(id)
      .populate('citizen', 'name email phone')
      .lean()

    return NextResponse.json({ 
      ok: true, 
      message: 'Status updated successfully',
      collection: updatedCollection
    }, { status: 200 })

  } catch (error) {
    console.error('Error updating collection status:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to update collection status' 
    }, { status: 500 })
  }
}
