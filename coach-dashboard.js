// ========================================
// ENHANCED COACH DASHBOARD WITH MATRIX ANALYSIS
// Replace coach-dashboard.js with this version
// ========================================

// ========================================
// MATRIX LEADERBOARD COMPONENT
// ========================================
const MatrixLeaderboard = ({ players, matrixSessions }) => {
  const leaderboards = React.useMemo(() => {
    // Calculate best scores for all players across all exercises
    const allPlayerBests = players.map(player => {
      const playerSessions = matrixSessions.filter(s => s.playerId === player.id);
      if (playerSessions.length === 0) return null;

      const bests = {};
      const exercises = Object.keys(playerSessions[0].exercises);
      
      exercises.forEach(exercise => {
        const scores = playerSessions
          .map(s => s.exercises[exercise])
          .filter(v => v > 0);
        
        if (scores.length > 0) {
          bests[exercise] = Math.max(...scores);
        }
      });

      return {
        playerId: player.id,
        playerName: player.name,
        bests,
        avgScore: Object.values(bests).length > 0
          ? Object.values(bests).reduce((a, b) => a + b, 0) / Object.values(bests).length
          : 0
      };
    }).filter(p => p !== null && p.avgScore > 0);

    // Create leaderboard for each exercise
    const exercises = [
  { key: 'volleyFigure8', label: 'Volley Figure 8', icon: '🎯' },
  { key: 'bounceFigure8', label: 'Bounce Figure 8', icon: '⚡' },
  { key: 'volleySideToSide', label: 'Volley Side to Side', icon: '↔️' },
  { key: 'bounceSideToSide', label: 'Bounce Side to Side', icon: '🔄' },  // ✅ ADD THIS
  { key: 'dropTargetBackhand', label: 'Drop Target BH', icon: '🎾' },
  { key: 'dropTargetForehand', label: 'Drop Target FH', icon: '🎾' },
  { key: 'serviceBoxDriveForehand', label: 'Service Box FH', icon: '📦' },
  { key: 'serviceBoxDriveBackhand', label: 'Service Box BH', icon: '📦' },
  { key: 'cornerVolleys', label: 'Corner Volleys', icon: '🔲' },
  { key: 'beepTest', label: 'Beep Test', icon: '⏱️' },
  { key: 'ballTransfer', label: 'Ball Transfer', icon: '🔄' },
  { key: 'slalom', label: 'Slalom', icon: '🎿' }
];

    const leaderboardData = {};
    
    exercises.forEach(exercise => {
      leaderboardData[exercise.key] = allPlayerBests
        .filter(p => p.bests[exercise.key])
        .map(p => ({
          playerName: p.playerName,
          value: p.bests[exercise.key],
          formatted: p.bests[exercise.key].toFixed(1)
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    });

    // Overall average leaderboard
    leaderboardData.overall = allPlayerBests
      .map(p => ({
        playerName: p.playerName,
        value: p.avgScore,
        formatted: p.avgScore.toFixed(1)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { leaderboardData, exercises };
  }, [players, matrixSessions]);

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
          fontSize: '0.875rem',
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
              style: { color: '#9ca3af', textAlign: 'center', padding: '1rem', fontSize: '0.875rem' }
            }, 'No data')
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
                      minWidth: '1.5rem',
                      fontSize: '0.875rem'
                    }
                  }, `${idx + 1}.`),
                  React.createElement('span', {
                    key: 'name',
                    style: {
                      fontWeight: idx === 0 ? '600' : '500',
                      color: '#1f2937',
                      fontSize: '0.875rem'
                    }
                  }, item.playerName)
                ]),
                React.createElement('span', {
                  key: 'value',
                  style: {
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    color: idx === 0 ? '#f59e0b' : '#2563eb',
                    fontSize: '0.875rem'
                  }
                }, item.formatted)
              ])
            )
      )
    ]);
  };

  if (matrixSessions.length === 0) {
    return React.createElement('div', {
      style: {
        textAlign: 'center',
        padding: '3rem 1rem',
        background: '#f9fafb',
        borderRadius: '0.5rem',
        border: '1px dashed #d1d5db'
      }
    }, [
      React.createElement('p', {
        key: 'icon',
        style: { fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }
      }, '🎯'),
      React.createElement('p', {
        key: 'text',
        style: { color: '#6b7280', fontWeight: '500' }
      }, 'No matrix sessions recorded yet')
    ]);
  }

  return React.createElement('div', { className: 'card' }, [
    React.createElement('h3', {
      key: 'header',
      className: 'section-header'
    }, '🎯 Matrix Performance Leaderboards'),
    
    // Overall Average First
    React.createElement('div', {
      key: 'overall',
      style: { marginBottom: '1.5rem' }
    }, [
      React.createElement('h4', {
        key: 'title',
        style: {
          fontSize: '1rem',
          fontWeight: '600',
          marginBottom: '0.75rem',
          color: '#1f2937'
        }
      }, '⭐ Overall Average Score'),
      React.createElement(LeaderboardCard, {
        key: 'card',
        title: 'Top Performers',
        icon: '👑',
        data: leaderboards.leaderboardData.overall,
        color: '#8b5cf6'
      })
    ]),

    // Individual Exercise Leaderboards
    React.createElement('div', {
      key: 'grid',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem'
      }
    }, leaderboards.exercises.map(exercise =>
      React.createElement(LeaderboardCard, {
        key: exercise.key,
        title: exercise.label,
        icon: exercise.icon,
        data: leaderboards.leaderboardData[exercise.key],
        color: '#3b82f6'
      })
    ))
  ]);
};

