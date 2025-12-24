// ========================================
// COMBINED COMPONENTS FILE - PART 1 OF 4
// Icons, Error Boundary, Navigation, Basic Components
// ========================================

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
const Navigation = ({ view, setView, userRole }) => {
  const handleLogout = async () => {
    try {
      await window.authService.logout();
      window.location.reload();
    } catch (error) {
      alert('Error logging out: ' + error.message);
    }
  };
  return React.createElement('nav', null,
    React.createElement('div', { className: 'nav-container' }, [
      React.createElement('h1', { className: 'nav-title', key: 'title' }, [
        React.createElement(Activity, { key: 'icon' }),
        'Court Craft Tracker'
      ]),
      React.createElement('div', { className: 'nav-buttons', key: 'buttons' }, [
        React.createElement('button', {
          key: 'dashboard',
          onClick: () => setView('dashboard'),
          className: `nav-button ${view === 'dashboard' ? 'active' : ''}`
        }, userRole === 'coach' ? 'Coach Dashboard' : 'My Dashboard'),
        userRole === 'coach' && React.createElement('button', {
          key: 'record',
          onClick: () => setView('record'),
          className: `nav-button ${view === 'record' ? 'active' : ''}`
        }, 'Record Session'),
        userRole === 'coach' && React.createElement('button', {
          key: 'record-matrix',
          onClick: () => setView('record-matrix'),
          className: `nav-button ${view === 'record-matrix' ? 'active' : ''}`
        }, 'Record Matrix'),
        React.createElement('button', {
          key: 'insights',
          onClick: () => setView('insights'),
          className: `nav-button ${view === 'insights' ? 'active' : ''}`
        }, 'Insights'),
        React.createElement('button', {
          key: 'history',
          onClick: () => setView('history'),
          className: `nav-button ${view === 'history' ? 'active' : ''}`
        }, 'History'),
        React.createElement('button', {
          key: 'logout',
          onClick: handleLogout,
          className: 'nav-button',
          style: { 
            marginLeft: 'auto',
            background: '#ef4444',
            color: 'white'
          }
        }, 'Logout')
      ])
    ])
  );
};

