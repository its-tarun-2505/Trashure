import React from "react";
import Link from "next/link";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.logo}>Trashure</span>
        </div>

        <nav className={styles.actions}>
          <Link href="/login" className={styles.btnOutline}>Login</Link>
          <Link href="/register" className={styles.btnPrimary}>Register</Link>
        </nav>
      </div>
    </header>
  );
}