// ========================================
// MATRIX PROGRESS TRACKING
// ========================================
const MatrixProgressTracking = ({ players, matrixSessions }) => {
  const [selectedPlayer, setSelectedPlayer] = React.useState('');
  const [selectedExercise, setSelectedExercise] = React.useState('volleyFigure8');

  const exercises = [
    { key: 'volleyFigure8', label: '🎯 Volley Figure 8' },
    { key: 'bounceFigure8', label: '⚡ Bounce Figure 8' },
    { key: 'volleySideToSide', label: '↔️ Volley Side to Side' },
    { key: 'bounceSideToSide', label: '↔️ Bounce Side to Side' },
    { key: 'dropTargetBackhand', label: '🎾 Drop Target Backhand' },
    { key: 'dropTargetForehand', label: '🎾 Drop Target Forehand' },
    { key: 'serviceBoxDriveForehand', label: '📦 Service Box Drive FH' },
    { key: 'serviceBoxDriveBackhand', label: '📦 Service Box Drive BH' },
    { key: 'cornerVolleys', label: '🔲 Corner Volleys' },
    { key: 'beepTest', label: '⏱️ Beep Test' },
    { key: 'ballTransfer', label: '🔄 Ball Transfer' },
    { key: 'slalom', label: '🎿 Slalom' }
  ];

  const progressData = React.useMemo(() => {
    if (!selectedPlayer) return [];

    const playerSessions = matrixSessions
      .filter(s => s.playerId === selectedPlayer)
      .sort((a, b) => window.utils.compareDates(a.date, b.date));

    return playerSessions.map(session => ({
      date: window.utils.formatDate(session.date),
      score: session.exercises[selectedExercise] || 0
    })).filter(d => d.score > 0);
  }, [selectedPlayer, selectedExercise, matrixSessions]);

  const stats = React.useMemo(() => {
    if (progressData.length === 0) return null;

    const scores = progressData.map(d => d.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const best = Math.max(...scores);
    const latest = scores[scores.length - 1];
    const improvement = scores.length > 1 ? latest - scores[0] : 0;

    return { avg, best, latest, improvement };
  }, [progressData]);

  return React.createElement('div', { className: 'card' }, [
    React.createElement('h3', {
      key: 'header',
      className: 'section-header'
    }, '📈 Matrix Progress Tracking'),

    // Selection Controls
    React.createElement('div', {
      key: 'controls',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }
    }, [
      React.createElement('div', { key: 'player' }, [
        React.createElement('label', { key: 'label' }, 'Select Player'),
        React.createElement('select', {
          key: 'select',
          value: selectedPlayer,
          onChange: (e) => setSelectedPlayer(e.target.value)
        }, [
          React.createElement('option', { value: '', key: 'default' }, 'Choose a player...'),
          ...players.map(p => 
            React.createElement('option', { key: p.id, value: p.id }, p.name)
          )
        ])
      ]),
      React.createElement('div', { key: 'exercise' }, [
        React.createElement('label', { key: 'label' }, 'Select Exercise'),
        React.createElement('select', {
          key: 'select',
          value: selectedExercise,
          onChange: (e) => setSelectedExercise(e.target.value)
        }, exercises.map(ex =>
          React.createElement('option', { key: ex.key, value: ex.key }, ex.label)
        ))
      ])
    ]),

    // Stats Cards
    selectedPlayer && stats && React.createElement('div', {
      key: 'stats',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }
    }, [
      React.createElement('div', {
        key: 'avg',
        style: {
          padding: '1rem',
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          borderRadius: '0.5rem',
          border: '2px solid #3b82f6',
          textAlign: 'center'
        }
      }, [
        React.createElement('p', {
          key: 'label',
          style: { fontSize: '0.75rem', color: '#1e40af', fontWeight: '600' }
        }, 'Average'),
        React.createElement('p', {
          key: 'value',
          style: { fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937', marginTop: '0.25rem', fontFamily: 'monospace' }
        }, stats.avg.toFixed(1))
      ]),
      React.createElement('div', {
        key: 'best',
        style: {
          padding: '1rem',
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          borderRadius: '0.5rem',
          border: '2px solid #10b981',
          textAlign: 'center'
        }
      }, [
        React.createElement('p', {
          key: 'label',
          style: { fontSize: '0.75rem', color: '#065f46', fontWeight: '600' }
        }, 'Best'),
        React.createElement('p', {
          key: 'value',
          style: { fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937', marginTop: '0.25rem', fontFamily: 'monospace' }
        }, stats.best.toFixed(1))
      ]),
      React.createElement('div', {
        key: 'latest',
        style: {
          padding: '1rem',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '0.5rem',
          border: '2px solid #f59e0b',
          textAlign: 'center'
        }
      }, [
        React.createElement('p', {
          key: 'label',
          style: { fontSize: '0.75rem', color: '#92400e', fontWeight: '600' }
        }, 'Latest'),
        React.createElement('p', {
          key: 'value',
          style: { fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937', marginTop: '0.25rem', fontFamily: 'monospace' }
        }, stats.latest.toFixed(1))
      ]),
      React.createElement('div', {
        key: 'improvement',
        style: {
          padding: '1rem',
          background: stats.improvement >= 0 
            ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
            : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          borderRadius: '0.5rem',
          border: stats.improvement >= 0 ? '2px solid #10b981' : '2px solid #ef4444',
          textAlign: 'center'
        }
      }, [
        React.createElement('p', {
          key: 'label',
          style: { 
            fontSize: '0.75rem', 
            color: stats.improvement >= 0 ? '#065f46' : '#991b1b', 
            fontWeight: '600' 
          }
        }, 'Change'),
        React.createElement('p', {
          key: 'value',
          style: { 
            fontSize: '1.75rem', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginTop: '0.25rem', 
            fontFamily: 'monospace' 
          }
        }, (stats.improvement >= 0 ? '+' : '') + stats.improvement.toFixed(1))
      ])
    ]),

    // Progress List
    selectedPlayer && progressData.length > 0 ? React.createElement('div', {
      key: 'progress',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxHeight: '400px',
        overflowY: 'auto'
      }
    }, progressData.map((data, idx) =>
      React.createElement('div', {
        key: idx,
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem',
          background: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }
      }, [
        React.createElement('span', {
          key: 'date',
          style: { fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }
        }, data.date),
        React.createElement('span', {
          key: 'score',
          style: { 
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            color: '#2563eb',
            fontFamily: 'monospace'
          }
        }, data.score.toFixed(1))
      ])
    )) : React.createElement('div', {
      key: 'empty',
      style: {
        textAlign: 'center',
        padding: '3rem 1rem',
        color: '#6b7280'
      }
    }, [
      React.createElement('p', {
        key: 'icon',
        style: { fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }
      }, '📊'),
      React.createElement('p', {
        key: 'text',
        style: { fontWeight: '500' }
      }, selectedPlayer 
        ? 'No data for this exercise' 
        : 'Select a player to view progress')
    ])
  ]);
};

