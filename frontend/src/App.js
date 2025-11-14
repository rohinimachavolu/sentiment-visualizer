// App.js
import React, { useState, useRef, useEffect } from 'react';
import TranscriptDisplay from './components/TranscriptDisplay';
import KeywordsDisplay from './components/KeywordsDisplay';
import AuraVisualization from './components/AuraVisualization';
import Controls from './components/Controls';
import './App.css';

const DEEPGRAM_API_KEY = process.env.REACT_APP_DEEPGRAM_API_KEY || 'YOUR_DEEPGRAM_KEY_HERE';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [emotion, setEmotion] = useState('calm');
  const [intensity, setIntensity] = useState(0.5);
  const [keywords, setKeywords] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  const deepgramRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const processingQueueRef = useRef([]);
  const isProcessingRef = useRef(false);

  const connectionLockRef = useRef(false);
  const manualStopRef = useRef(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      manualStopRef.current = true;
      stopRecordingCleanup();
    };
  }, []);

/* ---------------------------
   PROCESSING QUEUE (REFACTORED)
   --------------------------- */
  const processQueue = async () => {
    // do nothing if already processing or queue empty
    if (isProcessingRef.current || processingQueueRef.current.length === 0) return;

    isProcessingRef.current = true;
    setIsProcessing(true);

    const text = processingQueueRef.current.shift();

    try {
      // --- BACKEND CONNECTIVITY CHECK ---
      const backendCheckController = new AbortController();
      const backendCheckTimeout = setTimeout(() => backendCheckController.abort(), 3000);

      try {
        const healthCheck = await fetch(`${BACKEND_URL}/health`, {
          method: "GET",
          signal: backendCheckController.signal
        });
        clearTimeout(backendCheckTimeout);

        if (!healthCheck.ok) {
          throw new Error('Backend not reachable');
        }
      } catch (backendErr) {
        clearTimeout(backendCheckTimeout);
        setError("❌ Backend server not connected.");
        await new Promise(resolve => setTimeout(resolve, 10000));

        setError("❌ Backend server not connected. Analyzing stopped.");

        // FULL STOP — backend unavailable
        manualStopRef.current = true;
        stopRecordingCleanup();
        setIsRecording(false);
        setConnectionStatus("disconnected");
        processingQueueRef.current = [];
        isProcessingRef.current = false;
        setIsProcessing(false);
        return;
      }

      // --- LLM PROCESSING WITH TIMEOUTS ---
      const controller = new AbortController();
      let responseReceived = false;

      // --- 5s Warning ---
      const timeout5 = setTimeout(() => {
        if (!responseReceived) {
          setError("⏳ LLM taking >5 seconds… slow response");
          setTimeout(() => setError(null), 3000);
        }
      }, 5000);

      // --- 15s Kill Switch ---
      const timeout15 = setTimeout(() => {
        if (!responseReceived) {
          controller.abort();
        }
      }, 15000);

      // --- API CALL ---
      const response = await fetch(`${BACKEND_URL}/process_text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal
      });

      responseReceived = true;
      clearTimeout(timeout5);
      clearTimeout(timeout15);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const aiData = await response.json();

      // Apply AI results
      setEmotion(aiData.emotion || "calm");
      setIntensity(prev => prev * 0.7 + (aiData.intensity || 0.5) * 0.3);

      if (aiData.keywords?.length > 0) {
        setKeywords(prev => {
          const unique = [...new Set([...prev, ...aiData.keywords])];
          return unique.slice(-10);
        });
      }

      setError(null);

    } catch (err) {
      console.error("processing error:", err);

      // --- CHECK ERROR TYPE ---
      if (err.name === "AbortError") {
        // 15s timeout happened
        setError("❌ LLM timed out (>15s). Recording stopped.");
        setTimeout(() => setError(null), 4000);

        // FULL STOP — treat timeout as user stop
        manualStopRef.current = true;
        stopRecordingCleanup();
        setIsRecording(false);
        setConnectionStatus("disconnected");
        processingQueueRef.current = [];
        isProcessingRef.current = false;
        setIsProcessing(false);
        return;
        
      } else if (err.message.includes('HTTP')) {
        // HTTP error from backend
        setError(`❌ Backend error: ${err.message}`);
        setTimeout(() => setError(null), 3000);
        
      } else {
        // Any other error
        setError("Analysis failed. Using defaults.");
        setEmotion("calm");
        setIntensity(0.5);
        setTimeout(() => setError(null), 3000);
      }

    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);

      // If more items in queue, continue
      if (processingQueueRef.current.length > 0) {
        setTimeout(processQueue, 500);
      }
    }
  };


  /* ---------------------------
     STOP CLEANUP
     --------------------------- */
  const stopRecordingCleanup = () => {
    try {
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }

        if (mediaRecorderRef.current.networkCheckInterval) {
          clearInterval(mediaRecorderRef.current.networkCheckInterval);
        }
      }
    } catch {}

    mediaRecorderRef.current = null;

    try {
      if (deepgramRef.current && deepgramRef.current.readyState !== WebSocket.CLOSED) {
        deepgramRef.current.close(1000, 'cleanup');
      }
    } catch {}

    deepgramRef.current = null;

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    } catch {}

    streamRef.current = null;
  };

  /* ---------------------------
     MANUAL STOP
     --------------------------- */
  const stopRecording = () => {
    manualStopRef.current = true;

    stopRecordingCleanup();

    setIsRecording(false);
    setConnectionStatus('disconnected');
  };

  /* ---------------------------
     START RECORDING (MANUAL ONLY)
     --------------------------- */
  const startRecording = async () => {
    manualStopRef.current = false;

    if (connectionLockRef.current) return;
    connectionLockRef.current = true;

    if (!navigator.onLine) {
      setError('🔌 No internet connection. Please try again.');
      setTimeout(() => setError(null), 4000);
      connectionLockRef.current = false;
      return;
    }

    setConnectionStatus('connecting');

    try {
      stopRecordingCleanup(); // reset anything old

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true }
      });

      streamRef.current = stream;

      const ws = new WebSocket(
        `wss://api.deepgram.com/v1/listen?punctuate=true&interim_results=false&model=nova-2`,
        ['token', DEEPGRAM_API_KEY]
      );
      deepgramRef.current = ws;

      const openTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          try { ws.close(); } catch {}
          setError('❌ Deepgram connection timeout.');
          setTimeout(() => setError(null), 5000);
          setConnectionStatus('disconnected');
        }
      }, 8000);

      ws.onopen = () => {
        clearTimeout(openTimeout);

        try {
          const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (ev) => {
            if (ev.data.size > 0 && ws.readyState === WebSocket.OPEN) {
              ws.send(ev.data);
            }
          };

          mediaRecorder.start(250);

          setIsRecording(true);
          setConnectionStatus('connected');

          // --- NETWORK MONITOR ---
          const monitor = setInterval(() => {
            const offline = !navigator.onLine;
            const wsClosed = ws.readyState !== WebSocket.OPEN;

            if (offline || wsClosed) {
              manualStopRef.current = true; // treat as full stop

              clearInterval(monitor);
              stopRecordingCleanup();

              setIsRecording(false);
              setConnectionStatus('disconnected');
              setError('🔌 Lost connection. Recording stopped.');
              setTimeout(() => setError(null), 4000);
            }
          }, 800);

          mediaRecorder.networkCheckInterval = monitor;

        } catch (err) {
          console.error('MediaRecorder start failed:', err);
          setError('🎤 Cannot start microphone.');
          setTimeout(() => setError(null), 5000);
          setConnectionStatus('disconnected');
        } finally {
          connectionLockRef.current = false;
        }
      };

      ws.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          const text = data.channel?.alternatives?.[0]?.transcript;

          if (text?.trim()) {
            setTranscript(prev => [...prev, text]);
            processingQueueRef.current.push(text);
            processQueue();
          }
        } catch (err) {
          console.error('WS message parse error:', err);
        }
      };

      ws.onerror = () => {
        setError('WebSocket error — stopped.');
        setTimeout(() => setError(null), 5000);
        stopRecording();
      };

      ws.onclose = () => {
        if (!manualStopRef.current) {
          setError('Reconnecting.....');
          setTimeout(() => setError(null), 1500);
        }
        connectionLockRef.current = false;
      };

    } catch (err) {
      console.error('startRecording error:', err);
      setError('Recording failed. please allow microphone access.');
      setTimeout(() => setError(null), 5000);
      setConnectionStatus('disconnected');
      connectionLockRef.current = false;
    }
  };

  /* ---------------------------
     RENDER
     --------------------------- */
  return (
    <div className="app">
      <AuraVisualization emotion={emotion} intensity={intensity} />

      <div className="overlay">
        <Controls
          isRecording={isRecording}
          isProcessing={isProcessing}
          onStart={startRecording}
          onStop={stopRecording}
          error={error}
          connectionStatus={connectionStatus}
        />

        <TranscriptDisplay transcript={transcript} />
        <KeywordsDisplay keywords={keywords} />
      </div>
    </div>
  );
}

export default App;
