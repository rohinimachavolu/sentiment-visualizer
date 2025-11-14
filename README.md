# Real-Time Emotion Visualization with Perlin Noise
**Author : Rohini Machavolu**

A full-stack web application that performs real-time audio transcription and visualizes the speaker's emotional state through dynamic Perlin noise-based wave animations. The visualization smoothly transitions between 9 distinct emotions, each with unique wave patterns, colors, and characteristics.

![Demo](https://img.shields.io/badge/Status-Active-success)
![React](https://img.shields.io/badge/React-18.x-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.121-green)
![Python](https://img.shields.io/badge/Python-3.9+-yellow)

---

## Features

- **Real-time audio transcription** using Deepgram WebSocket API
- **Advanced emotion analysis** with Groq AI (Llama 3.3 70B) detecting 9 distinct emotions
- **Dynamic Perlin noise visualization** with smooth transitions between emotional states
- **Spotify-style scrolling transcript** with blur effects and auto-scroll
- **Animated keyword extraction** displaying 5 lines of keywords with fade-in effects
- **Live emotion indicator** showing current emotion with emoji and intensity percentage
- **Full-stack architecture** with React frontend and FastAPI backend

---

## Emotion Visualizations

Each emotion has a unique wave pattern, color scheme, and animation style:

| Emotion | Emoji | Color | Wave Style | Description |
|---------|-------|-------|------------|-------------|
| 😢 **Sad** | 😢 | 🔴 Red | Deep, drooping downward | Waves sink down heavily with slow movement |
| 😊 **Happy** | 😊 | 🟢 Green | Smooth, flowing | Gentle curves with peaceful rhythm |
| 😡 **Angry** | 😡 | 🔴 Bright Red | Sharp, spiky | High frequency jagged waves |
| 😌 **Calm** | 😌 | 🔵 Soft Blue | Minimal, gentle | Slow, peaceful minimal waves |
| 😕 **Confused** | 😕 | 🟣 Purple | Chaotic, irregular | Disorganized turbulent patterns |
| 💪 **Confident** | 💪 | 🟡 Gold | Bold, strong | Powerful curves with steady flow |
| 😍 **Love** | 😍 | 💗 Pink/Magenta | Soft, romantic | Flowing warm patterns |
| 😲 **Surprise** | 😲 | 🟡 Yellow/Orange | Explosive, bursting | Radiating outward energy |
| 😰 **Fear** | 😰 | 🟣 Dark Purple | Trembling, shaky | Erratic, anxious movement |

### Emotion Indicator

Above the "Start Recording" button, a live indicator displays:

```
┌──────────────────┐
│  😍  Love        │
│      75%         │
└──────────────────┘
```

- **Emoji** represents the detected emotion
- **Label** shows emotion name with color-coded text
- **Percentage** displays intensity (0-100%)

---

## Technical Architecture

### Frontend (React)
- **Framework:** React 18.x with Hooks
- **Visualization:** p5.js for Perlin noise rendering
- **Animations:** Framer Motion for UI transitions
- **Audio:** Web Audio API + WebSocket for real-time streaming
- **Styling:** Custom CSS with glassmorphism effects

### Backend (FastAPI)
- **Framework:** FastAPI (Python)
- **AI Model:** Groq AI API (Llama 3.3 70B Versatile)
- **CORS:** Configured for local and production environments
- **Async:** Handles concurrent transcription processing

### External APIs
- **Deepgram API:** Real-time speech-to-text transcription
- **Groq API:** Emotion classification and keyword extraction

---

## Project Structure

```
sentiment-visualizer/
├── backend/
│   ├── main.py              # FastAPI server with emotion analysis
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # API keys (not in repo)
│   └── .env.example         # Template for environment variables
│
├── frontend/
│   ├── src/
│   │   ├── App.js           # Main application logic and state management
│   │   ├── App.css          # Global styles
│   │   ├── components/
│   │   │   ├── AuraVisualization.jsx  # Perlin noise wave visualization
│   │   │   ├── Controls.jsx           # Recording controls
│   │   │   ├── Controls.css
│   │   │   ├── TranscriptDisplay.jsx  # Spotify-style scrolling text
│   │   │   ├── TranscriptDisplay.css
│   │   │   ├── KeywordsDisplay.jsx    # Animated keyword tags
│   │   │   └── KeywordsDisplay.css
│   │   └── index.js         # React entry point
│   ├── public/
│   ├── package.json         # Node dependencies
│   ├── .env                 # Environment variables (not in repo)
│   └── .env.example         # Template
│
├── .gitignore
└── README.md
```

---

## API Keys Required

### 1. **Deepgram API** (Speech-to-Text)
- **Used in:** `frontend/src/App.js`
- **Purpose:** Real-time audio transcription via WebSocket
- **Get it:** [https://console.deepgram.com/](https://console.deepgram.com/)
- **Free tier:** $200 credit

### 2. **Groq API** (AI Emotion Analysis)
- **Used in:** `backend/main.py`
- **Purpose:** Analyzes transcribed text to detect emotion, intensity, and keywords
- **Get it:** [https://console.groq.com/](https://console.groq.com/)
- **Free tier:** 14,400 tokens/minute

---

## Local Development Setup

### Prerequisites

- **Node.js** (v14 or higher)
- **Python** (v3.8 or higher)
- **Git**
- **Microphone access** (for audio recording)

---

### Backend Setup

#### 1. Navigate to backend directory

```bash
cd sentiment-visualizer/backend
```

#### 2. Create and activate virtual environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate it (Mac/Linux)
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

#### 3. Install dependencies

```bash
pip install -r requirements.txt
```

#### 4. Create environment file

```bash
# Create .env file
touch .env
```

Add your Groq API key to `.env`:

```bash
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
```

#### 5. Run the backend server

```bash
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Backend is now running on `http://localhost:8000`**

#### 6. Test backend health (optional)

Open browser or use curl:
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

**Keep this terminal window open!**

---

### Frontend Setup

#### 1. Open a NEW terminal and navigate to frontend

```bash
cd sentiment-visualizer/frontend
```

#### 2. Install dependencies

```bash
npm install
```

This will install:
- React
- react-p5 (for Perlin noise visualization)
- framer-motion (for animations)
- Other dependencies

#### 3. Create environment file

```bash
touch .env
```

Add your Deepgram API key to `.env`:

```bash
REACT_APP_DEEPGRAM_API_KEY=your_actual_deepgram_api_key_here
```

**Alternative:** You can also directly add the key in `src/App.js` line 8 (not recommended for production):

```javascript
const DEEPGRAM_API_KEY = 'your-deepgram-key-here';
```

#### 4. Run the frontend

```bash
npm start
```

The app should automatically open in your browser at `http://localhost:3000`

If not, manually navigate to: **http://localhost:3000**

**Keep this terminal window open!**

---

### Running Both Together

You should have **TWO terminal windows** open:

```
Terminal 1 (Backend):               Terminal 2 (Frontend):
cd backend/                         cd frontend/
source venv/bin/activate            npm start
uvicorn main:app --reload           
  → Running on :8000                  → Running on :3000
```

---

## How to Use

1. **Click "Start Recording"** button
2. **Allow microphone access** when browser prompts
3. **Speak naturally** - try different emotions:
   - "I'm so sad and depressed" → Red downward waves
   - "I'm incredibly happy!" → Green smooth waves
   - "I'm furious!" → Red spiky waves
   - "I love this!" → Pink romantic waves
4. **Watch the visualization** change colors, wave patterns, and speed
5. **See your words** appear in Spotify-style scrolling text
6. **View keywords** fade in on the right side (max 3 shown)
7. **Click "Stop Recording"** to end

---

## How It Works

### Data Flow

```
1. User speaks into microphone
   ↓
2. Audio streamed to Deepgram API via WebSocket
   ↓
3. Deepgram returns transcribed text in real-time
   ↓
4. Frontend displays text in scrolling transcript
   ↓
5. Text sent to FastAPI backend (/process_text endpoint)
   ↓
6. Backend sends text to Groq AI for analysis
   ↓
7. Groq returns: { emotion: "happy", intensity: 0.75, keywords: [...] }
   ↓
8. Frontend receives emotion data
   ↓
9. Visualization smoothly transitions to new emotion state
   ↓
10. Wave patterns, colors, and speed update in real-time
```

---

## Visualization Techniques

### Perlin Noise
The visualization uses **multi-layered Perlin noise** to create organic, flowing wave patterns:

```javascript
// 3 layers of Perlin noise at different scales
noise1 * 0.4  // Large-scale flow
noise2 * 0.35 // Medium turbulence  
noise3 * 0.25 // Fine detail
```

### Smooth Transitions
All parameters (color, frequency, amplitude, turbulence) use **linear interpolation (lerp)** for smooth transitions:

```javascript
currentValue = lerp(currentValue, targetValue, 0.03)
// 0.03 = 3% change per frame → smooth 1-2 second transitions
```

### Wave Characteristics

Each emotion has unique parameters that define its visual appearance:

- **Frequency:** How many peaks/valleys (spikiness)
- **Amplitude:** Wave height
- **Turbulence:** Chaotic variation
- **Wave Count:** Number of horizontal waves (changes with intensity)
- **Direction:** Upward, downward, or neutral flow

---

## Keyword Display

Keywords extracted by the AI appear on the right side with:
- **Staggered fade-in animation** (200ms delay between each)
- **Maximum 5 lines of keywords** shown at once
- **Glassmorphism styling** with blur and transparency
- **Smooth transitions** when new keywords replace old ones
---

## Technology Stack

### Frontend
- **React** (v18.x) - UI framework
- **p5.js** (via react-p5) - Generative art and Perlin noise
- **Framer Motion** - Smooth animations and transitions
- **Web Audio API** - Microphone access
- **WebSocket** - Real-time Deepgram connection
- **CSS3** - Glassmorphism and modern styling

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Groq SDK** - AI model API client
- **Pydantic** - Data validation
- **Python-dotenv** - Environment variable management

### APIs
- **Deepgram API** - Speech-to-text transcription
- **Groq API** - Emotion analysis (Llama 3.3 70B)

---

## Testing Different Emotions

Try saying these phrases to see different visualizations:

- **Sad:** "I'm feeling so down and depressed today"
- **Happy:** "I'm incredibly happy and joyful!"
- **Angry:** "I'm so furious and angry right now!"
- **Calm:** "I feel peaceful and relaxed"
- **Confused:** "I'm so confused and don't understand"
- **Confident:** "I'm confident and determined to succeed!"
- **Love:** "I love this so much, it's amazing!"
- **Surprise:** "Wow! That's so surprising and unexpected!"
- **Fear:** "I'm scared and worried about this"

---

## Async Management

The application handles asynchronous operations carefully to ensure smooth recording, real-time transcription, and AI processing:

### 1. `async/await`

All network requests, including communication with the backend AI processing API (`/process_text`), are handled with `async/await` for predictable sequencing.


### 2. Timed Operations

- **5-second slow response warning:** Shows a message if AI processing exceeds 5 seconds
- **15-second timeout:** Automatically aborts the request if processing takes longer than 15 seconds
- **10-second backend wait:** Before disconnecting on backend failure, the app waits 10 seconds to allow transient network issues to resolve

### 3. Media & WebSocket Monitoring

- A background interval monitors network connectivity and WebSocket state
- Stops recording if connection is lost, preventing unintended behavior
- Monitors every 800ms for real-time detection

### 4. Processing Queue Management

- Incoming transcripts are queued and processed sequentially to avoid race conditions
- Queue processing is paused if already handling an item (`isProcessingRef`) and resumes automatically once ready
- 500ms delay between requests prevents overwhelming the backend

---

## Error Handling

Robust error handling ensures the app recovers gracefully from failures:

### 1. Backend/API Errors

- Catches HTTP failures and aborted fetches
- Provides user feedback for connection issues, timeouts, and other backend failures
- Pre-flight health check (`/health` endpoint) before processing

### 2. Timeout & Abort Handling

- `AbortController` is used to cancel slow requests after 15 seconds
- On timeout, recording is safely stopped and the user is informed
- Backend-side timeout: Groq API calls limited to 10 seconds

### 3. MediaRecorder & WebSocket Errors

- Handles errors while starting/stopping the microphone or WebSocket connections
- On failure, shows an error message and cleans up all resources
- Specific error messages for different microphone issues:
  - `NotAllowedError`: Permission denied
  - `NotFoundError`: No microphone found
  - `NotReadableError`: Microphone in use by another app

### 4. Frontend State Reset

On any error, the application ensures consistent state:
- Stops recording (`setIsRecording(false)`)
- Updates connection status (`setConnectionStatus("disconnected")`)
- Clears processing queue and timers
- Resets emotion and intensity to defaults if AI processing fails
- Cleans up WebSocket, MediaRecorder, and media stream tracks

### 5. User-Friendly Notifications

- Error messages are displayed temporarily and cleared after 3-5 seconds to maintain UI clarity
- Visual feedback with icons (⏳, ❌, 🔌, 🎤)
- Processing indicator shows when backend is analyzing
- Connection status indicator shows when actively connected

---

## Error Scenarios Handled

| Scenario | Detection | User Feedback | Recovery |
|----------|-----------|---------------|----------|
| Backend timeout (>15s) | AbortController | "LLM timed out (>15s)" | Auto-stop, manual restart |
| Backend offline | Health check fails | "Backend not connected" | Auto-stop after 10s |
| Slow API (5-15s) | Timer at 5s | Warning message | Continues normally |
| WiFi disconnect | Network monitor (800ms) | "Lost connection" | Auto-stop, manual restart |
| Mic access denied | NotAllowedError | "Access denied" | User enables permissions |
| WebSocket error | ws.onerror | Connection error | Auto-stop |

---

## Graceful Degradation

**Separation of Concerns:**
- **Transcription** (Deepgram) works independently from **emotion analysis** (backend)
- If backend fails: text still appears on screen, and it stops after 10 seconds.
- App never crashes, always provides user feedback
- Clean resource cleanup on all error paths

---

## Performance Considerations

- **Frame Rate:** Targets 60 FPS
- **Wave Count:** 8-30 depending on intensity
- **API Calls:** Throttled via queue system to prevent overwhelming backend
- **Memory:** Transcript limited to recent lines to prevent memory buildup
- **Render Time:** Each frame renders in ~16ms for smooth 60 FPS

---

## Known Limitations

- Requires stable internet connection for Deepgram and Groq APIs
- Free tier rate limits may apply
- First load on Render may take 30-60 seconds (cold start)
- Microphone access requires HTTPS (except localhost)
- Best performance in Chrome/Edge browsers
- Emotion detection accuracy depends on AI model and speech clarity

---

## Acknowledgments

- **Deepgram** for real-time speech-to-text API
- **Groq** for fast AI inference with Llama 3.3 70B
- **p5.js** for creative coding framework
- **FastAPI** for elegant Python backend framework
- **Render** for free hosting platform
- **Framer Motion** for beautiful React animations

---

