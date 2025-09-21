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

    const { id } = params

    // Find the pickup request
    const pickupRequest = await PickupRequest.findById(id)
    
    if (!pickupRequest) {
      return NextResponse.json({ ok: false, error: 'Pickup request not found' }, { status: 404 })
    }

    // Check if request is still pending
    if (pickupRequest.status !== 'pending') {
      return NextResponse.json({ ok: false, error: 'Request has already been processed' }, { status: 400 })
    }

    // Update the request status to accepted and assign collector
    pickupRequest.status = 'accepted'
    pickupRequest.collector = payload.sub
    pickupRequest.acceptedAt = new Date()
    
    await pickupRequest.save()

    // Fetch the updated request with collector information
    const updatedRequest = await PickupRequest.findById(pickupRequest._id)
      .populate('collector', 'name email phone profileImage')
      .populate('citizen', 'name email')
      .lean()

    return NextResponse.json({ 
      ok: true, 
      message: 'Request accepted successfully',
      request: updatedRequest
    }, { status: 200 })

  } catch (error) {
    console.error('Error accepting pickup request:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to accept pickup request' 
    }, { status: 500 })
  }
}
