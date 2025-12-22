// ========================================
// ENHANCED ANALYTICS SERVICE - COMPLETE
// Includes: Input Validation (#3), Optimized Functions (#5), Date Handling (#6)
// ========================================

(function() {
  'use strict';
  
  // ========================================
  // VALIDATION CONSTANTS & RULES (#3)
  // ========================================
  const VALIDATION_RULES = {
    runTime: {
      regex: /^([0-9]|[0-5][0-9]):([0-5][0-9])$/,
      min: 240, // 4 minutes in seconds
      max: 900, // 15 minutes in seconds
      errorMsg: 'Run time must be in MM:SS format between 04:00 and 15:00'
    },
    broadJump: {
      min: 50,
      max: 500,
      errorMsg: 'Broad jump distance must be between 50cm and 500cm'
    },
    sprint: {
      min: 0,
      max: 60,
      errorMsg: 'Sprint reps must be between 0 and 60'
    }
  };

  // ========================================
  // DATE UTILITIES (#6)
  // ========================================
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseLocalDate = (dateString) => {
    // Parse date string in local timezone (avoid UTC conversion)
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDate = (dateString) => {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatDateLong = (dateString) => {
    const date = parseLocalDate(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  const compareDates = (date1, date2) => {
    // Compare dates without time component
    const d1 = parseLocalDate(date1);
    const d2 = parseLocalDate(date2);
    return d1.getTime() - d2.getTime();
  };

  const isToday = (dateString) => {
    const today = getLocalDateString();
    return dateString === today;
  };

  const isThisWeek = (dateString) => {
    const date = parseLocalDate(dateString);
    const today = new Date();
    const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return date >= weekAgo && date <= today;
  };

  // ========================================
  // RUN TIME UTILITIES
  // ========================================
  const validateRunTime = (timeString) => {
    if (!timeString || !timeString.includes(':')) return false;
    const parts = timeString.split(':');
    if (parts.length !== 2) return false;
    const min = Number(parts[0]);
    const sec = Number(parts[1]);
    return !isNaN(min) && !isNaN(sec) && min >= 0 && sec >= 0 && sec < 60;
  };

  const parseRunTime = (timeString) => {
    if (!validateRunTime(timeString)) return null;
    const parts = timeString.split(':');
    const min = Number(parts[0]);
    const sec = Number(parts[1]);
    return min * 60 + sec;
  };

  const formatRunTime = (seconds) => {
    if (!seconds || seconds <= 0) return 'N/A';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return min + ':' + String(sec).padStart(2, '0');
  };

  // ========================================
  // VALIDATION FUNCTIONS (#3)
  // ========================================
  const validators = {
    // Validate run time format and range
    validateRunTime: function(timeString) {
      if (!timeString || timeString.trim() === '') {
        return { valid: true }; // Allow empty (optional field)
      }

      if (!VALIDATION_RULES.runTime.regex.test(timeString)) {
        return { 
          valid: false, 
          error: VALIDATION_RULES.runTime.errorMsg 
        };
      }

      const [min, sec] = timeString.split(':').map(Number);
      const totalSeconds = min * 60 + sec;

      if (totalSeconds < VALIDATION_RULES.runTime.min || totalSeconds > VALIDATION_RULES.runTime.max) {
        return { 
          valid: false, 
          error: VALIDATION_RULES.runTime.errorMsg 
        };
      }

      return { valid: true };
    },

    // Validate broad jump distance
    validateBroadJump: function(value, fieldName) {
      if (!value || value.trim() === '') {
        return { valid: true }; // Allow empty (optional field)
      }

      const num = parseFloat(value);
      
      if (isNaN(num)) {
        return { 
          valid: false, 
          error: `${fieldName} must be a valid number` 
        };
      }

      if (num < VALIDATION_RULES.broadJump.min || num > VALIDATION_RULES.broadJump.max) {
        return { 
          valid: false, 
          error: `${fieldName}: ${VALIDATION_RULES.broadJump.errorMsg}` 
        };
      }

      return { valid: true };
    },

    // Validate sprint reps
    validateSprint: function(value, fieldName) {
      if (!value || value.trim() === '') {
        return { valid: true }; // Allow empty (optional field)
      }

      const num = parseFloat(value);
      
      if (isNaN(num)) {
        return { 
          valid: false, 
          error: `${fieldName} must be a valid number` 
        };
      }

      if (num < VALIDATION_RULES.sprint.min || num > VALIDATION_RULES.sprint.max) {
        return { 
          valid: false, 
          error: `${fieldName}: ${VALIDATION_RULES.sprint.errorMsg}` 
        };
      }

      // Check for reasonable decimal places (max 1)
      if (num % 1 !== 0 && (num * 10) % 1 !== 0) {
        return { 
          valid: false, 
          error: `${fieldName} can have at most 1 decimal place` 
        };
      }

      return { valid: true };
    },

    // Validate date (#6)
    validateDate: function(dateString) {
      if (!dateString || dateString.trim() === '') {
        return { valid: false, error: 'Date is required' };
      }

      // Check format YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
      }

      const date = parseLocalDate(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return { valid: false, error: 'Invalid date' };
      }

      // Check if date is not in the future
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      if (date > today) {
        return { valid: false, error: 'Date cannot be in the future' };
      }

      // Check if date is not too far in the past (e.g., more than 5 years)
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      
      if (date < fiveYearsAgo) {
        return { valid: false, error: 'Date cannot be more than 5 years in the past' };
      }

      return { valid: true };
    },

    // Validate entire training form
    validateTrainingForm: function(formData) {
      const errors = [];

      // Validate date
      const dateValidation = this.validateDate(formData.date);
      if (!dateValidation.valid) {
        errors.push(dateValidation.error);
      }

      // Validate run time
      const runTimeValidation = this.validateRunTime(formData.runTime);
      if (!runTimeValidation.valid) {
        errors.push(runTimeValidation.error);
      }

      // Validate broad jumps
      const jumpFields = [
        { key: 'leftSingle', name: 'Left Single Jump' },
        { key: 'rightSingle', name: 'Right Single Jump' },
        { key: 'doubleSingle', name: 'Double Single Jump' },
        { key: 'leftTriple', name: 'Left Triple Jump' },
        { key: 'rightTriple', name: 'Right Triple Jump' },
        { key: 'doubleTriple', name: 'Double Triple Jump' }
      ];

      jumpFields.forEach(field => {
        const validation = this.validateBroadJump(formData[field.key], field.name);
        if (!validation.valid) {
          errors.push(validation.error);
        }
      });

      // Validate sprints
      for (let i = 1; i <= 6; i++) {
        const validation = this.validateSprint(formData[`sprint${i}`], `Sprint Set ${i}`);
        if (!validation.valid) {
          errors.push(validation.error);
        }
      }

      // Check if at least one metric is filled
      const hasRunTime = formData.runTime && formData.runTime.trim() !== '';
      const hasJumps = jumpFields.some(field => formData[field.key] && formData[field.key].trim() !== '');
      const hasSprints = Array.from({length: 6}, (_, i) => formData[`sprint${i + 1}`])
        .some(sprint => sprint && sprint.trim() !== '');

      if (!hasRunTime && !hasJumps && !hasSprints) {
        errors.push('Please enter at least one metric (run time, jumps, or sprints)');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    },

    // Validate player name
    validatePlayerName: function(name) {
      if (!name || name.trim() === '') {
        return { valid: false, error: 'Player name is required' };
      }

      if (name.trim().length < 2) {
        return { valid: false, error: 'Player name must be at least 2 characters' };
      }

      if (name.trim().length > 50) {
        return { valid: false, error: 'Player name must be less than 50 characters' };
      }

      // Check for invalid characters
      if (!/^[a-zA-Z0-9\s\-']+$/.test(name)) {
        return { valid: false, error: 'Player name contains invalid characters' };
      }

      return { valid: true };
    }
  };

  // Export utilities
  window.utils = {
    validateRunTime,
    parseRunTime,
    formatRunTime,
    formatDate,
    formatDateLong,
    getLocalDateString,
    parseLocalDate,
    compareDates,
    isToday,
    isThisWeek,
    validators
  };

  // ========================================
  // FIREBASE SERVICE
  // ========================================
  const firebaseService = {
    loadPlayers: async function() {
      const db = window.db;
      if (!db) throw new Error('Firebase not initialized');
      
      const snapshot = await db.collection('players').orderBy('name').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        createdAt: doc.data().createdAt
      }));
    },

    loadSessions: async function() {
      const db = window.db;
      if (!db) throw new Error('Firebase not initialized');
      
      const snapshot = await db.collection('training_sessions').orderBy('date', 'desc').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        playerId: doc.data().playerId,
        playerName: doc.data().playerName,
        date: doc.data().date,
        runTime: doc.data().runTime,
        broadJumps: doc.data().broadJumps,
        sprints: doc.data().sprints,
        createdAt: doc.data().createdAt
      }));
    },

    addPlayer: async function(name) {
      const db = window.db;
      if (!db) throw new Error('Firebase not initialized');
      
      const newPlayer = {
        name: name.trim(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      const docRef = await db.collection('players').add(newPlayer);
      return { id: docRef.id, name: newPlayer.name };
    },

    addSession: async function(sessionData) {
      const db = window.db;
      if (!db) throw new Error('Firebase not initialized');
      
      const session = {
        playerId: sessionData.playerId,
        playerName: sessionData.playerName,
        date: sessionData.date,
        runTime: sessionData.runTime,
        broadJumps: sessionData.broadJumps,
        sprints: sessionData.sprints,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      const docRef = await db.collection('training_sessions').add(session);
      return { id: docRef.id, ...session };
    }
  };

  window.firebaseService = firebaseService;

  // ========================================
  // ENHANCED ANALYTICS SERVICE
  // ========================================
  const analyticsService = {
    // Sport-specific benchmark standards
    benchmarks: {
      runTime: { elite: 420, good: 450, average: 480, poor: 540 },
      broadJump: { elite: 260, good: 240, average: 220, poor: 200 },
      sprint: { elite: 32, good: 28, average: 24, poor: 20 },
      jumpBalance: { elite: 95, good: 90, average: 85, poor: 75 },
      fatigue: { elite: -5, good: -10, average: -15, poor: -20 }
    },

    // Classify performance against benchmarks
    classifyPerformance: function(value, metric, lowerIsBetter = false) {
      const bench = this.benchmarks[metric];
      if (!bench) return { level: 'Unknown', color: '#6b7280' };

      let level, color;
      
      if (lowerIsBetter) {
        if (value <= bench.elite) { level = 'Elite'; color = '#10b981'; }
        else if (value <= bench.good) { level = 'Good'; color = '#3b82f6'; }
        else if (value <= bench.average) { level = 'Average'; color = '#f59e0b'; }
        else { level = 'Needs Work'; color = '#ef4444'; }
      } else {
        if (value >= bench.elite) { level = 'Elite'; color = '#10b981'; }
        else if (value >= bench.good) { level = 'Good'; color = '#3b82f6'; }
        else if (value >= bench.average) { level = 'Average'; color = '#f59e0b'; }
        else { level = 'Needs Work'; color = '#ef4444'; }
      }

      return { level, color };
    },

    // Track personal bests
    getPersonalBests: function(sessions) {
      if (sessions.length === 0) return null;

      const validRunTimes = sessions
        .filter(s => s.runTime && s.runTime.includes(':'))
        .map(s => ({ time: parseRunTime(s.runTime), timeStr: s.runTime, date: s.date }))
        .filter(s => s.time !== null)
        .sort((a, b) => a.time - b.time);

      const getBest = (field) => sessions
        .filter(s => s.broadJumps[field] > 0)
        .map(s => ({ value: s.broadJumps[field], date: s.date }))
        .sort((a, b) => b.value - a.value)[0];

      const allSprints = sessions
        .flatMap(s => s.sprints.filter(sp => sp > 0).map(sp => ({ value: sp, date: s.date })))
        .sort((a, b) => b.value - a.value);

      return {
        bestRunTime: validRunTimes[0] || null,
        bestLeftJump: getBest('leftSingle'),
        bestRightJump: getBest('rightSingle'),
        bestDoubleJump: getBest('doubleSingle'),
        bestLeftTriple: getBest('leftTriple'),
        bestRightTriple: getBest('rightTriple'),
        bestDoubleTriple: getBest('doubleTriple'),
        bestSprint: allSprints[0] || null
      };
    },

    // Calculate performance trends
    calculateTrend: function(recent, all, metric) {
      if (recent.length < 2) return { change: 0, arrow: '→', isImproving: null };

      let recentAvg, overallAvg;

      if (metric === 'runTime') {
        const getTimes = (sessions) => sessions
          .filter(s => s.runTime && s.runTime.includes(':'))
          .map(s => parseRunTime(s.runTime))
          .filter(t => t !== null);
        
        const recentTimes = getTimes(recent);
        const allTimes = getTimes(all);

        if (recentTimes.length === 0 || allTimes.length === 0) {
          return { change: 0, arrow: '→', isImproving: null };
        }

        recentAvg = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
        overallAvg = allTimes.reduce((a, b) => a + b, 0) / allTimes.length;

        const change = ((recentAvg - overallAvg) / overallAvg) * 100;
        const isImproving = change < 0;

        return {
          change: Math.abs(change).toFixed(1),
          arrow: isImproving ? '↓' : (change > 0 ? '↑' : '→'),
          isImproving: change !== 0 ? isImproving : null
        };
      } 
      
      if (metric === 'jumpBalance') {
        const getBalance = (sessions) => sessions
          .map(s => {
            const left = s.broadJumps.leftSingle;
            const right = s.broadJumps.rightSingle;
            return (left > 0 && right > 0) ? (Math.min(left, right) / Math.max(left, right)) * 100 : null;
          })
          .filter(b => b !== null);

        const recentBalance = getBalance(recent);
        const allBalance = getBalance(all);

        if (recentBalance.length === 0 || allBalance.length === 0) {
          return { change: 0, arrow: '→', isImproving: null };
        }

        recentAvg = recentBalance.reduce((a, b) => a + b, 0) / recentBalance.length;
        overallAvg = allBalance.reduce((a, b) => a + b, 0) / allBalance.length;

        const change = ((recentAvg - overallAvg) / overallAvg) * 100;
        const isImproving = change > 0;

        return {
          change: Math.abs(change).toFixed(1),
          arrow: isImproving ? '↑' : (change < 0 ? '↓' : '→'),
          isImproving: change !== 0 ? isImproving : null
        };
      }

      return { change: 0, arrow: '→', isImproving: null };
    },

    // Advanced fatigue analysis
    analyzeFatigue: function(sessions) {
      const fatigueData = sessions.map(session => {
        const sprints = session.sprints.filter(sp => sp > 0);
        if (sprints.length < 2) return null;

        const first = sprints[0];
        const last = sprints[sprints.length - 1];
        const peak = Math.max(...sprints);
        
        return {
          dropoff: ((last - first) / first) * 100,
          consistency: (Math.min(...sprints) / Math.max(...sprints)) * 100,
          peakPosition: sprints.indexOf(peak) + 1,
          date: session.date
        };
      }).filter(f => f !== null);

      if (fatigueData.length === 0) {
        return {
          avgDropoff: 0,
          avgConsistency: 0,
          fatigueResistance: 'N/A',
          peakTiming: 'N/A',
          recommendation: 'Need more data',
          classification: { level: 'N/A', color: '#6b7280' }
        };
      }

      const avgDropoff = fatigueData.reduce((a, b) => a + b.dropoff, 0) / fatigueData.length;
      const avgConsistency = fatigueData.reduce((a, b) => a + b.consistency, 0) / fatigueData.length;
      const avgPeak = fatigueData.reduce((a, b) => a + b.peakPosition, 0) / fatigueData.length;

      let resistance, rec;
      if (avgDropoff > -5) {
        resistance = 'Excellent';
        rec = 'Maintaining peak performance throughout sets';
      } else if (avgDropoff > -10) {
        resistance = 'Good';
        rec = 'Strong endurance with minimal decline';
      } else if (avgDropoff > -15) {
        resistance = 'Average';
        rec = 'Consider conditioning work to reduce fatigue';
      } else {
        resistance = 'Poor';
        rec = 'Focus on endurance and recovery training';
      }

      return {
        avgDropoff: avgDropoff.toFixed(1),
        avgConsistency: avgConsistency.toFixed(1),
        fatigueResistance: resistance,
        peakTiming: avgPeak.toFixed(1),
        recommendation: rec,
        classification: this.classifyPerformance(avgDropoff, 'fatigue', true)
      };
    },

    // Calculate session quality score (0-100)
    calculateSessionQuality: function(session) {
      let total = 0, components = 0;

      // Run time (30 pts)
      if (session.runTime && session.runTime.includes(':')) {
        const time = parseRunTime(session.runTime);
        if (time) {
          const b = this.benchmarks.runTime;
          let score = time <= b.elite ? 30 : time <= b.good ? 25 : time <= b.average ? 20 : 15;
          total += score;
          components++;
        }
      }

      // Jumps (30 pts)
      const jumps = [session.broadJumps.leftSingle, session.broadJumps.rightSingle, session.broadJumps.doubleSingle]
        .filter(j => j > 0);
      if (jumps.length > 0) {
        const avg = jumps.reduce((a, b) => a + b, 0) / jumps.length;
        const b = this.benchmarks.broadJump;
        let score = avg >= b.elite ? 30 : avg >= b.good ? 25 : avg >= b.average ? 20 : 15;
        total += score;
        components++;
      }

      // Sprints (20 pts)
      const sprints = session.sprints.filter(s => s > 0);
      if (sprints.length > 0) {
        const avg = sprints.reduce((a, b) => a + b, 0) / sprints.length;
        const b = this.benchmarks.sprint;
        let score = avg >= b.elite ? 20 : avg >= b.good ? 17 : avg >= b.average ? 14 : 10;
        total += score;
        components++;
      }

      // Balance (10 pts)
      if (session.broadJumps.leftSingle > 0 && session.broadJumps.rightSingle > 0) {
        const balance = (Math.min(session.broadJumps.leftSingle, session.broadJumps.rightSingle) / 
                        Math.max(session.broadJumps.leftSingle, session.broadJumps.rightSingle)) * 100;
        const b = this.benchmarks.jumpBalance;
        let score = balance >= b.elite ? 10 : balance >= b.good ? 8 : balance >= b.average ? 6 : 4;
        total += score;
        components++;
      }

      // Fatigue (10 pts)
      if (sprints.length >= 2) {
        const dropoff = ((sprints[sprints.length - 1] - sprints[0]) / sprints[0]) * 100;
        const b = this.benchmarks.fatigue;
        let score = dropoff >= b.elite ? 10 : dropoff >= b.good ? 8 : dropoff >= b.average ? 6 : 4;
        total += score;
        components++;
      }

      const maxScore = components * 20;
      const finalScore = components > 0 ? Math.round((total / maxScore) * 100) : 0;

      let rating, color;
      if (finalScore >= 85) { rating = 'Excellent'; color = '#10b981'; }
      else if (finalScore >= 70) { rating = 'Good'; color = '#3b82f6'; }
      else if (finalScore >= 55) { rating = 'Average'; color = '#f59e0b'; }
      else { rating = 'Below Average'; color = '#ef4444'; }

      return { score: finalScore, rating, color, components };
    },

    // Main insights calculation - OPTIMIZED (#5)
    calculateInsights: function(playerSessions, playerId) {
      // playerSessions is already filtered, no need to filter again
      const allSessions = playerSessions.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      if (allSessions.length === 0) {
        return {
          avgRunTime: 'N/A',
          jumpBalance: 'N/A',
          fatigueDropoff: 'N/A',
          totalSessions: 0
        };
      }

      const recent = allSessions.slice(-5);
      const hasHistory = allSessions.length > 5;

      // Run time metrics
      const validTimes = allSessions
        .map(s => s.runTime)
        .filter(t => t && t.includes(':'))
        .map(t => parseRunTime(t))
        .filter(t => t !== null);

      const avgTime = validTimes.length > 0
        ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length
        : null;

      // Jump balance
      const leftJumps = allSessions.map(s => s.broadJumps.leftSingle).filter(j => j > 0);
      const rightJumps = allSessions.map(s => s.broadJumps.rightSingle).filter(j => j > 0);
      
      const avgLeft = leftJumps.length > 0 ? leftJumps.reduce((a, b) => a + b, 0) / leftJumps.length : 0;
      const avgRight = rightJumps.length > 0 ? rightJumps.reduce((a, b) => a + b, 0) / rightJumps.length : 0;
      
      const balancePercent = (avgLeft > 0 && avgRight > 0)
        ? (Math.min(avgLeft, avgRight) / Math.max(avgLeft, avgRight)) * 100
        : 0;

      // Quality scores
      const qualities = allSessions.map(s => this.calculateSessionQuality(s));
      const avgQuality = qualities.length > 0
        ? Math.round(qualities.reduce((a, b) => a + b.score, 0) / qualities.length)
        : 0;

      return {
        totalSessions: allSessions.length,
        
        // Core metrics
        avgRunTime: avgTime ? formatRunTime(avgTime) : 'N/A',
        avgRunTimeSeconds: avgTime,
        jumpBalance: balancePercent > 0 ? Math.round(balancePercent) + '%' : 'N/A',
        jumpBalancePercent: balancePercent,
        fatigueDropoff: this.analyzeFatigue(allSessions).avgDropoff + '%',
        
        // Trends
        runTimeTrend: hasHistory ? this.calculateTrend(recent, allSessions, 'runTime') : { change: 0, arrow: '→', isImproving: null },
        jumpBalanceTrend: hasHistory ? this.calculateTrend(recent, allSessions, 'jumpBalance') : { change: 0, arrow: '→', isImproving: null },
        
        // Personal bests
        personalBests: this.getPersonalBests(allSessions),
        
        // Benchmarks
        runTimeBenchmark: avgTime ? this.classifyPerformance(avgTime, 'runTime', true) : { level: 'N/A', color: '#6b7280' },
        jumpBenchmark: (avgLeft > 0 || avgRight > 0) ? this.classifyPerformance(Math.max(avgLeft, avgRight), 'broadJump', false) : { level: 'N/A', color: '#6b7280' },
        balanceBenchmark: balancePercent > 0 ? this.classifyPerformance(balancePercent, 'jumpBalance', false) : { level: 'N/A', color: '#6b7280' },
        
        // Fatigue
        fatigueMetrics: this.analyzeFatigue(allSessions),
        
        // Session quality
        avgQualityScore: avgQuality,
        qualityRating: avgQuality >= 85 ? 'Excellent' : avgQuality >= 70 ? 'Good' : avgQuality >= 55 ? 'Average' : 'Below Average'
      };
    },

    // Helper methods
    getPlayerSessions: function(sessions, playerId) {
      return sessions.filter(s => s.playerId === playerId);
    },

    getChartData: function(sessions, playerId) {
  const playerSessions = this.getPlayerSessions(sessions, playerId)
    .slice(-10);  // ← Change slice(0, 10) to slice(-10) to get last 10 sessions
  
  // Separate data arrays for each metric
  const runTimeData = [];
  const sprintData = [];
  const singleJumpData = [];
  const tripleJumpData = [];
  
  playerSessions.forEach(s => {
    const date = formatDate(s.date);
    
    // Only include run time if recorded
    if (s.runTime && s.runTime.includes(':')) {
      const time = parseRunTime(s.runTime);
      if (time !== null) {
        runTimeData.push({ date, runTime: time });
      }
    }
    
    // Only include sprints if both first and last are recorded
    if (s.sprints[0] > 0 && s.sprints[5] > 0) {
      sprintData.push({
        date,
        sprint1: s.sprints[0],
        sprint6: s.sprints[5]
      });
    }
    
    // Only include single jumps if at least one is recorded
    if (s.broadJumps.leftSingle > 0 || s.broadJumps.rightSingle > 0 || s.broadJumps.doubleSingle > 0) {
      singleJumpData.push({
        date,
        leftJump: s.broadJumps.leftSingle || null,
        rightJump: s.broadJumps.rightSingle || null,
        doubleJump: s.broadJumps.doubleSingle || null
      });
    }
    
    // Only include triple jumps if at least one is recorded
    if (s.broadJumps.leftTriple > 0 || s.broadJumps.rightTriple > 0 || s.broadJumps.doubleTriple > 0) {
      tripleJumpData.push({
        date,
        leftTriple: s.broadJumps.leftTriple || null,
        rightTriple: s.broadJumps.rightTriple || null,
        doubleTriple: s.broadJumps.doubleTriple || null
      });
    }
  });
  
  return {
    runTime: runTimeData,
    sprint: sprintData,
    singleJump: singleJumpData,
    tripleJump: tripleJumpData
  };
}
  };

  window.analyticsService = analyticsService;
  console.log('✅ Enhanced Analytics Service loaded (Phase 1)');
})();