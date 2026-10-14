/**
 * SecretEasterEggModal.jsx - Secret Modal triggered by 3 consecutive heart clicks
 */

import React from 'react';
import { Sparkles, Heart, X } from 'lucide-react';
import { SCENE_TEXTS } from '../content/protocolData.js';

export function SecretEasterEggModal({ onClose }) {
  return (
    <div className="secret-modal-backdrop" onClick={onClose}>
      <div className="secret-modal-card" onClick={(e) => e.stopPropagation()}>
        <button 
          className="secret-modal-close" 
          onClick={onClose}
          aria-label="Close secret modal"
        >
          <X size={18} />
        </button>

        <div className="secret-badge">
          <Sparkles size={14} className="sparkle-spin" />
          <span>HIDDEN CONSTELLATION DISCOVERED</span>
        </div>

        <h2 className="secret-title">{SCENE_TEXTS.secret.line1}</h2>
        <div className="secret-gold-divider" />

        <p className="secret-body">
          "{SCENE_TEXTS.secret.line2}"
        </p>

        <div className="secret-footer">
          <button className="luxury-btn primary-glow secret-action-btn" onClick={onClose}>
            <Heart size={16} fill="#FF173D" />
            <span>KEEP THIS CLOSE TO MY HEART</span>
          </button>
        </div>
      </div>
    </div>
  );
}
