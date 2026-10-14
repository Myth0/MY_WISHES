# 🌌 PROJECT: POOKIE PROTOCOL
### A Real-Time Cinematic 3D Love Experience
*A private universe created by **YOUR CLOSE ONE** for **MY LITTLE POOKIE**.*

---

## 🌹 Overview

**POOKIE PROTOCOL** is an extraordinary real-time 3D interactive web experience designed as a comforting get-well-soon gift. Combining the visual fidelity of a high-end Unreal Engine cinematic with interactive storytelling, physical simulation, and custom GLSL shaders, it serves as a personal sanctuary of warmth and affection.

---

## 🎨 Art Direction

- **Void Black** (`#030305`) & **Obsidian** (`#09090D`)
- **Deep Crimson** (`#790014`) & **Cherry Red** (`#C00028`)
- **Electric Crimson** (`#FF173D`)
- **Subtle Rose Gold** (`#D5A27C`)
- **Warm White** (`#F8EDEF`)

### Atmosphere & Shaders
- **The Living Crystal Heart**: 3D mathematical parametric surface bifurcated into symmetrical halves with internal crystal nucleus, bioluminescent veins (`HeartShader.js`), organic "lub-dub" cardiac contraction cycle, and raycasting interaction.
- **Particle Universe**: Over 4,000 GPU-simulated particles (`ParticleShader.js`) capable of smooth morphing between orbital space dust and a 3D Celestial Rose phyllotaxis in the finale.
- **Falling Rose Petals**: Real-time instanced 3D curved rose petals with chaotic aerodynamic tumbling and sinusoidal wind sway.
- **Cinematic Post-Processing**: Selective `UnrealBloomPass` with dynamic energy spikes, film grain, subtle chromatic aberration, and vignette (`CinematicPass.js`).
- **Web Audio Sound Engine**: Procedural cinematic ambient drone, sub-bass heartbeat thump, harmonic crystal chimes, and warm virtual hug resonance — 100% opt-in and requiring zero external audio downloads.

---

## 🎬 Narrative Progression

1. **Scene One: The Void**
   - Opens in complete darkness. A single red particle ignites at the core.
   - Letter-by-letter typing poetry: *"In a world full of people... there is one person who makes mine different."*
   - Audio opt-in controls and smooth camera dolly toward the distant heart silhouette.

2. **Scene Two: The Living Heart**
   - Cinematic orbit reveals the crystal heart floating in space with volumetric rim highlights.
   - Organic heartbeat, hover curiosity sway, and click shockwave. Limited OrbitControls unlocked.

3. **Scene Three: The First Touch**
   - Interactive celestial energy ring encircles the heart.
   - Touching triggers an intense crimson pulse, radial particle explosion, and transmission: *"If I could, I'd be right there with you. Until then, let me send you a little piece of my world."*

4. **Scene Four: Constellation of Little Moments**
   - 5 luminous 3D crystalline memory orbs float at varied depths around the heart:
     - **ORB 01 — WHEN YOU FEEL TIRED**: *"My little pookie, you don't have to be strong every second. Rest, take your time, and be gentle with yourself."*
     - **ORB 02 — WHEN YOU MISS ME**: *"I wish I could be beside you right now. Until then, imagine me giving you the biggest, warmest hug."*
     - **ORB 03 — WHEN YOU NEED A SMILE**: *"Official Pookie Protocol: You are currently authorized to rest, receive affection, and ignore all unnecessary stress."*
     - **ORB 04 — WHEN YOU FEEL ALONE**: *"Even when we aren't talking, you can still be important to someone. I hope you never forget that you matter to me."*
     - **ORB 05 — WHEN YOU FEEL BETTER**: *"No rush, my love. Take all the time you need. I'll be cheering for every little step toward feeling better."*
   - Clicking any orb initiates a cinematic 3D zoom and opens a frosted obsidian memory card.

5. **Scene Five: The Virtual Hug**
   - Dual curved light ribbons wrap around the heart in an embrace.
   - Interactive button: **SEND ME A VIRTUAL HUG**.
   - Triggers an expanding toroidal energy shockwave, a shower of rose petals and rose-gold particles rushing toward the camera, a warm harmonic audio swell, and reveals: *"One hug from your close one. ❤️ And another one, just in case you need it."* (Repeatable indefinitely).

