// ========================================
// COACH DASHBOARD COMPONENTS
// Full access to all players + aggregate stats
// ========================================

// REMOVED: const { useState, useMemo } = React;
// Use React.useState and React.useMemo instead

// ========================================
// PERSONAL BESTS LEADERBOARD
// ========================================
const PersonalBestsLeaderboard = ({ players, sessions }) => {
  const leaderboards = React.useMemo(() => {  // ← Changed from useMemo
    // Calculate personal bests for all players
    const allPlayerBests = players.map(player => {
      const playerSessions = sessions.filter(s => s.playerId === player.id);
      const bests = window.analyticsService.getPersonalBests(playerSessions);
      return {
        playerId: player.id,
        playerName: player.name,
        bests
      };
    }).filter(p => p.bests);

    // Create leaderboard for each metric
    const createLeaderboard = (metric, getValue, format) => {
      return allPlayerBests
        .map(p => ({
          playerName: p.playerName,
          value: getValue(p.bests),
          formatted: format(getValue(p.bests))
        }))
        .filter(item => item.value)
        .sort((a, b) => {
          // For run time, lower is better
          if (metric === 'runTime') return a.value - b.value;
          // For others, higher is better
          return b.value - a.value;
        })
        .slice(0, 5); // Top 5
    };

    return {
      runTime: createLeaderboard(
        'runTime',
        (bests) => bests.bestRunTime?.time,
        (value) => value ? window.utils.formatRunTime(value) : 'N/A'
      ),
      leftSingle: createLeaderboard(
        'leftSingle',
        (bests) => bests.bestLeftJump?.value,
        (value) => value ? value + ' cm' : 'N/A'
      ),
      rightSingle: createLeaderboard(
        'rightSingle',
        (bests) => bests.bestRightJump?.value,
        (value) => value ? value + ' cm' : 'N/A'
      ),
      doubleSingle: createLeaderboard(
        'doubleSingle',
        (bests) => bests.bestDoubleJump?.value,
        (value) => value ? value + ' cm' : 'N/A'
      ),
      leftTriple: createLeaderboard(
        'leftTriple',
        (bests) => bests.bestLeftTriple?.value,
        (value) => value ? value + ' cm' : 'N/A'
      ),
      rightTriple: createLeaderboard(
        'rightTriple',
        (bests) => bests.bestRightTriple?.value,
        (value) => value ? value + ' cm' : 'N/A'
      ),
      doubleTriple: createLeaderboard(
        'doubleTriple',
        (bests) => bests.bestDoubleTriple?.value,
        (value) => value ? value + ' cm' : 'N/A'
      ),
      sprint: createLeaderboard(
        'sprint',
        (bests) => bests.bestSprint?.value,
        (value) => value ? value + ' reps' : 'N/A'
      )
    };
  }, [players, sessions]);

  const LeaderboardCard = ({ title, icon, data, color }) => {
    return React.createElement('div', {
      className: 'card',
      style: { borderLeft: `4px solid ${color}` }
    }, [
      React.createElement('h4', {
        key: 'title',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#1f2937'
        }
      }, [
        React.createElement('span', { key: 'icon' }, icon),
        title
      ]),
      React.createElement('div', {
        key: 'list',
        style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
      },
        data.length === 0
          ? React.createElement('p', {
              style: { color: '#9ca3af', textAlign: 'center', padding: '1rem' }
            }, 'No data available')
          : data.map((item, idx) =>
              React.createElement('div', {
                key: idx,
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  background: idx === 0 ? '#fef3c7' : '#f9fafb',
                  borderRadius: '0.375rem',
                  border: idx === 0 ? '2px solid #f59e0b' : '1px solid #e5e7eb'
                }
              }, [
                React.createElement('div', {
                  key: 'info',
                  style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }
                }, [
                  React.createElement('span', {
                    key: 'rank',
                    style: {
                      fontWeight: 'bold',
                      color: idx === 0 ? '#f59e0b' : '#6b7280',
                      minWidth: '1.5rem'
                    }
                  }, `${idx + 1}.`),
                  React.createElement('span', {
                    key: 'name',
                    style: {
                      fontWeight: idx === 0 ? '600' : '500',
                      color: '#1f2937'
                    }
                  }, item.playerName)
                ]),
                React.createElement('span', {
                  key: 'value',
                  style: {
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    color: idx === 0 ? '#f59e0b' : '#2563eb'
                  }
                }, item.formatted)
              ])
            )
      )
    ]);
  };

  return React.createElement('div', { className: 'card' }, [
    React.createElement('h3', {
      key: 'header',
      className: 'section-header'
    }, '🏆 Personal Bests Leaderboard'),
    
    React.createElement('div', {
      key: 'grid',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginTop: '1rem'
      }
    }, [
      React.createElement(LeaderboardCard, {
        key: 'run',
        title: '2km Run Time',
        icon: '🏃',
        data: leaderboards.runTime,
        color: '#3b82f6'
      }),
      React.createElement(LeaderboardCard, {
        key: 'left',
        title: 'Left Single Jump',
        icon: '⬅️',
        data: leaderboards.leftSingle,
        color: '#10b981'
      }),
      React.createElement(LeaderboardCard, {
        key: 'right',
        title: 'Right Single Jump',
        icon: '➡️',
        data: leaderboards.rightSingle,
        color: '#f59e0b'
      }),
      React.createElement(LeaderboardCard, {
        key: 'double',
        title: 'Double Single Jump',
        icon: '🦘',
        data: leaderboards.doubleSingle,
        color: '#ec4899'
      }),
      React.createElement(LeaderboardCard, {
        key: 'leftTriple',
        title: 'Left Triple Jump',
        icon: '⬅️⬅️⬅️',
        data: leaderboards.leftTriple,
        color: '#0ea5e9'
      }),
      React.createElement(LeaderboardCard, {
        key: 'rightTriple',
        title: 'Right Triple Jump',
        icon: '➡️➡️➡️',
        data: leaderboards.rightTriple,
        color: '#eab308'
      }),
      React.createElement(LeaderboardCard, {
        key: 'doubleTriple',
        title: 'Double Triple Jump',
        icon: '🦘🦘🦘',
        data: leaderboards.doubleTriple,
        color: '#a855f7'
      }),
      React.createElement(LeaderboardCard, {
        key: 'sprint',
        title: 'Best Sprint Set',
        icon: '⚡',
        data: leaderboards.sprint,
        color: '#f97316'
      })
    ])
  ]);
};

