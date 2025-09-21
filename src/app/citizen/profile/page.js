'use client'

import React, { useEffect, useState, useRef } from 'react'
import styles from './ProfilePage.module.css'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUpload, FaArrowLeft, FaSave } from 'react-icons/fa'
import Link from 'next/link'

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    photoUrl: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef(null)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    let mounted = true
    fetch('/api/user/me')
      .then(r => r.json())
      .then(data => {
        if (!mounted) return
        if (data?.ok) {
          setUser(prev => ({ ...prev, ...data.user }))
          setPreview(data.user?.photoUrl || '')
        }
      })
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [])

  function handleFileChange(e) {
    const f = e.target.files?.[0]
    if (!f) {
      setPreview(user.photoUrl || '')
      return
    }
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', user.name || '')
      fd.append('email', user.email || '')
      fd.append('phone', user.phone || '')
      fd.append('address', user.address || '')
      const file = fileRef.current?.files?.[0]
      if (file) fd.append('photo', file)

      const res = await fetch('/api/user/update', { method: 'PATCH', body: fd })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        setError(data?.error || 'Failed to save profile')
      } else {
        setUser(prev => ({ ...prev, ...data.user }))
        setPreview(data.user?.photoUrl || preview)
        setSuccess('Profile updated successfully!')
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(''), 2500)
    }
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Citizen Profile</h1>
        <p className={styles.sub}>Update your personal information and preferences</p>
      </header>

      <form className={styles.card} onSubmit={handleSubmit}>
        {/* Profile Photo at Top */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrap}>
            {preview ? (
              <img src={preview} alt="avatar" className={styles.avatar} />
            ) : (
              <div className={styles.avatarEmpty}><FaUser /></div>
            )}
            <label className={styles.uploadOverlay}>
              <FaUpload />
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
          <div className={styles.hint}>Click the icon to upload a new photo (Max 5MB)</div>
        </div>

        {/* Fields */}
        <div className={styles.formFields}>
          <label className={styles.field}>
            <FaUser className={styles.icon} />
            <input
              placeholder="Full Name"
              className={styles.input}
              value={user.name}
              onChange={e => setUser({ ...user, name: e.target.value })}
            />
          </label>

          <label className={styles.field}>
            <FaEnvelope className={styles.icon} />
            <input
              type="email"
              placeholder="Email"
              className={styles.input}
              value={user.email}
              onChange={e => setUser({ ...user, email: e.target.value })}
            />
          </label>

          <label className={styles.field}>
            <FaPhone className={styles.icon} />
            <input
              type="tel"
              placeholder="Phone"
              className={styles.input}
              value={user.phone}
              onChange={e => setUser({ ...user, phone: e.target.value })}
            />
          </label>

          <label className={styles.fieldTextArea}>
            <FaMapMarkerAlt className={styles.icon} />
            <textarea
              placeholder="Your Address"
              className={styles.address}
              value={user.address}
              onChange={e => setUser({ ...user, address: e.target.value })}
            />
          </label>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button type="submit" className={styles.save} disabled={saving}>
            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/citizen" className={styles.cancel}>
            <FaArrowLeft /> Back
          </Link>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
      </form>
    </div>
  )
}