// ========================================
// PERSONAL BESTS LEADERBOARD (Updated)
// ========================================
const PersonalBestsLeaderboard = ({ players, sessions }) => {
  const leaderboards = React.useMemo(() => {
    const allPlayerBests = players.map(player => {
      const playerSessions = sessions.filter(s => s.playerId === player.id);
      const bests = window.analyticsService.getPersonalBests(playerSessions);
      return {
        playerId: player.id,
        playerName: player.name,
        bests
      };
    }).filter(p => p.bests);

    const createLeaderboard = (metric, getValue, format) => {
      return allPlayerBests
        .map(p => ({
          playerName: p.playerName,
          value: getValue(p.bests),
          formatted: format(getValue(p.bests))
        }))
        .filter(item => item.value)
        .sort((a, b) => {
          if (metric === 'runTime') return a.value - b.value;
          return b.value - a.value;
        })
        .slice(0, 5);
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
// TEAM OVERVIEW STATS (Updated with Matrix)
// ========================================
const TeamOverview = ({ players, sessions, matrixSessions }) => {
  const stats = React.useMemo(() => {
    const totalSessions = sessions.length;
    const totalMatrixSessions = matrixSessions.length;
    const activePlayers = new Set(sessions.map(s => s.playerId)).size;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSessions = sessions.filter(s => {
      const sessionDate = window.utils.parseLocalDate(s.date);
      return sessionDate >= sevenDaysAgo;
    }).length;

    const recentMatrixSessions = matrixSessions.filter(s => {
      const sessionDate = window.utils.parseLocalDate(s.date);
      return sessionDate >= sevenDaysAgo;
    }).length;

    const qualityScores = sessions.map(s => 
      window.analyticsService.calculateSessionQuality(s).score
    );
    const avgQuality = qualityScores.length > 0
      ? Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)
      : 0;

    // Matrix average
    const allMatrixScores = matrixSessions.flatMap(s => 
      Object.values(s.exercises).filter(v => v > 0)
    );
    const avgMatrixScore = allMatrixScores.length > 0
      ? Math.round(allMatrixScores.reduce((a, b) => a + b, 0) / allMatrixScores.length)
      : 0;

    return {
      totalPlayers: players.length,
      activePlayers,
      totalSessions,
      totalMatrixSessions,
      recentSessions,
      recentMatrixSessions,
      avgQuality,
      avgMatrixScore
    };
  }, [players, sessions, matrixSessions]);

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
        key: 'matrix',
        label: 'Matrix Sessions',
        value: stats.totalMatrixSessions,
        icon: '🎯',
        color: '#8b5cf6'
      }),
      React.createElement(StatCard, {
        key: 'recent',
        label: 'Sessions (7 days)',
        value: stats.recentSessions,
        icon: '🔥',
        color: '#ef4444'
      }),
      React.createElement(StatCard, {
        key: 'recent-matrix',
        label: 'Matrix (7 days)',
        value: stats.recentMatrixSessions,
        icon: '⚡',
        color: '#a855f7'
      }),
      React.createElement(StatCard, {
        key: 'quality',
        label: 'Avg Quality Score',
        value: stats.avgQuality + '/100',
        icon: '⭐',
        color: '#06b6d4'
      }),
      React.createElement(StatCard, {
        key: 'matrix-avg',
        label: 'Avg Matrix Score',
        value: stats.avgMatrixScore + '/100',
        icon: '🎖️',
        color: '#ec4899'
      })
    ])
  ]);
};

