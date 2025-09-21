'use client'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [reqMenuOpen, setReqMenuOpen] = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const router = useRouter()
  const userMenuRef = useRef(null)
  const reqMenuRef = useRef(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/user/me')
      .then(r => r.json())
      .then(d => { if (mounted && d?.ok && d.user?.photoUrl) setPhotoUrl(d.user.photoUrl) })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    function onDocClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
      if (reqMenuRef.current && !reqMenuRef.current.contains(e.target)) setReqMenuOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  async function onLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (e) {
      router.push('/login')
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <FaLeaf className={styles.logoIcon} />
          <Link href="/" className={styles.brandText}>Trashure</Link>
        </div>

        <nav className={`${styles.nav} ${open ? styles.open : ''}`} aria-label="Primary">
          <Link href="/citizen/dashboard" className={styles.link} onClick={() => setOpen(false)}>Dashboard</Link>
          <div className={styles.dropdown} ref={reqMenuRef}>
            <button type="button" className={styles.dropBtn} onClick={(e) => { e.stopPropagation(); setReqMenuOpen(v => !v) }}>Requests ▾</button>
            {reqMenuOpen && (
              <div className={styles.menu} role="menu">
                <Link href="/citizen/requests" className={styles.menuItem} onClick={() => { setOpen(false); setReqMenuOpen(false) }}>All Requests</Link>
                <Link href="/citizen/new-request" className={styles.menuItem} onClick={() => { setOpen(false); setReqMenuOpen(false) }}>New Request</Link>
              </div>
            )}
          </div>
          <Link href="/recycling-centers" className={styles.link} onClick={() => setOpen(false)}>Recycling Centers</Link>
          {/* <Link href="/citizen/profile" className={styles.link} onClick={() => setOpen(false)}>Profile</Link> */}
        </nav>

        <div className={styles.actions}>
          <button className={styles.iconBtn} aria-label="Notifications">
            <FaBell />
            <span className={styles.badge} />
          </button>

          <div className={styles.dropdown} ref={userMenuRef}>
            <button type="button" className={styles.avatarBtn} onClick={(e) => { e.stopPropagation(); setUserMenuOpen(v => !v) }} aria-label="User menu">
              {photoUrl ? (
                <img src={photoUrl} alt="avatar" className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarIcon}><FaUserCircle /></span>
              )}
            </button>
            {userMenuOpen && (
              <div className={styles.menuRight} role="menu">
                <Link href="/citizen/profile" className={styles.menuItem} onClick={() => setUserMenuOpen(false)}>Profile</Link>
                <button className={styles.menuItemBtn} onClick={onLogout}>Logout</button>
              </div>
            )}
          </div>

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