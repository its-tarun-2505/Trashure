'use client'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function RootChrome({ children }) {
  const pathname = usePathname()
  const hideRootChrome = pathname?.startsWith('/citizen') || pathname?.startsWith('/collector') || pathname?.startsWith('/admin')

  return (
    <>
      {!hideRootChrome && <Navbar />}
      <main className="main-container">
        {children}
      </main>
      {!hideRootChrome && <Footer />}
    </>
  )
}


