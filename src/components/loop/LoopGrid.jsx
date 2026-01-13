/**
 * LoopGrid Component - Loop Mode
 * Subdivision markers (quarters, eighths, triplets) below the staff
 * Enhanced with accessibility features (aria-live, roles)
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { RHYTHM_CONFIG } from '../../config/uiConfig.js';

/**
 * @param {Object} props
 * @param {string} props.subdivision - 'quarter' | 'eighth' | 'triplet' | 'sixteenth'
 * @param {number} props.loopLength - Number of measures (1, 2, 4)
 * @param {number} props.currentBeat - Current beat for highlighting (-1 when not playing)
 */
export default function LoopGrid({ 
  subdivision = 'quarter', 
  loopLength = 1,
  currentBeat = -1,
}) {
  const prevBeatRef = useRef(-1);
  const totalBeats = RHYTHM_CONFIG.beatsPerMeasure * loopLength;

  // Calculate grid lines based on subdivision
  const gridLines = useMemo(() => {
    const beatsPerLoop = RHYTHM_CONFIG.beatsPerMeasure * loopLength;
    const lines = [];
    
    let divisionsPerBeat;
    switch (subdivision) {
      case 'sixteenth': divisionsPerBeat = 4; break;
      case 'triplet': divisionsPerBeat = 3; break;
      case 'eighth': divisionsPerBeat = 2; break;
      case 'quarter':
      default: divisionsPerBeat = 1; break;
    }
    
    const totalDivisions = beatsPerLoop * divisionsPerBeat;
    
    for (let i = 0; i <= totalDivisions; i++) {
      const position = (i / totalDivisions) * 100;
      const beatIndex = Math.floor(i / divisionsPerBeat);
      const isDownbeat = i % (divisionsPerBeat * RHYTHM_CONFIG.beatsPerMeasure) === 0;
      const isBeat = i % divisionsPerBeat === 0;
      const isActive = beatIndex === currentBeat;
      
      lines.push({
        id: i,
        position,
        isDownbeat,
        isBeat,
        isActive,
        beatNumber: isBeat ? (beatIndex % RHYTHM_CONFIG.beatsPerMeasure) + 1 : null,
      });
    }
    
    return lines;
  }, [subdivision, loopLength, currentBeat]);

  // Track beat changes for aria-live announcements
  const beatChanged = currentBeat !== prevBeatRef.current && currentBeat >= 0;
  useEffect(() => {
    prevBeatRef.current = currentBeat;
  }, [currentBeat]);

  // Current beat display (1-indexed)
  const displayBeat = currentBeat >= 0 ? (currentBeat % RHYTHM_CONFIG.beatsPerMeasure) + 1 : 0;
  const displayMeasure = currentBeat >= 0 ? Math.floor(currentBeat / RHYTHM_CONFIG.beatsPerMeasure) + 1 : 0;

  return (
    <div 
      className="relative h-8 w-full"
      role="progressbar"
      aria-valuenow={currentBeat >= 0 ? currentBeat + 1 : 0}
      aria-valuemin={0}
      aria-valuemax={totalBeats}
      aria-label={`Loop progress: beat ${displayBeat} of measure ${displayMeasure}`}
    >
      {/* Accessibility: Screen reader live region for beat announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {beatChanged && currentBeat >= 0 && (
          <span>Beat {displayBeat}</span>
        )}
      </div>

      {/* Grid lines */}
      {gridLines.map((line) => (
        <div
          key={line.id}
          className="absolute bottom-0"
          style={{ left: `${line.position}%` }}
        >
          {/* Tick mark */}
          <div
            className={`
              w-px transition-all duration-100
              ${line.isDownbeat 
                ? 'h-6 bg-[var(--loop-grid-downbeat-color)]' 
                : line.isBeat 
                  ? 'h-4 bg-[var(--loop-grid-tick-color)]'
                  : 'h-2 bg-[var(--color-primary-medium)] opacity-50'
              }
              ${line.isActive ? 'bg-[var(--color-gold)] shadow-sm loop-tick-active' : ''}
            `}
          />
          
          {/* Beat number label */}
          {line.beatNumber && (
            <span
              className={`
                absolute -bottom-5 left-1/2 -translate-x-1/2
                text-xs font-mono transition-all duration-100
                ${line.isActive 
                  ? 'text-[var(--color-gold)] font-bold loop-beat-active' 
                  : 'text-[var(--color-primary-light)] opacity-60'
                }
              `}
              aria-hidden="true"
            >
              {line.beatNumber}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
