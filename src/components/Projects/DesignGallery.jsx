"use client"

import { motion } from "framer-motion"
import { FaBehance } from "react-icons/fa"
import "./DesignGallery.scss"

const getGridSpans = (ratio) => {
  const defaultSpan = { colSpan: 1, rowSpan: 1 }

  if (!ratio || typeof ratio !== "string") {
    return defaultSpan
  }

  const parts = ratio.split(":")
  if (parts.length !== 2) {
    return defaultSpan
  }

  const [rowSpan, colSpan] = parts.map(Number)

  if (isNaN(rowSpan) || isNaN(colSpan) || rowSpan <= 0 || colSpan <= 0) {
    return defaultSpan
  }

  return {
    rowSpan,
    colSpan,
  }
}

const DesignGallery = ({ designs, onImageClick }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div className="designGallery" variants={containerVariants} initial="hidden" animate="visible">
      {designs.map((design) => {
        const { colSpan, rowSpan } = getGridSpans(design.ratio)

        return (
          <motion.div
            key={design.id}
            className="galleryItem"
            style={{
              gridColumn: `span ${colSpan}`,
              gridRow: `span ${rowSpan}`,
            }}
            variants={itemVariants}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            onClick={() => onImageClick(design)}
          >
            <div className="imageWrapper">
              <img src={design.image || "/placeholder.svg"} alt={design.title || `Design ${design.id}`} />
              <div className="overlay">
                <div className="overlayContent">
                  {design.tools && design.tools.length > 0 && (
                    <div className="tools">
                      {design.tools.map((tool, index) => (
                        <span key={index} className="tool">
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                  {design.behanceUrl && (
                    <a
                      href={design.behanceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="behanceLink"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaBehance />
                      <span>View on Behance</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export default DesignGallery