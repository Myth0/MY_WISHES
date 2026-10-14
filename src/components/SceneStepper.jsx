/**
 * SceneStepper.jsx - Minimalist luxury timeline navigation
 */

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SCENES = [
  { id: 1, label: 'THE VOID' },
  { id: 2, label: 'LIVING HEART' },
  { id: 3, label: 'FIRST TOUCH' },
  { id: 4, label: 'CONSTELLATION' },
  { id: 5, label: 'VIRTUAL HUG' },
  { id: 6, label: 'THE REVEAL' },
];

export function SceneStepper({ currentScene, onSelectScene }) {
  const canGoPrev = currentScene > 1;
  const canGoNext = currentScene < SCENES.length;

  return (
    <nav className="scene-stepper-container" aria-label="Cinematic timeline navigation">
      <div className="stepper-glass">
        <button
          className="nav-arrow"
          onClick={() => canGoPrev && onSelectScene(currentScene - 1)}
          disabled={!canGoPrev}
          aria-label="Previous chapter"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="steps-list">
          {SCENES.map((s) => {
            const isActive = s.id === currentScene;
            const isPassed = s.id < currentScene;
            return (
              <button
                key={s.id}
                onClick={() => onSelectScene(s.id)}
                className={`step-btn ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                title={`Jump to Scene ${s.id}: ${s.label}`}
              >
                <span className="step-num">0{s.id}</span>
                <span className="step-name">{s.label}</span>
                <span className="step-glow-indicator" />
              </button>
            );
          })}
        </div>

        <button
          className="nav-arrow"
          onClick={() => canGoNext && onSelectScene(currentScene + 1)}
          disabled={!canGoNext}
          aria-label="Next chapter"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
