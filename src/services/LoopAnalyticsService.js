/**
 * LoopAnalyticsService.js - Loop Practice Analytics
 * Tracks loop practice metrics with localStorage persistence
 */

import { LOOP_ANALYTICS_CONFIG } from '../config/uiConfig.js';

class LoopAnalyticsService {
  constructor() {
    this.storageKey = LOOP_ANALYTICS_CONFIG.storageKey;
    this.maxSessionHistory = LOOP_ANALYTICS_CONFIG.maxSessionHistory;
    this.currentSession = null;
  }

  /**
   * Get stored analytics data
   * @returns {Object} Analytics data
   */
  getData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load loop analytics:', error);
    }
    
    return {
      totalLoops: 0,
      totalPracticeTime: 0, // seconds
      sessions: [],
      lastUpdated: null,
    };
  }

  /**
   * Save analytics data to localStorage
   * @param {Object} data - Data to save
   */
  saveData(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save loop analytics:', error);
    }
  }

  /**
   * Start a new practice session
   */
  startSession() {
    this.currentSession = {
      startTime: Date.now(),
      loopsCompleted: 0,
      totalLoopDuration: 0,
    };
  }

  /**
   * Record a completed loop
   * @param {number} loopDuration - Duration of the loop in seconds
   */
  recordLoopComplete(loopDuration) {
    if (!this.currentSession) {
      this.startSession();
    }
    
    this.currentSession.loopsCompleted += 1;
    this.currentSession.totalLoopDuration += loopDuration;
    
    // Update persistent data
    const data = this.getData();
    data.totalLoops += 1;
    data.totalPracticeTime += loopDuration;
    this.saveData(data);
  }

  /**
   * End the current practice session
   */
  endSession() {
    if (!this.currentSession) return;
    
    const sessionDuration = (Date.now() - this.currentSession.startTime) / 1000;
    
    const session = {
      date: new Date().toISOString(),
      duration: sessionDuration,
      loopsCompleted: this.currentSession.loopsCompleted,
      avgLoopDuration: this.currentSession.loopsCompleted > 0
        ? this.currentSession.totalLoopDuration / this.currentSession.loopsCompleted
        : 0,
    };
    
    // Save session to history
    const data = this.getData();
    data.sessions.unshift(session);
    
    // Trim to max history
    if (data.sessions.length > this.maxSessionHistory) {
      data.sessions = data.sessions.slice(0, this.maxSessionHistory);
    }
    
    this.saveData(data);
    this.currentSession = null;
    
    return session;
  }

  /**
   * Get aggregated statistics
   * @returns {Object} Statistics summary
   */
  getStats() {
    const data = this.getData();
    
    const avgLoopDuration = data.totalLoops > 0
      ? data.totalPracticeTime / data.totalLoops
      : 0;
    
    const recentSessions = data.sessions.slice(0, 7);
    const weeklyLoops = recentSessions.reduce((sum, s) => sum + s.loopsCompleted, 0);
    const weeklyTime = recentSessions.reduce((sum, s) => sum + s.duration, 0);
    
    return {
      totalLoops: data.totalLoops,
      totalPracticeTime: data.totalPracticeTime,
      avgLoopDuration,
      sessionCount: data.sessions.length,
      weeklyLoops,
      weeklyTime,
      lastSession: data.sessions[0] || null,
      currentSession: this.currentSession,
    };
  }

  /**
   * Reset all analytics data
   */
  reset() {
    localStorage.removeItem(this.storageKey);
    this.currentSession = null;
  }
}

// Singleton instance
export const loopAnalyticsService = new LoopAnalyticsService();

export default LoopAnalyticsService;
