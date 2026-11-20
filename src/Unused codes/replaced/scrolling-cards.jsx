"use client"
import React, { useEffect, useRef } from "react"
import { useGSAP } from "@gsap/react"
import ScrollTrigger from "gsap/ScrollTrigger"
import gsap from "gsap"

gsap.registerPlugin(ScrollTrigger)

function ScrollingCards({
  cards,
  cardWidth,
  top = 55,
  left = 20,
  animationLength = 200,
  scrollerRef,
}) {
  const sectionRef = useRef(null)
  const cardsRef = useRef([])

  useGSAP(() => {
    if (!sectionRef.current || !cardsRef.current) return

    // Set initial position for all cards (below viewport)
    gsap.set(cardsRef.current, {
      top: window.innerHeight + 300,
      rotate: (i) => `${cards[i].rotate}deg`,
    })

    // Create timeline for sequential animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "center center", // Start when section center hits viewport center
        end: "+=200%", // End after scrolling 300% of section height
        pin: true, // Pin the section while animation plays
        pinSpacing: true,
        scrub: 2, // Smooth scrubbing effect
        markers: false,
      },
    })

    // Add each card to the timeline with sequential animation
    cardsRef.current.forEach((card) => {
      if (!card) return
      tl.to(
        card,
        {
          top: `${top}%`,
          ease: "none",
        },
        ">" // Stagger the animations
      )
    })
  }, [cards, cardsRef.current])

  return (
    <div
      ref={sectionRef}
      className="h-screen relative flex items-center justify-center overflow-hidden w-full"
    >
      {cards.map((item, index) => (
        <div
          key={index}
          ref={(el) => {
            if (el) cardsRef.current[index] = el
          }}
          style={{
            rotate: `${item.rotate}deg`,
            transformOrigin: `${
              item.transformOrigin ?? `${index % 2 === 0 ? "left" : "right"}`
            }`,
            width: `100%`,
            maxWidth: `${cardWidth}px`,
            position: "absolute",
          }}
          className="transition-all -translate-x-1/2 -translate-y-1/2 left-1/2 top-full"
        >
          {item.card}
        </div>
      ))}
    </div>
  )
}

function SnappingScrollingCards({
  cards,
  cardWidth,
  top = 35,
  left = 30,
  animationLength = 400,
  scrollerRef,
}) {
  const sectionRef = useRef(null)
  const cardsRef = useRef([])

  useGSAP(() => {
    if (!sectionRef.current || cardsRef.current.some((ref) => !ref)) return

    const unitLeftDis = (50 - left) / (cards.length - 1 || 1)

    // Calculate maximum rotation to adjust starting position
    const maxRotation = Math.max(...cards.map((card) => Math.abs(card.rotate)))
    const extraPadding = maxRotation * 2 // Add extra padding based on rotation

    // Reset all cards to initial position - move them further down to account for rotation
    gsap.set(cardsRef.current, {
      top: window.innerHeight + 300 + extraPadding,
      left: "50%",
      rotate: (i) => `${cards[i]?.rotate || 0}deg`,
      opacity: 0, // Start with opacity 0
      clearProps: "none", // Clear any previously set props
    })

    // Create main scroll trigger
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "center center",
      end: `+=${animationLength}%`,
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        // Calculate current scroll progress (0-1)
        const progress = self.progress

        // Total scroll is divided into sections:
        // - First 70% of scroll brings cards up sequentially
        // - Remaining 30% ensures all cards reach final horizontal position
        const verticalSection = 0.7 // 70% of scroll dedicated to vertical movement

        cardsRef.current.forEach((card, i) => {
          if (!card) return

          // Calculate when this card should start its vertical animation
          // (distributed evenly across the first 70% of scroll)
          const cardStartPoint = (i / cards.length) * verticalSection

          // Calculate progress of this card's animation sequence (0-1)
          let cardProgress = (progress - cardStartPoint) / (verticalSection / cards.length)
          cardProgress = Math.max(0, Math.min(1, cardProgress))

          // Calculate vertical position
          const verticalProgress = Math.min(1, cardProgress * 2) // Complete vertical movement in first half of card's sequence
          const startY = window.innerHeight + 300 + extraPadding
          const endY = (window.innerHeight * top) / 100
          const topPosition = startY - (startY - endY) * verticalProgress

          // Calculate horizontal position (starts when vertical is halfway done)
          let horizontalProgress = 0
          if (cardProgress > 0.5) {
            // Map 0.5-1 to 0-1 for horizontal animation
            horizontalProgress = (cardProgress - 0.5) * 2

            // Use eased progress based on overall scroll progress to ensure all cards finish together
            // When overall progress reaches 1, all cards should be at their final position
            const masterProgress = Math.min(1, progress / 1)
            horizontalProgress = Math.min(horizontalProgress, masterProgress)
          }

          // Calculate final left position
          const leftPos = 50 - (50 - (left + i * unitLeftDis)) * horizontalProgress

          // Apply transforms directly
          gsap.set(card, {
            top: topPosition,
            left: `${leftPos}%`,
            opacity: cardProgress > 0 ? 1 : 0, // Fade in when animation starts
          })
        })
      },
    })

    return () => {
      st.kill()
    }
  }, [cards, cardWidth, top, left])

  return (
    <div
      ref={sectionRef}
      className="h-screen relative flex items-center justify-center overflow-hidden w-full"
    >
      {cards.map((item, index) => (
        <div
          key={index}
          ref={(el) => {
            if (el) cardsRef.current[index] = el
          }}
          style={{
            rotate: `${item.rotate}deg`,
            transformOrigin: item.transformOrigin || (index % 2 === 0 ? "left" : "right"),
            width: `100%`,
            maxWidth: `${cardWidth}px`,
            position: "absolute",
          }}
          className="transition-all -translate-x-1/2 -translate-y-1/2"
        >
          {item.card}
        </div>
      ))}
    </div>
  )
}

export { ScrollingCards, SnappingScrollingCards }
