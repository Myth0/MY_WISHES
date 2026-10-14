/**
 * ConstellationOverlay.jsx - Scene 4: Constellation of Little Moments
 * HUD, quick selector dock, and luxury memory modal
 */

import React from 'react';
import { X, Sparkles, ArrowRight, HeartHandshake } from 'lucide-react';
import { MEMORY_ORBS } from '../content/protocolData.js';

export function ConstellationOverlay({
  activeOrb,
  onSelectOrb,
  onCloseOrb,
  onProceedToHug
}) {
  return (
    <div className="constellation-overlay-container">
      {/* Top Header */}
      <div className="constellation-hud-header">
        <div className="hud-badge">
          <Sparkles size={13} className="sparkle-spin" />
          <span>CELESTIAL MEMORY FIELD</span>
        </div>
        <h1 className="constellation-title">CONSTELLATION OF LITTLE MOMENTS</h1>
        <p className="constellation-sub">
          Suspended stars carrying messages for every feeling you might encounter.
        </p>
      </div>

      {/* Floating Orb Detail Modal */}
      {activeOrb && (
        <div className="orb-modal-backdrop" onClick={onCloseOrb}>
          <div className="orb-modal-card" onClick={(e) => e.stopPropagation()}>
            <button 
              className="orb-modal-close" 
              onClick={onCloseOrb}
              aria-label="Close memory modal"
            >
              <X size={18} />
            </button>

            <div className="orb-modal-tag-row">
              <span className="orb-modal-index">ORB {activeOrb.index}</span>
              <span className="orb-modal-separator">•</span>
              <span className="orb-modal-tag">{activeOrb.tag}</span>
            </div>

            <h2 className="orb-modal-title">{activeOrb.title}</h2>
            <div className="orb-gold-divider" />

            <blockquote className="orb-modal-message">
              "{activeOrb.message}"
            </blockquote>

            <div className="orb-modal-footer">
              <span className="orb-modal-love">WITH ENDLESS CARE ❤️</span>
              <button className="luxury-btn secondary-ghost small-btn" onClick={onCloseOrb}>
                RETURN TO ORBIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Orb Selector Dock (Bottom) */}
      <div className="orb-selector-dock">
        <div className="dock-hint">SELECT AN ORB IN SPACE OR CHOOSE A CHAPTER:</div>
        <div className="dock-buttons">
          {MEMORY_ORBS.map((orb) => {
            const isSelected = activeOrb && activeOrb.id === orb.id;
            return (
              <button
                key={orb.id}
                className={`dock-orb-btn ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectOrb(orb)}
              >
                <span className="dock-dot" style={{ backgroundColor: orb.color }} />
                <span className="dock-title">{orb.title}</span>
              </button>
            );
          })}
        </div>

        <button
          className="luxury-btn primary-glow proceed-hug-btn"
          onClick={onProceedToHug}
        >
          <HeartHandshake size={16} />
          <span>PROCEED TO THE VIRTUAL HUG</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
