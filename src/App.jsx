/**
 * POOKIE PROTOCOL - Main Application Container
 * Orchestrates Three.js 3D viewport and luxury cinematic UI overlays.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { ExperienceController } from './components/ExperienceController.js';
import { AudioController } from './components/AudioController.jsx';
import { SceneStepper } from './components/SceneStepper.jsx';
import { CinematicIntro } from './components/CinematicIntro.jsx';
import { LivingHeartOverlay } from './components/LivingHeartOverlay.jsx';
import { ConstellationOverlay } from './components/ConstellationOverlay.jsx';
import { VirtualHugOverlay } from './components/VirtualHugOverlay.jsx';
import { FinalRevealOverlay } from './components/FinalRevealOverlay.jsx';
import { SecretEasterEggModal } from './components/SecretEasterEggModal.jsx';
import { WebGLFallback } from './components/WebGLFallback.jsx';
import { PROTOCOL_CONFIG } from './content/protocolData.js';
import './App.css';

function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export default function App() {
  const containerRef = useRef(null);
  const controllerRef = useRef(null);

  const [hasWebGL] = useState(checkWebGLSupport);
  const [currentScene, setCurrentScene] = useState(1);
  const [activeOrb, setActiveOrb] = useState(null);
  const [hasTouchedScene3, setHasTouchedScene3] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);

  // Initialize WebGL and Experience Controller
  useEffect(() => {
    if (!hasWebGL) return;

    if (containerRef.current && !controllerRef.current) {
      const controller = new ExperienceController(containerRef.current, {
        onEasterEgg: () => {
          setShowSecretModal(true);
        },
        onOrbSelected: (orbData) => {
          setActiveOrb(orbData);
        },
        onScene3Touch: () => {
          setHasTouchedScene3(true);
        },
      });

      controllerRef.current = controller;
      controller.setScene(1);
    }

    return () => {
      if (controllerRef.current) {
        controllerRef.current.dispose();
        controllerRef.current = null;
      }
    };
  }, [hasWebGL]);

  const handleSelectScene = (sceneNum) => {
    setCurrentScene(sceneNum);
    setActiveOrb(null);
    if (controllerRef.current) {
      controllerRef.current.setScene(sceneNum);
    }
  };

  const handleCompleteIntro = () => {
    handleSelectScene(2);
  };

  const handleScene3Touch = () => {
    setHasTouchedScene3(true);
    if (controllerRef.current) {
      controllerRef.current.triggerHeartInteraction();
    }
  };

  const handleOrbSelectFromDock = (orbData) => {
    setActiveOrb(orbData);
    if (controllerRef.current && controllerRef.current.memoryOrbs) {
      // Find matching orb in 3D group
      const hitOrb = controllerRef.current.memoryOrbs.orbs.find(
        (o) => o.userData.id === orbData.id
      );
      if (hitOrb) {
        const hitSphere = hitOrb.children.find(
          (c) => c.userData && c.userData.isOrbHitTarget
        );
        if (hitSphere) {
          controllerRef.current.memoryOrbs.selectOrb(hitSphere);
        }
      }
    }
  };

  const handleCloseOrb = () => {
    setActiveOrb(null);
    if (controllerRef.current) {
      controllerRef.current.deselectOrb();
    }
  };

  const handleSendHug = () => {
    if (controllerRef.current) {
      controllerRef.current.triggerVirtualHug();
    }
  };

  const handleRestart = () => {
    setHasTouchedScene3(false);
    handleSelectScene(1);
  };

  if (!hasWebGL) {
    return <WebGLFallback />;
  }

  return (
    <div className="experience-wrapper">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="webgl-canvas-container" />

      {/* Persistent Top Header Branding & Audio Controls */}
      <header className="persistent-header">
        <div className="brand-pill">
          <Heart size={14} className="heart-brand-icon" fill="#FF173D" />
          <span className="brand-title">{PROTOCOL_CONFIG.EXPERIENCE_TITLE}</span>
          <span className="brand-divider">/</span>
          <span className="brand-recipient">{PROTOCOL_CONFIG.HER_NICKNAME}</span>
        </div>

        <AudioController />
      </header>

      {/* Main Dynamic Scene Overlays */}
      <main className="scene-content-stage">
        {currentScene === 1 && (
          <CinematicIntro onCompleteIntro={handleCompleteIntro} />
        )}

        {(currentScene === 2 || currentScene === 3) && (
          <LivingHeartOverlay
            scene={currentScene}
            hasTouchedScene3={hasTouchedScene3}
            onTriggerTouch={handleScene3Touch}
            onProceedToNext={() => handleSelectScene(currentScene === 2 ? 3 : 4)}
          />
        )}

        {currentScene === 4 && (
          <ConstellationOverlay
            activeOrb={activeOrb}
            onSelectOrb={handleOrbSelectFromDock}
            onCloseOrb={handleCloseOrb}
            onProceedToHug={() => handleSelectScene(5)}
          />
        )}

        {currentScene === 5 && (
          <VirtualHugOverlay
            onSendHug={handleSendHug}
            onProceedToFinale={() => handleSelectScene(6)}
          />
        )}

        {currentScene === 6 && (
          <FinalRevealOverlay onRestart={handleRestart} />
        )}
      </main>

      {/* Timeline Stepper Navigation (Available after Scene 1 intro) */}
      {currentScene > 1 && (
        <SceneStepper
          currentScene={currentScene}
          onSelectScene={handleSelectScene}
        />
      )}

      {/* Secret Easter Egg Modal */}
      {showSecretModal && (
        <SecretEasterEggModal onClose={() => setShowSecretModal(false)} />
      )}
    </div>
  );
}
