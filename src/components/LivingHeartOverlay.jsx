/**
 * LivingHeartOverlay.jsx - Overlays for Scene 2 (Living Heart) and Scene 3 (First Interaction)
 */

import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { SCENE_TEXTS } from '../content/protocolData.js';

export function LivingHeartOverlay({
  scene,
  hasTouchedScene3,
  onTriggerTouch,
  onProceedToNext
}) {
  const isScene2 = scene === 2;
  const isScene3 = scene === 3;

  return (
    <div className="scene-overlay-container">
      {/* Scene 2 Header & Interaction Guide */}
      {isScene2 && (
        <div className="scene2-hud">
          <div className="hud-badge">
            <span className="pulse-dot" />
            <span>HEARTBEAT SYNCHRONIZED</span>
          </div>

          <h1 className="hud-title">THE LIVING HEART</h1>
          <p className="hud-caption">
            Forged in crimson glass & rose gold light. Floating in your personal cosmos.
          </p>

          <div className="hud-hints">
            <div className="hint-pill">
              <span className="pill-dot" />
              <span>HOVER TO AWAKEN</span>
            </div>
            <div className="hint-pill">
              <span className="pill-dot" />
              <span>CLICK TO EMIT ENERGY</span>
            </div>
            <div className="hint-pill">
              <span className="pill-dot" />
              <span>DRAG TO ORBIT</span>
            </div>
          </div>

          <button
            className="luxury-btn primary-glow proceed-btn"
            onClick={onProceedToNext}
          >
            <span>ONE LITTLE TOUCH...</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Scene 3: The First Interaction */}
      {isScene3 && (
        <div className="scene3-hud">
          {!hasTouchedScene3 ? (
            <div className="touch-prompt-box">
              <span className="sub-prompt">{SCENE_TEXTS.scene3.prompt1}</span>
              <h2 className="main-prompt">{SCENE_TEXTS.scene3.prompt2}</h2>

              <button
                className="luxury-btn touch-trigger-btn"
                onClick={onTriggerTouch}
              >
                <Heart className="heart-icon-pulse" size={20} />
                <span>TOUCH THE HEART CORE</span>
              </button>

              <p className="touch-hint">Or click directly on the floating crystal heart</p>
            </div>
          ) : (
            <div className="touch-revealed-box">
              <div className="reveal-tag">TRANSMISSION RECEIVED</div>
              <h2 className="reveal-line-1">{SCENE_TEXTS.scene3.reveal1}</h2>
              <p className="reveal-line-2">{SCENE_TEXTS.scene3.reveal2}</p>

              <button
                className="luxury-btn primary-glow proceed-btn"
                onClick={onProceedToNext}
              >
                <span>EXPLORE THE CONSTELLATION</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
