"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import "./RotatingCardCarousel.scss"

// Icons
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { MagicCard, MagicContainer } from "../ui/MagicCard"

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

  const getClosestCardIndex = () => {
    const container = containerRef.current
    if (!container) return 0

    const cardWidth = 380
    const gap = 16
    const containerWidth = container.offsetWidth
    const centerOffset = (containerWidth - cardWidth) / 2
    
    // Calculate which card index is closest to center
    const currentOffset = Math.abs(offsetRef.current)
    const cardStep = cardWidth + gap
    return Math.round((currentOffset - centerOffset) / cardStep)
  }

  const slideToCard = (targetIndex) => {
    const track = trackRef.current
    const container = containerRef.current
    if (!track || !container) return

    const cardWidth = 380
    const gap = 16
    const containerWidth = container.offsetWidth
    const centerOffset = (containerWidth - cardWidth) / 2
    const cardStep = cardWidth + gap
    const trackWidth = track.scrollWidth / 2

    // Calculate target position to center the card
    let targetOffset = -(targetIndex * cardStep + centerOffset)
    
    // Handle infinite loop by wrapping around
    const totalCards = projects.length
    if (Math.abs(targetOffset) >= trackWidth) {
      // Wrap to equivalent position in first set
      const wrappedIndex = targetIndex % totalCards
      targetOffset = -(wrappedIndex * cardStep + centerOffset)
    }

    // Pause animation during manual control
    setIsHovered(true)

    track.style.transition = "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
    offsetRef.current = targetOffset
    track.style.transform = `translate3d(${targetOffset}px, 0, 0)`

    // Resume animation after transition
    setTimeout(() => {
      if (track) {
        track.style.transition = ""
        setIsHovered(false)
      }
    }, 600)
  }

  const nextSlide = () => {
    const currentIndex = getClosestCardIndex()
    slideToCard(currentIndex + 1)
  }

  const prevSlide = () => {
    const currentIndex = getClosestCardIndex()
    slideToCard(currentIndex - 1)
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
                    <p className="projectDescription">{project.description}</p>

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
