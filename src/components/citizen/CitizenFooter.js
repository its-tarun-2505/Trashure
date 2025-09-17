'use client'
import React from 'react'
import Link from 'next/link'
import styles from './CitizenFooter.module.css'

export default function CitizenFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.col}>
          <div className={styles.brand}>Trashure</div>
          <p className={styles.desc}>Making waste collection simple and sustainable.</p>
        </div>

        <div className={styles.col}>
          <h4 className={styles.heading}>Product</h4>
          <Link href="/recycling-centers" className={styles.link}>Recycling Centers</Link>
          <Link href="/citizen/new-request" className={styles.link}>Request Pickup</Link>
        </div>

        <div className={styles.col}>
          <h4 className={styles.heading}>Company</h4>
          <Link href="/about" className={styles.link}>About</Link>
          <Link href="/contact" className={styles.link}>Contact</Link>
        </div>
      </div>

      <div className={styles.bottom}>
        <small>© {year} Trashure. All rights reserved.</small>
      </div>
    </footer>
  )
}