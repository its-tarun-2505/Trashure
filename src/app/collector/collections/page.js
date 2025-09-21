'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Collections.module.css'

const CollectionsPage = () => {
  const [collections, setCollections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    date: ''
  })
  const router = useRouter()

  // Fetch collections from API
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Build query parameters based on filters and search
        const queryParams = new URLSearchParams()
        if (searchQuery) queryParams.append('search', searchQuery)
        if (filters.status) queryParams.append('status', filters.status)
        if (filters.date) queryParams.append('date', filters.date)
        
        const response = await fetch(`/api/collector/collections?${queryParams.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setCollections(data.collections || [])
        } else {
          setError('Failed to load collections')
        }
      } catch (err) {
        console.error('Error fetching collections:', err)
        setError('Failed to load collections')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollections()
  }, [searchQuery, filters])

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  // Handle row click to navigate to individual collection page
  const handleRowClick = (collectionId) => {
    router.push(`/collector/collections/${collectionId}`)
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
      'Recyclables': '#2196F3',
      'Organics': '#4CAF50',
      'General Waste': '#9E9E9E',
      'Electronic Waste': '#9C27B0',
      'Hazardous Waste': '#F44336'
    }
    return colors[category] || '#4CAF50'
  }

  // Get status color and text
  const getStatusInfo = (status) => {
    const statusMap = {
      'accepted': { color: '#FF9800', bgColor: '#FFF3E0', text: 'Accepted' },
      'on-the-way': { color: '#FFC107', bgColor: '#FFFDE7', text: 'On the Way' },
      'collected': { color: '#9C27B0', bgColor: '#F3E5F5', text: 'Collected' },
      'completed': { color: '#4CAF50', bgColor: '#E8F5E8', text: 'Completed' },
      'cancelled': { color: '#F44336', bgColor: '#FFEBEE', text: 'Cancelled' }
    }
    return statusMap[status] || { color: '#9E9E9E', bgColor: '#F5F5F5', text: status }
  }


  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading collections...</p>
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
        <h1 className={styles.title}>Collections</h1>
        <p className={styles.subtitle}>Manage your assigned and completed waste pickups efficiently.</p>
      </div>

      {/* Search and Filter Section */}
      <div className={styles.searchFilterSection}>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputContainer}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by Citizen Name or Address"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <select 
              className={styles.filterSelect}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="accepted">Accepted</option>
              <option value="on-the-way">On the Way</option>
              <option value="collected">Collected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
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
          </div>

          <button className={styles.addNewButton}>
            Add New
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.headerCell}>CITIZEN NAME</th>
              <th className={styles.headerCell}>ADDRESS</th>
              <th className={styles.headerCell}>WASTE CATEGORY</th>
              <th className={styles.headerCell}>STATUS</th>
              <th className={styles.headerCell}>DATE/TIME</th>
            </tr>
          </thead>
          <tbody>
            {collections.length === 0 ? (
              <tr>
                <td colSpan="5" className={styles.noDataCell}>
                  <div className={styles.noDataContainer}>
                    <p>No collections found</p>
                  </div>
                </td>
              </tr>
            ) : (
              collections.map((collection) => {
                const statusInfo = getStatusInfo(collection.status)
                
                return (
                  <tr 
                    key={collection._id} 
                    className={styles.tableRow}
                    onClick={() => handleRowClick(collection._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className={styles.dataCell}>
                      <div className={styles.citizenName}>
                        {collection.citizen?.name || 'Unknown'}
                      </div>
                    </td>
                    <td className={styles.dataCell}>
                      <div className={styles.address}>
                        {collection.address}
                      </div>
                    </td>
                    <td className={styles.dataCell}>
                      <span 
                        className={styles.categoryTag}
                        style={{ 
                          backgroundColor: getCategoryColor(collection.category),
                          color: '#ffffff'
                        }}
                      >
                        {collection.category}
                      </span>
                    </td>
                    <td className={styles.dataCell}>
                      <span 
                        className={styles.statusTag}
                        style={{ 
                          backgroundColor: statusInfo.bgColor,
                          color: statusInfo.color
                        }}
                      >
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className={styles.dataCell}>
                      <div className={styles.dateTime}>
                        {formatDateTime(collection.scheduledAt)}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CollectionsPage
