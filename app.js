// ========================================
// OPTIMIZED MAIN APPLICATION
// ========================================

console.log('App loading...');

const AthleteTracker = () => {
  // ✅ ALL STATE HOOKS AT TOP LEVEL
  const [players, setPlayers] = React.useState([]);
  const [sessions, setSessions] = React.useState([]);
  const [matrixSessions, setMatrixSessions] = React.useState([]);  // ✅ FIXED
  const [view, setView] = React.useState('dashboard');
  const [loading, setLoading] = React.useState(true);
  const [userRole, setUserRole] = React.useState(null);
  const [userPlayerId, setUserPlayerId] = React.useState(null);

  React.useEffect(() => {
    console.log('Component mounted, loading data');
    loadData();
  }, []);

  const loadData = async () => {
    console.time('Data Load');
    try {
      // Get current user info FIRST
      const currentUser = window.authService.getCurrentUser();
      if (!currentUser.userData) {
        throw new Error('User not authenticated');
      }
      
      setUserRole(currentUser.userData.role);
      setUserPlayerId(currentUser.userData.playerId);
      console.log('User role:', currentUser.userData.role);
      
      // Wait for Firebase to be ready
      let attempts = 0;
      while (!window.db && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
      }
        
      if (!window.db) {
        throw new Error('Firebase not initialized');
      }
        
      // ✅ FIXED: Correct destructuring with 3 variables for 3 promises
      const [loadedPlayers, loadedSessions, loadedMatrixSessions] = await Promise.all([
        window.firebaseService.loadPlayers(),
        window.firebaseService.loadSessions(),
        window.firebaseService.loadMatrixSessions()
      ]);
      
      console.log(`Loaded ${loadedPlayers.length} players, ${loadedSessions.length} sessions, ${loadedMatrixSessions.length} matrix sessions`);
      console.timeEnd('Data Load');
      
      setPlayers(loadedPlayers);
      setSessions(loadedSessions);
      setMatrixSessions(loadedMatrixSessions);  // ✅ FIXED
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + error.message);
      setLoading(false);
    }
  };

  // ✅ HANDLERS AT COMPONENT LEVEL
  const handlePlayerAdded = (newPlayer) => {
    setPlayers([...players, newPlayer]);
  };

  const handleSessionSaved = (newSession) => {
    setSessions([newSession, ...sessions]);
  };

  const handleMatrixSessionSaved = (newSession) => {  // ✅ FIXED
    setMatrixSessions([newSession, ...matrixSessions]);
  };

  if (loading) {
    return React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }
    }, [
      React.createElement('div', { className: 'loading-spinner', key: 'spinner' }),
      React.createElement('p', {
        key: 'text',
        style: { color: '#6b7280' }
      }, 'Loading Court Craft Tracker...')
    ]);
  }

  return React.createElement('div', null, [
    React.createElement(window.Components.Navigation, { 
      view, 
      setView, 
      userRole,
      key: 'nav' 
    }),
    React.createElement('main', { key: 'main' },
      view === 'dashboard'
        ? (userRole === 'coach'
            ? React.createElement(window.CoachComponents.CoachView, {
                players,
                sessions,
                matrixSessions
              })
            : React.createElement(window.PlayerComponents.PlayerView, {
                players,
                sessions,
                matrixSessions
              })
          )
        : view === 'record'
? React.createElement('div', { className: 'space-y-6' }, [
    React.createElement(window.Components.TrainingForm, {
      key: 'form',
      players: userRole === 'coach' ? players : players.filter(p => p.id === userPlayerId),
      onSessionSaved: handleSessionSaved,
      userRole: userRole,
      userPlayerId: userPlayerId
    }),
    userRole === 'coach' && React.createElement('div', { 
      key: 'coach-section',
      className: 'grid-2',
      style: { gap: '1.5rem' }
    }, [
      React.createElement(window.Components.PlayerList, { 
        key: 'list',
        players, 
        sessions 
      }),
      React.createElement(window.Components.RecentSessions, { 
        key: 'recent',
        sessions 
      })
    ])
  ])
        : view === 'record-matrix'
? React.createElement('div', { className: 'space-y-6' }, [
    React.createElement(window.MatrixComponents.MatrixForm, {
      key: 'form',
      players: userRole === 'coach' ? players : players.filter(p => p.id === userPlayerId),
      onSessionSaved: handleMatrixSessionSaved,
      userRole: userRole,
      userPlayerId: userPlayerId
    })
  ])
        : view === 'insights'
        ? React.createElement(window.Components.InsightsView, {
            players: userRole === 'coach' ? players : players.filter(p => p.id === userPlayerId),
            sessions: userRole === 'coach' ? sessions : sessions.filter(s => s.playerId === userPlayerId),
            matrixSessions: userRole === 'coach' ? matrixSessions : matrixSessions.filter(s => s.playerId === userPlayerId)  // ✅ ADD THIS
          })
        : React.createElement(window.Components.HistoryView, {
            players: userRole === 'coach' ? players : players.filter(p => p.id === userPlayerId),
            sessions: userRole === 'coach' ? sessions : sessions.filter(s => s.playerId === userPlayerId),
            matrixSessions: userRole === 'coach' ? matrixSessions : matrixSessions.filter(s => s.playerId === userPlayerId)  // ✅ ADD THIS
          })
    )
  ]);
};

// ========================================
// APP INITIALIZATION (No changes needed)
// ========================================
const initApp = async () => {
  console.time('Total Load Time');
  console.log('Initializing app...');
  
  try {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const reactReady = window.React && window.ReactDOM;
      const componentsReady = window.Components;
      const servicesReady = window.firebaseService && window.analyticsService;
      const utilsReady = window.utils;
      const iconsReady = window.Icons;
      const authReady = window.authService && window.AuthComponents;
      const roleReady = window.roleManager;
      const dashboardsReady = window.CoachComponents && window.PlayerComponents;
      const matrixReady = window.MatrixComponents;  // ✅ ADD THIS CHECK
      
      if (reactReady && componentsReady && servicesReady && utilsReady && iconsReady && 
          authReady && roleReady && dashboardsReady && matrixReady) {  // ✅ UPDATE
        console.log('All dependencies ready');
        break;
      }
      
      if (attempts % 20 === 0) {
        console.log(`Waiting for dependencies... (attempt ${attempts})`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('Dependencies failed to load');
    }
    
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      React.createElement(window.Components.ErrorBoundary, null,
        React.createElement(window.AuthComponents.AuthWrapper, null,
          React.createElement(AthleteTracker)
        )
      )
    );
    
    console.timeEnd('Total Load Time');
    console.log('✅ App initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing app:', error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; background: #fee; border: 2px solid #f00; margin: 20px; border-radius: 8px;">
          <h2>Error Loading App</h2>
          <p>${error.message}</p>
          <pre>${error.stack || ''}</pre>
        </div>
      `;
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}