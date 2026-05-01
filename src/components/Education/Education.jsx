import React from 'react'
import { motion } from 'framer-motion'
import './Education.scss'
import AnimatedGridPattern from '../../ui/AnimatedGridPattern'
import AnimatedGradientText from '../ui/AnimatedGradientText'
import { LightRays } from '../ui/LightRays'

const Education = () => {
  const educationData = [
    {
      id: 1,
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
      year: '2015 - 2016',
      degree: 'Ordinary Level',
      field: 'General Education',
      institution: 'Prince of Wales College Moratuwa',
      location: 'Sri Lanka',
      description: 'Completed Ordinary Level education with excellent results across all subjects.',
      achievements: '',
      skills: ['Mathematics', 'English', 'Science']
    }
  ]



  return (
    <section className="educationWrapper" id="education">
      <div className="gridBackground">
        <LightRays />
        <AnimatedGridPattern
          numSquares={120}
          maxOpacity={0.12}
          duration={3}
          repeatDelay={1}
          className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] inset-0"
        />
      </div>
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

        <div className="timelineContainer">
          <div className="timeline">
            {educationData.map((education, index) => (
              <motion.div
                key={education.id}
                className={`timelineItem ${index % 2 === 0 ? 'left' : 'right'}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="timelineContent">
                  <div className="timelineYear">
                    <span>{education.year}</span>
                  </div>
                  
                  <div className="timelineCard">
                    <div className="cardHeader">
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
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Education
