import React, { Suspense, lazy, useEffect } from 'react'
import './App.scss'
import Navbar from './components/Navbar/Navbar'
import Banner from './components/Banner/Banner'
import SpaceCanvas from './components/Space/SpaceCanvas'
import { initSmoothScroll, destroySmoothScroll } from './lib/smoothScroll'

// Below-the-fold sections are code-split so the hero paints first.
const About = lazy(() => import(/* webpackChunkName: "about" */ './components/About/About'))
const Projects = lazy(() => import(/* webpackChunkName: "projects" */ './components/Projects/Projects'))
const Experience = lazy(() => import(/* webpackChunkName: "experience" */ './components/Experience/Experience'))
const Education = lazy(() => import(/* webpackChunkName: "education" */ './components/Education/Education'))
const Footer = lazy(() => import(/* webpackChunkName: "footer" */ './components/Footer/Footer'))

/** Reserves space while a section chunk loads (keeps anchors valid, avoids layout shift). */
const Placeholder = ({ id }) => <section id={id} className="section" style={{ minHeight: '100svh' }} aria-busy="true" />

const App = () => {
  useEffect(() => {
    initSmoothScroll()
    return destroySmoothScroll
  }, [])

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SpaceCanvas />
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Banner />
        <Suspense fallback={<Placeholder id="about" />}>
          <About />
        </Suspense>
        <Suspense fallback={<Placeholder id="projects" />}>
          <Projects />
        </Suspense>
        <Suspense fallback={<Placeholder id="experience" />}>
          <Experience />
        </Suspense>
        <Suspense fallback={<Placeholder id="education" />}>
          <Education />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  )
}

export default App
