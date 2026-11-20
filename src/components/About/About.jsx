import React, { Component, Suspense, lazy, useRef } from 'react'
import './About.scss'
import BentoCard from './BentoCard'
import NumberTicker from '../ui/NumberTicker'
import Marquee from '../ui/Marquee'
import { FlipWords } from '../ui/flip-words'
import useReveal from '../../hooks/useReveal'
import { useInView } from '../../hooks/useMedia'
import CV from '../../cv/Fazeel Nizam - CV.pdf'

import { HiSquare3Stack3D } from 'react-icons/hi2'
import { PiCrownSimpleFill } from 'react-icons/pi'
import { IoRocket } from 'react-icons/io5'
import { FaDownload, FaGraduationCap } from 'react-icons/fa'
import { BiLogoGmail } from 'react-icons/bi'

import { languages, softwares, aboutWords, counterCards, aboutCardTabData, aboutCardContactData, contactCard } from '../../data/data'

// The icon cloud fetches icon data from a CDN and runs its own canvas loop: load it
// only when its card is near the viewport, and unmount it when far away.
const IconCloud = lazy(() => import(/* webpackChunkName: "icon-cloud" */ '../ui/IconCloud'))

class SilentBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? null : this.props.children
  }
}

const cloudIcons = [...languages, ...softwares]
const PUBLIC = process.env.PUBLIC_URL
const EMAIL = 'mailto:nizamfazeel@gmail.com?subject=Hello%20from%20your%20portfolio'

