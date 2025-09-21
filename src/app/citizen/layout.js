import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth.js'
import CitizenNavbar from '../../components/citizen/CitizenNavbar'
import CitizenFooter from '../../components/citizen/CitizenFooter'
import '../globals.css'

const layout = async ({ children }) => {
  const cookieStore = await cookies()
  const token = cookieStore.get('trashure_auth')?.value
  const payload = verifyToken(token)

  if (!payload) {
    redirect(`/login?next=/citizen`)
  }
  if (payload.role !== 'citizen') {
    redirect(`/?next=/citizen&error=role`)
  }

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