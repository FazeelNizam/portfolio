import React from 'react'
import { motion } from 'framer-motion'
import './Education.scss'
import AnimatedGridPattern from '../../ui/AnimatedGridPattern'

const Education = () => {
  const educationData = [
    {
      id: 1,
      year: '2021 - Present',
      degree: 'Bachelor of Technology (Hons)',
      field: 'Computer Engineering',
      institution: 'The Open University of Sri Lanka',
      location: '',
      description: 'Specialized in Computer Architecture, Software engineering, Embedded Systems, and Procesor Designing.',
      achievements: [
        'GPA - 3.58',
        'Student Organizing committee President of ENOSPIRE OUSL 2024',
        'Technical Team Lead of TalentLyft 23 Career Fair 2023'
      ],
      skills: ['Python', 'VHDL','C', 'C++', 'Java',  'Embedded Systems', 'Nural Networks', 'Machine Learning']
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: -100,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  }

  return (
    <section className="educationWrapper" id="education">
      <div className="gridBackground">
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
                        <div className="skillTags">
                          {education.skills.map((skill, idx) => (
                            <span key={idx} className="skillTag">{skill}</span>
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
