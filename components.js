// ========================================
// COMBINED COMPONENTS FILE - FIXED VERSION
// All React components in one file for better performance
// ========================================

const { useState, useEffect, useMemo } = React;

// Fix icon components to return React elements
const Activity = () => React.createElement('span', { role: 'img', 'aria-label': 'activity' }, '🏃');
const Users = () => React.createElement('span', { role: 'img', 'aria-label': 'users' }, '👥');
const Calendar = () => React.createElement('span', { role: 'img', 'aria-label': 'calendar' }, '📅');
const TrendingUp = () => React.createElement('span', { role: 'img', 'aria-label': 'trending' }, '📈');

// ========================================
// ERROR BOUNDARY
// ========================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: {padding: '20px', background: '#fee', border: '2px solid #f00', margin: '20px', borderRadius: '8px'}
      }, [
        React.createElement('h2', {key: 'h2'}, 'Something went wrong!'),
        React.createElement('details', {style: {whiteSpace: 'pre-wrap', marginTop: '10px'}, key: 'details'}, [
          React.createElement('summary', {key: 'summary'}, 'Click for error details'),
          React.createElement('p', {key: 'error'}, React.createElement('strong', null, 'Error: '), this.state.error && this.state.error.toString()),
          React.createElement('p', {key: 'stack-label'}, React.createElement('strong', null, 'Stack:')),
          React.createElement('pre', {key: 'stack'}, this.state.errorInfo && this.state.errorInfo.componentStack)
        ])
      ]);
    }
    return this.props.children;
  }
}

// ========================================
// NAVIGATION
// ========================================
const Navigation = ({ view, setView }) => {
  return React.createElement('nav', null,
    React.createElement('div', { className: 'nav-container' }, [
      React.createElement('h1', { className: 'nav-title', key: 'title' }, [
        React.createElement(Activity, { key: 'icon' }),
        'PerformanceDB'
      ]),
      React.createElement('div', { className: 'nav-buttons', key: 'buttons' }, [
        React.createElement('button', {
          key: 'record',
          onClick: () => setView('record'),
          className: `nav-button ${view === 'record' ? 'active' : ''}`
        }, 'Record Session'),
        React.createElement('button', {
          key: 'insights',
          onClick: () => setView('insights'),
          className: `nav-button ${view === 'insights' ? 'active' : ''}`
        }, 'Insights'),
        React.createElement('button', {
          key: 'history',
          onClick: () => setView('history'),
          className: `nav-button ${view === 'history' ? 'active' : ''}`
        }, 'History')
      ])
    ])
  );
};

// ========================================
// ADD PLAYER
// ========================================
const AddPlayer = ({ onPlayerAdded }) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) {
      alert('Please enter a player name');
      return;
    }

    setIsSubmitting(true);
    try {
      const player = await window.firebaseService.addPlayer(newPlayerName);
      onPlayerAdded(player);
      setNewPlayerName('');
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Error adding player: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return React.createElement('div', { className: 'card' }, [
    React.createElement('h2', { className: 'section-header', key: 'header' }, [
      React.createElement(Users, { key: 'icon' }),
      'Add New Player'
    ]),
    React.createElement('div', { className: 'flex flex-gap', key: 'form' }, [
      React.createElement('input', {
        key: 'input',
        type: 'text',
        value: newPlayerName,
        onChange: (e) => setNewPlayerName(e.target.value),
        onKeyDown: (e) => {
          if (e.key === 'Enter' && !isSubmitting) handleAddPlayer();
        },
        placeholder: 'Player name',
        disabled: isSubmitting
      }),
      React.createElement('button', {
        key: 'button',
        onClick: handleAddPlayer,
        className: 'btn btn-success',
        disabled: isSubmitting
      }, isSubmitting ? 'Adding...' : 'Add')
    ])
  ]);
};

