import React from 'react';
import { motion } from 'framer-motion';
import './Controls.css';

const Controls = ({ isRecording, isProcessing, onStart, onStop, error }) => {
  return (
    <div className="controls">
      <motion.button
        className={`control-button ${isRecording ? 'recording' : ''}`}
        onClick={isRecording ? onStop : onStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="button-content">
          <div className={`recording-indicator ${isRecording ? 'active' : ''}`}>
            <div className="pulse"></div>
          </div>
          <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
        </div>
      </motion.button>
      
      {isProcessing && (
        <motion.div 
          className="processing-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="spinner"></div>
          <span>Analyzing...</span>
        </motion.div>
      )}
      
      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default Controls;