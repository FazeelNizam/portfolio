import './Footer.scss'

import {
  contactCard
} from '../../data/data'

const Footer = () => {

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

    return (
    <footer className="footerWrapper" id="contact">
      <div className="footerContent">
        {/* Social Links */}
          <div className="socialLinks">
            {contactCard.map((card) => (
              <a
                href={card.link}
                target="_blank"
                rel="noopener noreferrer"
                className="socialLink"
              >
                <span className="socialIcon">{card.svg}</span>
                {/* <p>{card.text}</p> */}
              </a>
            ))}
          </div>

        {/* Copyright */}
        <div className="copyright">
          <p>&copy; 2025 Fazeel Nizam. All rights reserved.</p>
        </div>

        {/* Scroll to Top Button */}
        <button 
          className="scrollToTop"
          onClick={() => scrollToSection('#home')}
        >
          ↑
        </button>
      </div>
    </footer>
  )
}

export default Footer