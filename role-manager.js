// ========================================
// ROLE MANAGER
// Centralized role-based access control and permissions
// ========================================

(function() {
  'use strict';
  
  console.log('Loading Role Manager...');

  const roleManager = {
    // ========================================
    // ROLE DEFINITIONS
    // ========================================
    ROLES: {
      COACH: 'coach',
      PLAYER: 'player'
    },

    // ========================================
    // PERMISSION CHECKS
    // ========================================
    
    // Can user view all players?
    canViewAllPlayers: function() {
      if (!window.authService.isAuthenticated()) return false;
      return window.authService.isCoach();
    },

    // Can user view specific player?
    canViewPlayer: function(playerId) {
      if (!window.authService.isAuthenticated()) return false;
      
      const userData = window.authService.currentUserData;
      
      // Coaches can view all players
      if (userData.role === this.ROLES.COACH) {
        return true;
      }
      
      // Players can only view themselves
      if (userData.role === this.ROLES.PLAYER) {
        return userData.playerId === playerId;
      }
      
      return false;
    },

    // Can user add new players?
    canAddPlayers: function() {
      if (!window.authService.isAuthenticated()) return false;
      return window.authService.isCoach();
    },

    // Can user record sessions?
    canRecordSessions: function() {
      if (!window.authService.isAuthenticated()) return false;
      return window.authService.isCoach();
    },

    // Can user record session for specific player?
    canRecordSessionForPlayer: function(playerId) {
      if (!window.authService.isAuthenticated()) return false;
      
      const userData = window.authService.currentUserData;
      
      // Coaches can record for any player
      if (userData.role === this.ROLES.COACH) {
        return true;
      }
      
      // Players can only record for themselves
      if (userData.role === this.ROLES.PLAYER) {
        return userData.playerId === playerId;
      }
      
      return false;
    },

    // Can user view all sessions?
    canViewAllSessions: function() {
      if (!window.authService.isAuthenticated()) return false;
      return window.authService.isCoach();
    },

    // Can user view coach dashboard?
    canViewCoachDashboard: function() {
      if (!window.authService.isAuthenticated()) return false;
      return window.authService.isCoach();
    },

    // Can user view player dashboard?
    canViewPlayerDashboard: function() {
      if (!window.authService.isAuthenticated()) return false;
      return window.authService.isPlayer();
    },

    // Can user edit player info?
    canEditPlayer: function(playerId) {
      if (!window.authService.isAuthenticated()) return false;
      
      const userData = window.authService.currentUserData;
      
      // Only coaches can edit player info
      return userData.role === this.ROLES.COACH;
    },

    // Can user delete sessions?
    canDeleteSessions: function() {
      if (!window.authService.isAuthenticated()) return false;
      // For now, no one can delete (you can enable for coaches if needed)
      return false;
    },

    // ========================================
    // DATA FILTERING
    // ========================================
    
    // Filter players based on user role
    filterPlayers: function(players) {
      if (!window.authService.isAuthenticated()) return [];
      
      const userData = window.authService.currentUserData;
      
      // Coaches see all players
      if (userData.role === this.ROLES.COACH) {
        return players;
      }
      
      // Players see only themselves
      if (userData.role === this.ROLES.PLAYER) {
        return players.filter(p => p.id === userData.playerId);
      }
      
      return [];
    },

    // Filter sessions based on user role
    filterSessions: function(sessions) {
      if (!window.authService.isAuthenticated()) return [];
      
      const userData = window.authService.currentUserData;
      
      // Coaches see all sessions
      if (userData.role === this.ROLES.COACH) {
        return sessions;
      }
      
      // Players see only their sessions
      if (userData.role === this.ROLES.PLAYER) {
        return sessions.filter(s => s.playerId === userData.playerId);
      }
      
      return [];
    },

    // Get allowed player IDs for current user
    getAllowedPlayerIds: function() {
      if (!window.authService.isAuthenticated()) return [];
      
      const userData = window.authService.currentUserData;
      
      // Coaches can access all players
      if (userData.role === this.ROLES.COACH) {
        return null; // null means "all players"
      }
      
      // Players can only access their own ID
      if (userData.role === this.ROLES.PLAYER && userData.playerId) {
        return [userData.playerId];
      }
      
      return [];
    },

    // ========================================
    // UI HELPERS
    // ========================================
    
    // Get navigation items based on role
    getNavigationItems: function() {
      if (!window.authService.isAuthenticated()) return [];
      
      const userData = window.authService.currentUserData;
      const items = [];
      
      // Dashboard (both roles)
      items.push({
        id: 'dashboard',
        label: userData.role === this.ROLES.COACH ? 'Coach Dashboard' : 'My Dashboard',
        icon: '📊',
        visible: true
      });
      
      // Record Session (coach only)
      if (userData.role === this.ROLES.COACH) {
        items.push({
          id: 'record',
          label: 'Record Session',
          icon: '📝',
          visible: true
        });
      }
      
      // Insights (both roles, filtered by role)
      items.push({
        id: 'insights',
        label: 'Insights',
        icon: '📈',
        visible: true
      });
      
      // History (both roles, filtered by role)
      items.push({
        id: 'history',
        label: 'History',
        icon: '📅',
        visible: true
      });
      
      return items;
    },

    // Get user display info
    getUserDisplayInfo: function() {
      if (!window.authService.isAuthenticated()) return null;
      
      const userData = window.authService.currentUserData;
      
      return {
        displayName: userData.displayName,
        email: userData.email,
        role: userData.role,
        roleLabel: userData.role === this.ROLES.COACH ? '👨‍🏫 Coach' : '🏃 Player',
        playerId: userData.playerId
      };
    },

    // Get role-specific default view
    getDefaultView: function() {
      if (!window.authService.isAuthenticated()) return 'dashboard';
      
      return 'dashboard';
    },

    // ========================================
    // VALIDATION
    // ========================================
    
    // Validate if action is allowed for user
    validateAction: function(action, targetId = null) {
      const validations = {
        'view-all-players': () => this.canViewAllPlayers(),
        'view-player': () => this.canViewPlayer(targetId),
        'add-players': () => this.canAddPlayers(),
        'record-sessions': () => this.canRecordSessions(),
        'record-session-for': () => this.canRecordSessionForPlayer(targetId),
        'view-all-sessions': () => this.canViewAllSessions(),
        'view-coach-dashboard': () => this.canViewCoachDashboard(),
        'view-player-dashboard': () => this.canViewPlayerDashboard(),
        'edit-player': () => this.canEditPlayer(targetId),
        'delete-sessions': () => this.canDeleteSessions()
      };
      
      const validator = validations[action];
      if (!validator) {
        console.warn(`Unknown action: ${action}`);
        return false;
      }
      
      return validator();
    },

    // ========================================
    // ERROR MESSAGES
    // ========================================
    
    // Get access denied message
    getAccessDeniedMessage: function(action) {
      const userData = window.authService.currentUserData;
      
      const messages = {
        'view-all-players': 'Only coaches can view all players',
        'add-players': 'Only coaches can add new players',
        'record-sessions': 'Only coaches can record training sessions',
        'view-coach-dashboard': 'This view is only available to coaches',
        'view-player-dashboard': 'This view is only available to players',
        'edit-player': 'Only coaches can edit player information',
        'delete-sessions': 'Session deletion is not currently allowed'
      };
      
      return messages[action] || 'You do not have permission to perform this action';
    },

    // ========================================
    // INITIALIZATION
    // ========================================
    
    // Initialize role manager
    initialize: function() {
      if (!window.authService) {
        console.error('Auth service not available');
        return false;
      }
      
      console.log('✅ Role Manager initialized');
      return true;
    }
  };

  // Export to window
  window.roleManager = roleManager;
  
  console.log('✅ Role Manager loaded');
})();