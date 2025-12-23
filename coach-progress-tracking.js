// ========================================
// COACH PROGRESS TRACKING COMPONENT
// Monthly trend analysis for each player
// ========================================

const ProgressTracking = ({ players, sessions }) => {
  const [selectedPlayer, setSelectedPlayer] = React.useState('');
  const [selectedMetric, setSelectedMetric] = React.useState('runTime');

  // MOVED: Define calculateMonthlyMetric BEFORE useMemo
  const calculateMonthlyMetric = (sessions, metric) => {
    if (metric === 'runTime') {
      const times = sessions
        .map(s => window.utils.parseRunTime(s.runTime))
        .filter(t => t !== null);
      
      if (times.length === 0) return { value: null, formatted: 'N/A', trend: null };
      
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      return { 
        value: avg, 
        formatted: window.utils.formatRunTime(avg),
        trend: 'lower' // Lower is better for run time
      };
    }

    if (metric === 'leftSingle' || metric === 'rightSingle' || metric === 'doubleSingle' || 
        metric === 'leftTriple' || metric === 'rightTriple' || metric === 'doubleTriple') {
      const jumps = sessions
        .map(s => s.broadJumps[metric])
        .filter(j => j > 0);
      
      if (jumps.length === 0) return { value: null, formatted: 'N/A', trend: null };
      
      const avg = jumps.reduce((a, b) => a + b, 0) / jumps.length;
      return { 
        value: avg, 
        formatted: Math.round(avg) + ' cm',
        trend: 'higher' // Higher is better
      };
    }

    if (metric === 'sprint') {
      const allSprints = sessions
        .flatMap(s => s.sprints.filter(sp => sp > 0));
      
      if (allSprints.length === 0) return { value: null, formatted: 'N/A', trend: null };
      
      const avg = allSprints.reduce((a, b) => a + b, 0) / allSprints.length;
      return { 
        value: avg, 
        formatted: avg.toFixed(1) + ' reps',
        trend: 'higher' // Higher is better
      };
    }

    if (metric === 'balance') {
      const balances = sessions.map(s => {
        const left = s.broadJumps.leftSingle;
        const right = s.broadJumps.rightSingle;
        return (left > 0 && right > 0) ? (Math.min(left, right) / Math.max(left, right)) * 100 : null;
      }).filter(b => b !== null);
      
      if (balances.length === 0) return { value: null, formatted: 'N/A', trend: null };
      
      const avg = balances.reduce((a, b) => a + b, 0) / balances.length;
      return { 
        value: avg, 
        formatted: Math.round(avg) + '%',
        trend: 'higher' // Higher is better
      };
    }

    return { value: null, formatted: 'N/A', trend: null };
  };

  // Group sessions by month for selected player
  const monthlyData = React.useMemo(() => {
    if (!selectedPlayer) return [];

    const playerSessions = sessions
      .filter(s => s.playerId === selectedPlayer)
      .sort((a, b) => window.utils.compareDates(a.date, b.date));

    // Group by month
    const byMonth = {};
    playerSessions.forEach(session => {
      const date = window.utils.parseLocalDate(session.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = {
          month: monthKey,
          sessions: [],
          label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        };
      }
      byMonth[monthKey].sessions.push(session);
    });

    // Calculate averages for each month
    return Object.values(byMonth).map(monthData => {
      const metric = calculateMonthlyMetric(monthData.sessions, selectedMetric);
      return {
        month: monthData.month,
        label: monthData.label,
        value: metric.value,
        formatted: metric.formatted,
        sessionCount: monthData.sessions.length,
        trend: metric.trend
      };
    });
  }, [selectedPlayer, selectedMetric, sessions]);

  const getTrendIndicator = (current, previous, trendType) => {
    if (!current || !previous || current === previous) return '→';
    
    if (trendType === 'lower') {
      return current < previous ? '↓' : '↑';
    } else {
      return current > previous ? '↑' : '↓';
    }
  };

  const getTrendColor = (current, previous, trendType) => {
    if (!current || !previous || current === previous) return '#6b7280';
    
    if (trendType === 'lower') {
      return current < previous ? '#10b981' : '#ef4444';
    } else {
      return current > previous ? '#10b981' : '#ef4444';
    }
  };

  const metricOptions = [
    { value: 'runTime', label: '🏃 2km Run Time' },
    { value: 'leftSingle', label: '⬅️ Left Single Jump' },
    { value: 'rightSingle', label: '➡️ Right Single Jump' },
    { value: 'doubleSingle', label: '🦘 Double Single Jump' },
    { value: 'leftTriple', label: '⬅️⬅️⬅️ Left Triple Jump' },
    { value: 'rightTriple', label: '➡️➡️➡️ Right Triple Jump' },
    { value: 'doubleTriple', label: '🦘🦘🦘 Double Triple Jump' },
    { value: 'sprint', label: '⚡ Sprint Average' },
    { value: 'balance', label: '⚖️ Jump Balance' }
  ];

  return React.createElement('div', { className: 'card' }, [
    React.createElement('h3', {
      key: 'header',
      className: 'section-header'
    }, '📈 Player Progress Tracking'),

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
      React.createElement('div', { key: 'metric' }, [
        React.createElement('label', { key: 'label' }, 'Select Metric'),
        React.createElement('select', {
          key: 'select',
          value: selectedMetric,
          onChange: (e) => setSelectedMetric(e.target.value)
        }, metricOptions.map(opt =>
          React.createElement('option', { key: opt.value, value: opt.value }, opt.label)
        ))
      ])
    ]),

    // Monthly Progress Display
    selectedPlayer && monthlyData.length > 0 ? React.createElement('div', {
      key: 'progress',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }
    }, monthlyData.map((month, idx) => {
      const previous = idx > 0 ? monthlyData[idx - 1] : null;
      const trend = previous ? getTrendIndicator(month.value, previous.value, month.trend) : '—';
      const trendColor = previous ? getTrendColor(month.value, previous.value, month.trend) : '#6b7280';
      
      return React.createElement('div', {
        key: month.month,
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          background: idx === monthlyData.length - 1 ? '#eff6ff' : '#f9fafb',
          borderRadius: '0.5rem',
          border: idx === monthlyData.length - 1 ? '2px solid #3b82f6' : '1px solid #e5e7eb'
        }
      }, [
        React.createElement('div', {
          key: 'info',
          style: { flex: 1 }
        }, [
          React.createElement('p', {
            key: 'month',
            style: {
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '0.25rem'
            }
          }, month.label),
          React.createElement('p', {
            key: 'sessions',
            style: {
              fontSize: '0.75rem',
              color: '#6b7280'
            }
          }, `${month.sessionCount} session${month.sessionCount !== 1 ? 's' : ''}`)
        ]),
        React.createElement('div', {
          key: 'value',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }
        }, [
          React.createElement('span', {
            key: 'formatted',
            style: {
              fontSize: '1.25rem',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              color: '#1f2937'
            }
          }, month.formatted),
          React.createElement('span', {
            key: 'trend',
            style: {
              fontSize: '1.5rem',
              color: trendColor,
              fontWeight: 'bold',
              minWidth: '1.5rem',
              textAlign: 'center'
            }
          }, trend)
        ])
      ]);
    })) : React.createElement('div', {
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
        ? 'No training data available for this player' 
        : 'Select a player to view their progress')
    ])
  ]);
};

window.CoachComponents.ProgressTracking = ProgressTracking;
console.log('✅ Progress Tracking Component loaded');