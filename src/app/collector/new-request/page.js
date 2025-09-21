'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './RequestedPickups.module.css'

const RequestedPickupsPage = () => {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    date: '',
    category: '',
    proximity: ''
  })
  const router = useRouter()

  // Fetch pickup requests from API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Build query parameters based on filters
        const queryParams = new URLSearchParams()
        if (filters.date) queryParams.append('date', filters.date)
        if (filters.category) queryParams.append('category', filters.category)
        if (filters.proximity) queryParams.append('proximity', filters.proximity)
        
        const response = await fetch(`/api/collector/requests?${queryParams.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setRequests(data.requests || [])
        } else {
          setError('Failed to load pickup requests')
        }
      } catch (err) {
        console.error('Error fetching requests:', err)
        setError('Failed to load pickup requests')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [filters])

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  // Handle accept request
  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/collector/requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update the request status in the local state
        setRequests(prev => 
          prev.map(req => 
            req._id === requestId 
              ? { ...req, status: 'accepted' }
              : req
          )
        )
        alert('Request accepted successfully!')
      } else {
        const errorData = await response.json()
        console.error('Accept request error:', errorData)
        alert(`Failed to accept request: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error accepting request:', error)
      alert(`Failed to accept request: ${error.message}`)
    }
  }

  // Format date for display
  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'General Waste': '#607D8B',
      'Recyclables': '#4CAF50',
      'Organic Waste': '#8BC34A',
      'Mixed Waste': '#FF9800',
      'Electronic Waste': '#9C27B0',
      'Hazardous Waste': '#F44336'
    }
    return colors[category] || '#4CAF50'
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading pickup requests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
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

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <h1 className={styles.title}>Requested Pickups</h1>
        <p className={styles.subtitle}>Manage and accept new pickup requests from citizens</p>
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        {/* <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Date</label>
          <select 
            className={styles.filterSelect}
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this-week">This Week</option>
            <option value="next-week">Next Week</option>
          </select>
        </div> */}

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Category</label>
          <select 
            className={styles.filterSelect}
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="General Waste">General Waste</option>
            <option value="Recyclables">Recyclables</option>
            <option value="Organic Waste">Organic Waste</option>
            <option value="Electronic Waste">Electronic Waste</option>
            <option value="Hazardous Waste">Hazardous Waste</option>
            <option value="Mixed Waste">Mixed Waste</option>
          </select>
        </div>

        {/* <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Proximity</label>
          <select 
            className={styles.filterSelect}
            value={filters.proximity}
            onChange={(e) => handleFilterChange('proximity', e.target.value)}
          >
            <option value="">All Distances</option>
            <option value="0-5km">0-5 km</option>
            <option value="5-10km">5-10 km</option>
            <option value="10-20km">10-20 km</option>
            <option value="20km+">20+ km</option>
          </select>
        </div> */}
      </div>

      {/* Table Section */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.headerCell}>CITIZEN NAME</th>
              <th className={styles.headerCell}>ADDRESS</th>
              <th className={styles.headerCell}>WASTE CATEGORY</th>
              <th className={styles.headerCell}>REQUESTED DATE/TIME</th>
              <th className={styles.headerCell}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.noDataCell}>
                  <div className={styles.noDataContainer}>
                    <p>No pickup requests found</p>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request._id} className={styles.tableRow}>
                  <td className={styles.dataCell}>
                    <div className={styles.citizenName}>
                      {request.citizen?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className={styles.dataCell}>
                    <div className={styles.address}>
                      {request.address}
                    </div>
                  </td>
                  <td className={styles.dataCell}>
                    <span 
                      className={styles.categoryTag}
                      style={{ backgroundColor: getCategoryColor(request.category) }}
                    >
                      {request.category}
                    </span>
                  </td>
                  <td className={styles.dataCell}>
                    <div className={styles.dateTime}>
                      {formatDateTime(request.scheduledAt)}
                    </div>
                  </td>
                  <td className={styles.dataCell}>
                    <button
                      className={styles.acceptButton}
                      onClick={() => handleAcceptRequest(request._id)}
                      disabled={request.status !== 'pending'}
                    >
                      {request.status === 'pending' ? 'Accept Request' : 'Accepted'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RequestedPickupsPage
