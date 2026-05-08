import React from 'react'
import { motion } from 'framer-motion'
import './Experience.scss'
import AnimatedGradientText from '../ui/AnimatedGradientText'
import { ScrollingCards } from '../ui/scrolling-cards'
import { ShineBorder } from '../ui/shine-border'

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

const Experience = () => {
  const cards = experiences.map((exp, index) => ({
    card: (
      <div className="timelineCard" style={{ width: '100%', margin: 0, overflow: 'hidden' }}>
        <ShineBorder shineColor={["#9200fa", "#c385f0", "#6d00b8"]} duration={10} />
        <div className="cardHeader">
          <div className="timelineYear" style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <span style={{ color: '#9200fa', fontWeight: 'bold', background: 'rgba(146, 0, 250, 0.1)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.9rem' }}>{exp.year}</span>
          </div>
          <h3 className="degree">{exp.role}</h3>
          <h4 className="field">{exp.company}</h4>
          <div className="institution">
            <span className="institutionName">{exp.location}</span>
          </div>
        </div>
        <div className="cardBody">
          <p className="description">{exp.description}</p>
          <div className="skills">
            <h5>Key Skills:</h5>
            <div className="skillTags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {exp.skills.map((skill, idx) => (
                <AnimatedGradientText key={idx} className="!px-3 !py-1 !rounded-full !m-0 !bg-[#9200fa]/10" speed={3}>
                  <span className="text-xs font-medium text-white/80">{skill}</span>
                </AnimatedGradientText>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    rotate: (index % 2 === 0 ? 1 : -1) * (index % 3 + 1) * 2,
  }))

  return (
    <section className="experienceWrapper" id="experience">
      <div className="experienceContainer">
        <motion.div 
          className="experienceHeader"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>
            My <span className="highlight-text">Experience</span>
          </h2>
          <p>Professional journey and responsibilities</p>
        </motion.div>

        <ScrollingCards cards={cards} cardWidth={450} top={50} left={25} animationLength={300} />
      </div>
    </section>
  )
}

export default Experience
