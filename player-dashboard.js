// ========================================
// PLAYER DASHBOARD COMPONENTS
// Personal view - only their own data
// ========================================

// REMOVED: const { useState, useMemo } = React;
// Use React.useState and React.useMemo instead

// ========================================
// PLAYER PROFILE HEADER
// ========================================
const PlayerProfile = ({ playerData, sessions }) => {
  const stats = React.useMemo(() => {  // ← Changed from useMemo
    const playerSessions = sessions.filter(s => s.playerId === playerData.playerId);
    const totalSessions = playerSessions.length;
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSessions = playerSessions.filter(s => {
      const sessionDate = window.utils.parseLocalDate(s.date);
      return sessionDate >= sevenDaysAgo;
    }).length;

    // Last session date
    const lastSession = playerSessions.length > 0
      ? playerSessions[0].date
      : null;

    // Average quality
    const qualities = playerSessions.map(s => 
      window.analyticsService.calculateSessionQuality(s).score
    );
    const avgQuality = qualities.length > 0
      ? Math.round(qualities.reduce((a, b) => a + b, 0) / qualities.length)
      : 0;

    return {
      totalSessions,
      recentSessions,
      lastSession,
      avgQuality
    };
  }, [playerData, sessions]);

  return React.createElement('div', { className: 'card' }, [
    React.createElement('div', {
      key: 'header',
      style: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        marginBottom: '1rem'
      }
    }, [
      React.createElement('div', {
        key: 'info',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }
      }, [
        React.createElement('div', {
          key: 'avatar',
          style: {
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }
        }, '🏃'),
        React.createElement('div', { key: 'details' }, [
          React.createElement('h2', {
            key: 'name',
            style: { fontSize: '1.5rem', fontWeight: 'bold' }
          }, playerData.displayName),
          React.createElement('p', {
            key: 'email',
            style: { opacity: 0.9, fontSize: '0.875rem', marginTop: '0.25rem' }
          }, playerData.email)
        ])
      ])
    ]),

    React.createElement('div', {
      key: 'stats',
      className: 'grid-4'
    }, [
      React.createElement('div', {
        key: 'total',
        style: {
          padding: '1rem',
          background: '#eff6ff',
          borderRadius: '0.5rem',
          border: '2px solid #3b82f6'
        }
      }, [
        React.createElement('p', {
          key: 'label',
          style: { fontSize: '0.75rem', color: '#1e40af', fontWeight: '600' }
        }, 'Total Sessions'),
        React.createElement('p', {
          key: 'value',
          style: { fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937', marginTop: '0.25rem' }
        }, stats.totalSessions)
      ]),
      React.createElement('div', {
        key: 'recent',
        style: {
          padding: '1rem',
          background: '#f0fdf4',
          borderRadius: '0.5rem',
          border: '2px solid #10b981'
        }
      }, [
        React.createElement('p', {
          key: 'label',
          style: { fontSize: '0.75rem', color: '#065f46', fontWeight: '600' }
        }, 'This Week'),
        React.createElement('p', {
          key: 'value',
          style: { fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937', marginTop: '0.25rem' }
        }, stats.recentSessions)
      ]),
      React.createElement('div', {
        key: 'last',
        style: {
          padding: '1rem',
          background: '#fef3c7',
          borderRadius: '0.5rem',
          border: '2px solid #f59e0b'
        }
      }, [
        React.createElement('p', {
          key: 'label',
          style: { fontSize: '0.75rem', color: '#92400e', fontWeight: '600' }
        }, 'Last Session'),
        React.createElement('p', {
          key: 'value',
          style: { fontSize: '0.875rem', fontWeight: 'bold', color: '#1f2937', marginTop: '0.25rem' }
        }, stats.lastSession ? window.utils.formatDate(stats.lastSession) : 'None')
      ]),
      React.createElement('div', {
        key: 'quality',
        style: {
          padding: '1rem',
          background: '#f3e8ff',
          borderRadius: '0.5rem',
          border: '2px solid #a855f7'
        }
      }, [
        React.createElement('p', {
          key: 'label',
          style: { fontSize: '0.75rem', color: '#6b21a8', fontWeight: '600' }
        }, 'Avg Quality'),
        React.createElement('p', {
          key: 'value',
          style: { fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937', marginTop: '0.25rem' }
        }, stats.avgQuality + '/100')
      ])
    ])
  ]);
};

// ========================================
// QUICK STATS CARDS
// ========================================
const QuickStats = ({ insights }) => {
  if (!insights) return null;

  return React.createElement('div', { className: 'grid-4' }, [
    React.createElement('div', {
      key: 'run',
      className: 'insight-card blue',
      style: { '--from-color': '#3b82f6', '--to-color': '#2563eb' }
    }, [
      React.createElement('p', { key: 'label', className: 'insight-label' }, 'Best 2km Time'),
      React.createElement('p', { key: 'value', className: 'insight-value' }, 
        insights.personalBests?.bestRunTime?.timeStr || 'N/A'
      )
    ]),
    React.createElement('div', {
      key: 'jump',
      className: 'insight-card green',
      style: { '--from-color': '#10b981', '--to-color': '#059669' }
    }, [
      React.createElement('p', { key: 'label', className: 'insight-label' }, 'Best Single Jump'),
      React.createElement('p', { key: 'value', className: 'insight-value' }, 
        insights.personalBests?.bestLeftJump?.value 
          ? Math.max(
              insights.personalBests.bestLeftJump?.value || 0,
              insights.personalBests.bestRightJump?.value || 0,
              insights.personalBests.bestDoubleJump?.value || 0
            ) + 'mm'
          : 'N/A'
      )
    ]),
    React.createElement('div', {
      key: 'sprint',
      className: 'insight-card orange',
      style: { '--from-color': '#f59e0b', '--to-color': '#d97706' }
    }, [
      React.createElement('p', { key: 'label', className: 'insight-label' }, 'Best Sprint Set'),
      React.createElement('p', { key: 'value', className: 'insight-value' }, 
        insights.personalBests?.bestSprint?.value 
          ? insights.personalBests.bestSprint.value + ' reps'
          : 'N/A'
      )
    ]),
    React.createElement('div', {
      key: 'balance',
      className: 'insight-card purple',
      style: { '--from-color': '#a855f7', '--to-color': '#9333ea' }
    }, [
      React.createElement('p', { key: 'label', className: 'insight-label' }, 'Jump Balance'),
      React.createElement('p', { key: 'value', className: 'insight-value' }, insights.jumpBalance)
    ])
  ]);
};

// ========================================
// PLAYER MAIN VIEW
// ========================================
const PlayerView = ({ players, sessions }) => {
  const playerData = window.authService.currentUserData;
  const playerId = playerData.playerId;

  // Filter sessions to only this player's data
  const playerSessions = React.useMemo(() => {
    return sessions.filter(s => s.playerId === playerId);
  }, [sessions, playerId]);

  // Get player info
  const player = React.useMemo(() => {
    return players.find(p => p.id === playerId);
  }, [players, playerId]);

  // Calculate insights
  const insights = React.useMemo(() => {
    if (playerSessions.length === 0) return null;
    return window.analyticsService.calculateInsights(playerSessions, playerId);
  }, [playerSessions, playerId]);

  return React.createElement('div', { className: 'space-y-6' }, [
    // Profile Header
    React.createElement(PlayerProfile, {
      key: 'profile',
      playerData,
      sessions: playerSessions
    }),

    // Quick Stats
    insights && React.createElement(QuickStats, {
      key: 'stats',
      insights
    }),

    // Welcome Message or Info
    React.createElement('div', {
      key: 'info',
      className: 'card',
      style: {
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        border: '2px solid #f59e0b'
      }
    }, [
      React.createElement('div', {
        key: 'content',
        style: {
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem'
        }
      }, [
        React.createElement('span', {
          key: 'icon',
          style: { fontSize: '2rem' }
        }, '💡'),
        React.createElement('div', { key: 'text' }, [
          React.createElement('h3', {
            key: 'title',
            style: { fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }
          }, 'Welcome to Your Dashboard!'),
          React.createElement('p', {
            key: 'desc',
            style: { color: '#78350f', lineHeight: '1.5' }
          }, 'Track your personal progress, view your training history, and see detailed insights in the Insights and History tabs above.')
        ])
      ])
    ]),

    // Navigation hint
    React.createElement('div', {
      key: 'nav-hint',
      className: 'card'
    }, [
      React.createElement('h3', {
        key: 'header',
        className: 'section-header'
      }, '📍 Quick Navigation'),
      React.createElement('div', {
        key: 'grid',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginTop: '1rem'
        }
      }, [
        React.createElement('div', {
          key: 'insights',
          style: {
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }
        }, [
          React.createElement('h4', {
            key: 'title',
            style: { fontWeight: '600', marginBottom: '0.5rem' }
          }, '📈 Insights Tab'),
          React.createElement('p', {
            key: 'desc',
            style: { fontSize: '0.875rem', color: '#6b7280' }
          }, 'View your performance trends, personal bests, and detailed analytics')
        ]),
        React.createElement('div', {
          key: 'history',
          style: {
            padding: '1rem',
            background: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }
        }, [
          React.createElement('h4', {
            key: 'title',
            style: { fontWeight: '600', marginBottom: '0.5rem' }
          }, '📅 History Tab'),
          React.createElement('p', {
            key: 'desc',
            style: { fontSize: '0.875rem', color: '#6b7280' }
          }, 'Browse all your training sessions with detailed breakdowns')
        ])
      ])
    ])
  ]);
};

// Export components
window.PlayerComponents = {
  PlayerView,
  PlayerProfile,
  QuickStats
};

console.log('✅ Player Dashboard Components loaded');