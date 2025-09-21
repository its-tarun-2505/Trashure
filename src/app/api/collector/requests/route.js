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
    const dateFilter = searchParams.get('date')
    const categoryFilter = searchParams.get('category')
    const proximityFilter = searchParams.get('proximity')

    // Build filter query
    let filterQuery = { status: 'pending' }
    
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

    // Category filter
    if (categoryFilter) {
      filterQuery.category = categoryFilter
    }

    // Fetch pickup requests with citizen information
    let requests = await PickupRequest.find(filterQuery)
      .populate('citizen', 'name email phone')
      .sort({ createdAt: -1 })
      .lean()

    // Calculate distance for each request (if collector has location data)
    const requestsWithDistance = requests.map(request => {
      let distance = null
      
      if (collector.latitude && collector.longitude && request.latitude && request.longitude) {
        // Calculate distance using Haversine formula
        const R = 6371 // Earth's radius in kilometers
        const dLat = (request.latitude - collector.latitude) * Math.PI / 180
        const dLon = (request.longitude - collector.longitude) * Math.PI / 180
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(collector.latitude * Math.PI / 180) * Math.cos(request.latitude * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        distance = R * c
      }

      return {
        ...request,
        distance: distance ? Math.round(distance * 10) / 10 : null
      }
    })

    // Apply proximity filter
    let filteredRequests = requestsWithDistance
    if (proximityFilter && collector.latitude && collector.longitude) {
      const maxDistance = {
        '0-5km': 5,
        '5-10km': 10,
        '10-20km': 20,
        '20km+': Infinity
      }[proximityFilter]

      if (maxDistance !== undefined) {
        if (proximityFilter === '20km+') {
          filteredRequests = requestsWithDistance.filter(request => 
            request.distance === null || request.distance > 20
          )
        } else {
          filteredRequests = requestsWithDistance.filter(request => 
            request.distance !== null && request.distance <= maxDistance
          )
        }
      }
    }

    return NextResponse.json({ 
      ok: true, 
      requests: filteredRequests 
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching pickup requests:', error)
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to fetch pickup requests' 
    }, { status: 500 })
  }
}
