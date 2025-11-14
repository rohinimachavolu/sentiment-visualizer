// Controls.jsx
import React from 'react';
import { motion } from 'framer-motion';
import './Controls.css';

const Controls = ({ isRecording, isProcessing, onStart, onStop, error, connectionStatus }) => {
  const buttonLabel = connectionStatus === 'reconnecting'
    ? '🟡 Reconnecting…'
    : isRecording
      ? 'Stop Recording'
      : 'Start Recording';

  const isButtonDisabled = connectionStatus === 'failed';

  return (
    <div className="controls">
      <motion.button
        className={`control-button ${isRecording ? 'recording' : ''}`}
        onClick={isRecording ? onStop : onStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isButtonDisabled}
      >
        <div className="button-content">
          <div className={`recording-indicator ${isRecording ? 'active' : ''} ${connectionStatus === 'reconnecting' ? 'reconnecting' : ''}`}>
            <div className="pulse"></div>
          </div>
          <span>{buttonLabel}</span>
        </div>
      </motion.button>

      {connectionStatus === 'connected' && isRecording && (
        <motion.div
          className="status-indicator connected"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="status-dot"></div>
          <span>Connected</span>
        </motion.div>
      )}

      {isProcessing && (
        <motion.div
          className="processing-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="spinner"></div>
          <span>Analyzing emotion...</span>
        </motion.div>
      )}

      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⚠️ {error}
        </motion.div>
      )}
    </div>
  );
};

export default Controls;
