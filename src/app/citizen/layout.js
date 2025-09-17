import React from 'react'
import CitizenNavbar from '../../components/citizen/CitizenNavbar'
import CitizenFooter from '../../components/citizen/CitizenFooter'
import '../globals.css'

const layout = ({ children }) => {
  return (
    <>
      <CitizenNavbar />
      <main className="main-container">
        {children}
      </main>
      <CitizenFooter />
    </>
  )
}

export default layout;