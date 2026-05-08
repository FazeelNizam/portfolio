import React, { useRef } from 'react'
import './Banner.scss'
import { motion } from 'framer-motion'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FlipWords } from '../ui/flip-words'

import Hero1 from '../../img/Hero/hero_f.png'
import Hero3 from '../../img/Hero/l.png'
import Hero4 from '../../img/Hero/r.png'

gsap.registerPlugin(ScrollTrigger)

const Banner = () => {
  const containerRef = useRef()
  const skyRef = useRef()
  const backRef = useRef()
  const mid1Ref = useRef()
  const mid2Ref = useRef()
  const textRef = useRef()
  const text2Ref = useRef()

  const words = [
    'Computer Engineer',
    'Embedded System Engineer',
    'Software Engineer',
    'Fullstack Developer',
    'AI Engineer',
    'Graphic Designer',
  ]

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1, // Add a tiny bit of smoothing to the parallax itself
      }
    })

    tl.to(skyRef.current, { xPercent: 15, ease: 'none', force3D: true }, 0)
    tl.to(backRef.current, { yPercent: 90, ease: 'none', force3D: true }, 0)
    tl.to(mid1Ref.current, { yPercent: 70, ease: 'none', force3D: true }, 0)
    tl.to(mid2Ref.current, { yPercent: 80, ease: 'none', force3D: true }, 0)
    tl.to(textRef.current, { yPercent: 500, ease: 'none', force3D: true }, 0)
    tl.to(text2Ref.current, { yPercent: 1900, ease: 'none', force3D: true }, 0)
  }, { scope: containerRef })

  const floatingAnimationRight = {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  }

  const floatingAnimationLeft = {
    y: [0, -15, 0],
    transition: {
      duration: 3,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  }

  return (
    <section id="home" ref={containerRef} className="wrapper">
      <div ref={skyRef} className="sky-container">
        <div className="star1"></div>
        <div className="star2"></div>
        <div className="star3"></div>
      </div>
      <div className="content">
        <motion.div
          ref={backRef}
          className="bg backLayer"
          initial={{ opacity: 0, y: 180 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        ></motion.div>
        <motion.div
          ref={mid2Ref}
          className="bg midLayer2"
          initial={{ opacity: 0, y: 140 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        ></motion.div>
        <motion.div
          ref={mid1Ref}
          className="bg midLayer1"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        ></motion.div>
        <div className="imageContainer">
          <div ref={textRef} className="heroHeading">
            <motion.span
              initial={{ opacity: 0, y: 90 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Hey, I'm
            </motion.span> 
            <motion.span
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="name-text"
            >
              Fazeel Nizam
            </motion.span>
          </div>
          <motion.div
            ref={text2Ref}
            className="bannerFlipText"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <FlipWords color="white" words={words} />
          </motion.div>
          <motion.div
            className="frontLayer"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="frontImgContainer">
              <img src={Hero1} alt="Front Layer" className="front" />
            </div>
            <motion.img
              alt="Floating Right"
              className="floating-right"
              src={Hero4}
              animate={floatingAnimationRight}
            />
            <motion.img
              src={Hero3}
              alt="Floating left"
              className="floating-left"
              animate={floatingAnimationLeft}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Banner
