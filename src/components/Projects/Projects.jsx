"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import "./Projects.scss"
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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

gsap.registerPlugin(ScrollTrigger)

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

  useEffect(() => {
    // Refresh ScrollTrigger after tab transition finishes and layout settles
    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 600)
    return () => clearTimeout(timer)
  }, [activeTab])

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
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-10%" }}
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            My <span className="highlight-text">Projects</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Explore my work across different domains
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <TypewriterEffectSmooth words={words}/>
          </motion.div>
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
                  onClick={() => {
                    setActiveTab(tab.id);
                    projectsRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
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
