import React, { useState, useEffect } from 'react'
import { quantum } from 'ldrs'
import './App.scss'
import Navbar from './components/Navbar/Navbar'
import Banner from './components/Banner/Banner'
import About from './components/About/About'
import Projects from './components/Projects/Projects'
import Education from './components/Education/Education'
import Experience from './components/Experience/Experience'
import Footer from './components/Footer/Footer'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Medusae from './components/ui/medusae/Medusae'

gsap.registerPlugin(ScrollTrigger)

quantum.register()
const App = () => {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (loading) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
    
    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(lenis.raf)
    }
  }, [loading])

  return (
    <div>
      {loading ? (
        <div className="loader w-[100vw] h-[100vh] flex justify-center">
          <l-quantum size="55" speed="1.8" color="#9200fa"></l-quantum>
        </div>
      ) : (
    <>
      <Navbar />
      <Banner />
      <About />
      <Projects />
      
      <div className="relative">
        <div className="absolute inset-0 z-0">
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            <Medusae />
          </div>
        </div>
        <div className="relative z-10">
          <Experience />
          <Education />
          <Footer />
        </div>
      </div>
    </>
      )}
    </div>
  )
}



export default App
