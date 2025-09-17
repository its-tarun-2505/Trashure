'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import {
  FaBell,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaLeaf
} from 'react-icons/fa'
import styles from './CitizenNavbar.module.css'

export default function CitizenNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <FaLeaf className={styles.logoIcon} />
          <Link href="/" className={styles.brandText}>Trashure</Link>
        </div>

        <nav className={`${styles.nav} ${open ? styles.open : ''}`} aria-label="Primary">
          <Link href="/citizen" className={styles.link} onClick={() => setOpen(false)}>Dashboard</Link>
          <Link href="/citizen/new-request" className={styles.link} onClick={() => setOpen(false)}>New Request</Link>
          <Link href="/recycling-centers" className={styles.link} onClick={() => setOpen(false)}>Recycling Centers</Link>
          <Link href="/citizen/profile" className={styles.link} onClick={() => setOpen(false)}>Profile</Link>
        </nav>

        <div className={styles.actions}>
          <button className={styles.iconBtn} aria-label="Notifications">
            <FaBell />
            <span className={styles.badge} />
          </button>

          <Link href="/citizen/profile" className={styles.avatar} aria-label="Profile">
            <FaUserCircle />
          </Link>

          <button
            className={styles.menuBtn}
            onClick={() => setOpen(prev => !prev)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </header>
  )
}