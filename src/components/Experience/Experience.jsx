import React from 'react'
import { motion } from 'framer-motion'
import './Experience.scss'
import AnimatedGridPattern from '../../ui/AnimatedGridPattern'

const experiences = [
  {
    id: 1,
    year: '2025/03 - 2025/09',
    role: 'Technical Assistant',
    company: 'Career Guidance Unit - OUSL',
    location: 'Nawala',
    description:'Developed a portable GHG Analyzer for agricultural field research, featuring an automated workflow with high data accuracy and engineered a distributed environmental monitoring system using three wirelessly coordinating ESP32 units, featuring multi-protocol data aggregation from industsy level soil and atmospheric sensors.',
    skills: ['Arduino', 'ESP32', 'C++', 'IoT']
  },
  {
    id: 2,
    year: '2024/07 - 2024/12',
    role: 'Trainee Electronics Engineer',
    company: 'Arthur C Clarke Institute for Modern Technologies',
    location: 'Katubedda',
    description:
      'Designing a Power Control Unit and Self-Balancing Nano Satellite Testing Platform for Helmholtz Cage.',
    skills: ['Arduino', 'ESP32', 'C++', 'IoT', 'Python', 'Power Electronics']
  },
]

const Experience = () => {
  return (
    <section className="experienceWrapper" id="experience">
      <div className="gridBackground">
        <AnimatedGridPattern
          numSquares={120}
          maxOpacity={0.12}
          duration={3}
          repeatDelay={1}
          className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] inset-0"
        />
      </div>
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

        <div className="timelineContainer">
          <div className="timeline">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                className={`timelineItem ${index % 2 === 0 ? 'left' : 'right'}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="timelineContent">
                  <div className="timelineYear">
                    <span>{exp.year}</span>
                  </div>
                  <div className="timelineCard">
                    <div className="cardHeader">
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
                        <div className="skillTags">
                          {exp.skills.map((skill, idx) => (
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

export default Experience


