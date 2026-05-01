"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import "./Projects.scss"

// UI Components
import ProjectModal from "./ProjectModal"
import ProjectList from "./ProjectList"
import DesignGallery from "./DesignGallery"
import ImageModal from "./ImageModal"
import { TypewriterEffectSmooth } from '../ui/TypeWriter'
import { Dock, DockIcon } from '../ui/Dock'

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
  
  const projectsRef = useRef(null)

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
    <section className="projectsWrapper relative" id="projects" ref={projectsRef}>
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
                  <ProjectList
                    projects={projects[activeTab]}
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

        {/* Sticky Dock Navigation */}
        <div className="sticky bottom-6 z-50 w-full flex justify-center pointer-events-none mt-8">
          <div className="pointer-events-auto">
            <Dock>
              {tabs.map((tab) => (
                <DockIcon
                  key={tab.id}
                  label={tab.label}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                </DockIcon>
              ))}
            </Dock>
          </div>
        </div>
      </div>

      <ProjectModal project={selectedProject} isOpen={!!selectedProject} onClose={closeModal} />

      <ImageModal image={selectedImage} isOpen={!!selectedImage} onClose={closeImageModal} />
    </section>
  )
}

export default Projects
