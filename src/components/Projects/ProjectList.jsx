import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import AnimatedGradientText from '../ui/AnimatedGradientText';

/* ── Typing title — imperatively animated, zero re-renders ───── */
const TypingTitle = ({ text, speed = -9000 }) => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-10%' });
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isInView || startedRef.current) return;
    startedRef.current = true;

    const container = containerRef.current;
    if (!container) return;

    const charEls = container.querySelectorAll('.tch');
    const cursor = container.querySelector('.tcur');
    let i = 0;

    const step = () => {
      if (i < charEls.length) {
        charEls[i].style.opacity = '1';
        // Move cursor after this character
        charEls[i].appendChild(cursor);
        i++;
        setTimeout(step, speed);
      }
    };

    step();
  }, [isInView, speed]);

  return (
    <span ref={containerRef}>
      {text.split('').map((ch, i) => (
        <span key={i} className="tch" style={{ opacity: 0, whiteSpace: ch === ' ' ? 'pre' : undefined }}>
          {ch}
        </span>
      ))}
      <span
        className="tcur"
        style={{
          display: 'inline-block',
          width: '3px',
          height: '1.1em',
          verticalAlign: 'text-bottom',
          marginLeft: '2px',
          backgroundColor: '#9200fa',
          borderRadius: '1px',
          animation: 'blink 0.8s step-end infinite',
        }}
      />
    </span>
  );
};

/* ── Single project row ──────────────────────────────────────── */
const ProjectRow = ({ project, idx }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20% 0px' });
  const isReverse = idx % 2 !== 0;

  const ease = [0.22, 1, 0.36, 1]; // Premium cubic-bezier

  return (
    <div
      ref={ref}
      className={`project-row ${isReverse ? 'reverse' : ''}`}
    >
      {/* ── Text side ── */}
      <div className="project-text">
        {/* Index number */}
        <motion.span
          className="project-idx"
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 0.1, x: 0 } : {}}
          transition={{ duration: 1, ease }}
        >
          {String(idx + 1).padStart(2, '0')}
        </motion.span>

        {/* Title — typing reveal */}
        {isInView && (
          <h3 className="project-title">
            <TypingTitle text={project.title} />
          </h3>
        )}

        {/* Description */}
        <motion.div
          className="project-desc"
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.2, ease, delay: 0.3 }}
        >
          <p>{project.description}</p>
        </motion.div>

        {/* Tech pills */}
        {project.features && (
          <motion.div
            className="project-pills"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } },
              hidden: {}
            }}
          >
            {project.features.slice(0, 5).map((feat, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.8 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease } }
                }}
              >
                <AnimatedGradientText className="pill-wrapper" speed={3}>
                  <span className="pill-text">{feat}</span>
                </AnimatedGradientText>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Links */}
        <motion.div
          className="project-links"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8, ease }}
        >
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="proj-link">
              <FaGithub size={14} />
              <span>View Code</span>
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="proj-link accent">
              <FaExternalLinkAlt size={12} />
              <span>Live Demo</span>
            </a>
          )}
        </motion.div>
      </div>

      {/* ── Image side with Mask Reveal ── */}
      <motion.div
        className="project-image"
        initial={{ 
          clipPath: isReverse ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)',
          scale: 1.2,
          filter: 'blur(20px)',
          opacity: 0
        }}
        animate={isInView ? { 
          clipPath: 'inset(0 0% 0 0%)',
          scale: 1,
          filter: 'blur(0px)',
          opacity: 1
        } : {}}
        transition={{ duration: 1.5, ease, delay: 0.1 }}
      >
        <div className="img-inner group">
          <img
            src={project.image || '/placeholder.svg'}
            alt=""
            className="img-blur-bg"
            aria-hidden="true"
          />
          <div className="img-overlay" />
          <img
            src={project.image || '/placeholder.svg'}
            alt={project.title}
            className="proj-img"
            loading="lazy"
            decoding="async"
          />
        </div>
      </motion.div>
    </div>
  );
};

/* ── List wrapper ────────────────────────────────────────────── */
const ProjectList = ({ projects }) => (
  <div className="project-list">
    {projects.map((project, idx) => (
      <ProjectRow key={project.id || idx} project={project} idx={idx} />
    ))}
  </div>
);

export default ProjectList;