// ========================================
// TEAM OVERVIEW STATS
// ========================================
const TeamOverview = ({ players, sessions }) => {
  const stats = React.useMemo(() => {
    const totalSessions = sessions.length;
    const activePlayers = new Set(sessions.map(s => s.playerId)).size;
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSessions = sessions.filter(s => {
      const sessionDate = window.utils.parseLocalDate(s.date);
      return sessionDate >= sevenDaysAgo;
    }).length;

    // Average quality score
    const qualityScores = sessions.map(s => 
      window.analyticsService.calculateSessionQuality(s).score
    );
    const avgQuality = qualityScores.length > 0
      ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
      : 0;

    return {
      totalPlayers: players.length,
      activePlayers,
      totalSessions,
      recentSessions,
      avgQuality
    };
  }, [players, sessions]);

  const StatCard = ({ label, value, icon, color }) => {
    return React.createElement('div', {
      className: 'insight-card',
      style: {
        '--from-color': color,
        '--to-color': color,
        filter: 'brightness(0.95)'
      }
    }, [
      React.createElement('p', {
        key: 'label',
        className: 'insight-label'
      }, label),
      React.createElement('div', {
        key: 'content',
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '0.5rem'
        }
      }, [
        React.createElement('span', {
          key: 'icon',
          style: { fontSize: '2rem' }
        }, icon),
        React.createElement('p', {
          key: 'value',
          className: 'insight-value',
          style: { fontSize: '2.5rem' }
        }, value)
      ])
    ]);
  };

  return React.createElement('div', { className: 'card' }, [
    React.createElement('h3', {
      key: 'header',
      className: 'section-header'
    }, '📊 Team Overview'),
    
    React.createElement('div', {
      key: 'grid',
      className: 'grid-4',
      style: { marginTop: '1rem' }
    }, [
      React.createElement(StatCard, {
        key: 'players',
        label: 'Total Players',
        value: stats.totalPlayers,
        icon: '👥',
        color: '#3b82f6'
      }),
      React.createElement(StatCard, {
        key: 'active',
        label: 'Active Players',
        value: stats.activePlayers,
        icon: '✅',
        color: '#10b981'
      }),
      React.createElement(StatCard, {
        key: 'sessions',
        label: 'Total Sessions',
        value: stats.totalSessions,
        icon: '📝',
        color: '#f59e0b'
      }),
      React.createElement(StatCard, {
        key: 'recent',
        label: 'Sessions (7 days)',
        value: stats.recentSessions,
        icon: '🔥',
        color: '#ef4444'
      }),
      React.createElement(StatCard, {
        key: 'quality',
        label: 'Avg Quality Score',
        value: stats.avgQuality + '/100',
        icon: '⭐',
        color: '#a855f7'
      })
    ])
  ]);
};

