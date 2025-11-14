// AuraVisualization.jsx
import React, { useRef, useEffect } from 'react';
import Sketch from 'react-p5';

const AuraVisualization = ({ emotion, intensity }) => {
  const timeRef = useRef(0);

  // Smooth transition targets
  const targetHueRef = useRef(200);
  const currentHueRef = useRef(200);
  const targetFrequencyRef = useRef(0.005);
  const currentFrequencyRef = useRef(0.005);
  const targetAmplitudeRef = useRef(40);
  const currentAmplitudeRef = useRef(40);
  const targetTurbulenceRef = useRef(1);
  const currentTurbulenceRef = useRef(1);
  const targetWaveCountRef = useRef(12);
  const currentWaveCountRef = useRef(12);

  useEffect(() => {
    console.log('🎨 Emotion:', emotion, 'Intensity:', intensity);
  }, [emotion, intensity]);

  // Emotion configuration
  const emotionConfig = {
    sad: {
      emoji: '😢',
      label: 'Sad',
      hue: 10,
      saturation: 75,
      brightness: 70,
      frequency: 0.008,
      amplitude: 70,
      turbulence: 1.8,
      waveCount: 15,
      direction: 1
    },
    happy: {
      emoji: '😊',
      label: 'Happy',
      hue: 125,
      saturation: 65,
      brightness: 80,
      frequency: 0.004,
      amplitude: 40,
      turbulence: 0.6,
      waveCount: 18,
      direction: 0
    },
    angry: {
      emoji: '😡',
      label: 'Angry',
      hue: 5,
      saturation: 90,
      brightness: 85,
      frequency: 0.025,
      amplitude: 80,
      turbulence: 3.0,
      waveCount: 25,
      direction: 0
    },
    calm: {
      emoji: '😌',
      label: 'Calm',
      hue: 200,
      saturation: 40,
      brightness: 75,
      frequency: 0.003,
      amplitude: 30,
      turbulence: 0.4,
      waveCount: 8,
      direction: 0
    },
    confused: {
      emoji: '😕',
      label: 'Confused',
      hue: 280,
      saturation: 50,
      brightness: 65,
      frequency: 0.018,
      amplitude: 60,
      turbulence: 2.2,
      waveCount: 16,
      direction: 0
    },
    confident: {
      emoji: '💪',
      label: 'Confident',
      hue: 48,
      saturation: 75,
      brightness: 85,
      frequency: 0.006,
      amplitude: 50,
      turbulence: 1.0,
      waveCount: 20,
      direction: 0
    },
    love: {
      emoji: '😍',
      label: 'Love',
      hue: 335,
      saturation: 75,
      brightness: 85,
      frequency: 0.005,
      amplitude: 55,
      turbulence: 0.8,
      waveCount: 16,
      direction: 0
    },
    surprise: {
      emoji: '😲',
      label: 'Surprise',
      hue: 58,
      saturation: 80,
      brightness: 88,
      frequency: 0.015,
      amplitude: 70,
      turbulence: 2.0,
      waveCount: 22,
      direction: 0
    },
    fear: {
      emoji: '😰',
      label: 'Fear',
      hue: 270,
      saturation: 60,
      brightness: 60,
      frequency: 0.022,
      amplitude: 65,
      turbulence: 2.5,
      waveCount: 20,
      direction: 0
    }
  };

  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
    canvas.parent(canvasParentRef);
    console.log('✅ Smooth emotion visualization initialized');
  };

  const draw = (p5) => {
    const config = emotionConfig[emotion] || emotionConfig.calm;

    // Smoothly interpolate ALL parameters
    targetHueRef.current = config.hue;
    targetFrequencyRef.current = config.frequency;
    targetAmplitudeRef.current = config.amplitude + (intensity * 40);
    targetTurbulenceRef.current = config.turbulence;
    targetWaveCountRef.current = config.waveCount + Math.floor(intensity * 15);

    currentHueRef.current = p5.lerp(currentHueRef.current, targetHueRef.current, 0.03);
    currentFrequencyRef.current = p5.lerp(currentFrequencyRef.current, targetFrequencyRef.current, 0.03);
    currentAmplitudeRef.current = p5.lerp(currentAmplitudeRef.current, targetAmplitudeRef.current, 0.03);
    currentTurbulenceRef.current = p5.lerp(currentTurbulenceRef.current, targetTurbulenceRef.current, 0.03);
    currentWaveCountRef.current = p5.lerp(currentWaveCountRef.current, targetWaveCountRef.current, 0.05);

    const speed = 0.003 + (intensity * 0.012);
    timeRef.current += speed;

    p5.colorMode(p5.HSB, 360, 100, 100, 1);

    const bgSat = config.saturation * 0.4;
    const bgBright = config.brightness * 0.25;
    p5.background(currentHueRef.current, bgSat, bgBright);

    const numWaves = Math.floor(currentWaveCountRef.current);

    for (let i = 0; i < numWaves; i++) {
      let yBase = (p5.height / (numWaves + 1)) * (i + 1);

      if (emotion === 'sad') {
        yBase += i * 12;
      }

      const progress = i / numWaves;

      const waveHue = currentHueRef.current + p5.map(progress, 0, 1, -15, 15);
      const waveSat = config.saturation;
      const waveBright = config.brightness - p5.map(progress, 0, 1, 15, 0);
      const alpha = p5.map(i, 0, numWaves, 0.4, 0.8);

      for (let layer = 0; layer < 3; layer++) {
        p5.beginShape();
        p5.noFill();
        p5.stroke(waveHue, waveSat, waveBright, alpha * [0.25, 0.55, 0.85][layer]);
        p5.strokeWeight([12, 7, 4][layer]);

        for (let x = 0; x <= p5.width; x += 4) {
          const noise1 = p5.noise(x * 0.002, yBase * 0.01, timeRef.current + i * 0.1);
          const noise2 = p5.noise(x * 0.004, yBase * 0.005, timeRef.current * 1.3 + i * 0.15);
          const noise3 = p5.noise(x * 0.008, yBase * 0.003, timeRef.current * 0.7 + i * 0.2);

          const sineWave = p5.sin(x * currentFrequencyRef.current + timeRef.current + i * 0.3) * currentAmplitudeRef.current;

          const noiseInfluence = (
            (noise1 - 0.5) * 40 * currentTurbulenceRef.current +
            (noise2 - 0.5) * 25 * currentTurbulenceRef.current * 0.7 +
            (noise3 - 0.5) * 15 * currentTurbulenceRef.current * 0.5
          );

          const y = yBase + sineWave + noiseInfluence;

          p5.curveVertex(x, y);
        }

        p5.endShape();
      }
    }

    drawEmotionIndicator(p5, config, intensity);
  };

  const drawEmotionIndicator = (p5, emotionData, intensity) => {
    const centerX = p5.width / 2;
    const centerY = 60;

    p5.fill(0, 0, 0, 0.75);
    p5.noStroke();
    p5.rect(centerX - 150, centerY - 50, 300, 100, 15);

    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textSize(50);
    p5.text(emotionData.emoji, centerX - 60, centerY);

    p5.fill(currentHueRef.current, emotionData.saturation, emotionData.brightness);
    p5.textSize(28);
    p5.textStyle(p5.BOLD);
    p5.text(emotionData.label, centerX + 30, centerY - 10);

    p5.textSize(22);
    p5.textStyle(p5.NORMAL);
    p5.text(`${Math.round(intensity * 100)}%`, centerX + 30, centerY + 20);
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};

export default AuraVisualization;
