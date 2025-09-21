import React from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { dbConnect } from '@/lib/db.js'
import { verifyToken } from '@/lib/auth.js'
import Request from '@/models/PickupRequest.js'
import User from '@/models/User.js'
import {
  FaRecycle,
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaPlusCircle,
  FaExclamationCircle,
  FaLeaf
} from 'react-icons/fa'
import styles from './DashboardPage.module.css'

// optional: try NextAuth session (wrapped in try/catch to avoid hard dependency)
let getServerSession, authOptions
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  getServerSession = require('next-auth/next').getServerSession
  authOptions = require('@/lib/auth').authOptions
} catch (e) {
  getServerSession = null
  authOptions = null
}

export default async function CitizenDashboardPage() {
  await dbConnect()

  // 1) try NextAuth session (server)
  let displayName = 'Citizen'
  try {
    if (getServerSession && authOptions) {
      const session = await getServerSession(authOptions)
      if (session?.user?.name) displayName = session.user.name
      else if (session?.user?.email) displayName = session.user.email.split('@')[0]
    }
  } catch (e) {
    /* ignore session errors */
  }

  // 2) read cookies - support auth token and legacy cookies
  const cookieStore = cookies()
  try {
    // auth token cookie
    const auth = cookieStore.get('trashure_auth')?.value
    const payload = verifyToken(auth)
    if (payload?.sub) {
      try {
        const user = await User.findById(payload.sub).lean()
        if (user?.name) displayName = user.name
        else if (payload?.email) displayName = payload.email.split('@')[0]
      } catch (e) {
        // ignore lookup failure
      }
    }

    // cookie containing serialized user object
    const userCookie = cookieStore.get('user')?.value
    if (userCookie) {
      try {
        const parsed = JSON.parse(userCookie)
        if (parsed?.name) displayName = parsed.name
        else if (parsed?.email) displayName = parsed.email.split('@')[0]
      } catch (e) {
        // not JSON, ignore
      }
    }

    // cookie containing userId -> fetch user from DB
    const userId = cookieStore.get('userId')?.value || null
    if (displayName === 'Citizen' && userId) {
      try {
        const user = await User.findById(userId).lean()
        if (user?.name) displayName = user.name
        else if (user?.email) displayName = user.email?.split('@')[0] || 'Citizen'
      } catch (err) {
        console.error('Failed to load user for dashboard', err)
      }
    }
  } catch (e) {
    /* ignore cookie read errors */
  }

  // Get user ID from token for filtering
  let userId = null
  try {
    const auth = cookieStore.get('trashure_auth')?.value
    const payload = verifyToken(auth)
    if (payload?.sub) {
      userId = payload.sub
    }
  } catch (e) {
    // ignore auth errors
  }

  // counts - only for the authenticated user
  const filter = userId ? { citizen: userId } : {}
  const total = await Request.countDocuments(filter)
  const completed = await Request.countDocuments({ ...filter, status: /completed/i })
  const cancelled = await Request.countDocuments({ ...filter, status: /cancelled/i })
  const active = await Request.countDocuments({
    ...filter,
    status: { $in: [/pending/i, /scheduled/i, /on the way/i] }
  })

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome, {displayName}</h1>
        <p className={styles.subtitle}>Here's an overview of your waste management activity.</p>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <h2 className={styles.heroHeading}>Your Waste Requests</h2>
          <p className={styles.heroText}>
            Easily access your request history, track active pickups, and manage your scheduled services.
          </p>
          <Link href="/citizen/requests" className={styles.heroBtn}>
            <FaClipboardList /> <span>View Requests</span>
          </Link>
        </div>

        <div className={styles.heroImage} role="img" aria-label="recycling bins preview" />
      </section>

      <section className={styles.summary}>
        <h3 className={styles.sectionTitle}>Request Summary</h3>

        <div className={styles.cards}>
          <div className={styles.card}>
            <div className={styles.cardLabel}>Total Requests</div>
            <div className={styles.cardValue}>{total ?? 0}</div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>Active Requests</div>
            <div className={styles.cardValueActive}><FaExclamationCircle className={styles.iconSmall} /> {active ?? 0}</div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>Completed</div>
            <div className={styles.cardValue}><FaCheckCircle className={styles.iconSmall} /> {completed ?? 0}</div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardLabel}>Cancelled</div>
            <div className={styles.cardValueCancelled}><FaTimesCircle className={styles.iconSmall} /> {cancelled ?? 0}</div>
          </div>
        </div>
      </section>

      <section className={styles.quick}>
        <h3 className={styles.sectionTitle}>Quick Links</h3>

        <div className={styles.quickGrid}>
          <Link href="/citizen/new-request/" className={styles.quickCard}>
            <FaPlusCircle className={styles.qIcon} />
            <div>
              <div className={styles.qTitle}>Schedule a Pickup</div>
              <div className={styles.qSub}>Request a new collection</div>
            </div>
          </Link>

          <Link href="/citizen/report-dumping" className={styles.quickCard}>
            <FaExclamationCircle className={styles.qIcon} />
            <div>
              <div className={styles.qTitle}>Report Dumping</div>
              <div className={styles.qSub}>Report illegal dumping</div>
            </div>
          </Link>

          <Link href="/resources/compost" className={styles.quickCard}>
            <FaLeaf className={styles.qIcon} />
            <div>
              <div className={styles.qTitle}>Compost Guide</div>
              <div className={styles.qSub}>Learn composting at home</div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}