// ========================================
// COACH MAIN VIEW
// ========================================
const CoachView = ({ players, sessions }) => {
  const [selectedView, setSelectedView] = React.useState('overview');

  return React.createElement('div', { className: 'space-y-6' }, [
    // View Selector
    React.createElement('div', {
      key: 'selector',
      className: 'card'
    }, [
      React.createElement('div', {
        key: 'buttons',
        style: {
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }
      }, [
        React.createElement('button', {
          key: 'overview',
          onClick: () => setSelectedView('overview'),
          className: `btn ${selectedView === 'overview' ? 'btn-primary' : 'btn-secondary'}`,
          style: { minWidth: '120px' }
        }, '📊 Overview'),
        React.createElement('button', {
          key: 'progress',
          onClick: () => setSelectedView('progress'),
          className: `btn ${selectedView === 'progress' ? 'btn-primary' : 'btn-secondary'}`,
          style: { minWidth: '120px' }
        }, '📈 Progress'),
        React.createElement('button', {
          key: 'alerts',
          onClick: () => setSelectedView('alerts'),
          className: `btn ${selectedView === 'alerts' ? 'btn-primary' : 'btn-secondary'}`,
          style: { minWidth: '120px' }
        }, '🔔 Alerts'),
        React.createElement('button', {
          key: 'participation',
          onClick: () => setSelectedView('participation'),
          className: `btn ${selectedView === 'participation' ? 'btn-primary' : 'btn-secondary'}`,
          style: { minWidth: '120px' }
        }, '📅 Participation'),
        React.createElement('button', {
          key: 'leaderboard',
          onClick: () => setSelectedView('leaderboard'),
          className: `btn ${selectedView === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}`,
          style: { minWidth: '120px' }
        }, '🏆 Leaderboard')
      ])
    ]),

    // Content based on selected view
    selectedView === 'overview' && React.createElement(TeamOverview, {
      key: 'overview',
      players,
      sessions
    }),

    selectedView === 'progress' && React.createElement(window.CoachComponents.ProgressTracking, {
      key: 'progress',
      players,
      sessions
    }),

    selectedView === 'alerts' && React.createElement(window.CoachComponents.PerformanceAlerts, {
      key: 'alerts',
      players,
      sessions
    }),

    selectedView === 'participation' && React.createElement(window.CoachComponents.ParticipationTracking, {
      key: 'participation',
      players,
      sessions
    }),

    selectedView === 'leaderboard' && React.createElement(PersonalBestsLeaderboard, {
      key: 'leaderboard',
      players,
      sessions
    })
  ]);
};

// Export components
window.CoachComponents = {
  CoachView,
  TeamOverview,
  PersonalBestsLeaderboard
};

console.log('✅ Coach Dashboard Components loaded');    