import React, { Suspense, lazy, useLayoutEffect, useRef, useState } from 'react'
import './Projects.scss'
import ProjectShowcase from './ProjectShowcase'
import ProjectModal from './ProjectModal'
import useReveal from '../../hooks/useReveal'
import { embeddedProjects } from '../../data/embeddedProjects'
import { webProjects } from '../../data/webProjects'
import { designProjects } from '../../data/designProjects'
import { FaCode, FaPalette, FaMicrochip } from 'react-icons/fa'

const DesignGallery = lazy(() => import(/* webpackChunkName: "gallery" */ './DesignGallery'))

const TABS = [
  { id: 'embedded', label: 'Embedded Systems', short: 'Embedded', icon: FaMicrochip, data: embeddedProjects },
  { id: 'web', label: 'Web & Software', short: 'Web', icon: FaCode, data: webProjects },
  { id: 'design', label: 'Design Works', short: 'Design', icon: FaPalette, data: designProjects },
]

const Projects = () => {
  const [tab, setTab] = useState('embedded')
  const [selected, setSelected] = useState(null)
  const sectionRef = useRef(null)
  const listRef = useRef(null)
  const indRef = useRef(null)
  useReveal(sectionRef)

  // sliding tab indicator
  useLayoutEffect(() => {
    const move = () => {
      const el = listRef.current && listRef.current.querySelector(`[data-tab="${tab}"]`)
      if (!el || !indRef.current) return
      indRef.current.style.setProperty('--x', `${el.offsetLeft}px`)
      indRef.current.style.setProperty('--w', `${el.offsetWidth}px`)
    }
    move()
    window.addEventListener('resize', move)
    document.fonts && document.fonts.ready.then(move)
    return () => window.removeEventListener('resize', move)
  }, [tab])

  const onTabKey = (e) => {
    const i = TABS.findIndex((t) => t.id === tab)
    let next = null
    if (e.key === 'ArrowRight') next = TABS[(i + 1) % TABS.length]
    if (e.key === 'ArrowLeft') next = TABS[(i - 1 + TABS.length) % TABS.length]
    if (e.key === 'Home') next = TABS[0]
    if (e.key === 'End') next = TABS[TABS.length - 1]
    if (!next) return
    e.preventDefault()
    setTab(next.id)
    listRef.current.querySelector(`[data-tab="${next.id}"]`).focus()
  }

  const current = TABS.find((t) => t.id === tab)

  return (
    <section className="projects section" id="projects" ref={sectionRef} aria-labelledby="projects-title">
      <div className="container">
        <header className="section-head reveal">
          <span className="section-head__eyebrow">Selected work</span>
          <h2 id="projects-title">
            My <span className="highlight-text">Projects</span>
          </h2>
          <p>Hardware, software and visual design — explore each domain.</p>
        </header>

        <div className="projects__tabs reveal" style={{ '--i': 1 }}>
          <div className="seg" role="tablist" aria-label="Project categories" ref={listRef} onKeyDown={onTabKey}>
            <span className="seg__ind" ref={indRef} aria-hidden="true" />
            {TABS.map(({ id, label, short, icon: Icon, data }) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                data-tab={id}
                aria-selected={tab === id}
                aria-controls={`panel-${id}`}
                tabIndex={tab === id ? 0 : -1}
                className={`seg__btn${tab === id ? ' is-active' : ''}`}
                onClick={() => setTab(id)}
              >
                <Icon aria-hidden="true" />
                <span className="seg__long">{label}</span>
                <span className="seg__short" aria-hidden="true">
                  {short}
                </span>
                <span className="seg__count">{data.length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="projects__panel" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} key={tab}>
          {tab === 'design' ? (
            <Suspense fallback={<div className="projects__loading" aria-busy="true" />}>
              <DesignGallery designs={designProjects} />
            </Suspense>
          ) : (
            <ProjectShowcase projects={current.data} onOpen={setSelected} />
          )}
        </div>
      </div>

      <ProjectModal project={selected} isOpen={!!selected} onClose={() => setSelected(null)} />
    </section>
  )
}

export default Projects
