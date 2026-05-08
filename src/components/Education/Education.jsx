import React from 'react'
import { motion } from 'framer-motion'
import './Education.scss'
import AnimatedGradientText from '../ui/AnimatedGradientText'
import { ScrollingCards } from '../ui/scrolling-cards'
import { ShineBorder } from '../ui/shine-border'

const Education = () => {
  const educationData = [
    {
      id: 1,
      year: '2015 - 2016',
      degree: 'Ordinary Level',
      field: 'General Education',
      institution: 'Prince of Wales College Moratuwa',
      location: 'Sri Lanka',
      description: 'Completed Ordinary Level education with excellent results across all subjects.',
      achievements: '',
      skills: ['Mathematics', 'English', 'Science']
    },
    {
      id: 2,
      year: '2017 - 2019',
      degree: 'Advanced Level',
      field: 'Physical Science Stream',
      institution: 'Prince of Wales College Moratuwa',
      location: 'Sri Lanka',
      description: 'Completed Advanced Level in Physical Science stream with focus on Mathematics, Physics, and Chemistry.',
      achievements: '',
      skills: ['Mathematics', 'Physics', 'Chemistry', 'Chess', 'Badminton', 'Leadership', 'Teamwork']
    },
    {
      id: 3,
      year: '2021 - 2026',
      degree: 'BSc (Hons) in Computer Engineering',
      field: 'Computer Engineering',
      institution: 'The Open University of Sri Lanka',
      location: 'Sri Lanka',
      description: 'Focus: Embedded Systems, AI/ML, IoT, Digital System Design, Computer Vision, Processor Design.',
      achievements: [
        'Current GPA - 3.58',
        'Student Organizing committee President of ENOSPIRE OUSL 2024',
        'Technical Team Lead of TalentLyft 23 Career Fair 2023'
      ],
      skills: ['Embedded Systems', 'AI/ML', 'IoT', 'Digital System Design', 'Computer Vision', 'Processor Design']
    }
  ]

  const cards = educationData.map((education, index) => ({
    card: (
      <div className="timelineCard" style={{ width: '100%', margin: 0, overflow: 'hidden' }}>
        <ShineBorder shineColor={["#9200fa", "#c385f0", "#6d00b8"]} duration={10} />
        <div className="cardHeader">
          <div className="timelineYear" style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <span style={{ color: '#9200fa', fontWeight: 'bold', background: 'rgba(146, 0, 250, 0.1)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.9rem' }}>{education.year}</span>
          </div>
          <h3 className="degree">{education.degree}</h3>
          <h4 className="field">{education.field}</h4>
          <div className="institution">
            <span className="institutionName">{education.institution}</span>
            <span className="location">{education.location}</span>
          </div>
        </div>
        
        <div className="cardBody">
          <p className="description">{education.description}</p>
          <div className="skills">
            <h5>Key Skills:</h5>
            <div className="skillTags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {education.skills.map((skill, idx) => (
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
    <section className="educationWrapper" id="education">
      <div className="educationContainer">
        <motion.div 
          className="educationHeader"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>
            My <span className="highlight-text">Education</span>
          </h2>
          <p>My academic journey</p>
        </motion.div>

        <ScrollingCards cards={cards} cardWidth={450} top={50} left={25} animationLength={300} />
      </div>
    </section>
  )
}

export default Education
