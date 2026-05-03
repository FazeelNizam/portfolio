import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BiHomeAlt2 } from 'react-icons/bi'
import { GiSkills } from 'react-icons/gi'
import { AiOutlineProject } from 'react-icons/ai'
import { FaUserTie } from 'react-icons/fa'
import { FaGraduationCap } from "react-icons/fa";
import './Navbar.scss'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const NavBar = () => {
  const [activeLink, setActiveLink] = useState('home')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sectionIds = ['home', 'about', 'projects', 'experience', 'education']
    
    // Create triggers for each section
    const triggers = sectionIds.map((id) => {
      return ScrollTrigger.create({
        trigger: `#${id}`,
        start: "top 40%",
        end: "bottom 40%",
        onToggle: (self) => {
          if (self.isActive) {
            setActiveLink(id)
          }
        },
      })
    })

    const handleBaseScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleBaseScroll)

    // Initial check for 'home' if at the top
    if (window.scrollY < 100) setActiveLink('home')

    return () => {
      window.removeEventListener('scroll', handleBaseScroll)
      triggers.forEach(t => t.kill())
    }
  }, [])

  const onUpdateActiveLink = (value) => {
    setActiveLink(value)
  }
  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -80 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ y: -80 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        <div class="navbar" className={scrolled ? 'navbar scrolled' : 'navbar'}>
          <ul className="menu">
            <li className="li">
              <a
                href="#home"
                className={
                  activeLink === 'home' ? 'active navbar-link' : 'navbar-link'
                }
                onClick={() => onUpdateActiveLink('home')}
              >
                <div className="icon">
                  <BiHomeAlt2 size={25} />
                </div>
                <div className="link-container">
                  <span className="label">Home</span>
                </div>
              </a>
            </li>
            <li className="li">
              <a
                href="#about"
                className={
                  activeLink === 'about' ? 'active navbar-link' : 'navbar-link'
                }
                onClick={() => onUpdateActiveLink('about')}
              >
                <div className="icon">
                  <GiSkills size={25} />
                </div>
                <div className="link-container">
                  <span className="label">About</span>
                </div>
              </a>
            </li>
            <li className="li">
              <a
                href="#projects"
                className={
                  activeLink === 'projects'
                    ? 'active navbar-link'
                    : 'navbar-link'
                }
                onClick={() => onUpdateActiveLink('projects')}
              >
                <div className="icon">
                  <AiOutlineProject size={24} />
                </div>
                <div className="link-container">
                  <span className="label">Projects</span>
                </div>
              </a>
            </li>
            <li className="li">
              <a
                href="#experience"
                className={
                  activeLink === 'experience'
                    ? 'active navbar-link'
                    : 'navbar-link'
                }
                onClick={() => onUpdateActiveLink('experience')}
              >
                <div className="icon">
                  <FaUserTie size={24} />
                </div>
                <div className="link-container">
                  <span className="label">Work</span>
                </div>
              </a>
            </li>
            <li className="li">
              <a
                href="#education"
                className={
                  activeLink === 'education'
                    ? 'active navbar-link'
                    : 'navbar-link'
                }
                onClick={() => onUpdateActiveLink('education')}
              >
                <div className="icon">
                  <FaGraduationCap size={24} />
                </div>
                <div className="link-container">
                  <span className="label edu">Education</span>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </motion.nav>
    </>
  )
}

export default NavBar
