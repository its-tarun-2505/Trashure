import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth.js'
import CollectorNavbar from '../../components/collector/CollectorNavbar'
import CollectorFooter from '../../components/collector/CollectorFooter'
import '../globals.css'

const layout = async ({ children }) => {
  const cookieStore = await cookies()
  const token = cookieStore.get('trashure_auth')?.value
  const payload = verifyToken(token)
  console.log("payload", payload);
   

  if (!payload) {
    redirect(`/login?next=/collector`)
  }
  if (payload.role !== 'collector') {
    redirect(`/?next=/collector&error=role`)
  }

  return (
    <>
      <CollectorNavbar />
      <main className="main-container">
        {children}
      </main>
      <CollectorFooter />
    </>
  )
}

export default layout;