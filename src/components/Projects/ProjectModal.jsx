"use client"
import { motion, AnimatePresence } from "framer-motion"
import "./ProjectModal.scss"

// Icons
import {
  FaTimes,
  FaGithub,
  FaExternalLinkAlt,
  FaStar,
  FaCodeBranch,
  FaCalendarAlt,
  FaCode,
  FaMicrochip,
  FaPalette,
} from "react-icons/fa"
import { BiLogoBehance } from "react-icons/bi"

const ProjectModal = ({ project, isOpen, onClose }) => {
  if (!project) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getProjectIcon = (type) => {
    switch (type) {
      case "web":
        return <FaCode />
      case "design":
        return <FaPalette />
      case "embedded":
        return <FaMicrochip />
      default:
        return <FaCode />
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#22c55e"
      case "ongoing":
        return "#f59e0b"
      case "planned":
        return "#3b82f6"
      default:
        return "#9200fa"
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modalOverlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modalContent"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modalHeader">
              <div className="headerLeft">
                <div className="projectType">
                  <span className="typeIcon">{getProjectIcon(project.type)}</span>
                  <span className="typeLabel">{project.type}</span>
                </div>
                <h2 className="projectTitle">{project.title}</h2>
              </div>
              <button className="closeBtn" onClick={onClose}>
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modalBody">
              {/* Project Image */}
              <div className="projectImage">
                <img src={project.image || "/placeholder.svg"} alt={project.title} />
              </div>

              {/* Project Details */}
              <div className="projectDetails">
                <div className="detailsGrid">
                  {(project.status || project.category || project.duration) && (
                    <div className="detailSection">
                      <h3>Project Info</h3>
                      <div className="projectInfo">
                        {project.status && (
                          <div className="infoItem">
                            <span className="infoLabel">Status:</span>
                            <span
                              className="statusBadge"
                              style={{
                                backgroundColor: `${getStatusColor(project.status)}20`,
                                color: getStatusColor(project.status),
                                borderColor: `${getStatusColor(project.status)}40`,
                              }}
                            >
                              {project.status}
                            </span>
                          </div>
                        )}
                        {project.category && (
                          <div className="infoItem">
                            <span className="infoLabel">Category:</span>
                            <span className="infoValue">{project.category}</span>
                          </div>
                        )}
                        {project.duration && (
                          <div className="infoItem">
                            <span className="infoLabel">Duration:</span>
                            <span className="infoValue">{project.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="detailSection">
                    <h3>Description</h3>
                    <p>{project.description}</p>
                  </div>

                  {project.features && project.features.length > 0 && (
                    <div className="detailSection">
                      <h3>Key Features</h3>
                      <ul className="featuresList">
                        {project.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Technologies */}
                  <div className="detailSection">
                    <h3>Technologies Used</h3>
                    <div className="technologiesList">
                      {project.technologies.map((tech, index) => (
                        <span key={index} className="techTag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Project Stats */}
                  {(project.stars !== undefined || project.forks !== undefined) && (
                    <div className="detailSection">
                      <h3>Project Stats</h3>
                      <div className="projectStats">
                        {project.stars !== undefined && (
                          <div className="stat">
                            <FaStar />
                            <span>{project.stars} Stars</span>
                          </div>
                        )}
                        {project.forks !== undefined && (
                          <div className="stat">
                            <FaCodeBranch />
                            <span>{project.forks} Forks</span>
                          </div>
                        )}
                        {project.language && (
                          <div className="stat">
                            <FaCode />
                            <span>{project.language}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Last Updated */}
                  {project.updatedAt && (
                    <div className="detailSection">
                      <h3>Last Updated</h3>
                      <div className="lastUpdated">
                        <FaCalendarAlt />
                        <span>{formatDate(project.updatedAt)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modalFooter">
              <div className="actionButtons">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="actionBtn github">
                    <FaGithub />
                    <span>View Code</span>
                  </a>
                )}

                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="actionBtn live">
                    <FaExternalLinkAlt />
                    <span>Live Demo</span>
                  </a>
                )}

                {project.behanceUrl && (
                  <a href={project.behanceUrl} target="_blank" rel="noopener noreferrer" className="actionBtn behance">
                    <BiLogoBehance />
                    <span>View on Behance</span>
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ProjectModal
