"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBehance } from "react-icons/fa";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import "./DesignGallery.scss";

gsap.registerPlugin(ScrollTrigger);

const DesignCard = ({ design, onImageClick }) => {
  const [aspectClass, setAspectClass] = useState("square");

  useEffect(() => {
    if (!design.image) return;

    const img = new Image();
    // Handle both string paths and imported image objects
    const imgSrc = typeof design.image === 'string' ? design.image : (design.image.src || design.image);
    
    img.src = imgSrc;
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      if (ratio > 1.3) {
        setAspectClass("landscape");
      } else if (ratio < 0.75) {
        setAspectClass("portrait");
      } else {
        setAspectClass("square");
      }
      // Notify ScrollTrigger that layout has shifted due to image load/ratio detection
      ScrollTrigger.refresh();
    };
  }, [design.image]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        duration: 0.5,
        layout: { duration: 0.6, type: "spring", stiffness: 200, damping: 25 }
      }}
      className={`design-card ${aspectClass}`}
      onClick={() => onImageClick(design)}
    >
      <img
        src={typeof design.image === 'string' ? design.image : (design.image.src || design.image)}
        alt={design.title}
        className="design-img"
        loading="lazy"
      />
      
      <div className="design-overlay">
        <h3 className="design-title">{design.title}</h3>
        
        {design.tools && (
          <div className="tools-list">
            {design.tools.map((tool, i) => (
              <span key={i} className="tool-pill">
                {tool}
              </span>
            ))}
          </div>
        )}

        <div className="shimmer-separator" />

        {design.behanceUrl && (
          <a
            href={design.behanceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="behance-link"
            onClick={(e) => e.stopPropagation()}
          >
            <FaBehance />
            <span>View on Behance</span>
          </a>
        )}
      </div>
    </motion.div>
  );
};

const DesignGallery = ({ designs, onImageClick }) => {
  return (
    <div className="w-full py-12 px-4 md:px-8">
      <motion.div layout className="design-gallery-grid">
        <AnimatePresence>
          {designs.map((design) => (
            <DesignCard 
              key={design.id} 
              design={design} 
              onImageClick={onImageClick} 
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DesignGallery;