import React from "react";
import styles from "../styles/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.left}>
          <span className={styles.logoSmall}>Trashure</span>
        </div>
        <div className={styles.right}>
          <small>© 2025 Trashure. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
}