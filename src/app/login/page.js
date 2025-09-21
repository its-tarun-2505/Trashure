'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaEnvelope, FaLock } from 'react-icons/fa'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState('citizen')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function validate() {
    if (!email.trim()) return 'Please enter your email address'
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(email)) return 'Please enter a valid email address (e.g., user@example.com)'
    if (!password) return 'Please enter your password'
    if (password.length < 6) return 'Password must be at least 6 characters long'
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setLoading(true)    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Login failed')
      // redirect based on role (backend may return preferred path)
      const redirectTo = data?.redirect || (role === 'collector' ? '/collector/dashboard' : (role === 'citizen') ? '/citizen/dashboard' : '/admin/dashboard')
      // Use window.location.href for full page reload to ensure cookie is set
      window.location.href = redirectTo
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { id: 'citizen', label: 'Citizen' },
    { id: 'collector', label: 'Collector' },
    { id: 'admin', label: 'Admin' },
  ]

  return (
    <div className={styles.pageWrap}>
      <main className={styles.card}>
        <h1 className={styles.title}>Welcome to Trashure</h1>
        <p className={styles.subtitle}>Sign in to your account to manage waste collection requests</p>

        <label className={styles.sectionLabel}>Select your role</label>
        <div className={styles.roleGrid} role="tablist" aria-label="Select role">
          {roles.map(r => (
            <button
              key={r.id}
              type="button"
              className={`${styles.roleBtn} ${role === r.id ? styles.active : ''}`}
              onClick={() => setRole(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span className={styles.icon}><FaEnvelope /></span>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.icon}><FaLock /></span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          <div className={styles.row}>
            <a className={styles.forgot} href="/forgot-password">Forgot Password?</a>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </main>
    </div>
  )
}