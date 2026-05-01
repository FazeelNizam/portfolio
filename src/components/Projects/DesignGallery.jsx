"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaBehance } from "react-icons/fa";

const Column = ({ data, y, onImageClick }) => (
  <motion.div
    style={{ y, willChange: 'transform' }}
    className="flex flex-col gap-6 md:gap-8 w-full"
  >
    {data.map((design) => (
      <div
        key={design.id}
        className="relative group overflow-hidden rounded-2xl cursor-pointer"
        onClick={() => onImageClick(design)}
      >
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-400 z-10" />
        <img
          src={design.image || "/placeholder.svg"}
          alt={design.title || `Design ${design.id}`}
          className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-600 ease-out grayscale group-hover:grayscale-0"
          loading="lazy"
          decoding="async"
        />
        {design.behanceUrl && (
          <a
            href={design.behanceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <FaBehance />
            <span className="text-sm font-medium">Behance</span>
          </a>
        )}
      </div>
    ))}
  </motion.div>
);

const DesignGallery = ({ designs, onImageClick }) => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const col1 = [];
  const col2 = [];
  const col3 = [];

  designs.forEach((d, i) => {
    if (i % 3 === 0) col1.push(d);
    else if (i % 3 === 1) col2.push(d);
    else col3.push(d);
  });

  // Reduced parallax range for better performance
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <div ref={containerRef} className="w-full py-12 px-4 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-[1400px] mx-auto items-start">
        <Column data={col1} y={y1} onImageClick={onImageClick} />
        <Column data={col2} y={y2} onImageClick={onImageClick} />
        <Column data={col3} y={y3} onImageClick={onImageClick} />
      </div>
    </div>
  );
};

export default DesignGallery;