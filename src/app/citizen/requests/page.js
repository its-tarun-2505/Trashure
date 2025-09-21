'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaRecycle, FaLeaf, FaHome, FaTrashAlt, FaClock, FaPlus } from 'react-icons/fa'
import styles from './RequestsPage.module.css'

function categoryIcon(category) {
  switch ((category || '').toLowerCase()) {
    case 'recyclables': return <FaRecycle />
    case 'organic': return <FaLeaf />
    case 'general waste': return <FaTrashAlt />
    case 'electronic': return <FaHome />
    case 'hazardous': return <FaClock />
    default: return <FaTrashAlt />
  }
}

function statusClass(status) {
  switch (status) {
    case 'pending': return styles.statusPending
    case 'scheduled': return styles.statusScheduled
    case 'on the way': return styles.statusOnTheWay
    case 'completed': return styles.statusCompleted
    case 'cancelled': return styles.statusCancelled
    default: return styles.statusPending
  }
}

export default function RequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | active | completed
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // apply filters client-side
  useEffect(() => {
    if (!requestsRaw) return
    applyFilters(requestsRaw)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, categoryFilter])

  // keep raw copy to re-filter without another fetch
  const [requestsRaw, setRequestsRaw] = useState([])

  async function fetchRequests() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/citizen/requests')
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed to load requests')
      const items = Array.isArray(data) ? data : data.requests || []
      setRequestsRaw(items)
      setCategories(Array.from(new Set(items.map(i => i.category).filter(Boolean))))
      applyFilters(items)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function applyFilters(items) {
    let filtered = Array.isArray(items) ? items.slice() : []
    // status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(r => r.status !== 'completed')
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter(r => r.status === 'completed')
    }
    // category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => (r.category || '').toLowerCase() === categoryFilter.toLowerCase())
    }
    setRequests(filtered)
  }

  function formatDate(s) {
    try {
      const d = new Date(s)
      return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    } catch (e) {
      return s
    }
  }

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>Loading requests…</div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.headerRow}>
        <h2 className={styles.heading}>My Pickup Requests</h2>

        <div className={styles.actionsRow}>
          <div className={styles.dropdownGroup}>
            <label className={styles.visuallyHidden}>Status filter</label>
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Show: All</option>
              <option value="active">Show: Active</option>
              <option value="completed">Show: Completed</option>
            </select>

            <label className={styles.visuallyHidden}>Category filter</label>
            <select
              className={styles.select}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button className={styles.newBtn} onClick={() => router.push('/citizen/new-request')}>
            <FaPlus /> New Request
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {requests.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyInner}>
            <h3>Be the change in your neighbourhood</h3>
            <p>There are no pickup requests yet — start by scheduling a pickup or invite neighbors to join a community clean-up.</p>
            <div className={styles.emptyActions}>
              <Link href="/citizen/new-request" className={styles.cta}>Create New Request</Link>
              <a className={styles.secondary} href="/about">How community clean-ups work</a>
            </div>

            <blockquote className={styles.quote}>
              &ldquo;Small acts, when multiplied by millions, can transform our world.&rdquo; — Community Clean-up
            </blockquote>
          </div>
        </div>
      ) : (
        <div className={styles.list}>
          {requests.map((r) => (
            <Link key={r._id} href={`/citizen/requests/${r._id}`} className={styles.itemLink}>
              <div className={styles.item}>
                <div className={styles.itemLeft}>
                  <div className={styles.catIcon}>{categoryIcon(r.category)}</div>
                  <div className={styles.info}>
                    <div className={styles.title}>{r.category}</div>
                    <div className={styles.meta}>Date: {formatDate(r.scheduledAt || r.createdAt)}</div>
                  </div>
                </div>

                <div className={styles.itemRight}>
                  {r.images && r.images.length > 0 && (
                    <img src={r.images[0]} className={styles.thumb} alt="request image" />
                  )}
                  <span className={`${styles.statusBadge} ${statusClass(r.status)}`}>{r.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}