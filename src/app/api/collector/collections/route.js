import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth.js'
import { dbConnect } from '@/lib/db.js'
import PickupRequest from '@/models/PickupRequest.js'
import User from '@/models/User.js'

export async function GET(request) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get('search')
    const statusFilter = searchParams.get('status')
    const dateFilter = searchParams.get('date')

    // Build filter query - only show requests assigned to this collector
    let filterQuery = { 
      collector: payload.sub,
      status: { $in: ['accepted', 'on-the-way', 'collected', 'completed', 'cancelled'] }
    }
    
    // Status filter
    if (statusFilter) {
      filterQuery.status = statusFilter
    }

    // Date filter
    if (dateFilter) {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      switch (dateFilter) {
        case 'today':
          const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
          filterQuery.scheduledAt = { $gte: startOfDay, $lt: endOfDay }
          break
        case 'tomorrow':
          const tomorrowStart = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
          const tomorrowEnd = new Date(tomorrowStart.getTime() + 24 * 60 * 60 * 1000)
          filterQuery.scheduledAt = { $gte: tomorrowStart, $lt: tomorrowEnd }
          break
        case 'this-week':
          const weekStart = new Date(startOfDay.getTime() - startOfDay.getDay() * 24 * 60 * 60 * 1000)
          const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
          filterQuery.scheduledAt = { $gte: weekStart, $lt: weekEnd }
          break
        case 'next-week':
          const nextWeekStart = new Date(startOfDay.getTime() + (7 - startOfDay.getDay()) * 24 * 60 * 60 * 1000)
          const nextWeekEnd = new Date(nextWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
          filterQuery.scheduledAt = { $gte: nextWeekStart, $lt: nextWeekEnd }
          break
      }
    }

    // Fetch collections with citizen information
    let collections = await PickupRequest.find(filterQuery)
      .populate('citizen', 'name email phone')
      .sort({ scheduledAt: -1 })
      .lean()

    // Apply search filter if provided
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      collections = collections.filter(collection => 
        collection.citizen?.name?.toLowerCase().includes(searchLower) ||
        collection.address?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({ 
      ok: true, 
      collections: collections 
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to fetch collections' 
    }, { status: 500 })
  }
}
