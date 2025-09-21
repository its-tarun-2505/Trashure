'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import styles from './CollectionDetail.module.css'

const CollectionDetailPage = () => {
  const [collection, setCollection] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [proofImages, setProofImages] = useState([])
  const [completionNotes, setCompletionNotes] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const params = useParams()

  // Fetch collection details
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/collector/collections/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setCollection(data.collection)
        } else {
          setError('Failed to load collection details')
        }
      } catch (err) {
        console.error('Error fetching collection:', err)
        setError('Failed to load collection details')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchCollection()
    }
  }, [params.id])

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsUpdating(true)
      
      const response = await fetch(`/api/collector/collections/${params.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const data = await response.json()
        setCollection(data.collection)
        alert('Status updated successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to update status: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setIsUpdating(false)
    }
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

  // Get status progression
  const getStatusProgression = (currentStatus) => {
    const statuses = [
      { key: 'accepted', label: 'Accepted', step: 1 },
      { key: 'on-the-way', label: 'On the Way', step: 2 },
      { key: 'collected', label: 'Collected', step: 3 },
      { key: 'pending-completion', label: 'Pending Completion', step: 4 },
      { key: 'completed', label: 'Completed', step: 5 }
    ]

    const currentIndex = statuses.findIndex(s => s.key === currentStatus)
    
    return statuses.map((status, index) => ({
      ...status,
      isCompleted: index < currentIndex,
      isCurrent: index === currentIndex,
      isPending: index > currentIndex
    }))
  }

  // Get next status
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'accepted': 'on-the-way',
      'on-the-way': 'collected',
      'collected': 'pending-completion'
    }
    return statusFlow[currentStatus]
  }

  // Handle proof image upload
  const handleProofImageUpload = async (files) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('proofImages', file)
      })

      const response = await fetch(`/api/collector/collections/${params.id}/proof`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setProofImages(data.proofImages || [])
        alert('Proof images uploaded successfully!')
      } else {
        alert('Failed to upload proof images')
      }
    } catch (error) {
      console.error('Error uploading proof images:', error)
      alert('Failed to upload proof images')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle completion request
  const handleRequestCompletion = async () => {
    if (proofImages.length === 0) {
      alert('Please upload at least one proof image before requesting completion')
      return
    }

    try {
      setIsUpdating(true)
      
      const response = await fetch(`/api/collector/collections/${params.id}/request-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          completionNotes,
          proofImages 
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCollection(data.collection)
        alert('Completion request sent to citizen successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to request completion: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error requesting completion:', error)
      alert('Failed to request completion')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading collection details...</p>
        </div>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error || 'Collection not found'}</p>
          <button 
            className={styles.backButton}
            onClick={() => router.push('/collector/collections')}
          >
            Back to Collections
          </button>
        </div>
      </div>
    )
  }

  const statusProgression = getStatusProgression(collection.status)
  const nextStatus = getNextStatus(collection.status)

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Collection Status Update</h1>
      </div>

      {/* Collection Details Card */}
      <div className={styles.detailsCard}>
        <div className={styles.detailsContent}>
          <div className={styles.detailsInfo}>
            <h2 className={styles.citizenName}>{collection.citizen?.name || 'Unknown'}</h2>
            <p className={styles.address}>{collection.address}</p>
            <span 
              className={styles.categoryTag}
              style={{ backgroundColor: getCategoryColor(collection.category) }}
            >
              {collection.category}
            </span>
          </div>
          <div className={styles.houseIcon}>
            <div className={styles.houseIllustration}>
              <div className={styles.house}></div>
              <div className={styles.tree}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Card */}
      <div className={styles.statusCard}>
        <h3 className={styles.statusTitle}>Update Collection Status</h3>
        
        {/* Progress Stepper */}
        <div className={styles.stepper}>
          {statusProgression.map((status, index) => (
            <div key={status.key} className={styles.step}>
              <div className={`${styles.stepCircle} ${
                status.isCompleted ? styles.completed : 
                status.isCurrent ? styles.current : 
                styles.pending
              }`}>
                {status.isCompleted ? '✓' : status.step}
              </div>
              <div className={styles.stepContent}>
                <div className={`${styles.stepLabel} ${
                  status.isCompleted ? styles.completedText : 
                  status.isCurrent ? styles.currentText : 
                  styles.pendingText
                }`}>
                  {status.isCompleted ? 'Status Updated' : 
                   status.isCurrent ? 'Current Status' : 
                   'Pending'}
                </div>
                <div className={`${styles.stepTitle} ${
                  status.isCompleted ? styles.completedText : 
                  status.isCurrent ? styles.currentText : 
                  styles.pendingText
                }`}>
                  {status.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status-specific Actions */}
        {nextStatus ? (
          <button
            className={styles.confirmButton}
            onClick={() => handleStatusUpdate(nextStatus)}
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : `Confirm Status: ${statusProgression.find(s => s.key === nextStatus)?.label}`}
          </button>
        ) : collection.status === 'collected' ? (
          <div className={styles.proofUploadSection}>
            <h4 className={styles.proofTitle}>Upload Proof of Work</h4>
            <p className={styles.proofDescription}>Upload images as proof that the collection has been completed.</p>
            
            <div className={styles.uploadArea}>
              <input
                type="file"
                id="proofImages"
                multiple
                accept="image/*"
                onChange={(e) => handleProofImageUpload(e.target.files)}
                className={styles.fileInput}
                disabled={isUploading}
              />
              <label htmlFor="proofImages" className={styles.uploadLabel}>
                {isUploading ? 'Uploading...' : 'Choose Proof Images'}
              </label>
            </div>

            {proofImages.length > 0 && (
              <div className={styles.proofPreview}>
                <h5>Proof Images ({proofImages.length})</h5>
                <div className={styles.imageGrid}>
                  {proofImages.map((image, index) => (
                    <img key={index} src={image} alt={`Proof ${index + 1}`} className={styles.proofImage} />
                  ))}
                </div>
              </div>
            )}

            <div className={styles.notesSection}>
              <label htmlFor="completionNotes" className={styles.notesLabel}>
                Completion Notes (Optional)
              </label>
              <textarea
                id="completionNotes"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add any notes about the collection..."
                className={styles.notesTextarea}
                rows={3}
              />
            </div>

            <button
              className={styles.requestCompletionButton}
              onClick={handleRequestCompletion}
              disabled={isUpdating || proofImages.length === 0}
            >
              {isUpdating ? 'Sending Request...' : 'Request Completion from Citizen'}
            </button>
          </div>
        ) : collection.status === 'pending-completion' ? (
          <div className={styles.pendingCompletionMessage}>
            <p>⏳ Completion request sent to citizen. Waiting for approval...</p>
            <p>Proof images: {collection.proofImages?.length || 0}</p>
          </div>
        ) : collection.status === 'completed' ? (
          <div className={styles.completedMessage}>
            <p>✅ Collection has been completed successfully!</p>
          </div>
        ) : (
          <div className={styles.noActionMessage}>
            <p>⚠️ No further action available for status: <strong>{collection.status}</strong></p>
            <p>Current status progression: {statusProgression.map(s => s.label).join(' → ')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CollectionDetailPage
