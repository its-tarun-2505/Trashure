import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db.js'
import User from '@/models/User.js'
import PickupRequest from '@/models/PickupRequest.js'

export async function GET(req) {
  try {
    await dbConnect()

    // Get collector ID from query params or headers
    const { searchParams } = new URL(req.url)
    const collectorId = searchParams.get('collectorId')

    if (!collectorId) {
      return NextResponse.json({ message: 'Collector ID is required' }, { status: 400 })
    }

    // Verify collector exists
    const collector = await User.findById(collectorId).lean()
    if (!collector || collector.role !== 'collector') {
      return NextResponse.json({ message: 'Collector not found' }, { status: 404 })
    }

    // Get current date for filtering
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfDay)
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch pickup requests data
    const allRequests = await PickupRequest.find({
      collectorId: collectorId
    }).lean()

    const todayRequests = await PickupRequest.find({
      collectorId: collectorId,
      createdAt: { $gte: startOfDay }
    }).lean()

    const weekRequests = await PickupRequest.find({
      collectorId: collectorId,
      createdAt: { $gte: startOfWeek }
    }).lean()

    const monthRequests = await PickupRequest.find({
      collectorId: collectorId,
      createdAt: { $gte: startOfMonth }
    }).lean()

    // Calculate statistics
    const totalPickups = allRequests.length
    const pendingRequests = allRequests.filter(req => req.status === 'pending').length
    const completedRequests = allRequests.filter(req => req.status === 'completed').length
    const inProgressRequests = allRequests.filter(req => req.status === 'in-progress').length

    // Calculate trends
    const yesterdayRequests = await PickupRequest.find({
      collectorId: collectorId,
      createdAt: {
        $gte: new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000),
        $lt: startOfDay
      }
    }).lean()

    const lastWeekRequests = await PickupRequest.find({
      collectorId: collectorId,
      createdAt: {
        $gte: new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
        $lt: startOfWeek
      }
    }).lean()

    const lastMonthRequests = await PickupRequest.find({
      collectorId: collectorId,
      createdAt: {
        $gte: new Date(startOfMonth.getTime() - 30 * 24 * 60 * 60 * 1000),
        $lt: startOfMonth
      }
    }).lean()

    // Calculate percentage changes
    const pendingTrend = yesterdayRequests.filter(req => req.status === 'pending').length
    const pendingChange = pendingTrend > 0 ? 
      Math.round(((pendingRequests - pendingTrend) / pendingTrend) * 100) : 0

    const completedTrend = lastWeekRequests.filter(req => req.status === 'completed').length
    const completedChange = completedTrend > 0 ? 
      Math.round(((completedRequests - completedTrend) / completedTrend) * 100) : 0

    const totalTrend = lastMonthRequests.length
    const totalChange = totalTrend > 0 ? 
      Math.round(((totalPickups - totalTrend) / totalTrend) * 100) : 0

    // Get recent activity (last 10 requests)
    const recentActivity = await PickupRequest.find({
      collectorId: collectorId
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('citizenId', 'name')
    .lean()

    // Format recent activity
    const formattedActivity = recentActivity.map(activity => ({
      id: activity._id,
      type: 'pickup',
      location: activity.address || 'Location not specified',
      time: getTimeAgo(activity.createdAt),
      status: activity.status,
      citizenName: activity.citizenId?.name || 'Unknown Citizen'
    }))

    // Get weekly performance data (last 7 days)
    const weeklyPerformance = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(startOfDay)
      date.setDate(date.getDate() - i)
      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)

      const dayRequests = await PickupRequest.find({
        collectorId: collectorId,
        createdAt: {
          $gte: date,
          $lt: nextDate
        }
      }).lean()

      const completedToday = dayRequests.filter(req => req.status === 'completed').length
      const totalToday = dayRequests.length
      const efficiency = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

      weeklyPerformance.push({
        date: date.toISOString().split('T')[0],
        completed: completedToday,
        total: totalToday,
        efficiency: efficiency
      })
    }

    const dashboardData = {
      stats: {
        totalPickups,
        pendingRequests,
        completed: completedRequests,
        inProgress: inProgressRequests
      },
      trends: {
        totalChange,
        pendingChange,
        completedChange
      },
      recentActivity: formattedActivity,
      weeklyPerformance,
      collector: {
        name: collector.name,
        email: collector.email,
        location: collector.address
      }
    }

    return NextResponse.json(dashboardData, { status: 200 })

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch dashboard data', error: error.message },
      { status: 500 }
    )
  }
}

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}


