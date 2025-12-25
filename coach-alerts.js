// ========================================
// PERFORMANCE ALERTS & INSIGHTS
// Regression detection, breakthroughs, warnings
// NOW INCLUDES MATRIX SESSIONS
// ========================================

const PerformanceAlerts = ({ players, sessions, matrixSessions = [] }) => {
  const alerts = React.useMemo(() => {
    const allAlerts = [];

    players.forEach(player => {
      // ========================================
      // TRADITIONAL SESSION ALERTS
      // ========================================
      const playerSessions = sessions
        .filter(s => s.playerId === player.id)
        .sort((a, b) => window.utils.compareDates(a.date, b.date));

      if (playerSessions.length >= 2) {
        const recent = playerSessions.slice(-2);
        const [previous, latest] = recent;

        // 1. Check for performance regression
        if (latest.runTime && previous.runTime) {
          const latestTime = window.utils.parseRunTime(latest.runTime);
          const prevTime = window.utils.parseRunTime(previous.runTime);
          
          if (latestTime && prevTime) {
            const change = ((latestTime - prevTime) / prevTime) * 100;
            
            if (change > 5) { // More than 5% slower
              allAlerts.push({
                type: 'regression',
                severity: change > 10 ? 'urgent' : 'attention',
                player: player.name,
                playerId: player.id,
                metric: '2km Run Time',
                message: `Run time increased by ${change.toFixed(1)}% (${window.utils.formatRunTime(prevTime)} → ${window.utils.formatRunTime(latestTime)})`,
                date: latest.date
              });
            }
          }
        }

        // 2. Check for breakthrough (new personal best)
        const allRunTimes = playerSessions
          .map(s => window.utils.parseRunTime(s.runTime))
          .filter(t => t !== null);
        
        if (allRunTimes.length >= 2) {
          const latestTime = allRunTimes[allRunTimes.length - 1];
          const bestBefore = Math.min(...allRunTimes.slice(0, -1));
          
          if (latestTime < bestBefore) {
            const improvement = ((bestBefore - latestTime) / bestBefore) * 100;
            allAlerts.push({
              type: 'breakthrough',
              severity: 'positive',
              player: player.name,
              playerId: player.id,
              metric: '2km Run Time',
              message: `New personal best! Improved by ${improvement.toFixed(1)}% (${window.utils.formatRunTime(latestTime)})`,
              date: latest.date
            });
          }
        }

        // 3. Check for jump imbalance
        if (latest.broadJumps.leftSingle > 0 && latest.broadJumps.rightSingle > 0) {
          const left = latest.broadJumps.leftSingle;
          const right = latest.broadJumps.rightSingle;
          const balance = (Math.min(left, right) / Math.max(left, right)) * 100;
          
          if (balance < 85) { // Less than 85% balance
            const stronger = left > right ? 'left' : 'right';
            const weaker = left > right ? 'right' : 'left';
            const diff = Math.abs(left - right);
            
            allAlerts.push({
              type: 'imbalance',
              severity: balance < 75 ? 'urgent' : 'attention',
              player: player.name,
              playerId: player.id,
              metric: 'Jump Balance',
              message: `${stronger.toUpperCase()} leg ${diff}cm stronger than ${weaker} (${balance.toFixed(0)}% balance)`,
              date: latest.date
            });
          }
        }

        // 4. Check for high fatigue
        const sprints = latest.sprints.filter(s => s > 0);
        if (sprints.length >= 2) {
          const first = sprints[0];
          const last = sprints[sprints.length - 1];
          const dropoff = ((last - first) / first) * 100;
          
          if (dropoff < -25) { // More than 25% fatigue
            allAlerts.push({
              type: 'fatigue',
              severity: dropoff < -35 ? 'urgent' : 'attention',
              player: player.name,
              playerId: player.id,
              metric: 'Sprint Fatigue',
              message: `High fatigue detected (${Math.abs(dropoff).toFixed(0)}% drop from first to last set)`,
              date: latest.date
            });
          }
        }

        // 5. Check for jump breakthroughs
        ['leftSingle', 'rightSingle', 'doubleSingle', 'leftTriple', 'rightTriple', 'doubleTriple'].forEach(jumpType => {
          const allJumps = playerSessions
            .map(s => s.broadJumps[jumpType])
            .filter(j => j > 0);
          
          if (allJumps.length >= 2) {
            const latestJump = allJumps[allJumps.length - 1];
            const bestBefore = Math.max(...allJumps.slice(0, -1));
            
            if (latestJump > bestBefore) {
              const improvement = ((latestJump - bestBefore) / bestBefore) * 100;
              const jumpLabels = {
                leftSingle: 'Left Single Jump',
                rightSingle: 'Right Single Jump',
                doubleSingle: 'Double Single Jump',
                leftTriple: 'Left Triple Jump',
                rightTriple: 'Right Triple Jump',
                doubleTriple: 'Double Triple Jump'
              };
              
              allAlerts.push({
                type: 'breakthrough',
                severity: 'positive',
                player: player.name,
                playerId: player.id,
                metric: jumpLabels[jumpType],
                message: `New PB! ${latestJump}cm (+${improvement.toFixed(1)}%)`,
                date: latest.date
              });
            }
          }
        });
      }

      // ========================================
      // MATRIX SESSION ALERTS
      // ========================================
      const playerMatrixSessions = matrixSessions
        .filter(s => s.playerId === player.id)
        .sort((a, b) => window.utils.compareDates(a.date, b.date));

      if (playerMatrixSessions.length >= 2) {
        const recentMatrix = playerMatrixSessions.slice(-2);
        const [previousMatrix, latestMatrix] = recentMatrix;

        // Matrix exercise labels
        const exerciseLabels = {
  volleyFigure8: 'Volley Figure 8',
  bounceFigure8: 'Bounce Figure 8',
  volleySideToSide: 'Volley Side to Side',
  bounceSideToSide: 'Bounce Side to Side',  // ✅ ADD THIS
  dropTargetBackhand: 'Drop Target BH',
  dropTargetForehand: 'Drop Target FH',
  serviceBoxDriveForehand: 'Service Box FH',
  serviceBoxDriveBackhand: 'Service Box BH',
  cornerVolleys: 'Corner Volleys',
  beepTest: 'Beep Test',
  ballTransfer: 'Ball Transfer',
  slalom: 'Slalom'
};

        // Check each exercise for regression or breakthrough
        Object.keys(exerciseLabels).forEach(exercise => {
          const latestScore = latestMatrix.exercises[exercise];
          const previousScore = previousMatrix.exercises[exercise];

          // Only check if both sessions have this exercise recorded
          if (latestScore > 0 && previousScore > 0) {
            const change = ((latestScore - previousScore) / previousScore) * 100;

            // Regression (more than 10% decrease)
            if (change < -10) {
              allAlerts.push({
                type: 'regression',
                severity: change < -20 ? 'urgent' : 'attention',
                player: player.name,
                playerId: player.id,
                metric: `🎯 ${exerciseLabels[exercise]}`,
                message: `Score decreased by ${Math.abs(change).toFixed(1)}% (${previousScore.toFixed(1)} → ${latestScore.toFixed(1)})`,
                date: latestMatrix.date
              });
            }

            // Breakthrough (new personal best for this exercise)
            const allScoresForExercise = playerMatrixSessions
              .map(s => s.exercises[exercise])
              .filter(score => score > 0);
            
            if (allScoresForExercise.length >= 2) {
              const bestBefore = Math.max(...allScoresForExercise.slice(0, -1));
              
              if (latestScore > bestBefore) {
                const improvement = ((latestScore - bestBefore) / bestBefore) * 100;
                allAlerts.push({
                  type: 'breakthrough',
                  severity: 'positive',
                  player: player.name,
                  playerId: player.id,
                  metric: `🎯 ${exerciseLabels[exercise]}`,
                  message: `New PB! ${latestScore.toFixed(1)} (+${improvement.toFixed(1)}%)`,
                  date: latestMatrix.date
                });
              }
            }
          }
        });

        // Check for overall matrix performance
        const latestAvg = Object.values(latestMatrix.exercises)
          .filter(v => v > 0)
          .reduce((sum, val, _, arr) => sum + val / arr.length, 0);
        
        const previousAvg = Object.values(previousMatrix.exercises)
          .filter(v => v > 0)
          .reduce((sum, val, _, arr) => sum + val / arr.length, 0);

        if (latestAvg > 0 && previousAvg > 0) {
          const avgChange = ((latestAvg - previousAvg) / previousAvg) * 100;

          if (avgChange > 15) {
            allAlerts.push({
              type: 'breakthrough',
              severity: 'positive',
              player: player.name,
              playerId: player.id,
              metric: '🎯 Overall Matrix Performance',
              message: `Strong improvement across all exercises! Average score up ${avgChange.toFixed(1)}%`,
              date: latestMatrix.date
            });
          } else if (avgChange < -15) {
            allAlerts.push({
              type: 'regression',
              severity: 'attention',
              player: player.name,
              playerId: player.id,
              metric: '🎯 Overall Matrix Performance',
              message: `Average score across exercises down ${Math.abs(avgChange).toFixed(1)}%`,
              date: latestMatrix.date
            });
          }
        }
      }
    });

    // Sort by severity and date
    const severityOrder = { urgent: 0, attention: 1, positive: 2 };
    return allAlerts.sort((a, b) => {
      if (a.severity !== b.severity) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return window.utils.compareDates(b.date, a.date);
    });
  }, [players, sessions, matrixSessions]);

  // Group alerts by severity
  const groupedAlerts = React.useMemo(() => {
    return {
      urgent: alerts.filter(a => a.severity === 'urgent'),
      attention: alerts.filter(a => a.severity === 'attention'),
      positive: alerts.filter(a => a.severity === 'positive')
    };
  }, [alerts]);

  const AlertCard = ({ alert }) => {
    const colors = {
      urgent: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: '🚨' },
      attention: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: '⚠️' },
      positive: { bg: '#d1fae5', border: '#10b981', text: '#065f46', icon: '🎉' }
    };
    
    const style = colors[alert.severity];
    
    return React.createElement('div', {
      style: {
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: '0.5rem',
        padding: '1rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start'
      }
    }, [
      React.createElement('span', {
        key: 'icon',
        style: { fontSize: '1.5rem', flexShrink: 0 }
      }, style.icon),
      React.createElement('div', {
        key: 'content',
        style: { flex: 1 }
      }, [
        React.createElement('div', {
          key: 'header',
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.5rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }
        }, [
          React.createElement('p', {
            key: 'player',
            style: {
              fontWeight: 'bold',
              color: style.text,
              fontSize: '1rem'
            }
          }, alert.player),
          React.createElement('span', {
            key: 'date',
            style: {
              fontSize: '0.75rem',
              color: style.text,
              opacity: 0.8
            }
          }, window.utils.formatDate(alert.date))
        ]),
        React.createElement('p', {
          key: 'metric',
          style: {
            fontSize: '0.875rem',
            color: style.text,
            fontWeight: '600',
            marginBottom: '0.25rem'
          }
        }, alert.metric),
        React.createElement('p', {
          key: 'message',
          style: {
            fontSize: '0.875rem',
            color: style.text,
            lineHeight: '1.5'
          }
        }, alert.message)
      ])
    ]);
  };

  return React.createElement('div', { className: 'card' }, [
    React.createElement('h3', {
      key: 'header',
      className: 'section-header'
    }, '🔔 Performance Alerts & Insights'),

    // Summary Cards
    React.createElement('div', {
      key: 'summary',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }
    }, [
      React.createElement('div', {
        key: 'urgent',
        style: {
          padding: '1rem',
          background: '#fee2e2',
          borderRadius: '0.5rem',
          border: '2px solid #ef4444',
          textAlign: 'center'
        }
      }, [
        React.createElement('p', {
          key: 'label',
          style: { fontSize: '0.75rem', color: '#991b1b', fontWeight: '600' }
        }, '🚨 Urgent'),
        React.createElement('p', {
          key: 'count',
          style: { fontSize: '2rem', fontWeight: 'bold', color: '#991b1b' }
        }, groupedAlerts.urgent.length)
      ]),
      React.createElement('div', {
        key: 'attention',
        style: {
          padding: '1rem',
          background: '#fef3c7',
          borderRadius: '0.5rem',
          border: '2px solid #f59e0b',
          textAlign: 'center'
        }
      }, [
        React.createElement('p', {
          key: 'label',
          style: { fontSize: '0.75rem', color: '#92400e', fontWeight: '600' }
        }, '⚠️ Attention'),
        React.createElement('p', {
          key: 'count',
          style: { fontSize: '2rem', fontWeight: 'bold', color: '#92400e' }
        }, groupedAlerts.attention.length)
      ]),
      React.createElement('div', {
        key: 'positive',
        style: {
          padding: '1rem',
          background: '#d1fae5',
          borderRadius: '0.5rem',
          border: '2px solid #10b981',
          textAlign: 'center'
        }
      }, [
        React.createElement('p', {
          key: 'label',
          style: { fontSize: '0.75rem', color: '#065f46', fontWeight: '600' }
        }, '🎉 Breakthroughs'),
        React.createElement('p', {
          key: 'count',
          style: { fontSize: '2rem', fontWeight: 'bold', color: '#065f46' }
        }, groupedAlerts.positive.length)
      ])
    ]),

    // Alerts List
    alerts.length > 0 ? React.createElement('div', {
      key: 'list',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxHeight: '600px',
        overflowY: 'auto'
      }
    }, alerts.map((alert, idx) =>
      React.createElement(AlertCard, { key: idx, alert })
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
      }, '✅'),
      React.createElement('p', {
        key: 'text',
        style: { fontWeight: '500' }
      }, 'All clear! No alerts at this time.')
    ])
  ]);
};

window.CoachComponents.PerformanceAlerts = PerformanceAlerts;
console.log('✅ Performance Alerts Component loaded (with Matrix support)');