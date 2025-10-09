"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import "./RotatingCardCarousel.scss"

// Icons
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { MagicCard, MagicContainer } from "../ui/MagicCard"

const truncateDescription = (text, wordLimit = 15) => {
  if (!text) return ""
  const words = text.split(" ")
  if (words.length <= wordLimit) return text
  return words.slice(0, wordLimit).join(" ") + "...read more"
}

const RotatingCardCarousel = ({ projects, onProjectClick, paused = false }) => {
  const [isHovered, setIsHovered] = useState(false)
  const duplicated = useMemo(() => [...projects, ...projects], [projects])
  const trackRef = useRef(null)
  const containerRef = useRef(null)
  const offsetRef = useRef(0)
  const speed = 0.25 // px per frame, slightly reduced for smoother scrolling

  useEffect(() => {
    let raf
    const step = () => {
      const track = trackRef.current
      const container = containerRef.current
      if (track && container) {
        if (!paused && !isHovered) {
          const trackWidth = track.scrollWidth / 2
          const next = offsetRef.current - speed
          offsetRef.current = Math.abs(next) >= trackWidth ? 0 : next
          track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
        }
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [paused, isHovered])

  // Pause animation when section is not visible to improve performance
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            // temporary pause by setting hover true
            setIsHovered(true)
          } else {
            setIsHovered(false)
          }
        })
      },
      { threshold: 0.1 },
    )
    const el = containerRef.current
    if (el) observer.observe(el)
    return () => {
      if (el) observer.unobserve(el)
      observer.disconnect()
    }
  }, [])

  const nextSlide = () => {
    const track = trackRef.current
    const container = containerRef.current
    if (!track || !container) return

    const cardWidth = 380 // card width
    const gap = 16 // gap between cards
    const containerWidth = container.offsetWidth

    // Calculate how much to move to center the next card
    const centerOffset = (containerWidth - cardWidth) / 2
    const currentOffset = offsetRef.current

    // Find the next card that's off-screen to the right
    const moveAmount = cardWidth + gap
    offsetRef.current = currentOffset - moveAmount

    track.style.transition = "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
    track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`

    // Remove transition after animation completes
    setTimeout(() => {
      if (track) track.style.transition = ""
    }, 500)
  }

  const prevSlide = () => {
    const track = trackRef.current
    const container = containerRef.current
    if (!track || !container) return

    const cardWidth = 380
    const gap = 16
    const containerWidth = container.offsetWidth

    const centerOffset = (containerWidth - cardWidth) / 2
    const currentOffset = offsetRef.current

    // Find the previous card that's off-screen to the left
    const moveAmount = cardWidth + gap
    offsetRef.current = currentOffset + moveAmount

    track.style.transition = "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
    track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`

    // Remove transition after animation completes
    setTimeout(() => {
      if (track) track.style.transition = ""
    }, 500)
  }

  return (
    <div className="simpleCarousel">
      <div
        className="carouselContainer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        ref={containerRef}
      >
        <motion.div className="carouselTrack" ref={trackRef}>
          <MagicContainer className="trackInner">
            {duplicated.map((project, index) => (
              <div
                key={`${project.id}-${index}`}
                className="projectCard"
                onClick={() => onProjectClick && onProjectClick(project)}
              >
                <MagicCard className="magicCard">
                  <div className="cardImage">
                    <img src={project.image || "/placeholder.svg"} alt={project.title} loading="lazy" />
                    <div className="imageOverlay">
                      <div className="projectType">
                        <span>{project.type || "Project"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="cardContent">
                    <h3 className="projectTitle">{project.title}</h3>
                    <p className="projectDescription">{truncateDescription(project.description, 15)}</p>

                    <div className="projectMeta">
                      {project.language && <span className="language">{project.language}</span>}
                      {project.category && <span className="category">{project.category}</span>}
                    </div>
                    <div className="projectStats">
                      {project.stars !== undefined && (
                        <div className="stat">
                          <span>⭐ {project.stars}</span>
                        </div>
                      )}
                      {project.forks !== undefined && (
                        <div className="stat">
                          <span>🍴 {project.forks}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </MagicCard>
              </div>
            ))}
          </MagicContainer>
        </motion.div>
      </div>

      {/* Navigation Controls */}
      <div className="carouselControls">
        <button className="navButton prev" onClick={prevSlide}>
          <FaChevronLeft />
        </button>

        <div className="indicators" />

        <button className="navButton next" onClick={nextSlide}>
          <FaChevronRight />
        </button>
      </div>
    </div>
  )
}

export default RotatingCardCarousel
