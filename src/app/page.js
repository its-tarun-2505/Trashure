import React from "react";
import styles from "../styles/HomePage.module.css";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className={`${styles.hero} ${styles.container}`}>
        <div className={styles.heroLeft}>
          <h1 className={styles.heroTitle}>A Greener Tomorrow Starts Today</h1>
          <p className={styles.heroSub}>
            Join our community in revolutionizing waste management. Seamlessly
            request pickups and track your positive environmental impact.
          </p>
          <button className={styles.ecCta}>Raise Your First Pickup Request</button>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.heroCardImg} aria-hidden="true">
            <img className={styles.image} src="/assets/homepage/Banner.png" alt="imageLoading..."/>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={`${styles.howItWorks} ${styles.container}`}>
        <h2>How It Works</h2>
        <p className={styles.muted}>Three simple steps to a cleaner planet.</p>

        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={`${styles.stepIllustration} ${styles.request}`} >
              <img className={styles.image} src="/assets/homepage/Request.png" alt="imageLoading..."/>
            </div>
            <h3>1. Request</h3>
            <p>Schedule a pickup at your convenience using our intuitive app or website.</p>
          </div>

          <div className={styles.stepCard}>
            <div className={`${styles.stepIllustration} ${styles.collect}`} >
              <img className={styles.image} src="/assets/homepage/Collect.png" alt="imageLoading..."/>
            </div>
            <h3>2. Collect</h3>
            <p>Our friendly team arrives on time to collect your segregated waste.</p>
          </div>

          <div className={styles.stepCard}>
            <div className={`${styles.stepIllustration} ${styles.recycle}`} >
              <img className={styles.image} src="/assets/homepage/Recycle.png" alt="imageLoading..."/>
            </div>
            <h3>3. Recycle</h3>
            <p>We ensure your waste is processed and recycled responsibly, minimizing landfill.</p>
          </div>
        </div>
      </section>

      {/* Why choose */}
      <section className={`${styles.why} ${styles.container}`}>
        <h2>Why Choose Trashure?</h2>
        <p className={styles.muted}>Experience a transparent, easy, and impactful way to manage waste.</p>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureImg} >
              <img className={styles.image} src="/assets/homepage/Transparency.png" alt="imageLoading..."/>
            </div>
            <h4>Transparency</h4>
            <p>Follow your waste's journey from your doorstep to the recycling facility.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureImg} >
              <img className={styles.image} src="/assets/homepage/ecoFriendly.png" alt="imageLoading..."/>
            </div>
            <h4>Eco-Friendly</h4>
            <p>Our optimized routes and sustainable practices reduce our carbon footprint.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureImg} >
              <img className={styles.image} src="/assets/homepage/easyTracking.png" alt="imageLoading..."/>
            </div>
            <h4>Easy Tracking</h4>
            <p>Manage pickups, view your recycling stats, and see your impact grow.</p>
          </div>
        </div>

        {/* <div className={styles.demoCta}> */}
          {/* <button className={styles.ecBtnOutlineLarge}>View Demo Collector Info</button> */}
        {/* </div> */}
      </section>
    </>
  );
}