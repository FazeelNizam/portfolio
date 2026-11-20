import React, { useRef } from 'react'
import './Experience.scss'
import TimelineCarousel from '../Timeline/TimelineCarousel'
import useReveal from '../../hooks/useReveal'

const experiences = [
  {
    id: 1,
    year: 'Aug 2022 - Dec 2022',
    role: 'Banking Trainee',
    company: 'Commercial Bank of Ceylon',
    location: 'Wellawatta, Sri Lanka',
    description: 'Handled lower-counter operations, including account opening, debit card issuance, and E-Remittances, ensuring compliance and customer satisfaction.',
    skills: ['Banking Operations', 'Customer Service']
  },
  {
    id: 2,
    year: 'Sep 2023 - Dec 2023',
    role: 'Technical Assistant',
    company: 'Neo Space Lab, OUSL',
    location: 'Nawala, Sri Lanka',
    description: 'Designed UI/UX for a Research Publication Web App and IoT dashboards using NextJS and MUI. Managed GitHub Repositories for IoT Weight Measurement System and LKO Web Dashboard.',
    skills: ['NextJS', 'ReactJS', 'MUI', 'Figma']
  },
  {
    id: 3,
    year: 'Jul 2024 - Dec 2024',
    role: 'Trainee Electronic Engineer',
    company: 'Arthur C Clarke Institute for Modern Technologies',
    location: 'Katubedda, Sri Lanka',
    description: 'Designed an ESP32-based Nano-Sterlite Orbital Magnetic Field Simulation Device (Helmholtz Cage), utilizing a PID algorithm to stabilize a frictionless air-bearing platform.',
    skills: ['ESP32', 'Embedded C', 'FreeRTOS', 'PID Control']
  },
  {
    id: 4,
    year: 'Mar 2025 - Sep 2025',
    role: 'Technical Assistant',
    company: 'Career Guidance Unit, OUSL',
    location: 'Nawala, Sri Lanka',
    description: 'Engineered a multi-node environmental monitoring system and a portable Greenhouse Gas (GHG) Analyzer for agricultural research. Provided technical support for university-wide hybrid career events.',
    skills: ['ESP32', 'Pi Zero', 'Embedded C', 'Python']
  },
  {
    id: 5,
    year: 'Oct 2025 - Present',
    role: 'Trainee IoT Engineer',
    company: 'SLTMobitel Digital Projects',
    location: 'Colombo, Sri Lanka',
    description: 'Developing an AI-powered parking management system with low-latency RTSP video pipelines using GStreamer. Benchmarking YOLOv11n and OCR inference on Raspberry Pi 5 and NVIDIA Jetson Orin Nano. Designing a scalable IoT ecosystem featuring smart access control, power monitoring, and automated HVAC control.',
    skills: ['NVIDIA Jetson', 'Raspberry Pi 5', 'YOLOv11n', 'GStreamer', 'IoT']
  }
]

const items = experiences.map((e) => ({ ...e, title: e.role, railLabel: e.year.split(' ')[1] || e.year }))

const Experience = () => {
  const ref = useRef(null)
  useReveal(ref)
  return (
    <section className="experience section" id="experience" ref={ref} aria-labelledby="experience-title">
      <div className="container">
        <header className="section-head reveal">
          <span className="section-head__eyebrow">Career</span>
          <h2 id="experience-title">
            My <span className="highlight-text">Experience</span>
          </h2>
          <p>Professional journey and responsibilities.</p>
        </header>
        <div className="reveal" style={{ '--i': 1 }}>
          <TimelineCarousel
            label="Work experience"
            items={items}
            renderCard={(exp, i) => (
              <>
                <div className="tl-card__top">
                  <span className="tl-card__period">{exp.year}</span>
                  <span className="tl-card__num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="tl-card__title">{exp.role}</h3>
                <p className="tl-card__org">{exp.company}</p>
                <p className="tl-card__place">{exp.location}</p>
                <p className="tl-card__desc">{exp.description}</p>
                <ul className="pj-pills" aria-label="Key skills">
                  {exp.skills.map((s) => (
                    <li key={s} className="pill">
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
          />
        </div>
      </div>
    </section>
  )
}

export default Experience
