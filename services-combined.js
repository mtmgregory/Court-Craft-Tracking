// ========================================
// ENHANCED ANALYTICS SERVICE - PHASE 1
// Phase 1 Features: Trends, Personal Bests, Benchmarks, Advanced Fatigue, Session Quality
// Replace your existing services-combined.js with this file
// ========================================

(function() {
  'use strict';
  
  // ========================================
  // UTILITY HELPERS (Keep existing)
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateLong = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  window.utils = {
    validateRunTime,
    parseRunTime,
    formatRunTime,
    formatDate,
    formatDateLong
  };

  // ========================================
  // FIREBASE SERVICE (Keep existing)
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
  bestLeftTriple: getBest('leftTriple'),      // ADD THIS
  bestRightTriple: getBest('rightTriple'),    // ADD THIS
  bestDoubleTriple: getBest('doubleTriple'),  // ADD THIS
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

    // Main insights calculation
    calculateInsights: function(sessions, playerId) {
      const allSessions = this.getPlayerSessions(sessions, playerId)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
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
      return this.getPlayerSessions(sessions, playerId)
        .slice(0, 10)
        .reverse()
        .map(s => {
          const runTimeSeconds = s.runTime && s.runTime.includes(':') ? parseRunTime(s.runTime) : null;
          return {
            date: formatDate(s.date),
      runTime: s.runTime && s.runTime.includes(':') ? parseRunTime(s.runTime) : null,  // ADDED
      sprint1: s.sprints[0] || 0,
      sprint6: s.sprints[5] || 0,
      leftJump: s.broadJumps.leftSingle,
      rightJump: s.broadJumps.rightSingle
          };
        });
    }
  };

  window.analyticsService = analyticsService;
  console.log('✅ Enhanced Analytics Service loaded (Phase 1)');
})();