'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaImage } from 'react-icons/fa'
import styles from './newRequest.module.css'

const CATEGORIES = [
  'General Waste',
  'Recyclables',
  'Organic Waste',
  'Electronic Waste',
  'Hazardous Waste',
  'Mixed Waste'
]

export default function NewRequestPage() {
  const router = useRouter()
  const [category, setCategory] = useState('')
  const [address, setAddress] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [images, setImages] = useState([]) 
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function resetMessages() {
    setError('')
    setSuccess('')
  }

  function fileToDataUrl(file) {
    return new Promise((res, rej) => {
      const reader = new FileReader()
      reader.onload = () => res({ name: file.name, dataUrl: reader.result, size: file.size, type: file.type })
      reader.onerror = rej
      reader.readAsDataURL(file)
    })
  }

  async function handleFiles(e) {
    resetMessages()
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    // limit number and size
    const maxFiles = 5
    const maxSize = 5 * 1024 * 1024 // 5MB each
    const newFiles = []
    for (let i = 0; i < files.length && newFiles.length + images.length < maxFiles; i++) {
      const f = files[i]
      if (f.size > maxSize) {
        setError(`"${f.name}" is larger than 5MB.`)
        continue
      }
      // only images
      if (!f.type.startsWith('image/')) {
        setError(`"${f.name}" is not an image.`)
        continue
      }
      try {
        const dto = await fileToDataUrl(f)
        newFiles.push(dto)
      } catch (err) {
        // skip
      }
    }
    setImages(prev => [...prev, ...newFiles])
    e.target.value = ''
  }

  function removeImage(index) {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  function validate() {
    if (!category) return 'Please choose a waste category.'
    if (!address.trim()) return 'Please enter address.'
    if (!scheduledAt) return 'Please choose date & time.'
    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    resetMessages()
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setLoading(true)
    try {
      const payload = {
        category,
        address,
        scheduledAt,
        images: images.map(img => ({ name: img.name, data: img.dataUrl, type: img.type }))
      }
      const res = await fetch('/api/citizen/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 400) {
          throw new Error(data?.message || 'Please check your information and try again.')
        } else if (res.status === 500) {
          throw new Error('Server error. Please try again in a moment.')
        } else {
          throw new Error(data?.message || 'Failed to create request. Please try again.')
        }
      }
      
      setSuccess('Your waste pickup request has been submitted successfully! We\'ll contact you soon to confirm the details.')
      // Clear form
      setCategory('')
      setAddress('')
      setScheduledAt('')
      setImages([])
      // Redirect to dashboard after showing success message
      setTimeout(() => router.push('/citizen/dashboard'), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.pageWrap}>
      <main className={styles.card}>
        <h1 className={styles.title}>New Waste Collection Request</h1>
        <p className={styles.subtitle}>Fill in the details to schedule a pickup.</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <label className={styles.label}>Waste Category</label>
          <select
            className={styles.select}
            value={category}
            onChange={e => setCategory(e.target.value)}
            aria-label="Waste category"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className={styles.label}>Address</label>
          <input
            className={styles.input}
            placeholder="302, Lotus Apartments, Linking Road, New Delhi - 110550"
            value={address}
            onChange={e => setAddress(e.target.value)}
          />

          <label className={styles.label}>Date & Time</label>
          <input
            className={styles.input}
            type="datetime-local"
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
          />

          <label className={styles.label}>Upload Images (optional)</label>
          <div className={styles.uploadRow}>
            <label className={styles.uploadBtn}>
              <FaImage className={styles.uploadIcon} />
              <span>Choose images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                aria-label="Upload images"
              />
            </label>
            <div className={styles.hint}>Max 5 images · each up to 5MB</div>
          </div>

          {images.length > 0 && (
            <div className={styles.previewGrid}>
              {images.map((img, idx) => (
                <div className={styles.thumb} key={idx}>
                  <img src={img.dataUrl} alt={img.name} />
                  <button type="button" className={styles.removeBtn} onClick={() => removeImage(idx)}>Remove</button>
                </div>
              ))}
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
      </main>
    </div>
  )
}