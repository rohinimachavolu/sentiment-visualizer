import React, { useState, useRef } from 'react';
import TranscriptDisplay from './components/TranscriptDisplay';
import KeywordsDisplay from './components/KeywordsDisplay';
import AuraVisualization from './components/AuraVisualization';
import Controls from './components/Controls';
import './App.css';

const DEEPGRAM_API_KEY = process.env.REACT_APP_DEEPGRAM_API_KEY || 'YOUR_DEEPGRAM_KEY_HERE';
const BACKEND_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8000';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [sentiment, setSentiment] = useState(0);
  const [intensity, setIntensity] = useState(0.5);
  const [keywords, setKeywords] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  
  const deepgramRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const processingQueueRef = useRef([]);
  const isProcessingRef = useRef(false);

  const processQueue = async () => {
    if (isProcessingRef.current || processingQueueRef.current.length === 0) {
      return;
    }

    isProcessingRef.current = true;
    setIsProcessing(true);
    const text = processingQueueRef.current.shift();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${BACKEND_URL}/process_text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const aiData = await response.json();
      console.log('📥 Frontend received from backend:', aiData);
      console.log('📊 Current sentiment:', sentiment, '→ New:', aiData.sentiment);
      console.log('⚡ Current intensity:', intensity, '→ New:', aiData.intensity);
      
      setSentiment(prev => prev * 0.7 + aiData.sentiment * 0.3);
      
      setSentiment(prev => prev * 0.7 + aiData.sentiment * 0.3);
      setIntensity(prev => prev * 0.7 + aiData.intensity * 0.3);
      
      if (aiData.keywords && aiData.keywords.length > 0) {
        setKeywords(prev => {
          const combined = [...prev, ...aiData.keywords];
          const unique = [...new Set(combined)];
          return unique.slice(-10);
        });
      }

      setError(null);

    } catch (err) {
      console.error('Backend error:', err);
      setError(err.message);
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
      
      if (processingQueueRef.current.length > 0) {
        setTimeout(processQueue, 100);
      }
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      streamRef.current = stream;
      
      const wsUrl = `wss://api.deepgram.com/v1/listen?punctuate=true&interim_results=false&model=nova-2`;
      const ws = new WebSocket(wsUrl, ['token', DEEPGRAM_API_KEY]);
      
      ws.onopen = () => {
        console.log('✓ Deepgram connected');
        setIsRecording(true);
        
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm'
        });
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(event.data);
          }
        };
        
        mediaRecorder.start(250);
        mediaRecorderRef.current = mediaRecorder;
      };
      
      ws.onmessage = (message) => {
        const data = JSON.parse(message.data);
        const transcriptText = data.channel?.alternatives?.[0]?.transcript;
        
        if (transcriptText && transcriptText.trim().length > 0) {
          console.log('Transcript:', transcriptText);
          setTranscript(prev => [...prev, transcriptText]);
          processingQueueRef.current.push(transcriptText);
          processQueue();
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Transcription connection error');
      };

      ws.onclose = () => {
        console.log('Deepgram disconnected');
      };
      
      deepgramRef.current = ws;
      
    } catch (err) {
      console.error('Mic access error:', err);
      setError('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (deepgramRef.current) {
      deepgramRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  return (
    <div className="app">
      <AuraVisualization 
        sentiment={sentiment} 
        intensity={intensity}
        keywords={keywords}
      />
      <div className="overlay">
        <Controls 
          isRecording={isRecording}
          isProcessing={isProcessing}
          onStart={startRecording}
          onStop={stopRecording}
          error={error}
        />
        <TranscriptDisplay transcript={transcript} />
        <KeywordsDisplay keywords={keywords} />
      </div>
    </div>
  );
}

export default App;