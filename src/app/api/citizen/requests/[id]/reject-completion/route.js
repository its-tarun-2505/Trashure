import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth.js'
import { dbConnect } from '@/lib/db.js'
import PickupRequest from '@/models/PickupRequest.js'
import User from '@/models/User.js'

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

    // Get the citizen's information
    const citizen = await User.findById(payload.sub).lean()
    if (!citizen || citizen.role !== 'citizen') {
      return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 })
    }

    const { id } = await params
    const { feedback } = await request.json()

    if (!feedback || !feedback.trim()) {
      return NextResponse.json({ ok: false, error: 'Feedback is required' }, { status: 400 })
    }

    // Find the request
    const pickupRequest = await PickupRequest.findById(id)
    if (!pickupRequest) {
      return NextResponse.json({ ok: false, error: 'Request not found' }, { status: 404 })
    }

    // Check if the request belongs to this citizen
    if (pickupRequest.citizen.toString() !== payload.sub) {
      return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 })
    }

    // Check if request is in pending-completion status
    if (pickupRequest.status !== 'pending-completion') {
      return NextResponse.json({ 
        ok: false, 
        error: 'Can only reject completion requests that are pending approval' 
      }, { status: 400 })
    }

    // Update request status to rejected and add rejection feedback
    pickupRequest.status = 'rejected'
    pickupRequest.rejectionFeedback = feedback.trim()
    pickupRequest.rejectedAt = new Date()
    pickupRequest.rejectedBy = payload.sub

    await pickupRequest.save()

    // Populate the updated request with citizen and collector details
    const updatedRequest = await PickupRequest.findById(id)
      .populate('citizen', 'name email phone')
      .populate('collector', 'name email phone profileImage')
      .lean()

    return NextResponse.json({ 
      ok: true, 
      message: 'Completion request rejected successfully',
      request: updatedRequest
    }, { status: 200 })

  } catch (error) {
    console.error('Error rejecting completion:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to reject completion request' 
    }, { status: 500 })
  }
}
