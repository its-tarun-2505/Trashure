'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './DashboardPage.module.css'

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const router = useRouter()

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Add a small delay to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 100))

        // Get collector ID from localStorage or session
        const collectorId = localStorage.getItem('collectorId')
        if (!collectorId) {
          // If no collector ID, try to get from user profile
          const response = await fetch('/api/user/me')
          if (response.ok) {
            const userData = await response.json()
            if (userData.ok && userData.user && userData.user.role === 'collector') {
              localStorage.setItem('collectorId', userData.user._id)
              await fetchData(userData.user._id)
            } else {
              router.push('/login')
            }
          } else {
            router.push('/login')
          }
        } else {
          await fetchData(collectorId)
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
        setIsLoading(false)
      }
    }

    const fetchData = async (collectorId) => {
      try {
        const response = await fetch(`/api/collector/dashboard?collectorId=${collectorId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const data = await response.json()
        setDashboardData(data)
        
        // Animate numbers after data is loaded
        animateNumbers(data.stats)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load dashboard data')
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  // Animate numbers on load
  const animateNumbers = (targetStats) => {
    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easeOut = 1 - Math.pow(1 - progress, 3)

      setDashboardData(prev => ({
        ...prev,
        stats: {
          totalPickups: Math.floor(targetStats.totalPickups * easeOut),
          pendingRequests: Math.floor(targetStats.pendingRequests * easeOut),
          completed: Math.floor(targetStats.completed * easeOut),
          inProgress: Math.floor(targetStats.inProgress * easeOut)
        }
      }))

      if (currentStep >= steps) {
        clearInterval(interval)
        setDashboardData(prev => ({
          ...prev,
          stats: targetStats
        }))
        setIsLoading(false)
      }
    }, stepDuration)
  }

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  const quickActions = [
    {
      title: 'New Request',
      icon: '➕',
      color: 'green',
      href: '/collector/new-request',
      description: 'Create a new collection request'
    },
    {
      title: 'View Reports',
      icon: '📊',
      color: 'blue',
      href: '/collector/reports',
      description: 'View analytics and reports'
    },
    {
      title: 'View Collections',
      icon: '🗺️',
      color: 'purple',
      href: '/collector/collections',
      description: 'Plan and view collection routes'
    },
  ]
    // {
    //   title: 'My History',
    //   icon: '🔄',
    //   color: 'orange',
    //   href: '/collector/collections',
    //   description: 'View collection history'
    // }

  // Show loading state
  if (isLoading && !dashboardData) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show dashboard with real data
  return (
    <div className={styles.dashboard}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Collector Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back{dashboardData?.collector?.name ? `, ${dashboardData.collector.name}` : ''}, let&apos;s manage your collections.
          </p>
          <div className={styles.timeDisplay}>
            <span className={styles.time}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className={styles.date}>
              {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.totalPickups}`}>
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <h3 className={styles.statLabel}>Total Pickups</h3>
              <div className={styles.statNumber}>
                {isLoading ? (
                  <div className={styles.loadingNumber}>...</div>
                ) : (
                  <span className={styles.number}>{dashboardData?.stats?.totalPickups?.toLocaleString() || 0}</span>
                )}
              </div>
            </div>
            <div className={styles.statIcon}>
              <div className={styles.truckIcon}>🚛</div>
            </div>
          </div>
          <div className={styles.statTrend}>
            <span className={dashboardData?.trends?.totalChange > 0 ? styles.trendUp : styles.trendNeutral}>
              {dashboardData?.trends?.totalChange > 0 ? '↗' : dashboardData?.trends?.totalChange < 0 ? '↘' : '→'} 
              {dashboardData?.trends?.totalChange ? `${Math.abs(dashboardData.trends.totalChange)}% this month` : 'No change'}
            </span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.pendingRequests}`}>
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <h3 className={styles.statLabel}>Pending Requests</h3>
              <div className={styles.statNumber}>
                {isLoading ? (
                  <div className={styles.loadingNumber}>...</div>
                ) : (
                  <span className={styles.number}>{dashboardData?.stats?.pendingRequests || 0}</span>
                )}
              </div>
            </div>
            <div className={styles.statIcon}>
              <div className={styles.hourglassIcon}>⏳</div>
            </div>
          </div>
          <div className={styles.statTrend}>
            <span className={dashboardData?.trends?.pendingChange > 0 ? styles.trendUp : styles.trendNeutral}>
              {dashboardData?.trends?.pendingChange > 0 ? '↗' : dashboardData?.trends?.pendingChange < 0 ? '↘' : '→'} 
              {dashboardData?.trends?.pendingChange ? `${Math.abs(dashboardData.trends.pendingChange)}% from yesterday` : 'Same as yesterday'}
            </span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.completed}`}>
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <h3 className={styles.statLabel}>Completed</h3>
              <div className={styles.statNumber}>
                {isLoading ? (
                  <div className={styles.loadingNumber}>...</div>
                ) : (
                  <span className={styles.number}>{dashboardData?.stats?.completed?.toLocaleString() || 0}</span>
                )}
              </div>
            </div>
            <div className={styles.statIcon}>
              <div className={styles.checkIcon}>✅</div>
            </div>
          </div>
          <div className={styles.statTrend}>
            <span className={dashboardData?.trends?.completedChange > 0 ? styles.trendUp : styles.trendNeutral}>
              {dashboardData?.trends?.completedChange > 0 ? '↗' : dashboardData?.trends?.completedChange < 0 ? '↘' : '→'} 
              {dashboardData?.trends?.completedChange ? `${Math.abs(dashboardData.trends.completedChange)}% this week` : 'No change'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActionsSection}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <Link
              key={action.title}
              href={action.href}
              className={`${styles.actionButton} ${styles[action.color]}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={styles.actionIcon}>{action.icon}</div>
              <div className={styles.actionContent}>
                <h3 className={styles.actionTitle}>{action.title}</h3>
                <p className={styles.actionDescription}>{action.description}</p>
              </div>
              <div className={styles.actionArrow}>→</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Collections */}
      <div className={styles.recentCollectionsSection}>
        <h2 className={styles.sectionTitle}>Recent Collections</h2>
        <div className={styles.collectionsList}>
          {dashboardData?.recentCollections?.length > 0 ? (
            dashboardData.recentCollections.map((collection, index) => (
              <div
                key={collection._id}
                className={styles.collectionItem}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.collectionIcon}>
                  {collection.category === 'Recyclables' ? '♻️' : 
                   collection.category === 'Organic Waste' ? '🍃' :
                   collection.category === 'Electronic Waste' ? '🔌' :
                   collection.category === 'Hazardous Waste' ? '⚠️' : '🗑️'}
                </div>
                <div className={styles.collectionContent}>
                  <h4 className={styles.collectionTitle}>
                    {collection.category} Collection
                  </h4>
                  <p className={styles.collectionLocation}>{collection.address}</p>
                  <span className={styles.collectionTime}>
                    {new Date(collection.scheduledAt).toLocaleDateString()} at {new Date(collection.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {collection.citizen?.name && (
                    <span className={styles.citizenName}>by {collection.citizen.name}</span>
                  )}
                </div>
                <div className={`${styles.collectionStatus} ${styles[collection.status]}`}>
                  {collection.status.replace('-', ' ')}
                </div>
                <Link href={`/collector/collections/${collection._id}`} className={styles.viewCollectionBtn}>
                  View →
                </Link>
              </div>
            ))
          ) : (
            <div className={styles.noCollections}>
              <div className={styles.noCollectionsIcon}>📭</div>
              <p>No recent collections</p>
              <Link href="/collector/new-request" className={styles.createCollectionBtn}>
                Create New Collection
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Performance Chart */}
      <div className={styles.chartSection}>
        <h2 className={styles.sectionTitle}>Performance Overview</h2>
        <div className={styles.chartContainer}>
          <div className={styles.chartPlaceholder}>
            <div className={styles.chartIcon}>📈</div>
            <h3>Weekly Performance</h3>
            <p>Collection efficiency and completion rates</p>
            <div className={styles.chartBars}>
              {dashboardData?.weeklyPerformance?.length > 0 ? (
                dashboardData.weeklyPerformance.map((day, index) => (
                  <div
                    key={index}
                    className={styles.chartBar}
                    style={{ height: `${day.efficiency}%` }}
                    title={`${day.date}: ${day.efficiency}% efficiency (${day.completed}/${day.total})`}
                  ></div>
                ))
              ) : (
                Array.from({ length: 7 }, (_, index) => (
                  <div
                    key={index}
                    className={styles.chartBar}
                    style={{ height: '0%' }}
                  ></div>
                ))
              )}
            </div>
            <div className={styles.chartLabels}>
              {dashboardData?.weeklyPerformance?.map((day, index) => (
                <span key={index} className={styles.chartLabel}>
                  {new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                </span>
              )) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <span key={index} className={styles.chartLabel}>{day}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