// ========================================
// COACH MAIN VIEW (Updated with Matrix)
// ========================================
const CoachView = ({ players, sessions, matrixSessions = [] }) => {
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
        }, '🏆 Leaderboard'),
        React.createElement('button', {
          key: 'matrix-leaderboard',
          onClick: () => setSelectedView('matrix-leaderboard'),
          className: `btn ${selectedView === 'matrix-leaderboard' ? 'btn-primary' : 'btn-secondary'}`,
          style: { minWidth: '120px' }
        }, '🎯 Matrix'),
        React.createElement('button', {
          key: 'matrix-progress',
          onClick: () => setSelectedView('matrix-progress'),
          className: `btn ${selectedView === 'matrix-progress' ? 'btn-primary' : 'btn-secondary'}`,
          style: { minWidth: '120px' }
        }, '📊 Matrix Progress')
      ])
    ]),

    // Content based on selected view
    selectedView === 'overview' && React.createElement(TeamOverview, {
      key: 'overview',
      players,
      sessions,
      matrixSessions
    }),

    selectedView === 'progress' && React.createElement(window.CoachComponents.ProgressTracking, {
      key: 'progress',
      players,
      sessions,
      matrixSessions
    }),

    selectedView === 'alerts' && React.createElement(window.CoachComponents.PerformanceAlerts, {
      key: 'alerts',
      players,
      sessions,
      matrixSessions
    }),

    selectedView === 'participation' && React.createElement(window.CoachComponents.ParticipationTracking, {
      key: 'participation',
      players,
      sessions,
      matrixSessions
    }),

    selectedView === 'leaderboard' && React.createElement(PersonalBestsLeaderboard, {
      key: 'leaderboard',
      players,
      sessions
    }),

    selectedView === 'matrix-leaderboard' && React.createElement(MatrixLeaderboard, {
      key: 'matrix-leaderboard',
      players,
      matrixSessions
    }),

    selectedView === 'matrix-progress' && React.createElement(MatrixProgressTracking, {
      key: 'matrix-progress',
      players,
      matrixSessions
    })
  ]);
};

// Export components
window.CoachComponents = {
  CoachView,
  TeamOverview,
  PersonalBestsLeaderboard,
  MatrixLeaderboard,
  MatrixProgressTracking,
  // Keep existing components
  ProgressTracking: window.CoachComponents?.ProgressTracking,
  PerformanceAlerts: window.CoachComponents?.PerformanceAlerts,
  ParticipationTracking: window.CoachComponents?.ParticipationTracking
};

