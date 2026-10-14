/**
 * WebGLFallback.jsx - Graceful luxury fallback for systems without WebGL support
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { MEMORY_ORBS } from '../content/protocolData.js';

export function WebGLFallback() {

  return (
    <div className="fallback-container">
      <div className="fallback-content">
        <div className="hud-badge">
          <Sparkles size={14} />
          <span>PROJECT: POOKIE PROTOCOL // COMPATIBILITY MODE</span>
        </div>

        <h1 className="fallback-title">A PRIVATE UNIVERSE FOR MY LITTLE POOKIE</h1>
        <p className="fallback-subtitle">Created with love by YOUR CLOSE ONE</p>

        {/* Animated 2D Glowing Crystal Heart */}
        <div className="fallback-heart-box">
          <div className="fallback-heart-glow" />
          <svg className="fallback-heart-svg" viewBox="0 0 24 24">
            <path
              fill="#FF173D"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
        </div>

        <div className="fallback-messages-section">
          <h2>MESSAGES OF CARE & WARMTH</h2>
          <div className="fallback-cards-grid">
            {MEMORY_ORBS.map((orb) => (
              <div key={orb.id} className="fallback-card">
                <span className="fallback-card-tag">{orb.title}</span>
                <p>"{orb.message}"</p>
              </div>
            ))}
          </div>
        </div>

        <div className="fallback-finale-quote">
          <p className="finale-quote-text">
            "MY LITTLE POOKIE, YOU DON'T HAVE TO BE OKAY EVERY SECOND. JUST TAKE THINGS ONE LITTLE MOMENT AT A TIME."
          </p>
          <span className="finale-quote-signoff">YOUR CLOSE ONE ❤️🔥</span>
        </div>
      </div>
    </div>
  );
}