const About = () => {
  const sectionRef = useRef(null)
  useReveal(sectionRef)
  const [cloudRef, cloudVisible] = useInView({ rootMargin: '200px' })
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <section className="about section" id="about" ref={sectionRef} aria-labelledby="about-title">
      <div className="container">
        <header className="section-head reveal">
          <span className="section-head__eyebrow">About</span>
          <h2 id="about-title">
            Engineer by trade, <span className="highlight-text">maker by heart</span>
          </h2>
          <p>From custom PCBs and firmware to edge AI and the dashboards that tie it all together.</p>
        </header>

        <div className="bento">
          {/* 1 — profile (focal point) */}
          <BentoCard className="bento__profile" style={{ '--i': 0 }}>
            <div className="profile__top">
              <picture className="profile__avatar">
                <source type="image/avif" srcSet={`${PUBLIC}/media/hero/dp-256.avif 1x, ${PUBLIC}/media/hero/dp-512.avif 2x`} />
                <img src={`${PUBLIC}/media/hero/dp-256.webp`} srcSet={`${PUBLIC}/media/hero/dp-512.webp 2x`} alt="Fazeel Nizam" width="112" height="112" loading="lazy" decoding="async" />
              </picture>
              <div className="profile__id">
                <span className="profile__status">
                  <span className="profile__dot" aria-hidden="true" /> Available to work
                </span>
                <h3 className="profile__name">Fazeel Nizam</h3>
                <p className="profile__role">
                  <span className="sr-only">Computer, embedded systems and software engineer</span>
                  <span aria-hidden="true">
                    I'm a{reduced ? <strong> {aboutWords[0]}</strong> : <FlipWords color="#c385f0" words={aboutWords} className="profile__flip" />}
                  </span>
                </p>
              </div>
            </div>
            <p className="profile__bio">
              Computer Engineering undergraduate at The Open University of Sri Lanka and Trainee IoT Engineer at SLTMobitel. I design hardware, write firmware, train vision
              models and build the web apps around them.
            </p>
            <ul className="profile__chips" aria-label="Quick facts">
              {aboutCardTabData.map((tab) => (
                <li key={tab.text} className="pill">
                  <span aria-hidden="true">{tab.svg}</span>
                  {tab.text === 'IST' ? 'Sri Lanka (IST)' : tab.text}
                </li>
              ))}
            </ul>
            <div className="profile__actions">
              <a className="btn btn--primary" href={CV} download>
                <FaDownload aria-hidden="true" /> Download résumé
              </a>
              {aboutCardContactData.map((c) => (
                <a key={c.text} className="btn btn--ghost" href={c.link} target="_blank" rel="noopener noreferrer">
                  <span aria-hidden="true">{c.svg}</span> {c.text.replace(' (Facebook)', '')}
                </a>
              ))}
            </div>
          </BentoCard>

          {/* 2 — tech stack */}
          <BentoCard className="bento__stack" style={{ '--i': 1 }} tilt={false}>
            <h3 className="bento__title">
              <HiSquare3Stack3D aria-hidden="true" /> My tech stack
            </h3>
            <div className="stack" ref={cloudRef}>
              <div className="stack__cloud" aria-hidden="true">
                {cloudVisible && !reduced && (
                  <SilentBoundary>
                    <Suspense fallback={null}>
                      <IconCloud icons={cloudIcons} />
                    </Suspense>
                  </SilentBoundary>
                )}
              </div>
              <div className="stack__lanes">
                <Marquee pauseOnHover vertical className="stack__lane [--duration:28s]" repeat={2}>
                  {softwares.map((s) => (
                    <div className="stack__item" key={s.text}>
                      <img src={s.svg} alt="" width="28" height="28" loading="lazy" decoding="async" />
                      <span>{s.text}</span>
                    </div>
                  ))}
                </Marquee>
                <Marquee reverse pauseOnHover vertical className="stack__lane [--duration:28s]" repeat={2}>
                  {languages.map((s) => (
                    <div className="stack__item" key={s.text}>
                      <img src={s.svg} alt="" width="28" height="28" loading="lazy" decoding="async" />
                      <span>{s.text}</span>
                    </div>
                  ))}
                </Marquee>
              </div>
              <p className="sr-only">Tools and languages: {[...languages, ...softwares].map((s) => s.text).join(', ')}.</p>
            </div>
          </BentoCard>

          {/* 3 — numbers */}
          <BentoCard className="bento__stats" style={{ '--i': 2 }} tilt={false}>
            <ul className="stats">
              {counterCards.map((c) => (
                <li key={c.text} className="stats__item">
                  <span className="stats__value">
                    <NumberTicker value={c.value} delay={0.2} />
                    <span aria-hidden="true">+</span>
                  </span>
                  <span className="stats__label">
                    <span aria-hidden="true">{c.svg}</span>
                    {c.text}
                  </span>
                </li>
              ))}
            </ul>
          </BentoCard>

          {/* 4 — education */}
          <BentoCard className="bento__edu" style={{ '--i': 3 }}>
            <span className="bento__icon" aria-hidden="true">
              <FaGraduationCap />
            </span>
            <h3 className="bento__heading">Computer Engineering</h3>
            <p className="bento__text">BSc (Hons) undergraduate · GPA 3.58</p>
          </BentoCard>

          {/* 5 — passion */}
          <BentoCard className="bento__passion" style={{ '--i': 4 }}>
            <img className="bento__art" src={`${PUBLIC}/media/decor/b5.webp`} alt="" width="700" height="536" loading="lazy" decoding="async" />
            <h3 className="bento__heading">Tech enthusiast</h3>
            <p className="bento__text">with a passion for building things end to end.</p>
          </BentoCard>

          {/* 6 — connect */}
          <BentoCard className="bento__connect" style={{ '--i': 5 }}>
            <h3 className="bento__title">
              <IoRocket aria-hidden="true" /> Follow me
            </h3>
            <ul className="socials">
              {contactCard.map((c) => (
                <li key={c.text}>
                  <a href={c.link} target="_blank" rel="noopener noreferrer">
                    <span aria-hidden="true">{c.svg}</span>
                    {c.text}
                  </a>
                </li>
              ))}
            </ul>
          </BentoCard>

          {/* 7 — call to action */}
          <BentoCard className="bento__cta" style={{ '--i': 6 }}>
            <span className="bento__icon bento__icon--glow" aria-hidden="true">
              <PiCrownSimpleFill />
            </span>
            <h3 className="bento__heading">Let's work together</h3>
            <p className="bento__text">Got an idea, a role or a board that needs bringing up? Let's make it happen.</p>
            <a className="btn btn--primary" href={EMAIL}>
              <BiLogoGmail aria-hidden="true" /> Email me
            </a>
          </BentoCard>
        </div>
      </div>
    </section>
  )
}

export default About
