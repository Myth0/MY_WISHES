/**
 * AudioController.jsx - Elegant Persistent Sound Toggle
 * Opt-in procedural audio with luxury soundwave visualizer
 */

import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine.js';

export function AudioController() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const toggleSound = () => {
    if (!isPlaying) {
      soundEngine.enable();
      setIsPlaying(true);
      setIsMuted(false);
    } else {
      const muted = soundEngine.toggleMute();
      setIsMuted(muted);
    }
  };

  return (
    <div className="audio-controller-wrapper">
      <button 
        onClick={toggleSound}
        className={`audio-btn ${isPlaying && !isMuted ? 'active' : ''}`}
        aria-label="Toggle cinematic audio"
        title={!isPlaying ? "Enable Cinematic Audio" : (isMuted ? "Unmute Audio" : "Mute Audio")}
      >
        <div className="audio-icon-box">
          {isPlaying && !isMuted ? (
            <Volume2 className="icon" size={17} />
          ) : (
            <VolumeX className="icon" size={17} />
          )}
        </div>

        <div className="audio-visualizer">
          <span className={`bar bar-1 ${isPlaying && !isMuted ? 'animating' : ''}`} />
          <span className={`bar bar-2 ${isPlaying && !isMuted ? 'animating' : ''}`} />
          <span className={`bar bar-3 ${isPlaying && !isMuted ? 'animating' : ''}`} />
          <span className={`bar bar-4 ${isPlaying && !isMuted ? 'animating' : ''}`} />
        </div>

        <span className="audio-label">
          {!isPlaying ? 'AUDIO: OFF' : (isMuted ? 'MUTED' : 'ATMOSPHERE')}
        </span>
      </button>
    </div>
  );
}
