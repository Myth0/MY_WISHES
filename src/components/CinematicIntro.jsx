/**
 * CinematicIntro.jsx - Scene 1: The Void
 * 
 * Opens in pitch darkness with a single glowing crimson particle.
 * Types letter-by-letter poetry, offers optional sound opt-in,
 * and initiates the camera dolly toward the floating heart silhouette.
 */

import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { SCENE_TEXTS } from '../content/protocolData.js';
import { soundEngine } from '../audio/SoundEngine.js';

export function CinematicIntro({ onCompleteIntro }) {
  const [stage, setStage] = useState(0); 
  // 0: Darkness + tiny particle, 1: Line 1 typing, 2: Line 2 typing, 3: Silhouette reveal, 4: Enter button
  const [typedLine1, setTypedLine1] = useState('');
  const [typedLine2, setTypedLine2] = useState('');

  const fullLine1 = SCENE_TEXTS.scene1.line1;
  const fullLine2 = SCENE_TEXTS.scene1.line2;

  // Typing effect sequence
  useEffect(() => {
    // Stage 0 -> 1: Particle emerges
    const timer0 = setTimeout(() => {
      setStage(1);
    }, 1200);

    return () => clearTimeout(timer0);
  }, []);

  // Type Line 1
  useEffect(() => {
    if (stage !== 1) return;
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setTypedLine1(fullLine1.slice(0, idx));
      if (idx >= fullLine1.length) {
        clearInterval(interval);
        setTimeout(() => setStage(2), 1400); // Pause before line 2
      }
    }, 65);

    return () => clearInterval(interval);
  }, [stage, fullLine1]);

  // Type Line 2
  useEffect(() => {
    if (stage !== 2) return;
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setTypedLine2(fullLine2.slice(0, idx));
      if (idx >= fullLine2.length) {
        clearInterval(interval);
        setTimeout(() => setStage(3), 2200); // Pause then reveal silhouette
      }
    }, 65);

    return () => clearInterval(interval);
  }, [stage, fullLine2]);

  // Stage 3 to 4: Reveal silhouette & Enter prompt
  useEffect(() => {
    if (stage !== 3) return;
    const timer = setTimeout(() => {
      setStage(4);
    }, 1800);
    return () => clearTimeout(timer);
  }, [stage]);

  const handleEnter = (withAudio = false) => {
    if (withAudio) {
      soundEngine.enable();
      setAudioEnabled(true);
    }
    onCompleteIntro();
  };

  return (
    <div className="void-intro-container">
      {/* Central pulsating seed particle */}
      <div className={`void-seed-particle ${stage >= 1 ? 'ignited' : ''}`}>
        <div className="seed-core" />
        <div className="seed-glow" />
        <div className="seed-wave-1" />
        <div className="seed-wave-2" />
      </div>

      {/* Cinematic Text Block */}
      <div className={`void-text-wrapper ${stage >= 3 ? 'fading-out' : ''}`}>
        {stage >= 1 && (
          <h2 className="void-line void-line-1">
            {typedLine1}
            {stage === 1 && <span className="typing-cursor">|</span>}
          </h2>
        )}

        {stage >= 2 && (
          <h3 className="void-line void-line-2">
            {typedLine2}
            {stage === 2 && <span className="typing-cursor">|</span>}
          </h3>
        )}
      </div>

      {/* Silhouette & Entry Actions */}
      {stage >= 3 && (
        <div className="void-actions-wrapper">
          <p className="void-whisper">
            A PRIVATE UNIVERSE AWAKENS
          </p>

          <div className="void-btn-group">
            <button
              className="luxury-btn primary-glow"
              onClick={() => handleEnter(true)}
            >
              <Volume2 size={16} />
              <span>ENTER WITH CINEMATIC SOUND</span>
            </button>

            <button
              className="luxury-btn secondary-ghost"
              onClick={() => handleEnter(false)}
            >
              <span>ENTER IN SILENCE</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
