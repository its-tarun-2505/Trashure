'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import styles from './TrackRequestPage.module.css'
import {
  FaRegSmile,
  FaTruck,
  FaRecycle,
  FaCheck,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTimes,
  FaThumbsUp,
  FaThumbsDown
} from 'react-icons/fa'

const STATUS_ORDER = ['pending', 'accepted', 'on-the-way', 'collected', 'pending-completion', 'completed', 'cancelled']

function statusIndex(status) {
  if (!status) return -1
  const s = String(status).toLowerCase()
  return STATUS_ORDER.indexOf(s)
}

function formatDate(d) {
  try {
    return d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : ''
  } catch {
    return String(d || '')
  }
}

export default function TrackRequestPage() {
  const [doc, setDoc] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectFeedback, setRejectFeedback] = useState('')
  const params = useParams()

  // Fetch request data
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/citizen/requests/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setDoc(data.request)
        } else {
          setError('Failed to load request details')
        }
      } catch (err) {
        console.error('Error fetching request:', err)
        setError('Failed to load request details')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchRequest()
    }
  }, [params.id])

  // Handle completion approval
  const handleApproveCompletion = async () => {
    try {
      setIsApproving(true)
      
      const response = await fetch(`/api/citizen/requests/${params.id}/approve-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDoc(data.request)
        alert('Request completed successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to approve completion: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error approving completion:', error)
      alert('Failed to approve completion')
    } finally {
      setIsApproving(false)
    }
  }

  // Handle completion rejection
  const handleRejectCompletion = async () => {
    if (!rejectFeedback.trim()) {
      alert('Please provide feedback for rejection')
      return
    }

    try {
      setIsRejecting(true)
      
      const response = await fetch(`/api/citizen/requests/${params.id}/reject-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          feedback: rejectFeedback
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDoc(data.request)
        setShowRejectModal(false)
        setRejectFeedback('')
        alert('Completion request rejected. Collector will be notified to resubmit.')
      } else {
        const errorData = await response.json()
        alert(`Failed to reject completion: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error rejecting completion:', error)
      alert('Failed to reject completion')
    } finally {
      setIsRejecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.leftCard}>
          <h1 className={styles.heading}>Track Request</h1>
          <p className={styles.subtitle}>Follow the progress of your waste collection request.</p>
          <div className={styles.empty}>
            <h3>Loading...</h3>
            <p>Please wait while we fetch your request details.</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className={styles.wrap}>
        <div className={styles.leftCard}>
          <h1 className={styles.heading}>Track Request</h1>
          <p className={styles.subtitle}>Follow the progress of your waste collection request.</p>
          <div className={styles.empty}>
            <h3>{error || 'Request not found'}</h3>
            <p>The requested pickup could not be located.</p>
            <Link href="/citizen" className={styles.backBtn}>Back to dashboard</Link>
          </div>
        </div>
      </div>
    )
  }

  const normalizedStatus = (doc.status || 'pending').toLowerCase()
  const idx = statusIndex(normalizedStatus)
  const cancelledMode = normalizedStatus === 'cancelled'
  const mapImage = '/map-placeholder.png'

  const baseSteps = [
    { key: 'pending', title: 'Pending', text: 'Your request has been received and is waiting for a collector.', icon: <FaRegSmile /> },
    { key: 'accepted', title: 'Accepted', text: 'A collector has been assigned to your request.', icon: <FaCalendarAlt /> },
    { key: 'on-the-way', title: 'On the Way', text: 'The collection truck is on its way to your location.', icon: <FaTruck /> },
    { key: 'collected', title: 'Collected', text: 'Your waste has been collected successfully.', icon: <FaRecycle /> },
    { key: 'pending-completion', title: 'Pending Completion', text: 'Collector has submitted proof of work. Please review and approve.', icon: <FaCheck /> },
    { key: 'completed', title: 'Completed', text: 'The request is successfully completed.', icon: <FaCheck /> }
  ]

  // build displaySteps - if cancelled, show steps up to the point it was cancelled and then a cancelled step
  let displaySteps = baseSteps.slice()
  let cancelledPos = -1

  if (cancelledMode) {
    // try to infer where cancellation occurred
    const candidateKeys = [
      doc.cancelledAfterStep,
      doc.cancelledAfter,
      doc.cancelledAtStep,
      doc.previousStatus,
      doc.prevStatus,
      doc.cancelledAt
    ].filter(Boolean)

    let cancelAfterIndex = -1
    for (const key of candidateKeys) {
      const lower = String(key).toLowerCase()
      const found = baseSteps.findIndex(s => s.key === lower)
      if (found !== -1) {
        cancelAfterIndex = found
        break
      }
    }

    if (cancelAfterIndex === -1 && doc.history && typeof doc.history === 'object') {
      for (let i = baseSteps.length - 1; i >= 0; i--) {
        const k = baseSteps[i].key
        if ((Array.isArray(doc.history) && doc.history.includes(k)) || (doc.history[k])) {
          cancelAfterIndex = i
          break
        }
      }
    }

    if (cancelAfterIndex === -1) {
      cancelAfterIndex = Math.max(0, Math.min(baseSteps.length - 1, idx - 1))
    }

    cancelAfterIndex = Math.min(Math.max(cancelAfterIndex, 0), baseSteps.length - 1)

    // keep steps up to cancelAfterIndex (inclusive)
    displaySteps = baseSteps.slice(0, cancelAfterIndex + 1)
    cancelledPos = displaySteps.length

    // append cancelled step
    displaySteps.push({
      key: 'cancelled',
      title: 'Cancelled',
      text: doc.cancelReason || 'This request has been cancelled.',
      icon: <FaTimes />
    })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        <section className={styles.leftCard}>
          <h1 className={styles.heading}>Track Request</h1>
          <p className={styles.subtitle}>Follow the progress of your waste collection request.</p>

          <div className={styles.timeline}>
            {displaySteps.map((s, i) => {
              const isCancelledStep = s.key === 'cancelled'
              let isDone = false
              let isActive = false

              if (cancelledMode) {
                const posOfCancelled = displaySteps.findIndex(x => x.key === 'cancelled')
                isDone = i < posOfCancelled
                isActive = i === posOfCancelled && isCancelledStep
              } else {
                const stepIdx = baseSteps.findIndex(b => b.key === s.key)
                isDone = stepIdx !== -1 ? stepIdx < idx : false
                isActive = stepIdx === idx
              }

              // when cancelled: fade/blur all other statuses except the cancelled step itself
              const isMuted = cancelledMode && !isCancelledStep

              const stepCls = [
                styles.step,
                isDone ? styles.completed : '',
                isActive ? styles.active : '',
                isCancelledStep ? styles.cancelled : '',
                isMuted ? styles.muted : ''
              ].join(' ').trim()

              const iconCls = [
                styles.iconWrap,
                isDone ? styles.iconDone : '',
                isCancelledStep ? styles.iconCancelled : ''
              ].join(' ').trim()

              const titleCls = [
                styles.stepTitle,
                isDone ? styles.stepTitleDone : '',
                isCancelledStep ? styles.stepTitleCancelled : ''
              ].join(' ').trim()

              const textCls = [
                styles.stepText,
                isCancelledStep ? styles.stepTextCancelled : ''
              ].join(' ').trim()

              return (
                <div key={s.key} className={stepCls}>
                  <div className={iconCls}>{s.icon}</div>
                  <div className={styles.stepBody}>
                    <div className={titleCls}>{s.title}</div>
                    <div className={textCls}>{s.text}</div>
                    {s.key === 'accepted' && doc.acceptedAt && (
                      <div className={styles.ts}>{formatDate(doc.acceptedAt)}</div>
                    )}
                    {s.key === 'on-the-way' && doc.onTheWayAt && (
                      <div className={styles.ts}>{formatDate(doc.onTheWayAt)}</div>
                    )}
                    {s.key === 'collected' && doc.collectedAt && (
                      <div className={styles.ts}>{formatDate(doc.collectedAt)}</div>
                    )}
                    {s.key === 'completed' && doc.completedAt && (
                      <div className={styles.ts}>{formatDate(doc.completedAt)}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <aside className={styles.rightCard}>
          <div className={styles.mapPreview}>
            <img src={mapImage} alt="map preview" />
          </div>

          <div className={styles.detailCard}>
            <h3 className={styles.detailTitle}>Request Details</h3>

            <div className={styles.kv}>
              <span className={styles.k}>Request ID</span>
              <span className={styles.v}>#{String(doc._id).slice(-6)}</span>
            </div>

            <div className={styles.kv}>
              <span className={styles.k}>Status</span>
              <span className={cancelledMode ? styles.vStatusCancelled : styles.vStatus}>
                {doc.status ? String(doc.status).replace(/\b\w/g, c => c.toUpperCase()) : 'Pending'}
              </span>
            </div>

            <div className={styles.kv}>
              <span className={styles.k}>Scheduled Date</span>
              <span className={styles.v}>{formatDate(doc.scheduledAt)}</span>
            </div>

            <div className={styles.kv}>
              <span className={styles.k}>Address</span>
              <span className={styles.vAddress}><FaMapMarkerAlt className={styles.addrIcon} /> {doc.address}</span>
            </div>

            {doc.collector && (
              <div className={styles.kv}>
                <span className={styles.k}>Assigned Collector</span>
                <div className={styles.collectorInfo}>
                  {doc.collector.profileImage && (
                    <img 
                      src={doc.collector.profileImage} 
                      alt={doc.collector.name}
                      className={styles.collectorPhoto}
                    />
                  )}
                  <div className={styles.collectorDetails}>
                    <div className={styles.collectorName}>{doc.collector.name}</div>
                    {doc.collector.phone && (
                      <div className={styles.collectorPhone}>{doc.collector.phone}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {doc.status === 'pending-completion' && (
              <div className={styles.completionApproval}>
                <h4 className={styles.approvalTitle}>Completion Request</h4>
                <p className={styles.approvalDescription}>
                  The collector has submitted proof of work. Please review and approve to complete the request.
                </p>
                
                {doc.completionNotes && (
                  <div className={styles.completionNotes}>
                    <strong>Collector Notes:</strong>
                    <p>{doc.completionNotes}</p>
                  </div>
                )}


                <div className={styles.approvalActions}>
                  <button 
                    className={styles.approveBtn}
                    onClick={handleApproveCompletion}
                    disabled={isApproving || isRejecting}
                  >
                    <FaThumbsUp /> {isApproving ? 'Approving...' : 'Approve Completion'}
                  </button>
                  <button 
                    className={styles.rejectBtn}
                    onClick={() => setShowRejectModal(true)}
                    disabled={isApproving || isRejecting}
                  >
                    <FaThumbsDown /> Reject Completion
                  </button>
                </div>
              </div>
            )}

            <Link href={`/citizen/requests/${params.id}`} className={styles.detailsLink}>View full request</Link>

            <button className={styles.contactBtn}>Contact Support</button>
          </div>
        </aside>
      </div>


      {/* Reject Completion Modal */}
      {showRejectModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Reject Completion Request</h3>
              <button 
                className={styles.closeModal}
                onClick={() => setShowRejectModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.rejectDescription}>
                Please provide feedback explaining why you&apos;re rejecting this completion request. 
                The collector will be notified and can resubmit with improvements.
              </p>
              <div className={styles.feedbackSection}>
                <label htmlFor="rejectFeedback" className={styles.feedbackLabel}>
                  Feedback/Remarks (Required)
                </label>
                <textarea
                  id="rejectFeedback"
                  value={rejectFeedback}
                  onChange={(e) => setRejectFeedback(e.target.value)}
                  placeholder="Please explain what needs to be improved..."
                  className={styles.feedbackTextarea}
                  rows={4}
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelBtn}
                  onClick={() => setShowRejectModal(false)}
                  disabled={isRejecting}
                >
                  Cancel
                </button>
                <button 
                  className={styles.confirmRejectBtn}
                  onClick={handleRejectCompletion}
                  disabled={isRejecting || !rejectFeedback.trim()}
                >
                  {isRejecting ? 'Rejecting...' : 'Reject Completion'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}