6. **Scene Six: The Heart Opens (Finale)**
   - The crystal heart slowly and symmetrically parts along the center, revealing a radiant rose-gold crystal nucleus.
   - Streams of starlight ascend from within, morphing into a towering 3D Celestial Rose in the heavens.
   - Cinematic wide-angle camera composition.
   - Line-by-line love letter unfolds with user pacing controls (Auto-play, Pause, Continue, Reveal All), culminating in: *"Made with love, just for you. YOUR CLOSE ONE ❤️🔥"*.

7. **Secret Easter Egg**
   - Rapidly clicking the heart 3 times triggers a secret starburst explosion, audio chime, and unveils the hidden transmission:
     *"You found my little secret. ❤️ If I could put every little reason you make me smile into this universe, there wouldn't be enough stars."*

---

## 🛠️ Project Structure

```
pookie-protocol/
├── public/
│   └── favicon.svg
├── src/
│   ├── audio/
│   │   └── SoundEngine.js         # Procedural Web Audio synthesizer (ambient drone, heartbeat, chimes, hug swell)
│   ├── components/
│   │   ├── AudioController.jsx    # Persistent soundwave visualizer and mute/play toggle
│   │   ├── CinematicIntro.jsx     # Scene 1 void typing sequence & audio opt-in
│   │   ├── ConstellationOverlay.jsx # Scene 4 memory orb cards & dock
│   │   ├── ExperienceController.js # Master Three.js engine & camera choreography
│   │   ├── FinalRevealOverlay.jsx # Scene 6 finale message & starlight burst
│   │   ├── LivingHeart.js         # Symmetrical crystal heart, heartbeat loop, collider
│   │   ├── LivingHeartOverlay.jsx # Scenes 2 & 3 HUD and interaction triggers
│   │   ├── MemoryOrbs.js          # 5 suspended 3D orbs with internal crystals & lights
│   │   ├── ParticleUniverse.js    # GPU particles, rose morphing, falling 3D petals
│   │   ├── SceneStepper.jsx       # Persistent luxury timeline chapter navigation
│   │   ├── SecretEasterEggModal.jsx # 3-click hidden modal
│   │   ├── VirtualHugEffect.js    # Embrace ribbons & expanding shockwave
│   │   ├── VirtualHugOverlay.jsx  # Hug button, haptic feedback, counter
│   │   └── WebGLFallback.jsx      # Luxury animated fallback for non-WebGL devices
│   ├── content/
│   │   └── protocolData.js        # Centralized nicknames, messages, colors, and orbs
│   ├── geometry/
│   │   └── HeartGeometry.js       # Mathematical 3D heart, split halves, and rose phyllotaxis
│   ├── shaders/
│   │   ├── CinematicPass.js       # Vignette, grain, and chromatic aberration
│   │   ├── HeartShader.js         # Vertex cardiac beat, light veins, Fresnel rim
│   │   └── ParticleShader.js      # GPU particles with Gaussian glow falloff
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## 🚀 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Verify Lint & Standards**:
   ```bash
   npm run lint
   ```

---

## 🌐 Deploying to Free Hosting (Vercel / Netlify / GitHub Pages)

### Deploying to Vercel (Recommended):
1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Framework Preset will automatically detect **Vite**.
5. Click **"Deploy"**.
6. You will receive an instant, free **HTTPS shareable URL** to send to your close one!

### Deploying with Vercel CLI directly:
```bash
npx vercel
```

---

## 💌 Personal Customization

To personalize nicknames, colors, or messages, open `src/content/protocolData.js`:
```javascript
export const PROTOCOL_CONFIG = {
  HER_NICKNAME: "MY LITTLE POOKIE",
  MY_NICKNAME: "YOUR CLOSE ONE",
  THEME: "Luxury Black and Crimson",
  EXPERIENCE_TITLE: "POOKIE PROTOCOL",
};
```
All messages, orb titles, and final lines will automatically adapt everywhere in real time.
