import React, { useEffect, useRef } from 'react';
import Sketch from 'react-p5';

const AuraVisualization = ({ sentiment, intensity }) => {
  const particlesRef = useRef([]);
  const timeRef = useRef(0);
  const currentHueRef = useRef(200);
  const noiseScale = 0.004; // Slightly larger for more varied patterns
  
  useEffect(() => {
    console.log('🎨 Sentiment:', sentiment, 'Intensity:', intensity);
  }, [sentiment, intensity]);
  
  const getEmoji = (sentimentValue) => {
    if (sentimentValue < -0.6) return '😢';
    if (sentimentValue < -0.3) return '😔';
    if (sentimentValue < -0.1) return '😕';
    if (sentimentValue < 0.1) return '😐';
    if (sentimentValue < 0.3) return '🙂';
    if (sentimentValue < 0.6) return '😊';
    return '😄';
  };
  
  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
    canvas.parent(canvasParentRef);
    p5.background(20);
    
    // Initialize particles with more varied properties
    particlesRef.current = [];
    for (let i = 0; i < 4000; i++) {
      particlesRef.current.push({
        x: p5.random(p5.width),
        y: p5.random(p5.height),
        prevX: 0,
        prevY: 0,
        alpha: p5.random(0.6, 1.0),
        size: p5.random(0.8, 2.5),
        offset: p5.random(1000), // Unique noise offset for each particle
        speedMult: p5.random(0.7, 1.3), // Individual speed variation
        life: 0 // Track how long particle has existed
      });
    }
    
    console.log('✅ Fluid flow initialized:', particlesRef.current.length, 'particles');
  };

  const draw = (p5) => {
    // Background fade
    let bgHue, bgSat, bgBright;
    
    if (sentiment < -0.1) {
      bgHue = p5.map(sentiment, -1, -0.1, 0, 280);
      bgSat = 35;
      bgBright = 12;
    } else if (sentiment > 0.1) {
      bgHue = p5.map(sentiment, 0.1, 1, 180, 60);
      bgSat = 30;
      bgBright = 15;
    } else {
      bgHue = 200;
      bgSat = 25;
      bgBright = 12;
    }
    
    p5.colorMode(p5.HSB, 360, 100, 100, 1);
    p5.fill(bgHue, bgSat, bgBright, 0.02); // Slightly stronger fade to prevent buildup
    p5.noStroke();
    p5.rect(0, 0, p5.width, p5.height);
    
    // Calculate target color
    let targetHue;
    if (sentiment < -0.1) {
      targetHue = p5.map(sentiment, -1, -0.1, 0, 30);
    } else if (sentiment > 0.1) {
      targetHue = p5.map(sentiment, 0.1, 1, 100, 60);
    } else {
      targetHue = 200;
    }
    
    currentHueRef.current = p5.lerp(currentHueRef.current, targetHue, 0.05);
    
    // Evolve time with some variation
    timeRef.current += 0.003;
    
    const particles = particlesRef.current;
    
    // Draw flowing particle field
    particles.forEach((particle, index) => {
      particle.life++;
      
      // Reset particles that have been alive too long (prevents stuck patterns)
      if (particle.life > 3000) {
        particle.x = p5.random(p5.width);
        particle.y = p5.random(p5.height);
        particle.life = 0;
      }
      
      // ═══════════════════════════════════════════════
      // 🌊 IMPROVED MULTI-LAYERED PERLIN NOISE
      // ═══════════════════════════════════════════════
      
      // Use particle's unique offset to avoid alignment
      const uniqueOffset = particle.offset;
      
      // Layer 1: Large-scale flow
      const noise1 = p5.noise(
        particle.x * noiseScale * 0.5 + uniqueOffset,
        particle.y * noiseScale * 0.5 + uniqueOffset * 0.5,
        timeRef.current * 0.5
      );
      
      // Layer 2: Medium turbulence (different time scale)
      const noise2 = p5.noise(
        particle.x * noiseScale * 1.8 + uniqueOffset * 2,
        particle.y * noiseScale * 1.8 + uniqueOffset * 1.5,
        timeRef.current * 1.5
      );
      
      // Layer 3: Fine detail (fastest time scale)
      const noise3 = p5.noise(
        particle.x * noiseScale * 4 + uniqueOffset * 3,
        particle.y * noiseScale * 4 + uniqueOffset * 2.5,
        timeRef.current * 2.5
      );
      
      // Combine with varied weights
      const combinedNoise = 
        noise1 * 0.4 + 
        noise2 * 0.35 + 
        noise3 * 0.25;
      
      // Curl noise for swirling effect (with unique offsets)
      const curlStrength = 1.5;
      const noiseOffsetX = p5.noise(
        particle.x * noiseScale + 1000 + uniqueOffset,
        particle.y * noiseScale + uniqueOffset * 0.7,
        timeRef.current * 0.8
      );
      
      const noiseOffsetY = p5.noise(
        particle.x * noiseScale + uniqueOffset * 0.7,
        particle.y * noiseScale + 2000 + uniqueOffset,
        timeRef.current * 0.8
      );
      
      // Calculate flow angles with more variation
      const angle1 = combinedNoise * p5.TWO_PI * 4;
      const curlAngle = (noiseOffsetX - noiseOffsetY) * p5.TWO_PI * curlStrength;
      
      // Add slight random perturbation to prevent alignment
      const randomWiggle = (p5.noise(index * 0.1, timeRef.current * 0.1) - 0.5) * 0.3;
      
      const finalAngle = angle1 + curlAngle + randomWiggle;
      
      // ═══════════════════════════════════════════════
      // END PERLIN NOISE
      // ═══════════════════════════════════════════════
      
      // Varied speed per particle
      const baseSpeed = 0.8 + combinedNoise * 0.5;
      const speed = baseSpeed * particle.speedMult * (0.7 + intensity * 0.5);
      
      particle.prevX = particle.x;
      particle.prevY = particle.y;
      
      particle.x += p5.cos(finalAngle) * speed;
      particle.y += p5.sin(finalAngle) * speed;
      
      // Wrap around edges with smooth transition
      const margin = 100;
      if (particle.x < -margin) {
        particle.x = p5.width + margin;
        particle.prevX = particle.x;
      }
      if (particle.x > p5.width + margin) {
        particle.x = -margin;
        particle.prevX = particle.x;
      }
      if (particle.y < -margin) {
        particle.y = p5.height + margin;
        particle.prevY = particle.y;
      }
      if (particle.y > p5.height + margin) {
        particle.y = -margin;
        particle.prevY = particle.y;
      }
      
      // Dynamic color variation
      const hueVariation = p5.map(
        p5.noise(particle.x * 0.002, particle.y * 0.002, timeRef.current * 0.5),
        0, 1, -60, 60
      );
      const hue = (currentHueRef.current + hueVariation + 360) % 360;
      const saturation = p5.map(combinedNoise, 0, 1, 55, 100);
      const brightness = p5.map(combinedNoise, 0, 1, 70, 100);
      
      // Draw multi-layered flowing lines
      // Outer glow
      p5.stroke(hue, saturation * 0.5, brightness, particle.alpha * 0.15);
      p5.strokeWeight(particle.size * 5);
      p5.line(particle.prevX, particle.prevY, particle.x, particle.y);
      
      // Middle layer
      p5.stroke(hue, saturation * 0.7, brightness, particle.alpha * 0.3);
      p5.strokeWeight(particle.size * 2.5);
      p5.line(particle.prevX, particle.prevY, particle.x, particle.y);
      
      // Inner core
      p5.stroke(hue, saturation, brightness, particle.alpha * 0.55);
      p5.strokeWeight(particle.size * 1);
      p5.line(particle.prevX, particle.prevY, particle.x, particle.y);
    });
    
    // Emojis floating in the flow
    const currentEmoji = getEmoji(sentiment);
    
    particles.forEach((particle, index) => {
      if (index % 25 === 0) {
        p5.push();
        p5.translate(particle.x, particle.y);
        
        // Smooth rotation
        const flowAngle = p5.atan2(
          particle.y - particle.prevY,
          particle.x - particle.prevX
        );
        p5.rotate(flowAngle * 0.5); // Gentler rotation
        
        // Emoji glow
        const emojiGlow = 40 + intensity * 30;
        p5.fill(currentHueRef.current, 70, 90, 0.2);
        p5.noStroke();
        p5.circle(0, 0, emojiGlow * 1.3);
        
        p5.fill(currentHueRef.current, 60, 95, 0.12);
        p5.circle(0, 0, emojiGlow * 0.8);
        
        // Draw emoji
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(26);
        p5.fill(255, 255, 255, particle.alpha * 0.95);
        p5.text(currentEmoji, 0, 0);
        
        p5.pop();
      }
    });
    
    // Top indicator
    p5.push();
    p5.textAlign(p5.CENTER);
    
    p5.fill(0, 0, 0, 0.5);
    p5.noStroke();
    p5.rect(p5.width/2 - 100, 30, 200, 60, 10);
    
    p5.textSize(40);
    p5.text(currentEmoji, p5.width/2, 60);
    
    p5.pop();
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};

export default AuraVisualization;