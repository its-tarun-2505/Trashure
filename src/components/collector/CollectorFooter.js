'use client'

import React from 'react'
import Link from 'next/link'
import styles from './CollectorFooter.module.css'

const CollectorFooter = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Left Side - Logo and Copyright */}
        <div className={styles.leftSection}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <div className={styles.bar}></div>
              <div className={styles.bar}></div>
              <div className={styles.bar}></div>
            </div>
            <span className={styles.copyright}>
              © {currentYear} Trashure. All rights reserved.
            </span>
          </div>
        </div>

        {/* Right Side - Navigation Links */}
        <div className={styles.rightSection}>
          <nav className={styles.footerNav}>
            <Link href="/about" className={styles.navLink}>
              About
            </Link>
            <Link href="/contact" className={styles.navLink}>
              Contact
            </Link>
            <Link href="/privacy" className={styles.navLink}>
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

export default CollectorFooter
