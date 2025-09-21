import React from "react"
import Link from "next/link"
import { dbConnect } from "@/lib/db.js"
import Request from "@/models/PickupRequest"
import styles from "./page.module.css"
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaRecycle,
  FaLeaf,
  FaTrashAlt,
  FaLaptop,
  FaBiohazard,
  FaClock,
  FaRoute,
  FaArrowLeft,
  FaImage,
} from "react-icons/fa"

function categoryIcon(category) {
  switch ((category || "").toLowerCase()) {
    case "recyclables":
      return <FaRecycle className={styles.bigIcon} />
    case "organic":
      return <FaLeaf className={styles.bigIcon} />
    case "general waste":
      return <FaTrashAlt className={styles.bigIcon} />
    case "electronic":
      return <FaLaptop className={styles.bigIcon} />
    case "hazardous":
      return <FaBiohazard className={styles.bigIcon} />
    default:
      return <FaTrashAlt className={styles.bigIcon} />
  }
}

function statusBadge(status) {
  const cls =
    status?.toLowerCase() === "completed"
      ? styles.statusCompleted
      : status?.toLowerCase() === "pending"
      ? styles.statusPending
      : status?.toLowerCase() === "cancelled"
      ? styles.statusCancelled
      : styles.statusDefault

  return <span className={`${styles.statusBadge} ${cls}`}>{status}</span>
}

export default async function RequestDetailPage({ params }) {
  const { id } = await params || {}
  await dbConnect()
  const doc = await Request.findById(id).lean()

  if (!doc) {
    return (
      <div className={styles.wrap}>
        <h1 className={styles.pageTitle}>Request Details</h1>
        <div className={styles.card}>
          <h2 className={styles.notFound}>Request not found</h2>
          <Link href="/citizen" className={styles.secondaryBtn}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const formattedDate = (d) => {
    try {
      return new Date(d).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    } catch {
      return d
    }
  }

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <Link href="/citizen" className={styles.backBtn}>
          <FaArrowLeft className={styles.backIcon} />
          Back to Dashboard
        </Link>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Request Details</h1>
          <p className={styles.pageSubtitle}>View the details of your waste pickup request</p>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        <div className={styles.mainCard}>
          {/* Request Details Section */}
          <div className={styles.detailsSection}>
            <div className={styles.categorySection}>
              <div className={styles.categoryIcon}>
                {categoryIcon(doc.category)}
              </div>
              <div className={styles.categoryInfo}>
                <h2 className={styles.categoryLabel}>Waste Category</h2>
                <p className={styles.categoryValue}>{doc.category || "N/A"}</p>
              </div>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>
                  <FaClock />
                </div>
                <div className={styles.detailContent}>
                  <h3 className={styles.detailLabel}>Status</h3>
                  {statusBadge(doc.status || "Pending")}
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>
                  <FaCalendarAlt />
                </div>
                <div className={styles.detailContent}>
                  <h3 className={styles.detailLabel}>Scheduled Date & Time</h3>
                  <p className={styles.detailValue}>
                    {formattedDate(doc.scheduledAt || doc.createdAt)}
                  </p>
                </div>
              </div>

              <div className={styles.detailItem}>
                <div className={styles.detailIcon}>
                  <FaMapMarkerAlt />
                </div>
                <div className={styles.detailContent}>
                  <h3 className={styles.detailLabel}>Pickup Address</h3>
                  <p className={styles.detailValue}>{doc.address}</p>
                </div>
              </div>

              {doc.notes && (
                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <FaImage />
                  </div>
                  <div className={styles.detailContent}>
                    <h3 className={styles.detailLabel}>Additional Notes</h3>
                    <p className={styles.detailValue}>{doc.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Photos Section */}
          <div className={styles.photosSection}>
            <h3 className={styles.photosTitle}>Request Photos</h3>
            {doc.images && doc.images.length > 0 ? (
              <div className={styles.photoGallery}>
                {doc.images.slice(0, 5).map((src, i) => (
                  <div key={i} className={styles.photoItem}>
                    <img src={src} alt={`Request photo ${i + 1}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noPhotosContainer}>
                <FaImage className={styles.noPhotosIcon} />
                <p className={styles.noPhotosText}>No images provided</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className={styles.actionSection}>
          <Link href={`/citizen/track/${id}`} className={styles.trackBtn}>
            <FaRoute className={styles.trackIcon} />
            Track Request
          </Link>
        </div>
      </div>
    </div>
  )
}
