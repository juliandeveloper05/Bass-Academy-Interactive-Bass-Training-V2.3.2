/**
 * UI Configuration - Bass Trainer
 * Centralized UI constants
 */

// Countdown settings
export const COUNTDOWN_CONFIG = {
  duration: 3, // seconds
  interval: 1000, // ms between ticks
};

// Beat & rhythm settings
export const RHYTHM_CONFIG = {
  beatsPerMeasure: 4,
  tripletsPerBeat: 3,
  notesPerMeasure: 12, // 4 beats × 3 triplets
};

// View modes
export const VIEW_MODES = {
  TAB: 'tab',
  FRETBOARD: 'fretboard',
  LOOP: 'loop',
};

// Loop Mode Configuration
export const LOOP_MODE_CONFIG = {
  defaultLoopLength: 1,        // measures
  maxLoopLength: 4,
  subdivisions: ['quarter', 'eighth', 'triplet', 'sixteenth'],
  defaultSubdivision: 'eighth',
  playheadColor: 'var(--color-gold)',
  ghostNoteOpacity: 0.25,
  accentScale: 1.1,
};

// Theme settings
export const THEME_CONFIG = {
  storageKey: 'bass-trainer-theme',
  default: 'dark',
  options: ['dark', 'light', 'practice'],
};

// Power Saving / Battery Mode
export const POWER_SAVING_CONFIG = {
  storageKey: 'bass-trainer-power-saving',
  batteryThreshold: 0.2, // 20% battery triggers low-power mode
  rafThrottleMs: 100,    // Throttle rAF to ~10fps in power saving
  disableParticles: true,
  disableAnimations: true,
};

// Pop-out Window Configuration
export const POPOUT_CONFIG = {
  width: 900,
  height: 550,
  features: 'toolbar=no,location=no,status=no,menubar=no,resizable=yes,scrollbars=yes',
};

// Loop Mode Pedagogical Presets
export const LOOP_PRESETS = {
  beginner: {
    id: 'beginner',
    name: 'Principiante',
    icon: '🌱',
    tempo: 60,
    loopLength: 1,
    subdivision: 'quarter',
    description: 'Tempo lento, 1 compás, negras. Ideal para empezar.',
  },
  intermediate: {
    id: 'intermediate',
    name: 'Intermedio',
    icon: '🎵',
    tempo: 80,
    loopLength: 2,
    subdivision: 'eighth',
    description: 'Tempo moderado, 2 compases, corcheas.',
  },
  advanced: {
    id: 'advanced',
    name: 'Avanzado',
    icon: '🔥',
    tempo: 100,
    loopLength: 4,
    subdivision: 'triplet',
    description: 'Tempo rápido, 4 compases, tresillos.',
  },
  custom: {
    id: 'custom',
    name: 'Personalizado',
    icon: '⚙️',
    tempo: null, // User-defined
    loopLength: null,
    subdivision: null,
    description: 'Configura tus propios ajustes.',
  },
};

// Loop Analytics Configuration
export const LOOP_ANALYTICS_CONFIG = {
  storageKey: 'bass-trainer-loop-analytics',
  maxSessionHistory: 30, // Keep last 30 sessions
};
