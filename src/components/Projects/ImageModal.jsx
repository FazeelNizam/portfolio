"use client"

import { motion, AnimatePresence } from "framer-motion"
import { IoClose } from "react-icons/io5"
import "./ImageModal.scss"

const ImageModal = ({ image, isOpen, onClose }) => {
  if (!isOpen || !image) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="imageModalOverlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="imageModalContent"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button className="closeButton" onClick={onClose} aria-label="Close modal">
              <IoClose />
            </button>
            <div className="imageContainer">
              <img src={image.image || "/placeholder.svg"} alt={image.title || "Design work"} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ImageModal
