import './Footer.scss'

import {
  contactCard
} from '../../data/data'
import { animate } from 'animejs'
import { scrollToTarget } from '../../lib/smoothScroll'
import { prefersReducedMotion } from '../../lib/device'

const Footer = () => {

  const scrollToSection = (e, sectionId) => {
    scrollToTarget(sectionId === '#home' ? 0 : sectionId);
    if (prefersReducedMotion()) return;
    
    // Particle burst effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'burst-particle';
      particle.style.position = 'fixed';
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      particle.style.width = '6px';
      particle.style.height = '6px';
      particle.style.backgroundColor = '#9200fa';
      particle.style.borderRadius = '50%';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = 9999;
      document.body.appendChild(particle);

      const angle = (Math.PI * 2 * i) / 8;
      const distance = 30 + Math.random() * 40;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      animate(particle, {
        translateX: [0, tx],
        translateY: [0, ty],
        scale: [1, 0],
        opacity: [1, 0],
        duration: 500 + Math.random() * 300,
        easing: 'easeOutExpo'
      });
      
      setTimeout(() => {
        if (particle.parentNode) particle.remove();
      }, 1000);
    }
  };

  return (
    <>
      {/* Animated shimmer separator line */}
      <div className="footerSeparator" />

      <footer className="footerWrapper" id="contact">
        <div className="footerContent">
          {/* Social Links */}
            <div className="socialLinks">
              {contactCard.map((card) => (
                <a
                  key={card.text}
                  aria-label={card.text}
                  href={card.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="socialLink"
                >
                  <span className="socialIcon" aria-hidden="true">{card.svg}</span>
                  {/* <p>{card.text}</p> */}
                </a>
              ))}
            </div>

          {/* Copyright */}
          <div className="copyright">
            <p>&copy; {new Date().getFullYear()} Fazeel Nizam. All rights reserved.</p>
          </div>

          {/* Scroll to Top Button */}
          <button
            type="button"
            aria-label="Back to top"
            className="scrollToTop"
            onClick={(e) => scrollToSection(e, '#home')}
          >
            <span aria-hidden="true">↑</span>
          </button>
        </div>
      </footer>
    </>
  )
}

export default Footer