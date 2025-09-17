'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock } from 'react-icons/fa'
import styles from './CitizenRegisterPage.module.css'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {        
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Registration failed')
      setSuccess('Registration successful — redirecting to login...')
      setTimeout(() => router.push('/login'), 1100)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function update(k, v) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  return (
    <div className={styles.pageWrap}>
      <main className={styles.card}>
        <h1 className={styles.title}>Citizen Registration</h1>
        <p className={styles.subtitle}>Create an account to manage your waste responsibly.</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <label className={styles.field}>
            <div className={styles.labelRow}>
                <FaUser className={styles.icon} />
                <span className={styles.labelText}>Name</span>
            </div>
            <input
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Enter your full name"
                required
            />
          </label>


          <label className={styles.field}>
            <div className={styles.labelRow}>
                <FaEnvelope className={styles.icon} />
                <span className={styles.labelText}>Email Id</span>
            </div>
            <input
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="you@example.com"
              inputMode="email"
              required
            />
          </label>

          <label className={styles.field}>
            <div className={styles.labelRow}>
                <FaPhone className={styles.icon} />
                <span className={styles.labelText}>Phone No.</span>
            </div>
            <input
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
              placeholder="Enter your phone number"
              inputMode="tel"
              required
            />
          </label>

          <label className={styles.field}>
            <div className={styles.labelRow}>
                <FaMapMarkerAlt className={styles.icon} />
                <span className={styles.labelText}>Address</span>
            </div>
            <input
              value={form.address}
              onChange={e => update('address', e.target.value)}
              placeholder="Enter your full address"
              required
            />
          </label>

          <label className={styles.field}>
            <div className={styles.labelRow}>
                <FaLock className={styles.icon} />
                <span className={styles.labelText}>Password</span>
            </div>
            <input
              value={form.password}
              onChange={e => update('password', e.target.value)}
              placeholder="Create a strong password"
              type="password"
              required
            />
          </label>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Registering…' : 'Register'}
          </button>

          <div className={styles.loginNote}>
            Already have an account? <a href="/login" className={styles.loginLink}>Log in</a>
          </div>
        </form>
      </main>
    </div>
  )
}