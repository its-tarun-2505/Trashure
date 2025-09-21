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

    // Get the user's information
    const user = await User.findById(payload.sub).lean()
    if (!user || user.role !== 'citizen') {
      return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 })
    }

    const { id } = params

    // Find the request
    const request = await PickupRequest.findById(id)
    if (!request) {
      return NextResponse.json({ ok: false, error: 'Request not found' }, { status: 404 })
    }

    // Check if the request belongs to this citizen
    if (request.citizen.toString() !== payload.sub) {
      return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 })
    }

    // Check if request is in pending completion status
    if (request.status !== 'pending-completion') {
      return NextResponse.json({ ok: false, error: 'Request is not pending completion approval' }, { status: 400 })
    }

    // Update request status to completed
    request.status = 'completed'
    request.completionApprovedAt = new Date()
    request.completedAt = new Date()
    
    await request.save()

    // Fetch the updated request with populated data
    const updatedRequest = await PickupRequest.findById(id)
      .populate('citizen', 'name email phone')
      .populate('collector', 'name email phone')
      .lean()

    return NextResponse.json({ 
      ok: true, 
      message: 'Request completed successfully',
      request: updatedRequest
    }, { status: 200 })

  } catch (error) {
    console.error('Error approving completion:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to approve completion' 
    }, { status: 500 })
  }
}