// ========================================
// ADD PLAYER (Updated with validation #3)
// ========================================
const AddPlayer = ({ onPlayerAdded }) => {
  const [newPlayerName, setNewPlayerName] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleAddPlayer = async () => {
    const validation = window.utils.validators.validatePlayerName(newPlayerName);
    
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsSubmitting(true);
    try {
      const player = await window.firebaseService.addPlayer(newPlayerName);
      onPlayerAdded(player);
      setNewPlayerName('');
      alert('✅ Player added successfully!');
    } catch (error) {
      console.error('Error adding player:', error);
      alert('❌ Error adding player: ' + error.message);
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
// PLAYER LIST (WITH COACH LINKING)
// ========================================
const PlayerList = ({ players, sessions }) => {
  const [showLinkDialog, setShowLinkDialog] = React.useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = React.useState(null);
  const [registeredUsers, setRegisteredUsers] = React.useState([]);
  const [selectedUserId, setSelectedUserId] = React.useState('');
  const [isLinking, setIsLinking] = React.useState(false);
  const [linkError, setLinkError] = React.useState('');
  const [linkSuccess, setLinkSuccess] = React.useState('');

  const userRole = window.authService.currentUserData?.role;
  const isCoach = userRole === 'coach';

  const getPlayerSessionCount = (playerId) => {
    return sessions.filter(s => s.playerId === playerId).length;
  };

  const getPlayerStatus = (player) => {
    if (player.userId) {
      return { text: '✅ Linked', color: '#10b981' };
    }
    return { text: '⚪ Not Linked', color: '#6b7280' };
  };

  const handleLinkClick = async (playerId) => {
    setSelectedPlayerId(playerId);
    setLinkError('');
    setLinkSuccess('');
    setSelectedUserId('');
    
    try {
      const users = await window.authService.getRegisteredPlayerUsers();
      setRegisteredUsers(users);
      setShowLinkDialog(true);
    } catch (error) {
      alert('Error loading registered users: ' + error.message);
    }
  };

  const handleLinkSubmit = async () => {
    if (!selectedUserId) {
      setLinkError('Please select a user account');
      return;
    }

    setIsLinking(true);
    setLinkError('');
    setLinkSuccess('');

    try {
      await window.authService.linkPlayerToUserAccount(selectedPlayerId, selectedUserId);
      setLinkSuccess('✅ Successfully linked player to user account!');
      
      setTimeout(() => {
        setShowLinkDialog(false);
        window.location.reload();
      }, 2000);
    } catch (error) {
      setLinkError(error.message);
    } finally {
      setIsLinking(false);
    }
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
        : players.map(player => {
            const status = getPlayerStatus(player);
            return React.createElement('div', {
              key: player.id,
              className: 'player-card',
              style: {
                borderLeft: `4px solid ${status.color}`
              }
            }, [
              React.createElement('div', {
                key: 'header',
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem'
                }
              }, [
                React.createElement('div', { key: 'info' }, [
                  React.createElement('p', { className: 'player-name', key: 'name' }, player.name),
                  React.createElement('p', { className: 'player-sessions', key: 'sessions' },
                    `${getPlayerSessionCount(player.id)} sessions`
                  )
                ]),
                React.createElement('span', {
                  key: 'status',
                  style: {
                    fontSize: '0.75rem',
                    color: status.color,
                    fontWeight: '600'
                  }
                }, status.text)
              ]),
              isCoach && React.createElement('button', {
                key: 'link-btn',
                onClick: () => handleLinkClick(player.id),
                className: 'btn btn-secondary',
                style: {
                  width: '100%',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  padding: '0.375rem 0.5rem'
                }
              }, player.userId ? 'Change Link' : '🔗 Link to User')
            ]);
          })
    ),

    // Link Dialog Modal
    showLinkDialog && React.createElement('div', {
      key: 'modal',
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      },
      onClick: (e) => {
        if (e.target === e.currentTarget) setShowLinkDialog(false);
      }
    }, [
      React.createElement('div', {
        key: 'dialog',
        style: {
          background: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto'
        }
      }, [
        React.createElement('h3', {
          key: 'title',
          style: {
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem'
          }
        }, '🔗 Link Player to User Account'),

        React.createElement('p', {
          key: 'desc',
          style: {
            fontSize: '0.875rem',
            color: '#6b7280',
            marginBottom: '1rem',
            lineHeight: '1.5'
          }
        }, `Select a registered user account to link with ${players.find(p => p.id === selectedPlayerId)?.name || 'this player'}.`),

        linkError && React.createElement('div', {
          key: 'error',
          style: {
            background: '#fee2e2',
            color: '#991b1b',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }
        }, linkError),

        linkSuccess && React.createElement('div', {
          key: 'success',
          style: {
            background: '#d1fae5',
            color: '#065f46',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }
        }, linkSuccess),

        React.createElement('div', {
          key: 'form',
          style: { marginBottom: '1rem' }
        }, [
          React.createElement('label', {
            key: 'label',
            style: {
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }
          }, 'Select User Account:'),
          React.createElement('select', {
            key: 'select',
            value: selectedUserId,
            onChange: (e) => setSelectedUserId(e.target.value),
            disabled: isLinking,
            style: {
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }
          }, [
            React.createElement('option', { key: 'default', value: '' }, 'Choose a user...'),
            ...registeredUsers.map(user =>
              React.createElement('option', {
                key: user.id,
                value: user.id,
                disabled: user.playerId && user.playerId !== selectedPlayerId
              }, `${user.displayName} (${user.email})${user.playerId ? ' - Already linked' : ''}`)
            )
          ])
        ]),

        React.createElement('div', {
          key: 'buttons',
          style: {
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'flex-end'
          }
        }, [
          React.createElement('button', {
            key: 'cancel',
            onClick: () => setShowLinkDialog(false),
            className: 'btn btn-secondary',
            disabled: isLinking
          }, 'Cancel'),
          React.createElement('button', {
            key: 'submit',
            onClick: handleLinkSubmit,
            className: 'btn btn-primary',
            disabled: isLinking || !selectedUserId
          }, isLinking ? 'Linking...' : 'Link Account')
        ])
      ])
    ])
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
// COMBINED COMPONENTS FILE - PART 2 OF 4
// Training Form and History View
// ========================================

// ========================================
// TRAINING FORM (Updated with validation #3 and date handling #6)
// ========================================
const TrainingForm = ({ players, onSessionSaved }) => {
  const [selectedPlayer, setSelectedPlayer] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    date: window.utils.getLocalDateString(),
    runTime: '',
    leftSingle: '', rightSingle: '', doubleSingle: '',
    leftTriple: '', rightTriple: '', doubleTriple: '',
    sprint1: '', sprint2: '', sprint3: '',
    sprint4: '', sprint5: '', sprint6: ''
  });

  const resetForm = () => {
    setFormData({
      date: window.utils.getLocalDateString(),
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

    const validation = window.utils.validators.validateTrainingForm(formData);
    
    if (!validation.valid) {
      const errorMessage = 'Please fix the following errors:\n\n' + 
        validation.errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n');
      alert(errorMessage);
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
      alert('✅ Training session saved successfully!');
    } catch (error) {
      console.error('Error saving session:', error);
      alert('❌ Error saving session: ' + error.message);
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
// HISTORY VIEW (Updated with date handling #6 and Matrix Sessions)
// ========================================
const HistoryView = ({ players, sessions, matrixSessions = [] }) => {
  const [selectedPlayer, setSelectedPlayer] = React.useState('');

  const filteredSessions = React.useMemo(() => {
    if (!selectedPlayer) return sessions;
    return window.analyticsService.getPlayerSessions(sessions, selectedPlayer);
  }, [selectedPlayer, sessions]);

  const filteredMatrixSessions = React.useMemo(() => {
    if (!selectedPlayer) return matrixSessions;
    return matrixSessions.filter(s => s.playerId === selectedPlayer);
  }, [selectedPlayer, matrixSessions]);

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
    React.createElement('div', { className: 'space-y-4 overflow-auto max-h-600', key: 'list' }, [
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
          ),
      
      // Matrix Sessions Section
      filteredMatrixSessions.length > 0 && React.createElement('div', { 
        key: 'matrix-sessions',
        style: { marginTop: '2rem' }
      }, [
        React.createElement('h3', {
          key: 'header',
          style: {
            fontSize: '1.125rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#374151'
          }
        }, '🎯 Matrix Sessions'),
        React.createElement('div', { className: 'space-y-4', key: 'list' },
          filteredMatrixSessions.map(session =>
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
                React.createElement('span', {
                  key: 'badge',
                  style: {
                    background: '#3b82f6',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }
                }, '🎯 Matrix')
              ]),
              
              // Exercise Scores Grid
              React.createElement('div', {
                key: 'exercises',
                style: {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.75rem'
                }
              }, Object.entries(session.exercises).map(([key, value]) =>
                React.createElement('div', {
                  key,
                  style: {
                    background: '#f9fafb',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb'
                  }
                }, [
                  React.createElement('p', {
                    key: 'label',
                    style: {
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginBottom: '0.25rem'
                    }
                  }, window.utils.validators.getMatrixExerciseLabel(key)),
                  React.createElement('p', {
                    key: 'value',
                    style: {
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: value > 0 ? '#2563eb' : '#9ca3af',
                      fontFamily: 'monospace'
                    }
                  }, value > 0 ? value : '-')
                ])
              ))
            ])
          )
        )
      ])
    ])
  ]);
};


