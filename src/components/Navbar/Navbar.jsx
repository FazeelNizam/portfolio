import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BiHomeAlt2 } from 'react-icons/bi'
import { GiSkills } from 'react-icons/gi'
import { AiOutlineProject } from 'react-icons/ai'
import { FaUserTie, FaGraduationCap, FaDownload } from 'react-icons/fa'
import { onFrame } from '../../lib/ticker'
import { scrollToTarget, lockScroll } from '../../lib/smoothScroll'
import { contactCard } from '../../data/data'
import Logo from '../../img/logo.png'
import CV from '../../cv/Fazeel Nizam - CV.pdf'
import './Navbar.scss'

export const SECTIONS = [
  { id: 'home', label: 'Home', icon: BiHomeAlt2 },
  { id: 'about', label: 'About', icon: GiSkills },
  { id: 'projects', label: 'Projects', icon: AiOutlineProject },
  { id: 'experience', label: 'Work', icon: FaUserTie },
  { id: 'education', label: 'Education', icon: FaGraduationCap },
]

const NavBar = () => {
  const [active, setActive] = useState('home')
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const listRef = useRef(null)
  const indicatorRef = useRef(null)
  const sheetRef = useRef(null)
  const toggleRef = useRef(null)
  const offsets = useRef([])
  const navRef = useRef(null)

  // cache section offsets (no layout reads inside the frame loop)
  useEffect(() => {
    const measure = () => {
      offsets.current = SECTIONS.map(({ id }) => {
        const el = document.getElementById(id)
        return el ? el.getBoundingClientRect().top + window.scrollY : Infinity
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => ro.disconnect()
  }, [])

  // scroll spy + hide on scroll down / show on scroll up
  useEffect(() => {
    let lastY = window.scrollY
    let acc = 0
    let current = 'home'
    let isHidden = false
    let isScrolled = false
    return onFrame(() => {
      const y = window.scrollY
      const probe = y + window.innerHeight * 0.4
      let id = SECTIONS[0].id
      offsets.current.forEach((top, i) => {
        if (top <= probe) id = SECTIONS[i].id
      })
      // bottom of page: last section wins
      if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) id = SECTIONS[SECTIONS.length - 1].id
      if (id !== current) {
        current = id
        setActive(id)
      }
      const dy = y - lastY
      lastY = y
      acc = Math.sign(dy) === Math.sign(acc) ? acc + dy : dy
      const focusInside = navRef.current && navRef.current.contains(document.activeElement)
      const shouldHide = y > 160 && acc > 24 && !focusInside
      const shouldShow = acc < -12 || y <= 160 || focusInside
      if (shouldHide && !isHidden) {
        isHidden = true
        setHidden(true)
      } else if (shouldShow && isHidden) {
        isHidden = false
        setHidden(false)
      }
      const sc = y > 24
      if (sc !== isScrolled) {
        isScrolled = sc
        setScrolled(sc)
      }
    })
  }, [])

  // animated active indicator (transform + width on one absolutely positioned element)
  const moveIndicator = useCallback(() => {
    const list = listRef.current
    const ind = indicatorRef.current
    if (!list || !ind) return
    const link = list.querySelector(`[data-id="${active}"]`)
    if (!link) return
    const lr = list.getBoundingClientRect()
    const r = link.getBoundingClientRect()
    ind.style.setProperty('--x', `${r.left - lr.left}px`)
    ind.style.setProperty('--w', `${r.width}px`)
  }, [active])
  useLayoutEffect(() => {
    moveIndicator()
  }, [moveIndicator])
  useEffect(() => {
    window.addEventListener('resize', moveIndicator)
    document.fonts && document.fonts.ready.then(moveIndicator)
    return () => window.removeEventListener('resize', moveIndicator)
  }, [moveIndicator])

  const go = (e, id) => {
    e.preventDefault()
    const wasOpen = open
    setOpen(false)
    setActive(id)
    const run = () => {
      scrollToTarget(id === 'home' ? 0 : `#${id}`)
      // move focus to the section for keyboard / screen-reader users
      const el = document.getElementById(id)
      if (el) {
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
        el.focus({ preventScroll: true })
      }
    }
    // when closing the mobile sheet, wait until its scroll lock is released
    if (wasOpen) requestAnimationFrame(() => requestAnimationFrame(run))
    else run()
  }

  // mobile sheet: scroll lock, Esc, focus trap, focus return
  useEffect(() => {
    if (!open) return
    lockScroll(true)
    const sheet = sheetRef.current
    const focusables = () => sheet.querySelectorAll('a[href], button:not([disabled])')
    const first = focusables()[0]
    first && first.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      // DOM order: the toggle comes before the sheet
      const els = [toggleRef.current, ...focusables()]
      const i = els.indexOf(document.activeElement)
      if (e.shiftKey && i <= 0) {
        e.preventDefault()
        els[els.length - 1].focus()
      } else if (!e.shiftKey && i === els.length - 1) {
        e.preventDefault()
        els[0].focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const toggle = toggleRef.current
    return () => {
      document.removeEventListener('keydown', onKey)
      lockScroll(false)
      toggle && toggle.focus({ preventScroll: true })
    }
  }, [open])

  // closed sheet is inert (not focusable / not in the a11y tree) but can still animate out
  useEffect(() => {
    if (sheetRef.current) {
      sheetRef.current.inert = !open
      sheetRef.current.setAttribute('aria-hidden', String(!open))
    }
  }, [open])

  useEffect(() => {
    const close = () => window.innerWidth >= 900 && setOpen(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  return (
    <header
      ref={navRef}
      className={`nav${hidden && !open ? ' nav--hidden' : ''}${scrolled ? ' nav--scrolled' : ''}${open ? ' nav--open' : ''}`}
    >
      <a className="nav__brand" href="#home" onClick={(e) => go(e, 'home')} aria-label="Fazeel Nizam — back to top">
        <img src={Logo} alt="" width="39" height="27" />
      </a>

      <nav className="nav__pill" aria-label="Primary">
        <ul ref={listRef} className="nav__list">
          <li className="nav__indicator" ref={indicatorRef} aria-hidden="true" />
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                data-id={id}
                className={`nav__link${active === id ? ' is-active' : ''}`}
                aria-current={active === id ? 'location' : undefined}
                onClick={(e) => go(e, id)}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <a className="nav__cv btn btn--ghost" href={CV} download>
        <FaDownload aria-hidden="true" />
        <span>CV</span>
      </a>

      <button
        ref={toggleRef}
        className="nav__toggle"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="nav__burger" aria-hidden="true">
          <span />
          <span />
        </span>
      </button>

      <div
        id="mobile-menu"
        ref={sheetRef}
        className="nav__sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      >
        <ul className="nav__sheet-list">
          {SECTIONS.map(({ id, label }, i) => (
            <li key={id} style={{ '--i': i }}>
              <a href={`#${id}`} className={active === id ? 'is-active' : ''} aria-current={active === id ? 'location' : undefined} onClick={(e) => go(e, id)}>
                <span className="nav__sheet-num">{String(i + 1).padStart(2, '0')}</span>
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav__sheet-foot" style={{ '--i': SECTIONS.length }}>
          <a className="btn btn--primary" href={CV} download>
            <FaDownload aria-hidden="true" /> Download CV
          </a>
          <ul className="nav__socials">
            {contactCard.map((c) => (
              <li key={c.text}>
                <a href={c.link} target="_blank" rel="noopener noreferrer" aria-label={c.text}>
                  {c.svg}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  )
}

export default NavBar
