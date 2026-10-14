/**
 * VirtualHugOverlay.jsx - Scene 5: The Virtual Hug
 * Interactive luxury emotional interface
 */

import React, { useState } from 'react';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { SCENE_TEXTS } from '../content/protocolData.js';

export function VirtualHugOverlay({ onSendHug, onProceedToFinale }) {
  const [hugCount, setHugCount] = useState(0);
  const [isHugging, setIsHugging] = useState(false);

  const handleHugClick = () => {
    setIsHugging(true);
    setHugCount((prev) => prev + 1);
    onSendHug();

    setTimeout(() => {
      setIsHugging(false);
    }, 1800);
  };

  return (
    <div className="hug-overlay-container">
      <div className="hug-card-glass">
        <div className="hud-badge hug-badge">
          <Heart size={13} className="heart-icon-pulse" />
          <span>EMBRACE PROTOCOL ACTIVE</span>
        </div>

        <h1 className="hug-header-title">{SCENE_TEXTS.scene4.line1}</h1>
        <p className="hug-header-sub">{SCENE_TEXTS.scene4.line2}</p>

        <div className="hug-interactive-zone">
          <button
            className={`luxury-btn hug-big-btn ${isHugging ? 'pulsing-hug' : ''}`}
            onClick={handleHugClick}
            disabled={isHugging}
          >
            <Heart size={22} className="hug-heart-icon" />
            <span>{isHugging ? "SENDING WARMTH..." : SCENE_TEXTS.scene4.buttonLabel}</span>
          </button>

          {hugCount > 0 && (
            <div className="hug-responses-box">
              <p className="hug-response-line-1">{SCENE_TEXTS.scene4.response1}</p>
              {hugCount > 1 && (
                <p className="hug-response-line-2">{SCENE_TEXTS.scene4.response2}</p>
              )}
              <div className="hug-counter-badge">
                <Sparkles size={13} />
                <span>TOTAL HUGS DELIVERED: {hugCount}</span>
              </div>
            </div>
          )}
        </div>

        <div className="hug-footer">
          <button
            className="luxury-btn primary-glow proceed-finale-btn"
            onClick={onProceedToFinale}
          >
            <span>THE HEART OPENS (FINALE)</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
