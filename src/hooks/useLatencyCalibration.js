/**
 * useLatencyCalibration.js
 * Hook for measuring and compensating device audio latency
 * Uses tap-to-click timing to calculate offset
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { LATENCY_CONFIG } from '../config/audioConfig.js';
import { audioService } from '../services/AudioService.js';

const STATES = {
  IDLE: 'idle',
  CALIBRATING: 'calibrating',
  COMPLETE: 'complete',
};

export function useLatencyCalibration() {
  // Stored latency offset (persisted)
  const [latencyOffsetMs, setLatencyOffsetMs] = useState(() => {
    try {
      const saved = localStorage.getItem(LATENCY_CONFIG.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed === 'number' ? parsed : LATENCY_CONFIG.defaultOffsetMs;
      }
    } catch (e) {
      console.warn('Failed to load latency offset:', e);
    }
    return LATENCY_CONFIG.defaultOffsetMs;
  });

  // Calibration state
  const [calibrationState, setCalibrationState] = useState(STATES.IDLE);
  const [currentClick, setCurrentClick] = useState(0);
  const [measurements, setMeasurements] = useState([]);
  const [calculatedOffset, setCalculatedOffset] = useState(null);

  // Refs for timing
  const clickScheduledTimeRef = useRef(null);
  const intervalRef = useRef(null);

  // Persist latency offset
  useEffect(() => {
    localStorage.setItem(LATENCY_CONFIG.storageKey, JSON.stringify(latencyOffsetMs));
  }, [latencyOffsetMs]);

  /**
   * Play calibration click and record scheduled time
   */
  const playCalibrationClick = useCallback(() => {
    if (!audioService.context) {
      audioService.init();
    }
    
    // Schedule click slightly in the future for precision
    const scheduledTime = audioService.currentTime + 0.05;
    clickScheduledTimeRef.current = scheduledTime;
    
    // Play a clear, audible click
    audioService.playCountdownBeep(true);
    
    return scheduledTime;
  }, []);

  /**
   * Start calibration session
   */
  const startCalibration = useCallback(async () => {
    // Ensure audio context is ready
    await audioService.resume();
    
    setCalibrationState(STATES.CALIBRATING);
    setCurrentClick(0);
    setMeasurements([]);
    setCalculatedOffset(null);

    // Play first click immediately
    playCalibrationClick();
    setCurrentClick(1);

    // Schedule remaining clicks
    intervalRef.current = setInterval(() => {
      setCurrentClick(prev => {
        const next = prev + 1;
        if (next > LATENCY_CONFIG.calibrationClicks) {
          clearInterval(intervalRef.current);
          return prev;
        }
        playCalibrationClick();
        return next;
      });
    }, LATENCY_CONFIG.calibrationIntervalMs);
  }, [playCalibrationClick]);

  /**
   * Record user tap - called when user taps the button
   */
  const recordTap = useCallback(() => {
    if (calibrationState !== STATES.CALIBRATING) return;
    if (!clickScheduledTimeRef.current) return;

    // Calculate latency: time from scheduled click to user tap
    const tapTime = audioService.currentTime;
    const scheduledTime = clickScheduledTimeRef.current;
    
    // Latency in milliseconds (tap happens after audio plays)
    const latencyMs = (tapTime - scheduledTime) * 1000;

    setMeasurements(prev => {
      const newMeasurements = [...prev, latencyMs];
      
      // Check if we've collected all measurements
      if (newMeasurements.length >= LATENCY_CONFIG.calibrationClicks) {
        // Stop the calibration
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        // Calculate offset, discarding warmup taps
        const validMeasurements = newMeasurements.slice(LATENCY_CONFIG.warmupClicks);
        
        if (validMeasurements.length > 0) {
          // Use median to reduce outlier effect
          const sorted = [...validMeasurements].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          const median = sorted.length % 2 !== 0
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
          
          // Round to nearest integer
          const offset = Math.round(median);
          
          // Clamp to valid range
          const clampedOffset = Math.max(
            LATENCY_CONFIG.minOffsetMs,
            Math.min(LATENCY_CONFIG.maxOffsetMs, offset)
          );
          
          setCalculatedOffset(clampedOffset);
        }
        
        setCalibrationState(STATES.COMPLETE);
      }
      
      return newMeasurements;
    });
  }, [calibrationState]);

  /**
   * Apply the calculated offset
   */
  const applyCalibration = useCallback(() => {
    if (calculatedOffset !== null) {
      setLatencyOffsetMs(calculatedOffset);
    }
    setCalibrationState(STATES.IDLE);
    setMeasurements([]);
    setCalculatedOffset(null);
    setCurrentClick(0);
  }, [calculatedOffset]);

  /**
   * Cancel calibration
   */
  const cancelCalibration = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCalibrationState(STATES.IDLE);
    setMeasurements([]);
    setCalculatedOffset(null);
    setCurrentClick(0);
  }, []);

  /**
   * Reset latency to default
   */
  const resetLatency = useCallback(() => {
    setLatencyOffsetMs(LATENCY_CONFIG.defaultOffsetMs);
    setCalculatedOffset(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    // Current offset value
    latencyOffsetMs,
    
    // Calibration state
    isCalibrating: calibrationState === STATES.CALIBRATING,
    isComplete: calibrationState === STATES.COMPLETE,
    currentClick,
    totalClicks: LATENCY_CONFIG.calibrationClicks,
    measurements,
    calculatedOffset,
    
    // Actions
    startCalibration,
    recordTap,
    applyCalibration,
    cancelCalibration,
    resetLatency,
    
    // Manual set (for advanced users)
    setLatencyOffsetMs,
  };
}

export default useLatencyCalibration;