// ========================================
// COMBINED COMPONENTS FILE - PART 3 OF 4
// Chart Components and Chart.js Lazy Loading
// ========================================

// ========================================
// CHART COMPONENTS (Fixed memory leaks #1)
// ========================================

// Reusable Chart Component with proper cleanup
const ChartComponent = ({ type, data, options }) => {
  const canvasRef = React.useRef(null);
  const chartInstanceRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current || !window.Chart) return;

    // Destroy existing chart instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    // Create new chart
    const ctx = canvasRef.current.getContext('2d');
    chartInstanceRef.current = new Chart(ctx, {
      type,
      data,
      options
    });

    // Cleanup function - runs when component unmounts or before next render
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [type, data, options]);

  return React.createElement('canvas', { ref: canvasRef });
};

// Run Time Chart Component
const RunTimeChart = ({ chartData }) => {
  const runData = React.useMemo(() => 
    chartData.runTime || [],
    [chartData]
  );

  if (runData.length < 2) {
    return React.createElement('div', {
      style: { 
        textAlign: 'center', 
        padding: '2rem',
        background: '#f9fafb',
        borderRadius: '0.5rem',
        border: '1px dashed #d1d5db'
      }
    }, [
      React.createElement('p', {
        key: 'icon',
        style: { fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }
      }, '📊'),
      React.createElement('p', {
        key: 'text',
        style: { color: '#6b7280', fontWeight: '500' }
      }, runData.length === 0 
        ? 'No run time data recorded yet' 
        : 'Need at least 2 sessions with run times to show trend')
    ]);
  }

  const data = {
    labels: runData.map(d => d.date),
    datasets: [{
      label: '2km Time',
      data: runData.map(d => d.runTime),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
      fill: true
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const seconds = context.parsed.y;
            const min = Math.floor(seconds / 60);
            const sec = Math.floor(seconds % 60);
            return '2km Time: ' + min + ':' + String(sec).padStart(2, '0');
          }
        }
      }
    },
    scales: {
      y: {
        reverse: true,
        title: {
          display: true,
          text: 'Time (seconds)'
        },
        ticks: {
          callback: function(value) {
            const min = Math.floor(value / 60);
            const sec = Math.floor(value % 60);
            return min + ':' + String(sec).padStart(2, '0');
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  return React.createElement('div', { 
    style: { position: 'relative', height: '300px' }
  }, 
    React.createElement(ChartComponent, { 
      type: 'line', 
      data, 
      options 
    })
  );
};

// Sprint Performance Chart Component
const SprintChart = ({ chartData }) => {
  const sprintData = React.useMemo(() => 
    chartData.sprint || [],
    [chartData]
  );

  if (sprintData.length < 2) {
    return React.createElement('div', {
      style: { 
        textAlign: 'center', 
        padding: '2rem',
        background: '#f9fafb',
        borderRadius: '0.5rem',
        border: '1px dashed #d1d5db'
      }
    }, [
      React.createElement('p', {
        key: 'icon',
        style: { fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }
      }, '📊'),
      React.createElement('p', {
        key: 'text',
        style: { color: '#6b7280', fontWeight: '500' }
      }, sprintData.length === 0 
        ? 'No sprint data recorded yet' 
        : 'Need at least 2 sessions with sprints to show trend')
    ]);
  }

  const data = {
    labels: sprintData.map(d => d.date),
    datasets: [
      {
        label: 'First Sprint',
        data: sprintData.map(d => d.sprint1),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Last Sprint',
        data: sprintData.map(d => d.sprint6),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Reps'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  return React.createElement('div', { 
    style: { position: 'relative', height: '300px' }
  }, 
    React.createElement(ChartComponent, { 
      type: 'line', 
      data, 
      options 
    })
  );
};

// Jump Performance Chart Component
const JumpChart = ({ chartData }) => {
  const jumpData = React.useMemo(() => 
    chartData.singleJump || [],
    [chartData]
  );

  if (jumpData.length < 2) {
    return React.createElement('div', {
      style: { 
        textAlign: 'center', 
        padding: '2rem',
        background: '#f9fafb',
        borderRadius: '0.5rem',
        border: '1px dashed #d1d5db'
      }
    }, [
      React.createElement('p', {
        key: 'icon',
        style: { fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }
      }, '📊'),
      React.createElement('p', {
        key: 'text',
        style: { color: '#6b7280', fontWeight: '500' }
      }, jumpData.length === 0 
        ? 'No single jump data recorded yet' 
        : 'Need at least 2 sessions with jumps to show trend')
    ]);
  }

  const data = {
    labels: jumpData.map(d => d.date),
    datasets: [
      {
        label: 'Left Leg',
        data: jumpData.map(d => d.leftJump),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true
      },
      {
        label: 'Right Leg',
        data: jumpData.map(d => d.rightJump),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true
      },
      {
        label: 'Double Leg',
        data: jumpData.map(d => d.doubleJump),
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Distance (cm)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  return React.createElement('div', { 
    style: { position: 'relative', height: '300px' }
  }, 
    React.createElement(ChartComponent, { 
      type: 'line', 
      data, 
      options 
    })
  );
};

// Triple Jump Chart Component
const TripleJumpChart = ({ chartData }) => {
  const tripleData = React.useMemo(() => 
    chartData.tripleJump || [],
    [chartData]
  );

  if (tripleData.length < 2) {
    return React.createElement('div', {
      style: { 
        textAlign: 'center', 
        padding: '2rem',
        background: '#f9fafb',
        borderRadius: '0.5rem',
        border: '1px dashed #d1d5db'
      }
    }, [
      React.createElement('p', {
        key: 'icon',
        style: { fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }
      }, '📊'),
      React.createElement('p', {
        key: 'text',
        style: { color: '#6b7280', fontWeight: '500' }
      }, tripleData.length === 0 
        ? 'No triple jump data recorded yet' 
        : 'Need at least 2 sessions with triple jumps to show trend')
    ]);
  }

  const data = {
    labels: tripleData.map(d => d.date),
    datasets: [
      {
        label: 'Left Triple',
        data: tripleData.map(d => d.leftTriple),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true
      },
      {
        label: 'Right Triple',
        data: tripleData.map(d => d.rightTriple),
        borderColor: '#eab308',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true
      },
      {
        label: 'Double Triple',
        data: tripleData.map(d => d.doubleTriple),
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Distance (cm)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  return React.createElement('div', { 
    style: { position: 'relative', height: '300px' }
  }, 
    React.createElement(ChartComponent, { 
      type: 'line', 
      data, 
      options 
    })
  );
};

// ========================================
// LAZY LOADING HOOK FOR CHART.JS (#14)
// ========================================
const useChartJS = () => {
  const [chartReady, setChartReady] = React.useState(false);
  const [chartError, setChartError] = React.useState(null);
  const loadAttemptedRef = React.useRef(false);

  React.useEffect(() => {
    // Check if already loaded
    if (window.Chart) {
      console.log('✅ Chart.js already available');
      setChartReady(true);
      return;
    }

    // Prevent multiple load attempts
    if (loadAttemptedRef.current) {
      return;
    }
    loadAttemptedRef.current = true;

    console.log('📊 Loading Chart.js dynamically...');

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.async = true;

    // Success handler
    script.onload = () => {
      console.log('✅ Chart.js loaded successfully');
      setChartReady(true);
    };

    // Error handler
    script.onerror = () => {
      console.error('❌ Failed to load Chart.js');
      setChartError('Failed to load charting library');
    };

    // Add to document
    document.head.appendChild(script);

    // Cleanup
    return () => {
      // Don't remove script on unmount - let it persist for other views
    };
  }, []);

  return { chartReady, chartError };
};

// ========================================
// COMBINED COMPONENTS FILE - PART 4A OF 5
// Insights View - First Half (Selection, Main Cards, Matrix Stats, Personal Bests)
// ========================================

// ========================================
// ENHANCED INSIGHTS VIEW - PART 1
// ========================================
const InsightsView = ({ players, sessions, matrixSessions = [] }) => {
  const [selectedPlayer, setSelectedPlayer] = React.useState('');
  const { chartReady, chartError } = useChartJS();

  // Step 1: Filter player sessions
  const playerSessions = React.useMemo(() => {
    if (!selectedPlayer) return [];
    return window.analyticsService.getPlayerSessions(sessions, selectedPlayer);
  }, [selectedPlayer, sessions]);

  // Step 1b: Filter player matrix sessions
  const playerMatrixSessions = React.useMemo(() => {
    if (!selectedPlayer) return [];
    return matrixSessions.filter(s => s.playerId === selectedPlayer);
  }, [selectedPlayer, matrixSessions]);

  // Step 2: Calculate insights
  const insights = React.useMemo(() => {
    if (!selectedPlayer || playerSessions.length === 0) return null;
    return window.analyticsService.calculateInsights(playerSessions, selectedPlayer);
  }, [selectedPlayer, playerSessions]);

  // Step 3: Prepare chart data
  const chartData = React.useMemo(() => {
    if (!selectedPlayer || playerSessions.length === 0) return [];
    return window.analyticsService.getChartData(playerSessions, selectedPlayer);
  }, [selectedPlayer, playerSessions]);

  const hasCharts = chartReady && window.Chart;

  return React.createElement('div', { className: 'space-y-6' }, [
    // Player Selection Card
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

    // Main Insight Cards (4 cards only)
    selectedPlayer && insights && React.createElement('div', { className: 'grid-4', key: 'insights' }, [
      // Card 1: Total Sessions
      React.createElement('div', {
        key: 'sessions',
        className: 'insight-card green',
        style: { '--from-color': '#10b981', '--to-color': '#059669' }
      }, [
        React.createElement('p', { className: 'insight-label', key: 'label' }, 'Total Sessions'),
        React.createElement('p', { className: 'insight-value', key: 'value' }, insights.totalSessions)
      ]),
      
      // Card 2: Avg Run Time with Trend
      React.createElement('div', {
        key: 'runtime',
        className: 'insight-card blue',
        style: { '--from-color': '#3b82f6', '--to-color': '#2563eb' }
      }, [
        React.createElement('p', { className: 'insight-label', key: 'label' }, 'Avg Run Time'),
        React.createElement('div', { 
          style: { display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }, 
          key: 'content' 
        }, [
          React.createElement('p', { 
            className: 'insight-value', 
            key: 'value', 
            style: { fontSize: '2rem' } 
          }, insights.avgRunTime),
          insights.runTimeTrend && insights.runTimeTrend.change > 0 && React.createElement('span', {
            key: 'trend',
            style: {
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: insights.runTimeTrend.isImproving ? '#86efac' : '#fca5a5'
            }
          }, `${insights.runTimeTrend.arrow} ${insights.runTimeTrend.change}%`)
        ]),
        React.createElement('p', {
          key: 'benchmark',
          style: { 
            fontSize: '0.75rem', 
            marginTop: '0.5rem', 
            opacity: 0.9,
            fontWeight: '600'
          }
        }, `Level: ${insights.runTimeBenchmark.level}`)
      ]),
      
      // Card 3: Jump Balance with Trend
      React.createElement('div', {
        key: 'balance',
        className: 'insight-card orange',
        style: { '--from-color': '#f59e0b', '--to-color': '#d97706' }
      }, [
        React.createElement('p', { className: 'insight-label', key: 'label' }, 'Jump Balance'),
        React.createElement('div', { 
          style: { display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }, 
          key: 'content' 
        }, [
          React.createElement('p', { 
            className: 'insight-value', 
            key: 'value', 
            style: { fontSize: '2rem' } 
          }, insights.jumpBalance),
          insights.jumpBalanceTrend && insights.jumpBalanceTrend.change > 0 && React.createElement('span', {
            key: 'trend',
            style: {
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: insights.jumpBalanceTrend.isImproving ? '#86efac' : '#fca5a5'
            }
          }, `${insights.jumpBalanceTrend.arrow} ${insights.jumpBalanceTrend.change}%`)
        ]),
        React.createElement('p', {
          key: 'benchmark',
          style: { 
            fontSize: '0.75rem', 
            marginTop: '0.5rem', 
            opacity: 0.9,
            fontWeight: '600'
          }
        }, `Level: ${insights.balanceBenchmark.level}`)
      ]),
      
      // Card 4: Session Quality Score
      React.createElement('div', {
        key: 'quality',
        className: 'insight-card purple',
        style: { '--from-color': '#a855f7', '--to-color': '#9333ea' }
      }, [
        React.createElement('p', { className: 'insight-label', key: 'label' }, 'Avg Session Quality'),
        React.createElement('p', { 
          className: 'insight-value', 
          key: 'value' 
        }, insights.avgQualityScore + '/100'),
        React.createElement('p', {
          key: 'rating',
          style: { 
            fontSize: '0.75rem', 
            marginTop: '0.5rem', 
            opacity: 0.9,
            fontWeight: '600'
          }
        }, insights.qualityRating)
      ])
    ]),

    // Matrix Stats Card (separate, outside grid-4)
    selectedPlayer && playerMatrixSessions.length > 0 && React.createElement('div', {
      key: 'matrix-stats',
      className: 'card'
    }, [
      React.createElement('h3', {
        key: 'header',
        className: 'section-header'
      }, '🎯 Matrix Training Statistics'),
      
      React.createElement('div', {
        key: 'grid',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem'
        }
      }, Object.keys(playerMatrixSessions[0].exercises).map(exerciseKey => {
        const scores = playerMatrixSessions
          .map(s => s.exercises[exerciseKey])
          .filter(v => v > 0);
        
        if (scores.length === 0) return null;
        
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        const best = Math.max(...scores);
        
        return React.createElement('div', {
          key: exerciseKey,
          style: {
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '2px solid #3b82f6'
          }
        }, [
          React.createElement('p', {
            key: 'label',
            style: {
              fontSize: '0.75rem',
              color: '#1e40af',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }
          }, window.utils.validators.getMatrixExerciseLabel(exerciseKey)),
          React.createElement('div', {
            key: 'stats',
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }
          }, [
            React.createElement('div', { key: 'avg' }, [
              React.createElement('p', {
                key: 'label',
                style: { fontSize: '0.75rem', color: '#6b7280' }
              }, 'Avg'),
              React.createElement('p', {
                key: 'value',
                style: {
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  fontFamily: 'monospace'
                }
              }, avg.toFixed(1))
            ]),
            React.createElement('div', { key: 'best' }, [
              React.createElement('p', {
                key: 'label',
                style: { fontSize: '0.75rem', color: '#6b7280' }
              }, 'Best'),
              React.createElement('p', {
                key: 'value',
                style: {
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#2563eb',
                  fontFamily: 'monospace'
                }
              }, best)
            ])
          ])
        ]);
      }).filter(Boolean))
    ]),

    // Personal Bests Section
    selectedPlayer && insights && insights.personalBests && React.createElement('div', { className: 'card', key: 'personal-bests' }, [
      React.createElement('h3', { className: 'section-header', key: 'header' }, '🏆 Personal Bests'),
      React.createElement('div', { 
        className: 'grid-2', 
        style: { gap: '1rem' }, 
        key: 'grid' 
      }, [
        // Best Run Time
        insights.personalBests.bestRunTime && React.createElement('div', {
          key: 'run',
          className: 'pb-card',
          style: { 
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            border: '2px solid #3b82f6' 
          }
        }, [
          React.createElement('p', { 
            key: 'label', 
            style: { 
              fontSize: '0.875rem', 
              color: '#1e40af', 
              fontWeight: '600',
              marginBottom: '0.5rem'
            } 
          }, '🏃 2km Run'),
          React.createElement('p', { 
            key: 'value', 
            style: { 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              fontFamily: 'monospace', 
              marginTop: '0.25rem' 
            } 
          }, insights.personalBests.bestRunTime.timeStr),
          React.createElement('p', { 
            key: 'date', 
            style: { 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              marginTop: '0.5rem' 
            } 
          }, window.utils.formatDate(insights.personalBests.bestRunTime.date))
        ]),
        
        // Best Left Single
        insights.personalBests.bestLeftJump && React.createElement('div', {
          key: 'left-single',
          className: 'pb-card',
          style: { 
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            border: '2px solid #10b981' 
          }
        }, [
          React.createElement('p', { 
            key: 'label', 
            style: { 
              fontSize: '0.875rem', 
              color: '#065f46', 
              fontWeight: '600',
              marginBottom: '0.5rem'
            } 
          }, '⬅️ Left Single'),
          React.createElement('p', { 
            key: 'value', 
            style: { 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              fontFamily: 'monospace', 
              marginTop: '0.25rem' 
            } 
          }, insights.personalBests.bestLeftJump.value + ' cm'),
          React.createElement('p', { 
            key: 'date', 
            style: { 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              marginTop: '0.5rem' 
            } 
          }, window.utils.formatDate(insights.personalBests.bestLeftJump.date))
        ]),
        
        // Best Right Single
        insights.personalBests.bestRightJump && React.createElement('div', {
          key: 'right-single',
          className: 'pb-card',
          style: { 
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            border: '2px solid #f59e0b' 
          }
        }, [
          React.createElement('p', { 
            key: 'label', 
            style: { 
              fontSize: '0.875rem', 
              color: '#92400e', 
              fontWeight: '600',
              marginBottom: '0.5rem'
            } 
          }, '➡️ Right Single'),
          React.createElement('p', { 
            key: 'value', 
            style: { 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              fontFamily: 'monospace', 
              marginTop: '0.25rem' 
            } 
          }, insights.personalBests.bestRightJump.value + ' cm'),
          React.createElement('p', { 
            key: 'date', 
            style: { 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              marginTop: '0.5rem' 
            } 
          }, window.utils.formatDate(insights.personalBests.bestRightJump.date))
        ]),
        
        // Best Double Single
        insights.personalBests.bestDoubleJump && React.createElement('div', {
          key: 'double-single',
          className: 'pb-card',
          style: { 
            background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            border: '2px solid #ec4899' 
          }
        }, [
          React.createElement('p', { 
            key: 'label', 
            style: { 
              fontSize: '0.875rem', 
              color: '#9f1239', 
              fontWeight: '600',
              marginBottom: '0.5rem'
            } 
          }, '🦘 Double Single'),
          React.createElement('p', { 
            key: 'value', 
            style: { 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              fontFamily: 'monospace', 
              marginTop: '0.25rem' 
            } 
          }, insights.personalBests.bestDoubleJump.value + ' cm'),
          React.createElement('p', { 
            key: 'date', 
            style: { 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              marginTop: '0.5rem' 
            } 
          }, window.utils.formatDate(insights.personalBests.bestDoubleJump.date))
        ]),
        
        // Best Left Triple
        insights.personalBests.bestLeftTriple && React.createElement('div', {
          key: 'left-triple',
          className: 'pb-card',
          style: { 
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            border: '2px solid #0ea5e9' 
          }
        }, [
          React.createElement('p', { 
            key: 'label', 
            style: { 
              fontSize: '0.875rem', 
              color: '#075985', 
              fontWeight: '600',
              marginBottom: '0.5rem'
            } 
          }, '⬅️⬅️⬅️ Left Triple'),
          React.createElement('p', { 
            key: 'value', 
            style: { 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              fontFamily: 'monospace', 
              marginTop: '0.25rem' 
            } 
          }, insights.personalBests.bestLeftTriple.value + ' cm'),
          React.createElement('p', { 
            key: 'date', 
            style: { 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              marginTop: '0.5rem' 
            } 
          }, window.utils.formatDate(insights.personalBests.bestLeftTriple.date))
        ]),
        
        // Best Right Triple
        insights.personalBests.bestRightTriple && React.createElement('div', {
          key: 'right-triple',
          className: 'pb-card',
          style: { 
            background: 'linear-gradient(135deg, #fef9c3 0%, #fde047 100%)', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            border: '2px solid #eab308' 
          }
        }, [
          React.createElement('p', { 
            key: 'label', 
            style: { 
              fontSize: '0.875rem', 
              color: '#713f12', 
              fontWeight: '600',
              marginBottom: '0.5rem'
            } 
          }, '➡️➡️➡️ Right Triple'),
          React.createElement('p', { 
            key: 'value', 
            style: { 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              fontFamily: 'monospace', 
              marginTop: '0.25rem' 
            } 
          }, insights.personalBests.bestRightTriple.value + ' cm'),
          React.createElement('p', { 
            key: 'date', 
            style: { 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              marginTop: '0.5rem' 
            } 
          }, window.utils.formatDate(insights.personalBests.bestRightTriple.date))
        ]),
        
        // Best Double Triple
        insights.personalBests.bestDoubleTriple && React.createElement('div', {
          key: 'double-triple',
          className: 'pb-card',
          style: { 
            background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            border: '2px solid #a855f7' 
          }
        }, [
          React.createElement('p', { 
            key: 'label', 
            style: { 
              fontSize: '0.875rem', 
              color: '#6b21a8', 
              fontWeight: '600',
              marginBottom: '0.5rem'
            } 
          }, '🦘🦘🦘 Double Triple'),
          React.createElement('p', { 
            key: 'value', 
            style: { 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              fontFamily: 'monospace', 
              marginTop: '0.25rem' 
            } 
          }, insights.personalBests.bestDoubleTriple.value + ' cm'),
          React.createElement('p', { 
            key: 'date', 
            style: { 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              marginTop: '0.5rem' 
            } 
          }, window.utils.formatDate(insights.personalBests.bestDoubleTriple.date))
        ]),
        
        // Best Sprint
        insights.personalBests.bestSprint && React.createElement('div', {
          key: 'sprint',
          className: 'pb-card',
          style: { 
            background: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            border: '2px solid #fb923c' 
          }
        }, [
          React.createElement('p', { 
            key: 'label', 
            style: { 
              fontSize: '0.875rem', 
              color: '#7c2d12', 
              fontWeight: '600',
              marginBottom: '0.5rem'
            } 
          }, '⚡ Best Sprint Set'),
          React.createElement('p', { 
            key: 'value', 
            style: { 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              fontFamily: 'monospace', 
              marginTop: '0.25rem' 
            } 
          }, insights.personalBests.bestSprint.value + ' reps'),
          React.createElement('p', { 
            key: 'date', 
            style: { 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              marginTop: '0.5rem' 
            } 
          }, window.utils.formatDate(insights.personalBests.bestSprint.date))
        ])
      ])
    ]),

// ========================================
// COMBINED COMPONENTS FILE - PART 4B OF 5
// Insights View - Second Half (Fatigue Analysis and Charts)
// ========================================

// CONTINUATION OF InsightsView from Part 4A
// This section includes: Fatigue Analysis and Performance Trend Charts

    // Advanced Fatigue Analysis Section
    selectedPlayer && insights && insights.fatigueMetrics && React.createElement('div', { className: 'card', key: 'fatigue-analysis' }, [
      React.createElement('h3', { className: 'section-header', key: 'header' }, '⚡ Fatigue Analysis'),
      React.createElement('div', { 
        className: 'grid-2', 
        style: { gap: '1rem' }, 
        key: 'grid' 
      }, [
        // Fatigue Resistance Card
        React.createElement('div', {
          key: 'resistance',
          style: {
            background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
            padding: '1.25rem',
            borderRadius: '0.5rem',
            border: `2px solid ${insights.fatigueMetrics.classification.color}`
          }
        }, [
          React.createElement('p', { 
            key: 'label', 
            style: { 
              fontSize: '0.875rem', 
              color: '#374151', 
              fontWeight: '600', 
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            } 
          }, [
            React.createElement('span', { key: 'icon' }, '🛡️'),
            'Fatigue Resistance'
          ]),
          React.createElement('p', { 
            key: 'value', 
            style: { 
              fontSize: '1.75rem', 
              fontWeight: 'bold', 
              color: insights.fatigueMetrics.classification.color,
              marginBottom: '0.5rem'
            } 
          }, insights.fatigueMetrics.fatigueResistance),
          React.createElement('p', { 
            key: 'detail', 
            style: { 
              fontSize: '0.875rem', 
              color: '#6b7280',
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '0.5rem',
              borderTop: '1px solid #e5e7eb'
            } 
          }, [
            React.createElement('span', { key: 'dropoff' }, `Avg Dropoff: ${insights.fatigueMetrics.avgDropoff}%`),
            React.createElement('span', { 
              key: 'badge',
              style: {
                background: insights.fatigueMetrics.classification.color,
                color: 'white',
                padding: '0.125rem 0.5rem',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: '600'
              }
            }, insights.fatigueMetrics.classification.level)
          ])
        ]),
        
        // Sprint Consistency Card
        React.createElement('div', {
          key: 'consistency',
          style: {
            background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
            padding: '1.25rem',
            borderRadius: '0.5rem',
            border: '2px solid #6b7280'
          }
        }, [
          React.createElement('p', { 
            key: 'label', 
            style: { 
              fontSize: '0.875rem', 
              color: '#374151', 
              fontWeight: '600', 
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            } 
          }, [
            React.createElement('span', { key: 'icon' }, '🎯'),
            'Sprint Consistency'
          ]),
          React.createElement('p', { 
            key: 'value', 
            style: { 
              fontSize: '1.75rem', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '0.5rem'
            } 
          }, `${insights.fatigueMetrics.avgConsistency}%`),
          React.createElement('p', { 
            key: 'detail', 
            style: { 
              fontSize: '0.875rem', 
              color: '#6b7280',
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '0.5rem',
              borderTop: '1px solid #e5e7eb'
            } 
          }, [
            React.createElement('span', { key: 'peak' }, `Peak at Set ${insights.fatigueMetrics.peakTiming}`),
            React.createElement('span', { 
              key: 'icon',
              style: { fontSize: '1.25rem' }
            }, insights.fatigueMetrics.avgConsistency >= 90 ? '🌟' : 
               insights.fatigueMetrics.avgConsistency >= 85 ? '✨' : '💫')
          ])
        ])
      ]),
      
      // Recommendation Box
      React.createElement('div', {
        key: 'recommendation',
        style: {
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '2px solid #fbbf24',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginTop: '1rem'
        }
      }, [
        React.createElement('p', { 
          key: 'label', 
          style: { 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: '#92400e', 
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          } 
        }, [
          React.createElement('span', { key: 'icon' }, '💡'),
          'Training Recommendation'
        ]),
        React.createElement('p', { 
          key: 'text', 
          style: { 
            fontSize: '0.875rem', 
            color: '#78350f',
            lineHeight: '1.5'
          } 
        }, insights.fatigueMetrics.recommendation)
      ])
    ]),

    // Performance Trend Charts with Loading State
    selectedPlayer && chartData && React.createElement('div', { className: 'card', key: 'charts' }, [
      React.createElement('h3', { className: 'section-header', key: 'header' }, '📈 Performance Trends'),
      
      // Show loading state while charts are loading
      !hasCharts && !chartError && React.createElement('div', {
        key: 'loading',
        style: {
          textAlign: 'center',
          padding: '3rem 1rem',
          color: '#6b7280'
        }
      }, [
        React.createElement('div', { 
          key: 'spinner',
          className: 'loading-spinner',
          style: { margin: '0 auto 1rem' }
        }),
        React.createElement('p', { key: 'text' }, '📊 Loading charts...')
      ]),

      // Show error state if charts failed to load
      chartError && React.createElement('div', {
        key: 'error',
        style: {
          textAlign: 'center',
          padding: '2rem 1rem',
          background: '#fef2f2',
          borderRadius: '0.5rem',
          color: '#991b1b'
        }
      }, [
        React.createElement('p', { 
          key: 'icon',
          style: { fontSize: '2rem', marginBottom: '0.5rem' }
        }, '⚠️'),
        React.createElement('p', { 
          key: 'text',
          style: { fontWeight: '600' }
        }, chartError),
        React.createElement('p', { 
          key: 'help',
          style: { fontSize: '0.875rem', marginTop: '0.5rem' }
        }, 'Please refresh the page to try again')
      ]),

      // Show charts when ready
      hasCharts && [
        // Run Time Chart
        React.createElement('div', { style: { marginBottom: '2rem' }, key: 'run-chart' }, [
          React.createElement('h4', {
            key: 'title',
            style: { 
              fontSize: '1rem', 
              fontWeight: '600', 
              marginBottom: '1rem', 
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }
          }, [
            React.createElement('span', { key: 'icon' }, '🏃'),
            '2km Run Time (Lower is Better)'
          ]),
          React.createElement(RunTimeChart, { key: 'chart', chartData })
        ]),
        
        // Sprint Chart
        React.createElement('div', { style: { marginBottom: '2rem' }, key: 'sprint-chart' }, [
          React.createElement('h4', {
            key: 'title',
            style: { 
              fontSize: '1rem', 
              fontWeight: '600', 
              marginBottom: '1rem', 
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }
          }, [
            React.createElement('span', { key: 'icon' }, '⚡'),
            'Sprint Performance (First vs Last Set)'
          ]),
          React.createElement(SprintChart, { key: 'chart', chartData })
        ]),
        
        // Jump Chart
        React.createElement('div', { style: { marginBottom: '2rem' }, key: 'jump-chart' }, [
          React.createElement('h4', {
            key: 'title',
            style: { 
              fontSize: '1rem', 
              fontWeight: '600', 
              marginBottom: '1rem', 
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }
          }, [
            React.createElement('span', { key: 'icon' }, '🦘'),
            'Single Jump Performance (All Types)'
          ]),
          React.createElement(JumpChart, { key: 'chart', chartData })
        ]),

        // Triple Jump Chart
        React.createElement('div', { key: 'triple-jump-chart' }, [
          React.createElement('h4', {
            key: 'title',
            style: { 
              fontSize: '1rem', 
              fontWeight: '600', 
              marginBottom: '1rem', 
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }
          }, [
            React.createElement('span', { key: 'icon' }, '🦘🦘🦘'),
            'Triple Jump Performance (All Types)'
          ]),
          React.createElement(TripleJumpChart, { key: 'chart', chartData })
        ])
      ]
    ]),

    // Empty state when no player selected
    !selectedPlayer && React.createElement('div', { className: 'card', key: 'empty' },
      React.createElement('div', { 
        style: { 
          textAlign: 'center', 
          padding: '3rem 1rem',
          color: '#6b7280'
        } 
      }, [
        React.createElement('p', { 
          key: 'icon',
          style: { fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }
        }, '📊'),
        React.createElement('p', { 
          key: 'text',
          style: { fontSize: '1.125rem', fontWeight: '500' }
        }, 'Select a player above to view their performance insights')
      ])
    )
  ]);
};

// ========================================
// COMBINED COMPONENTS FILE - PART 4C OF 5 (FINAL)
// Record View and Component Exports
// ========================================

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

