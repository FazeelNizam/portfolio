import React, { useRef } from 'react'
import './Education.scss'
import TimelineCarousel from '../Timeline/TimelineCarousel'
import useReveal from '../../hooks/useReveal'

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

const items = educationData.map((e) => ({ ...e, title: e.degree, railLabel: e.year.split(' ')[0] }))

const Education = () => {
  const ref = useRef(null)
  useReveal(ref)
  return (
    <section className="education section" id="education" ref={ref} aria-labelledby="education-title">
      <div className="container">
        <header className="section-head reveal">
          <span className="section-head__eyebrow">Learning</span>
          <h2 id="education-title">
            My <span className="highlight-text">Education</span>
          </h2>
          <p>My academic journey.</p>
        </header>
        <div className="reveal" style={{ '--i': 1 }}>
          <TimelineCarousel
            label="Education"
            items={items}
            renderCard={(edu, i) => (
              <>
                <div className="tl-card__top">
                  <span className="tl-card__period">{edu.year}</span>
                  <span className="tl-card__num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="tl-card__title">{edu.degree}</h3>
                <p className="tl-card__org">{edu.field}</p>
                <p className="tl-card__place">
                  {edu.institution} · {edu.location}
                </p>
                <p className="tl-card__desc">{edu.description}</p>
                {Array.isArray(edu.achievements) && edu.achievements.length > 0 && (
                  <ul className="tl-card__list" aria-label="Achievements">
                    {edu.achievements.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                )}
                <ul className="pj-pills" aria-label="Key skills">
                  {edu.skills.map((s) => (
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

export default Education
