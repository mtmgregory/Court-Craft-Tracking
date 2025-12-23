// ========================================
// PARTICIPATION TRACKING
// Monitor who's training regularly for monthly testing
// ========================================

const ParticipationTracking = ({ players, sessions }) => {
  const participationData = React.useMemo(() => {
    const today = new Date();
    
    return players.map(player => {
      const playerSessions = sessions
        .filter(s => s.playerId === player.id)
        .sort((a, b) => window.utils.compareDates(b.date, a.date));

      if (playerSessions.length === 0) {
        return {
          player: player.name,
          playerId: player.id,
          status: 'never',
          lastSession: null,
          daysSince: null,
          sessionCount: 0,
          recentCount: 0
        };
      }

      const lastSession = playerSessions[0];
      const lastDate = window.utils.parseLocalDate(lastSession.date);
      const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

      // For monthly testing: 35 days = month + 5 day buffer
      let status;
      if (daysSince <= 35) {
        status = 'active';
      } else if (daysSince <= 65) { // 2 months + buffer
        status = 'needs-checkin';
      } else {
        status = 'inactive';
      }

      // Count recent sessions (last 90 days)
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const recentCount = playerSessions.filter(s => {
        const date = window.utils.parseLocalDate(s.date);
        return date >= ninetyDaysAgo;
      }).length;

      return {
        player: player.name,
        playerId: player.id,
        status,
        lastSession: lastSession.date,
        daysSince,
        sessionCount: playerSessions.length,
        recentCount
      };
    }).sort((a, b) => {
      // Sort by status priority, then days since
      const statusOrder = { never: 0, inactive: 1, 'needs-checkin': 2, active: 3 };
      if (a.status !== b.status) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      // For same status, sort by days (more days = higher priority)
      if (a.daysSince === null) return -1;
      if (b.daysSince === null) return 1;
      return b.daysSince - a.daysSince;
    });
  }, [players, sessions]);

  const summary = React.useMemo(() => {
    return {
      active: participationData.filter(p => p.status === 'active').length,
      needsCheckin: participationData.filter(p => p.status === 'needs-checkin').length,
      inactive: participationData.filter(p => p.status === 'inactive').length,
      never: participationData.filter(p => p.status === 'never').length
    };
  }, [participationData]);

  const StatusBadge = ({ status }) => {
    const config = {
      active: { label: '✅ Active', color: '#10b981', bg: '#d1fae5' },
      'needs-checkin': { label: '⚠️ Needs Check-in', color: '#f59e0b', bg: '#fef3c7' },
      inactive: { label: '🔴 Inactive', color: '#ef4444', bg: '#fee2e2' },
      never: { label: '❓ Never Trained', color: '#6b7280', bg: '#f3f4f6' }
    };
    
    const style = config[status];
    
    return React.createElement('span', {
      style: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        background: style.bg,
        color: style.color,
        borderRadius: '0.25rem',
        fontSize: '0.75rem',
        fontWeight: '600',
        border: `1px solid ${style.color}`
      }
    }, style.label);
  };

  return React.createElement('div', { className: 'card' }, [
    React.createElement('h3', {
      key: 'header',
      className: 'section-header'
    }, '📅 Participation Tracking'),

    // Summary Cards
    React.createElement('div', {
      key: 'summary',
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }
    }, [
      React.createElement('div', {
        key: 'active',
        style: {
          padding: '1rem',
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          borderRadius: '0.5rem',
          border: '2px solid #10b981',
          textAlign: 'center'
        }
      }, [
        React.createElement('p', {
          key: 'icon',
          style: { fontSize: '2rem', marginBottom: '0.25rem' }
        }, '✅'),
        React.createElement('p', {
          key: 'count',
          style: { fontSize: '1.75rem', fontWeight: 'bold', color: '#065f46' }
        }, summary.active),
        React.createElement('p', {
          key: 'label',
          style: { fontSize: '0.75rem', color: '#065f46', fontWeight: '600', marginTop: '0.25rem' }
        }, 'Active')
      ]),
      React.createElement('div', {
        key: 'checkin',
        style: {
          padding: '1rem',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '0.5rem',
          border: '2px solid #f59e0b',
          textAlign: 'center'
        }
      }, [
        React.createElement('p', {
          key: 'icon',
          style: { fontSize: '2rem', marginBottom: '0.25rem' }
        }, '⚠️'),
        React.createElement('p', {
          key: 'count',
          style: { fontSize: '1.75rem', fontWeight: 'bold', color: '#92400e' }
        }, summary.needsCheckin),
        React.createElement('p', {
          key: 'label',
          style: { fontSize: '0.75rem', color: '#92400e', fontWeight: '600', marginTop: '0.25rem' }
        }, 'Needs Check-in')
      ]),
      React.createElement('div', {
        key: 'inactive',
        style: {
          padding: '1rem',
          background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          borderRadius: '0.5rem',
          border: '2px solid #ef4444',
          textAlign: 'center'
        }
      }, [
        React.createElement('p', {
          key: 'icon',
          style: { fontSize: '2rem', marginBottom: '0.25rem' }
        }, '🔴'),
        React.createElement('p', {
          key: 'count',
          style: { fontSize: '1.75rem', fontWeight: 'bold', color: '#991b1b' }
        }, summary.inactive),
        React.createElement('p', {
          key: 'label',
          style: { fontSize: '0.75rem', color: '#991b1b', fontWeight: '600', marginTop: '0.25rem' }
        }, 'Inactive')
      ]),
      React.createElement('div', {
        key: 'never',
        style: {
          padding: '1rem',
          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          borderRadius: '0.5rem',
          border: '2px solid #6b7280',
          textAlign: 'center'
        }
      }, [
        React.createElement('p', {
          key: 'icon',
          style: { fontSize: '2rem', marginBottom: '0.25rem' }
        }, '❓'),
        React.createElement('p', {
          key: 'count',
          style: { fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937' }
        }, summary.never),
        React.createElement('p', {
          key: 'label',
          style: { fontSize: '0.75rem', color: '#1f2937', fontWeight: '600', marginTop: '0.25rem' }
        }, 'Never Trained')
      ])
    ]),

    // Info Box
    React.createElement('div', {
      key: 'info',
      style: {
        background: '#eff6ff',
        border: '2px solid #3b82f6',
        borderRadius: '0.5rem',
        padding: '1rem',
        marginBottom: '1.5rem',
        fontSize: '0.875rem',
        color: '#1e40af'
      }
    }, [
      React.createElement('p', {
        key: 'title',
        style: { fontWeight: '600', marginBottom: '0.5rem' }
      }, 'ℹ️ Status Definitions (Monthly Testing)'),
      React.createElement('ul', {
        key: 'list',
        style: { marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }
      }, [
        React.createElement('li', { key: 'active' }, '✅ Active: Tested within 35 days'),
        React.createElement('li', { key: 'checkin' }, '⚠️ Needs Check-in: 35-65 days since last test'),
        React.createElement('li', { key: 'inactive' }, '🔴 Inactive: More than 65 days since last test'),
        React.createElement('li', { key: 'never' }, '❓ Never Trained: No sessions recorded')
      ])
    ]),

    // Player List
    React.createElement('div', {
      key: 'list',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }
    }, participationData.map(player =>
      React.createElement('div', {
        key: player.playerId,
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          background: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }
      }, [
        React.createElement('div', {
          key: 'info',
          style: { flex: '1 1 200px' }
        }, [
          React.createElement('p', {
            key: 'name',
            style: { fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }
          }, player.player),
          React.createElement('p', {
            key: 'stats',
            style: { fontSize: '0.75rem', color: '#6b7280' }
          }, player.status === 'never' 
            ? 'No sessions recorded'
            : `${player.sessionCount} total sessions • ${player.recentCount} in last 90 days`)
        ]),
        React.createElement('div', {
          key: 'status',
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }
        }, [
          player.daysSince !== null && React.createElement('div', {
            key: 'days',
            style: { textAlign: 'right' }
          }, [
            React.createElement('p', {
              key: 'number',
              style: {
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: player.status === 'active' ? '#10b981' : 
                       player.status === 'needs-checkin' ? '#f59e0b' : '#ef4444',
                fontFamily: 'monospace'
              }
            }, player.daysSince),
            React.createElement('p', {
              key: 'label',
              style: { fontSize: '0.75rem', color: '#6b7280' }
            }, 'days ago')
          ]),
          React.createElement(StatusBadge, {
            key: 'badge',
            status: player.status
          })
        ])
      ])
    ))
  ]);
};

window.CoachComponents.ParticipationTracking = ParticipationTracking;
console.log('✅ Participation Tracking Component loaded');