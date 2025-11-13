# Real-Time Audio Sentiment Visualization

A full-stack application that performs real-time audio transcription and visualizes emotional sentiment through generative art powered by Perlin noise.

## 🎥 Live Demo

**Deployed App:** [https://your-app.vercel.app](https://your-app.vercel.app)

## 🚀 Features

- Real-time audio transcription using Deepgram
- Sentiment analysis using Groq AI (Llama 3.3)
- Dynamic Perlin noise visualization with emotion-reactive colors
- Spotify-style scrolling transcript display
- Animated keyword extraction with glassmorphism UI
- Emoji particles flowing through noise fields

## 🛠️ Tech Stack

**Frontend:**
- React
- p5.js (Perlin noise visualization)
- Framer Motion (animations)
- Web Audio API
- WebSocket (Deepgram)

**Backend:**
- FastAPI (Python)
- Groq AI API
- OpenAI-compatible endpoints

**Deployment:**
- Vercel

## 📦 Setup Instructions

### Prerequisites

- Node.js (v14+)
- Python (v3.8+)
- API Keys:
  - [Deepgram API Key](https://console.deepgram.com/)
  - [Groq API Key](https://console.groq.com/)

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
touch .env
```

5. Add your API key to `.env`:
```
GROQ_API_KEY=your-groq-api-key-here
```

6. Run backend:
```bash
uvicorn main:app --reload --port 8000
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update Deepgram API key in `src/App.js` (line 8):
```javascript
const DEEPGRAM_API_KEY = 'your-deepgram-api-key-here';
```

4. Run frontend:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000)

## 🎨 How It Works

1. User clicks "Start Recording"
2. Audio is streamed to Deepgram via WebSocket
3. Transcribed text is sent to backend
4. Groq AI analyzes sentiment and extracts keywords
5. Visualization reacts with:
   - Color shifts (red = negative, blue = neutral, green = positive)
   - Particle speed changes based on intensity
   - Emoji expressions matching emotion
   - Flowing Perlin noise fields

## 📊 Visualization Techniques

- **Multi-layered Perlin Noise**: 3 noise layers at different scales
- **Curl Noise**: Creates swirling, organic flow patterns
- **Particle System**: 4000 particles with individual behaviors
- **Dynamic Color Mapping**: HSB color space for smooth transitions
- **Trailing Effects**: Long-lasting particle trails for fluid appearance

## 🔑 Environment Variables

**Backend (`backend/.env`):**
```
GROQ_API_KEY=your-groq-api-key
```

**Frontend (`frontend/src/App.js`):**
```javascript
const DEEPGRAM_API_KEY = 'your-deepgram-key';
```

## 📝 Notes

- API keys are not included in this repository for security
- Free tier limits: Groq (14,400 tokens/min), Deepgram ($200 credit)
- Browser must support WebSocket and getUserMedia API

## 👤 Author

Your Name - [GitHub Profile](https://github.com/yourusername)

## 📄 License

This project was created as part of a technical assessment.