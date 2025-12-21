// ========================================
// COMBINED SERVICES FILE
// All utility functions and services in one file
// ========================================

// ========================================
// UTILITY HELPERS
// ========================================
(function() {
  'use strict';
  
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
    validateRunTime: validateRunTime,
    parseRunTime: parseRunTime,
    formatRunTime: formatRunTime,
    formatDate: formatDate,
    formatDateLong: formatDateLong
  };
  
  console.log('✅ Utils loaded');
})();

// ========================================
// FIREBASE SERVICE
// ========================================
(function() {
  'use strict';
  
  const firebaseService = {
    // Load all players
    loadPlayers: async function() {
      const db = window.db;
      if (!db) throw new Error('Firebase not initialized');
      
      const snapshot = await db.collection('players')
        .orderBy('name')
        .get();
      
      return snapshot.docs.map(function(doc) {
        return {
          id: doc.id,
          name: doc.data().name,
          createdAt: doc.data().createdAt
        };
      });
    },

    // Load all training sessions
    loadSessions: async function() {
      const db = window.db;
      if (!db) throw new Error('Firebase not initialized');
      
      const snapshot = await db.collection('training_sessions')
        .orderBy('date', 'desc')
        .get();
      
      return snapshot.docs.map(function(doc) {
        return {
          id: doc.id,
          playerId: doc.data().playerId,
          playerName: doc.data().playerName,
          date: doc.data().date,
          runTime: doc.data().runTime,
          broadJumps: doc.data().broadJumps,
          sprints: doc.data().sprints,
          createdAt: doc.data().createdAt
        };
      });
    },

    // Add a new player
    addPlayer: async function(name) {
      const db = window.db;
      if (!db) throw new Error('Firebase not initialized');
      
      const newPlayer = {
        name: name.trim(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('players').add(newPlayer);
      
      return {
        id: docRef.id,
        name: newPlayer.name
      };
    },

    // Add a training session
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
      
      return {
        id: docRef.id,
        playerId: session.playerId,
        playerName: session.playerName,
        date: session.date,
        runTime: session.runTime,
        broadJumps: session.broadJumps,
        sprints: session.sprints
      };
    },

    // Delete a player
    deletePlayer: async function(playerId) {
      const db = window.db;
      if (!db) throw new Error('Firebase not initialized');
      await db.collection('players').doc(playerId).delete();
    },

    // Delete a session
    deleteSession: async function(sessionId) {
      const db = window.db;
      if (!db) throw new Error('Firebase not initialized');
      await db.collection('training_sessions').doc(sessionId).delete();
    },

    // Update a session
    updateSession: async function(sessionId, updates) {
      const db = window.db;
      if (!db) throw new Error('Firebase not initialized');
      await db.collection('training_sessions').doc(sessionId).update(updates);
    }
  };

  window.firebaseService = firebaseService;
  console.log('✅ Firebase Service loaded');
})();

// ========================================
// ANALYTICS SERVICE
// ========================================
(function() {
  'use strict';
  
  const analyticsService = {
    // Get all sessions for a specific player
    getPlayerSessions: function(sessions, playerId) {
      return sessions.filter(function(s) {
        return s.playerId === playerId;
      });
    },

    // Calculate insights for a player
    calculateInsights: function(sessions, playerId) {
      const playerSessions = this.getPlayerSessions(sessions, playerId);
      
      if (playerSessions.length === 0) {
        return {
          avgRunTime: 'N/A',
          jumpBalance: 'N/A',
          fatigueDropoff: 'N/A',
          totalSessions: 0
        };
      }

      // Calculate average run time
      const validRunTimes = playerSessions
        .map(function(s) { return s.runTime; })
        .filter(function(t) { return t && t.includes(':'); })
        .map(function(t) { return window.utils.parseRunTime(t); })
        .filter(function(t) { return t !== null; });

      const avgRunTime = validRunTimes.length > 0
        ? window.utils.formatRunTime(
            validRunTimes.reduce(function(a, b) { return a + b; }, 0) / validRunTimes.length
          )
        : 'N/A';

      // Calculate jump balance
      const leftJumps = playerSessions
        .map(function(s) { return s.broadJumps.leftSingle; })
        .filter(function(j) { return j > 0; });
      const rightJumps = playerSessions
        .map(function(s) { return s.broadJumps.rightSingle; })
        .filter(function(j) { return j > 0; });
      
      const avgLeft = leftJumps.length > 0 
        ? leftJumps.reduce(function(a, b) { return a + b; }, 0) / leftJumps.length 
        : 0;
      const avgRight = rightJumps.length > 0 
        ? rightJumps.reduce(function(a, b) { return a + b; }, 0) / rightJumps.length 
        : 0;
      
      const jumpBalance = avgLeft > 0 && avgRight > 0
        ? Math.round((Math.min(avgLeft, avgRight) / Math.max(avgLeft, avgRight)) * 100) + '%'
        : 'N/A';

      // Calculate fatigue dropoff
      const sprintDropoffs = playerSessions.map(function(s) {
        const sprints = s.sprints.filter(function(sp) { return sp > 0; });
        if (sprints.length < 2) return null;
        return ((sprints[sprints.length - 1] - sprints[0]) / sprints[0]) * 100;
      }).filter(function(d) { return d !== null; });

      const fatigueDropoff = sprintDropoffs.length > 0
        ? Math.round(sprintDropoffs.reduce(function(a, b) { return a + b; }, 0) / sprintDropoffs.length) + '%'
        : 'N/A';

      return {
        avgRunTime: avgRunTime,
        jumpBalance: jumpBalance,
        fatigueDropoff: fatigueDropoff,
        totalSessions: playerSessions.length
      };
    },

    // Get chart data for a player
    getChartData: function(sessions, playerId) {
      const playerSessions = this.getPlayerSessions(sessions, playerId)
        .slice(0, 10)
        .reverse();
      
      return playerSessions.map(function(session) {
        return {
          date: window.utils.formatDate(session.date),
          sprint1: session.sprints[0] || 0,
          sprint6: session.sprints[5] || 0,
          leftJump: session.broadJumps.leftSingle,
          rightJump: session.broadJumps.rightSingle
        };
      });
    }
  };

  window.analyticsService = analyticsService;
  console.log('✅ Analytics Service loaded');
})();

console.log('✅ All services loaded successfully');