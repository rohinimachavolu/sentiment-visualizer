import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import './TranscriptDisplay.css';

const TranscriptDisplay = ({ transcript }) => {
  const containerRef = useRef(null);

  return (
    <div className="transcript-spotify" ref={containerRef}>
      <div className="lyrics-container">
        {transcript.map((text, index) => {
          const currentIndex = transcript.length - 1;
          const isActive = index === currentIndex;
          const distanceFromCurrent = currentIndex - index;
          
          // Calculate vertical position (each line 90px apart)
          const yPosition = -distanceFromCurrent * 90;
          
          // Calculate opacity based on distance (but never fully disappear)
          let opacity;
          if (isActive) {
            opacity = 1;
          } else if (distanceFromCurrent <= 2) {
            opacity = 0.6; // Previous 2 lines stay fairly visible
          } else {
            opacity = Math.max(0.25, 1 - (distanceFromCurrent - 2) * 0.1); // Fade gradually but keep minimum 0.25
          }
          
          // Calculate blur (less blur for recent lines)
          let blurAmount;
          if (isActive) {
            blurAmount = 0;
          } else if (distanceFromCurrent <= 2) {
            blurAmount = distanceFromCurrent * 0.5; // Slight blur
          } else {
            blurAmount = Math.min(1 + distanceFromCurrent * 0.3, 4); // Max 4px blur
          }
          
          // Calculate scale
          let scale;
          if (isActive) {
            scale = 1;
          } else if (distanceFromCurrent <= 2) {
            scale = 0.85;
          } else {
            scale = Math.max(0.75, 0.85 - (distanceFromCurrent - 2) * 0.02);
          }
          
          return (
            <motion.div
              key={index}
              className={`lyric-line ${isActive ? 'active' : ''}`}
              initial={{ opacity: 0, y: 100 }}
              animate={{ 
                opacity: opacity,
                y: yPosition,
                filter: `blur(${blurAmount}px)`,
                scale: scale
              }}
              transition={{ 
                duration: 0.5,
                ease: "easeOut"
              }}
            >
              {text}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TranscriptDisplay;