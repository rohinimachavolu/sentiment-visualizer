import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './KeywordsDisplay.css';

const KeywordsDisplay = ({ keywords }) => {
  const [displayedKeywords, setDisplayedKeywords] = useState([]);
  
  useEffect(() => {
    // Stagger keyword appearance - fade in one by one
    keywords.forEach((keyword, index) => {
      setTimeout(() => {
        setDisplayedKeywords(prev => {
          if (prev.find(k => k.text === keyword)) {
            return prev; // Already exists
          }
          return [...prev, {
            text: keyword,
            id: `${keyword}-${Date.now()}-${index}`,
            delay: index * 0.15 // Stagger delay
          }];
        });
      }, index * 200); // 200ms delay between each keyword
    });
    
    // Clean up old keywords (keep last 15)
    if (displayedKeywords.length > 15) {
      setDisplayedKeywords(prev => prev.slice(-15));
    }
  }, [keywords, displayedKeywords.length]);

  return (
    <div className="keywords-display">
      <div className="keywords-header">
        <motion.h3
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Key Topics
        </motion.h3>
      </div>
      
      <div className="keywords-cloud">
        <AnimatePresence mode="popLayout">
          {displayedKeywords.map((keyword, index) => (
            <motion.div
              key={keyword.id}
              className="keyword-tag"
              initial={{ 
                opacity: 0, 
                y: 40,
                scale: 0.5,
                filter: 'blur(4px)'
              }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: 1,
                filter: 'blur(0px)'
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.5,
                filter: 'blur(4px)',
                transition: { duration: 0.3 }
              }}
              transition={{
                duration: 0.6,
                delay: keyword.delay,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              whileHover={{
                scale: 1.1,
                transition: { duration: 0.2 }
              }}
              style={{
                // Random subtle positioning for tag cloud effect
                marginLeft: `${(index % 3) * 2}px`,
                marginRight: `${((index + 1) % 3) * 2}px`
              }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: keyword.delay + 0.3, duration: 0.4 }}
              >
                {keyword.text}
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default KeywordsDisplay;