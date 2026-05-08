import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBehance } from "react-icons/fa";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import "./DesignGallery.scss";

gsap.registerPlugin(ScrollTrigger);

const DesignCard = ({ design, onImageClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`design-card ${design.aspectClass || "square"}`}
      onClick={() => onImageClick(design)}
    >
      <img
        src={typeof design.image === 'string' ? design.image : (design.image.src || design.image)}
        alt={design.title}
        className="design-img"
        loading="lazy"
      />
      
      <div className="design-overlay">
        <div className="category-label">{design.category}</div>
        
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
  const [shuffledDesigns, setShuffledDesigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    const shuffle = (array) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    const loadRatios = async () => {
      const projectsWithRatios = await Promise.all(
        designs.map((design) => {
          return new Promise((resolve) => {
            const img = new Image();
            const imgSrc = typeof design.image === 'string' ? design.image : (design.image.src || design.image);
            img.src = imgSrc;
            img.onload = () => {
              const ratio = img.naturalWidth / img.naturalHeight;
              let aspectClass = "square";
              if (ratio > 1.3) aspectClass = "landscape";
              else if (ratio < 0.75) aspectClass = "portrait";
              resolve({ ...design, aspectClass });
            };
            img.onerror = () => resolve({ ...design, aspectClass: "square" });
          });
        })
      );

      setShuffledDesigns(shuffle(projectsWithRatios));
      setIsLoading(false);
      
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    };

    loadRatios();
  }, [designs]);

  return (
    <div className="w-full py-12 px-4 md:px-8 min-h-[500px] flex items-center justify-center">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6"
          >
            <l-quantum size="45" speed="1.8" color="#9200fa"></l-quantum>
            {/* <span className="text-xs text-[#9200fa] tracking-[0.3em] uppercase font-bold opacity-80">Curating Gallery</span> */}
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="design-gallery-grid w-full"
          >
            {shuffledDesigns.map((design) => (
              <DesignCard 
                key={design.id} 
                design={design} 
                onImageClick={onImageClick} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DesignGallery;