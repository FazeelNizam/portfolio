"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import "./Projects.scss"

// UI Components
import ProjectModal from "./ProjectModal"
import RotatingCardCarousel from "./RotatingCardCarousel"
import DesignGallery from "./DesignGallery"
import ImageModal from "./ImageModal"
import { TypewriterEffectSmooth } from '../ui/TypeWriter'

// Data
import { embeddedProjects } from "../../data/embeddedProjects"
import { webProjects } from "../../data/webProjects"
import { designProjects } from "../../data/designProjects"

// Icons
import { FaCode, FaPalette, FaMicrochip } from "react-icons/fa"

const words = [
  {
    text: 'This',
  },
  {
    text: 'section',
  },
  {
    text: 'still',
  },
  {
    text: 'under',
  },
  {
    text: 'development.',
  },
  {
    text: 'Stay',
  },

  {
    text: 'tuned',
  },
  {
    text: '.',
  },
  {
    text: '.',
  },
  {
    text: '.',
  },
  {
    text: '!',
  },
]

const Projects = () => {
  const [activeTab, setActiveTab] = useState("embedded")
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabRefs = useRef({})

  const tabs = [
    { id: "embedded", label: "Embedded Systems", icon: <FaMicrochip /> },
    { id: "web", label: "Web & Software", icon: <FaCode /> },
    { id: "design", label: "Design Works", icon: <FaPalette /> },
  ]

  const projects = {
    embedded: embeddedProjects,
    web: webProjects,
    design: designProjects,
  }

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab]
    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth })
    }
  }, [activeTab])

  const handleProjectClick = (project) => {
    setSelectedProject(project)
  }

  const handleImageClick = (image) => {
    setSelectedImage(image)
  }

  const closeModal = () => {
    setSelectedProject(null)
  }

  const closeImageModal = () => {
    setSelectedImage(null)
  }

  return (
    <section className="projectsWrapper" id="projects">
      <div className="projectsContainer">
        <motion.div
          className="projectsHeader"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2>
            My <span className="highlight-text">Projects</span>
          </h2>
          <p>Explore my work across different domains</p>
          <TypewriterEffectSmooth words={words}/>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="tabsContainer"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="tabs">
            <motion.div
              className="tabIndicator"
              initial={false}
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            />
            {tabs.map((tab) => (
              <button
                key={tab.id}
                ref={(el) => (tabRefs.current[tab.id] = el)}
                className={`tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tabIcon">{tab.icon}</span>
                <span className="tabLabel">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="projectsContent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {activeTab !== "design" && (
            <div className="projectsCarousel">
              <div className="sky-container">
                <div className="star1"></div>
                <div className="star2"></div>
                <div className="star3"></div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  style={{ width: "100%" }}
                >
                  <RotatingCardCarousel
                    projects={projects[activeTab]}
                    onProjectClick={handleProjectClick}
                    paused={!!selectedProject}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {activeTab === "design" && (
            <AnimatePresence mode="wait">
              <motion.div
                key="design"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{ width: "100%" }}
              >
                <DesignGallery designs={projects.design} onImageClick={handleImageClick} />
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      <ProjectModal project={selectedProject} isOpen={!!selectedProject} onClose={closeModal} />

      <ImageModal image={selectedImage} isOpen={!!selectedImage} onClose={closeImageModal} />
    </section>
  )
}

export default Projects
