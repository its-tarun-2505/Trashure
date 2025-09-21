"use client"
import React from 'react'
import { FaTruck, FaUserCircle } from 'react-icons/fa'
import styles from './register.module.css'
import CitizenRegisterPage from '@/components/citizen/CitizenRegisterPage'
import CollectorRegisterPage from '@/components/collector/CollectorRegisterPage'

const SelectProfile = () => {
  const [showCitizenRegistrationPage, setShowCitizenRegistrationPage] = React.useState(false);
  const [showCollectorRegistrationPage, setShowCollectorRegistrationPage] = React.useState(false);
  return (
    <>
      <main className={styles.wrap}>
        <section className={styles.cardWrap}>
          <h1 className={styles.title}>Select Your Profile</h1>
          <p className={styles.subtitle}>
            Choose a role to continue. You can switch later from your account settings.
          </p>

          <div className={styles.grid}>
            <button className={styles.card} aria-label="Collector" onClick={() => {setShowCollectorRegistrationPage(true); setShowCitizenRegistrationPage(false)}}>
              <div className={styles.iconWrap}>
                <FaTruck className={styles.icon} />
              </div>
              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>Collector</h2>
                <p className={styles.cardText}>Collect and manage pickups in your area.</p>
              </div>
            </button>

            <button className={styles.card} aria-label="Citizen" onClick={()=> {setShowCitizenRegistrationPage(true);  setShowCollectorRegistrationPage(false)}}>
              <div className={styles.iconWrap}>
                <FaUserCircle className={styles.icon} />
              </div>
              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>Citizen</h2>
                <p className={styles.cardText}>Request pickups and track your recycling impact.</p>
              </div>
            </button>
          </div>

          <p className={styles.note}>Not sure? You can learn more about each role on the next page.</p>
        </section>
      </main>
      {showCitizenRegistrationPage && <CitizenRegisterPage/>}
      {showCollectorRegistrationPage && <CollectorRegisterPage/>}
    </>
  )
}

export default SelectProfile