// ========================================
// PLAYER LIST
// ========================================
const PlayerList = ({ players, sessions }) => {
  const getPlayerSessionCount = (playerId) => {
    return sessions.filter(s => s.playerId === playerId).length;
  };

  return React.createElement('div', { className: 'card' }, [
    React.createElement('h3', { className: 'section-header', key: 'header' }, [
      React.createElement(Users, { key: 'icon' }),
      `Current Players (${players.length})`
    ]),
    React.createElement('div', { className: 'grid-2 grid-players', key: 'list' },
      players.length === 0
        ? React.createElement('p', {
            className: 'text-gray-500 text-center py-8 col-span-2'
          }, 'No players added yet')
        : players.map(player =>
            React.createElement('div', {
              key: player.id,
              className: 'player-card'
            }, [
              React.createElement('p', { className: 'player-name', key: 'name' }, player.name),
              React.createElement('p', { className: 'player-sessions', key: 'sessions' },
                `${getPlayerSessionCount(player.id)} sessions`
              )
            ])
          )
    )
  ]);
};

// ========================================
// RECENT SESSIONS
// ========================================
const RecentSessions = ({ sessions }) => {
  return React.createElement('div', { className: 'card' }, [
    React.createElement('h3', { className: 'section-header', key: 'header' }, 'Recent Training Sessions'),
    React.createElement('div', { className: 'space-y-4 overflow-auto max-h-96', key: 'list' },
      sessions.length === 0
        ? React.createElement('p', {
            className: 'text-gray-500 text-center py-8'
          }, 'No training sessions recorded yet')
        : sessions.slice(0, 5).map(session =>
            React.createElement('div', {
              key: session.id,
              className: 'session-card'
            },
              React.createElement('div', { className: 'session-header' }, [
                React.createElement('div', { key: 'info' }, [
                  React.createElement('p', { className: 'session-player', key: 'name' }, session.playerName),
                  React.createElement('p', { className: 'session-date', key: 'date' },
                    new Date(session.date).toLocaleDateString()
                  )
                ]),
                React.createElement('div', { key: 'time' },
                  React.createElement('p', { className: 'session-time' }, session.runTime || 'N/A')
                )
              ])
            )
          )
    )
  ]);
};

