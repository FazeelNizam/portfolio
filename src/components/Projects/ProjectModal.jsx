import React from 'react'
import './ProjectModal.scss'
import Dialog from '../ui/Dialog'
import { ResponsivePicture } from '../../lib/media'
import { FaTimes, FaGithub, FaExternalLinkAlt, FaCode, FaMicrochip, FaPalette } from 'react-icons/fa'
import { BiLogoBehance } from 'react-icons/bi'

const icons = { web: FaCode, design: FaPalette, embedded: FaMicrochip }
const statusTone = (s = '') => (/progress|ongoing/i.test(s) ? 'live' : /planned/i.test(s) ? 'planned' : 'done')

const ProjectModal = ({ project, isOpen, onClose }) => {
  if (!project) return null
  const Icon = icons[project.type] || FaCode
  return (
    <Dialog open={isOpen} onClose={onClose} label={project.title} className="pmodal" initialFocus=".pmodal__close">
      <article className="pmodal__panel">
        <header className="pmodal__head">
          <div>
            <p className="pmodal__type">
              <Icon aria-hidden="true" /> {project.category || project.type}
              {project.status && (
                <span className="pj-card__status" data-tone={statusTone(project.status)}>
                  {project.status}
                </span>
              )}
            </p>
            <h2 className="pmodal__title">{project.title}</h2>
          </div>
          <button type="button" className="pmodal__close btn btn--ghost btn--icon" onClick={onClose} aria-label="Close project details">
            <FaTimes aria-hidden="true" />
          </button>
        </header>

        <div className="pmodal__body">
          <ResponsivePicture src={project.image} alt={`${project.title} preview`} className="pmodal__media" sizes="(max-width: 900px) 92vw, 860px" loading="eager" />
          <div className="pmodal__details">
            <section>
              <h3>About the project</h3>
              <p>{project.description}</p>
            </section>
            {project.features && project.features.length > 0 && (
              <section>
                <h3>Key features</h3>
                <ul className="pmodal__features">
                  {project.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </section>
            )}
            {project.technologies && (
              <section>
                <h3>Tech stack</h3>
                <ul className="pj-pills">
                  {project.technologies.map((t) => (
                    <li key={t} className="pill">
                      {t}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        <footer className="pmodal__foot">
          {project.githubUrl && (
            <a className="btn btn--primary" href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <FaGithub aria-hidden="true" /> View code
            </a>
          )}
          {project.liveUrl && (
            <a className="btn btn--ghost" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <FaExternalLinkAlt aria-hidden="true" /> Live demo
            </a>
          )}
          {project.behanceUrl && (
            <a className="btn btn--ghost" href={project.behanceUrl} target="_blank" rel="noopener noreferrer">
              <BiLogoBehance aria-hidden="true" /> Behance
            </a>
          )}
        </footer>
      </article>
    </Dialog>
  )
}

export default ProjectModal
