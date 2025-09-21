'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng
      
      // Get address using reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        )
        const data = await response.json()
        
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        
        onLocationSelect({
          lat: lat,
          lng: lng,
          address: address
        })
      } catch (error) {
        console.error('Reverse geocoding error:', error)
        // Fallback to coordinates if reverse geocoding fails
        onLocationSelect({
          lat: lat,
          lng: lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        })
      }
    }
  })
  return null
}

// Component to handle automatic zoom to selected location
function MapZoomHandler({ selectedLocation }) {
  const map = useMapEvents({})
  
  React.useEffect(() => {
    if (selectedLocation) {
      map.setView([selectedLocation.lat, selectedLocation.lng], 15, {
        animate: true,
        duration: 1
      })
    }
  }, [selectedLocation, map])
  
  return null
}

// Component to handle location updates
function LocationMarker({ selectedLocation }) {
  if (!selectedLocation) return null

  return (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
      <Popup>
        <div>
          <strong>Selected Location</strong>
          <br />
          {selectedLocation.address}
          <br />
          <small>
            Lat: {selectedLocation.lat.toFixed(6)}, 
            Lng: {selectedLocation.lng.toFixed(6)}
          </small>
        </div>
      </Popup>
    </Marker>
  )
}

const MapComponent = ({ selectedLocation, onLocationSelect }) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div style={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8f9fa',
        border: '2px solid #e9ecef',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center', color: '#6c757d' }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>🗺️</div>
          <div>Loading map...</div>
        </div>
      </div>
    )
  }

  return (
    <MapContainer
      center={[28.407210237858546, 77.8495502471924]} // Delhi/NCR area
      zoom={12}
      style={{ height: '400px', width: '100%' }}
      className="map-container"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapClickHandler onLocationSelect={onLocationSelect} />
      <MapZoomHandler selectedLocation={selectedLocation} />
      <LocationMarker selectedLocation={selectedLocation} />
    </MapContainer>
  )
}

export default MapComponent
