/**
 * FinalRevealOverlay.jsx - Scene 6: The Heart Opens (Finale)
 * Line-by-line cinematic love letter with user pacing control
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, ChevronRight, Eye, Pause, Play } from 'lucide-react';
import { SCENE_TEXTS } from '../content/protocolData.js';
import { soundEngine } from '../audio/SoundEngine.js';

export function FinalRevealOverlay({ onRestart }) {
  const messages = SCENE_TEXTS.scene5.finalMessages;
  const [visibleCount, setVisibleCount] = useState(1);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto progression with calm, generous pacing
  useEffect(() => {
    if (!autoPlay) return;
    if (visibleCount >= messages.length + 1) return; // +1 for the signoff

    const timer = setTimeout(() => {
      setVisibleCount((prev) => prev + 1);
      soundEngine.playChime(visibleCount);
    }, 4200);

    return () => clearTimeout(timer);
  }, [visibleCount, autoPlay, messages.length]);

  const handleNext = () => {
    if (visibleCount < messages.length + 1) {
      setVisibleCount((prev) => prev + 1);
      soundEngine.playChime(visibleCount);
    }
  };

  const handleShowAll = () => {
    setVisibleCount(messages.length + 1);
    soundEngine.playSecretChime();
  };

  const triggerCelebration = () => {
    soundEngine.playSecretChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#FF173D', '#D5A27C', '#FF4D6D', '#FFFFFF'],
    });
  };

  const isComplete = visibleCount >= messages.length + 1;

  return (
    <div className="finale-overlay-container">
      <div className="finale-scroll-card">
        <div className="hud-badge finale-badge">
          <Sparkles size={13} className="sparkle-spin" />
          <span>PROJECT: POOKIE PROTOCOL // COMPLETED</span>
        </div>

        <div className="finale-message-list">
          {messages.slice(0, visibleCount).map((line, idx) => (
            <p
              key={idx}
              className={`finale-line line-${idx} ${idx === 0 ? 'title-salutation' : ''}`}
            >
              {line}
            </p>
          ))}

          {/* Sincere Signoff */}
          {visibleCount > messages.length && (
            <div className="finale-signoff-block">
              <div className="gold-seal-line" />
              <p className="signoff-note">{SCENE_TEXTS.scene5.signoff1}</p>
              <h3 className="signoff-signature">{SCENE_TEXTS.scene5.signoff2}</h3>
            </div>
          )}
        </div>

        {/* Pacing Controls */}
        <div className="finale-controls-bar">
          {!isComplete ? (
            <div className="pacing-btns">
              <button className="luxury-btn secondary-ghost small-btn" onClick={() => setAutoPlay(!autoPlay)}>
                {autoPlay ? <Pause size={14} /> : <Play size={14} />}
                <span>{autoPlay ? "PAUSE PACING" : "AUTO PLAY"}</span>
              </button>
              <button className="luxury-btn secondary-ghost small-btn" onClick={handleNext}>
                <span>CONTINUE READING</span>
                <ChevronRight size={15} />
              </button>
              <button className="luxury-btn secondary-ghost small-btn" onClick={handleShowAll}>
                <Eye size={14} />
                <span>REVEAL ALL</span>
              </button>
            </div>
          ) : (
            <div className="completed-actions">
              <button
                className="luxury-btn primary-glow celebration-btn"
                onClick={triggerCelebration}
              >
                <Sparkles size={16} />
                <span>SEND STARLIGHT ❤️</span>
              </button>

              <button
                className="luxury-btn secondary-ghost restart-btn"
                onClick={onRestart}
              >
                <RotateCcw size={15} />
                <span>REVISIT FROM THE BEGINNING</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
