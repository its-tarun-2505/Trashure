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

    // Get the collector's information
    const collector = await User.findById(payload.sub).lean()
    if (!collector || collector.role !== 'collector') {
      return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 403 })
    }

    // Get the collection ID from params
    const { id: collectionId } = await params

    // Fetch the specific collection with citizen information
    const collection = await PickupRequest.findOne({
      _id: collectionId,
      collector: payload.sub // Ensure the collector can only access their own collections
    })
      .populate('citizen', 'name email phone')
      .lean()

    if (!collection) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Collection not found or access denied' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      ok: true, 
      collection 
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching collection details:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to fetch collection details' 
    }, { status: 500 })
  }
}
