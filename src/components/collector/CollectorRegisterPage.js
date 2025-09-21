'use client'

import React, { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import styles from './CollectorRegisterPage.module.css'

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('../../lib/MapComponent'), {
  ssr: false,
  loading: () => <div className={styles.mapLoading}>Loading map...</div>
})

const CollectorRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    latitude: '',
    longitude: '',
    address: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
    setFormData(prev => ({
      ...prev,
      latitude: location.lat.toString(),
      longitude: location.lng.toString(),
      address: location.address || `${location.lat}, ${location.lng}`
    }))
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      // Using Nominatim (OpenStreetMap's geocoding service) - completely free
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`
      )
      const results = await response.json()
      
      if (results.length > 0) {
        const result = results[0]
        const location = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: result.display_name
        }
        handleLocationSelect(location)
      }
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Please select a location on the map'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'collector',
          address: formData.address || `${formData.latitude}, ${formData.longitude}`,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        }),
      })

      const data = await response.json()
      console.log(data);
      console.log(data.message);
      

      if (response.ok) {
        alert('Registration successful! Please login to continue.')
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          latitude: '',
          longitude: '',
          address: ''
        })
        // Reset selected location
        setSelectedLocation(null)
      } else {
        alert("Collector Registration Failed: "+data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formCard}>
        <h1 className={styles.title}>Collector Registration</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Personal Information Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Personal Information</h2>
            
            <div className={styles.inputGroup}>
              <label htmlFor="name" className={styles.label}>
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              />
              {errors.name && <span className={styles.errorText}>{errors.name}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              />
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
              />
              {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a strong password"
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              />
              {errors.password && <span className={styles.errorText}>{errors.password}</span>}
            </div>
          </div>

          {/* Warehouse Location Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Warehouse Location</h2>
            
            {/* Integrated Location Section */}
            <div className={styles.locationSection}>
              {/* Search and Selected Location Combined */}
              <div className={styles.locationHeader}>
                <div className={styles.searchContainer}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a location..."
                    className={styles.searchInput}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    className={styles.searchButton}
                  >
                    Search
                  </button>
                </div>
                
                {selectedLocation && (
                  <div className={styles.selectedLocation}>
                    <div className={styles.locationIcon}>📍</div>
                    <div className={styles.locationInfo}>
                      <div className={styles.locationLabel}>Selected Location:</div>
                      <div className={styles.locationAddress}>{selectedLocation.address}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Container */}
              <div className={styles.mapContainer}>
                <MapComponent
                  selectedLocation={selectedLocation}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

              {/* Manual Coordinate Input */}
              <div className={styles.coordinateContainer}>
                <div className={styles.coordinateInput}>
                  <label htmlFor="latitude" className={styles.label}>
                    Latitude
                  </label>
                  <input
                    type="number"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 28.4072"
                    step="any"
                    className={`${styles.input} ${errors.location ? styles.inputError : ''}`}
                  />
                </div>
                <div className={styles.coordinateInput}>
                  <label htmlFor="longitude" className={styles.label}>
                    Longitude
                  </label>
                  <input
                    type="number"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="e.g., 77.8495"
                    step="any"
                    className={`${styles.input} ${errors.location ? styles.inputError : ''}`}
                  />
                </div>
              </div>
              {errors.location && <span className={styles.errorText}>{errors.location}</span>}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? 'Registering...' : 'Register Collector'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CollectorRegisterPage
