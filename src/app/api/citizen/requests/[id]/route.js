import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth.js'
import { dbConnect } from '@/lib/db.js'
import PickupRequest from '@/models/PickupRequest.js'
import User from '@/models/User.js'

export async function GET(request, { params }) {
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

    // Fetch the specific request with collector information
    const request = await PickupRequest.findOne({
      _id: id,
      citizen: payload.sub // Ensure the citizen can only access their own requests
    })
      .populate('collector', 'name email phone profileImage')
      .lean()

    if (!request) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Request not found or access denied' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      ok: true, 
      request 
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching request details:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to fetch request details' 
    }, { status: 500 })
  }
}