// ========================================
// TRAINING FORM
// ========================================
const TrainingForm = ({ players, onSessionSaved }) => {
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    runTime: '',
    leftSingle: '', rightSingle: '', doubleSingle: '',
    leftTriple: '', rightTriple: '', doubleTriple: '',
    sprint1: '', sprint2: '', sprint3: '',
    sprint4: '', sprint5: '', sprint6: ''
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      runTime: '',
      leftSingle: '', rightSingle: '', doubleSingle: '',
      leftTriple: '', rightTriple: '', doubleTriple: '',
      sprint1: '', sprint2: '', sprint3: '',
      sprint4: '', sprint5: '', sprint6: ''
    });
  };

  const handleSubmit = async () => {
    if (!selectedPlayer) {
      alert('Please select a player');
      return;
    }

    if (formData.runTime && !window.utils.validateRunTime(formData.runTime)) {
      alert('Please enter run time in MM:SS format (e.g., 07:30)');
      return;
    }

    setIsSubmitting(true);

    const session = {
      playerId: selectedPlayer,
      playerName: players.find(p => p.id === selectedPlayer)?.name,
      date: formData.date,
      runTime: formData.runTime,
      broadJumps: {
        leftSingle: parseFloat(formData.leftSingle) || 0,
        rightSingle: parseFloat(formData.rightSingle) || 0,
        doubleSingle: parseFloat(formData.doubleSingle) || 0,
        leftTriple: parseFloat(formData.leftTriple) || 0,
        rightTriple: parseFloat(formData.rightTriple) || 0,
        doubleTriple: parseFloat(formData.doubleTriple) || 0
      },
      sprints: [
        parseFloat(formData.sprint1) || 0,
        parseFloat(formData.sprint2) || 0,
        parseFloat(formData.sprint3) || 0,
        parseFloat(formData.sprint4) || 0,
        parseFloat(formData.sprint5) || 0,
        parseFloat(formData.sprint6) || 0
      ]
    };

    try {
      const savedSession = await window.firebaseService.addSession(session);
      onSessionSaved(savedSession);
      resetForm();
      alert('Training session saved!');
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Error saving session: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return React.createElement('div', { className: 'card' }, [
    React.createElement('h2', { className: 'section-header', key: 'header' }, [
      React.createElement(Calendar, { key: 'icon' }),
      'Record Training Session'
    ]),
    React.createElement('div', { className: 'space-y-4', key: 'form' }, [
      // Player Select
      React.createElement('div', { key: 'player' }, [
        React.createElement('label', { key: 'label' }, 'Player'),
        React.createElement('select', {
          key: 'select',
          value: selectedPlayer,
          onChange: (e) => setSelectedPlayer(e.target.value),
          disabled: isSubmitting
        }, [
          React.createElement('option', { value: '', key: 'default' }, 'Select Player...'),
          ...players.map(player =>
            React.createElement('option', { key: player.id, value: player.id }, player.name)
          )
        ])
      ]),
      
      // Date
      React.createElement('div', { key: 'date' }, [
        React.createElement('label', { key: 'label' }, 'Date'),
        React.createElement('input', {
          key: 'input',
          type: 'date',
          value: formData.date,
          onChange: (e) => updateFormData('date', e.target.value),
          disabled: isSubmitting
        })
      ]),
      
      // Run Time
      React.createElement('div', { className: 'border-t', key: 'run' }, [
        React.createElement('label', { className: 'section-label', key: 'label' }, '1. Endurance (2km Run)'),
        React.createElement('input', {
          key: 'input',
          type: 'text',
          placeholder: 'MM:SS (e.g., 07:30)',
          value: formData.runTime,
          onChange: (e) => updateFormData('runTime', e.target.value),
          disabled: isSubmitting
        })
      ]),
      
      // Broad Jumps
      React.createElement('div', { className: 'border-t', key: 'jumps' }, [
        React.createElement('label', { className: 'section-label', key: 'label' }, '2. Broad Jumps (Distance in cm)'),
        React.createElement('div', { className: 'grid-2', key: 'grid' }, [
          React.createElement('input', {
            key: 'leftSingle',
            type: 'number',
            placeholder: 'L Single',
            value: formData.leftSingle,
            onChange: (e) => updateFormData('leftSingle', e.target.value),
            disabled: isSubmitting
          }),
          React.createElement('input', {
            key: 'rightSingle',
            type: 'number',
            placeholder: 'R Single',
            value: formData.rightSingle,
            onChange: (e) => updateFormData('rightSingle', e.target.value),
            disabled: isSubmitting
          }),
          React.createElement('input', {
            key: 'doubleSingle',
            type: 'number',
            placeholder: 'Double',
            value: formData.doubleSingle,
            onChange: (e) => updateFormData('doubleSingle', e.target.value),
            disabled: isSubmitting,
            className: 'col-span-2'
          }),
          React.createElement('input', {
            key: 'leftTriple',
            type: 'number',
            placeholder: 'L Triple',
            value: formData.leftTriple,
            onChange: (e) => updateFormData('leftTriple', e.target.value),
            disabled: isSubmitting
          }),
          React.createElement('input', {
            key: 'rightTriple',
            type: 'number',
            placeholder: 'R Triple',
            value: formData.rightTriple,
            onChange: (e) => updateFormData('rightTriple', e.target.value),
            disabled: isSubmitting
          }),
          React.createElement('input', {
            key: 'doubleTriple',
            type: 'number',
            placeholder: 'Double Triple',
            value: formData.doubleTriple,
            onChange: (e) => updateFormData('doubleTriple', e.target.value),
            disabled: isSubmitting,
            className: 'col-span-2'
          })
        ])
      ]),
      
      // Sprints
      React.createElement('div', { className: 'border-t', key: 'sprints' }, [
        React.createElement('label', { className: 'section-label', key: 'label' }, '3. Court Sprints (6 x 30s)'),
        React.createElement('div', { className: 'grid-3-cols', key: 'grid' },
          [1, 2, 3, 4, 5, 6].map(num =>
            React.createElement('input', {
              key: num,
              type: 'number',
              placeholder: `Set ${num}`,
              value: formData[`sprint${num}`],
              onChange: (e) => updateFormData(`sprint${num}`, e.target.value),
              disabled: isSubmitting
            })
          )
        )
      ]),
      
      // Submit Button
      React.createElement('button', {
        key: 'submit',
        onClick: handleSubmit,
        className: 'btn btn-primary',
        disabled: isSubmitting
      }, isSubmitting ? 'Saving...' : 'Save Training Session')
    ])
  ]);
};

// ========================================
// HISTORY VIEW
// ========================================
const HistoryView = ({ players, sessions }) => {
  const [selectedPlayer, setSelectedPlayer] = useState('');

  const filteredSessions = useMemo(() => {
    if (!selectedPlayer) return sessions;
    return window.analyticsService.getPlayerSessions(sessions, selectedPlayer);
  }, [selectedPlayer, sessions]);

  return React.createElement('div', { className: 'card' }, [
    React.createElement('h2', { className: 'section-header', key: 'header' }, 'Training History'),
    React.createElement('div', { className: 'mb-4', key: 'filter' },
      React.createElement('select', {
        value: selectedPlayer,
        onChange: (e) => setSelectedPlayer(e.target.value),
        style: { maxWidth: '28rem' }
      }, [
        React.createElement('option', { value: '', key: 'all' }, 'All Players'),
        ...players.map(player =>
          React.createElement('option', { key: player.id, value: player.id }, player.name)
        )
      ])
    ),
    React.createElement('div', { className: 'space-y-4 overflow-auto max-h-600', key: 'list' },
      filteredSessions.length === 0
        ? React.createElement('p', {
            className: 'text-gray-500 text-center py-8'
          }, 'No training sessions found')
        : filteredSessions.map(session =>
            React.createElement('div', { key: session.id, className: 'history-detail' }, [
              // Header
              React.createElement('div', { className: 'session-header mb-4', key: 'header' }, [
                React.createElement('div', { key: 'info' }, [
                  React.createElement('h3', {
                    className: 'session-player',
                    style: { fontSize: '1.125rem' },
                    key: 'name'
                  }, session.playerName),
                  React.createElement('p', { className: 'session-date', key: 'date' },
                    window.utils.formatDateLong(session.date)
                  )
                ]),
                React.createElement('div', { key: 'time' }, [
                  React.createElement('p', { className: 'session-date', key: 'label' }, '2km Run Time'),
                  React.createElement('p', { className: 'session-time', key: 'value' }, session.runTime || 'N/A')
                ])
              ]),
              
              // Details Grid
              React.createElement('div', { className: 'detail-grid', key: 'details' }, [
                // Broad Jumps
                React.createElement('div', { className: 'detail-section', key: 'jumps' }, [
                  React.createElement('p', { className: 'detail-title', key: 'title' }, 'Broad Jumps (cm)'),
                  React.createElement('div', { style: { marginTop: '0.5rem' }, key: 'values' }, [
                    React.createElement('p', { key: 'ls' }, `L Single: ${session.broadJumps.leftSingle || '-'}`),
                    React.createElement('p', { key: 'rs' }, `R Single: ${session.broadJumps.rightSingle || '-'}`),
                    React.createElement('p', { key: 'ds' }, `Double: ${session.broadJumps.doubleSingle || '-'}`),
                    React.createElement('p', { key: 'lt' }, `L Triple: ${session.broadJumps.leftTriple || '-'}`),
                    React.createElement('p', { key: 'rt' }, `R Triple: ${session.broadJumps.rightTriple || '-'}`),
                    React.createElement('p', { key: 'dt' }, `Double Triple: ${session.broadJumps.doubleTriple || '-'}`)
                  ])
                ]),
                
                // Sprints
                React.createElement('div', { className: 'detail-section', key: 'sprints' }, [
                  React.createElement('p', { className: 'detail-title', key: 'title' }, 'Sprint Sets'),
                  React.createElement('div', {
                    className: 'sprint-grid',
                    style: { marginTop: '0.5rem' },
                    key: 'grid'
                  },
                    session.sprints.map((sprint, idx) =>
                      React.createElement('div', { key: idx, className: 'sprint-box' }, [
                        React.createElement('p', { className: 'sprint-label', key: 'label' }, `Set ${idx + 1}`),
                        React.createElement('p', { className: 'sprint-value', key: 'value' }, sprint || '-')
                      ])
                    )
                  )
                ])
              ])
            ])
          )
    )
  ]);
};

// ========================================
// INSIGHTS VIEW
// ========================================
const InsightsView = ({ players, sessions, rechartsLoaded }) => {
  const [selectedPlayer, setSelectedPlayer] = useState('');

  const insights = useMemo(() => {
    if (!selectedPlayer) return null;
    return window.analyticsService.calculateInsights(sessions, selectedPlayer);
  }, [selectedPlayer, sessions]);

  const chartData = useMemo(() => {
    if (!selectedPlayer) return [];
    return window.analyticsService.getChartData(sessions, selectedPlayer);
  }, [selectedPlayer, sessions]);

  // Check if Recharts is available
  const hasRecharts = rechartsLoaded && window.Recharts && window.Recharts.LineChart;

  return React.createElement('div', { className: 'space-y-6' }, [
    // Player Selection
    React.createElement('div', { className: 'card', key: 'select' }, [
      React.createElement('h2', { className: 'section-header', key: 'header' }, [
        React.createElement(TrendingUp, { key: 'icon' }),
        'Performance Insights'
      ]),
      React.createElement('select', {
        key: 'dropdown',
        value: selectedPlayer,
        onChange: (e) => setSelectedPlayer(e.target.value),
        style: { maxWidth: '28rem' }
      }, [
        React.createElement('option', { value: '', key: 'default' }, 'Select a player to view insights...'),
        ...players.map(player =>
          React.createElement('option', { key: player.id, value: player.id }, player.name)
        )
      ])
    ]),

    // Insights Cards
    selectedPlayer && insights && React.createElement('div', { className: 'grid-4', key: 'insights' }, [
      React.createElement('div', {
        key: 'sessions',
        className: 'insight-card green',
        style: { '--from-color': '#10b981', '--to-color': '#059669' }
      }, [
        React.createElement('p', { className: 'insight-label', key: 'label' }, 'Total Sessions'),
        React.createElement('p', { className: 'insight-value', key: 'value' }, insights.totalSessions)
      ]),
      
      React.createElement('div', {
        key: 'runtime',
        className: 'insight-card blue',
        style: { '--from-color': '#3b82f6', '--to-color': '#2563eb' }
      }, [
        React.createElement('p', { className: 'insight-label', key: 'label' }, 'Avg Run Time'),
        React.createElement('p', { className: 'insight-value', key: 'value' }, insights.avgRunTime)
      ]),
      
      React.createElement('div', {
        key: 'balance',
        className: 'insight-card orange',
        style: { '--from-color': '#f59e0b', '--to-color': '#d97706' }
      }, [
        React.createElement('p', { className: 'insight-label', key: 'label' }, 'Jump Balance'),
        React.createElement('p', { className: 'insight-value', key: 'value' }, insights.jumpBalance)
      ]),
      
      React.createElement('div', {
        key: 'fatigue',
        className: 'insight-card purple',
        style: { '--from-color': '#a855f7', '--to-color': '#9333ea' }
      }, [
        React.createElement('p', { className: 'insight-label', key: 'label' }, 'Fatigue Dropoff'),
        React.createElement('p', { className: 'insight-value', key: 'value' }, insights.fatigueDropoff)
      ])
    ]),

    // Charts - only show if Recharts is loaded
    selectedPlayer && chartData.length > 0 && hasRecharts && (() => {
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = window.Recharts;
      
      return React.createElement('div', { className: 'card', key: 'charts' }, [
        React.createElement('h3', { className: 'section-header', key: 'header' }, 'Performance Trends'),
        
        // Sprint Performance Chart
        React.createElement('div', { style: { marginBottom: '2rem' }, key: 'sprint-chart' }, [
          React.createElement('h4', {
            key: 'title',
            style: { fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }
          }, 'Sprint Performance (First vs Last Set)'),
          React.createElement(ResponsiveContainer, { width: '100%', height: 300, key: 'container' },
            React.createElement(LineChart, { data: chartData }, [
              React.createElement(CartesianGrid, { strokeDasharray: '3 3', key: 'grid' }),
              React.createElement(XAxis, { dataKey: 'date', key: 'xaxis' }),
              React.createElement(YAxis, { key: 'yaxis' }),
              React.createElement(Tooltip, { key: 'tooltip' }),
              React.createElement(Legend, { key: 'legend' }),
              React.createElement(Line, {
                key: 'sprint1',
                type: 'monotone',
                dataKey: 'sprint1',
                stroke: '#3b82f6',
                strokeWidth: 2,
                name: 'First Sprint'
              }),
              React.createElement(Line, {
                key: 'sprint6',
                type: 'monotone',
                dataKey: 'sprint6',
                stroke: '#ef4444',
                strokeWidth: 2,
                name: 'Last Sprint'
              })
            ])
          )
        ]),
        
        // Jump Performance Chart
        React.createElement('div', { key: 'jump-chart' }, [
          React.createElement('h4', {
            key: 'title',
            style: { fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }
          }, 'Broad Jump Performance (Single Leg)'),
          React.createElement(ResponsiveContainer, { width: '100%', height: 300, key: 'container' },
            React.createElement(LineChart, { data: chartData }, [
              React.createElement(CartesianGrid, { strokeDasharray: '3 3', key: 'grid' }),
              React.createElement(XAxis, { dataKey: 'date', key: 'xaxis' }),
              React.createElement(YAxis, { key: 'yaxis' }),
              React.createElement(Tooltip, { key: 'tooltip' }),
              React.createElement(Legend, { key: 'legend' }),
              React.createElement(Line, {
                key: 'left',
                type: 'monotone',
                dataKey: 'leftJump',
                stroke: '#10b981',
                strokeWidth: 2,
                name: 'Left Leg'
              }),
              React.createElement(Line, {
                key: 'right',
                type: 'monotone',
                dataKey: 'rightJump',
                stroke: '#f59e0b',
                strokeWidth: 2,
                name: 'Right Leg'
              })
            ])
          )
        ])
      ]);
    })(),

    // Show message if charts aren't available
    selectedPlayer && chartData.length > 0 && !hasRecharts && React.createElement('div', { className: 'card', key: 'no-charts' },
      React.createElement('p', { 
        className: 'text-center py-8 text-gray-500',
        style: { fontStyle: 'italic' }
      }, '📊 Charts are loading... If they don\'t appear, please refresh the page.')
    )
  ]);
};

// ========================================
// RECORD VIEW
// ========================================
const RecordView = ({ players, sessions, onPlayerAdded, onSessionSaved }) => {
  return React.createElement('div', { className: 'grid-3' }, [
    React.createElement('div', { className: 'space-y-6', key: 'col1' }, [
      React.createElement(AddPlayer, { onPlayerAdded, key: 'add' }),
      React.createElement(TrainingForm, { players, onSessionSaved, key: 'form' })
    ]),
    React.createElement('div', { className: 'space-y-6', key: 'col2' }, [
      React.createElement(PlayerList, { players, sessions, key: 'list' }),
      React.createElement(RecentSessions, { sessions, key: 'recent' })
    ])
  ]);
};

// ========================================
// EXPORT TO WINDOW
// ========================================
window.Components = {
  ErrorBoundary,
  Navigation,
  AddPlayer,
  PlayerList,
  RecentSessions,
  TrainingForm,
  HistoryView,
  InsightsView,
  RecordView
};