// ========================================
// OPTIMIZED MAIN APPLICATION
// No Babel needed - plain React.createElement
// Chart.js loading removed - now handled by lazy loading in components
// ========================================

console.log('App loading...');

// Use Components from window.Components (defined in components.js)
// Don't destructure to avoid redeclaration errors

const AthleteTracker = () => {
  const [players, setPlayers] = React.useState([]);
  const [sessions, setSessions] = React.useState([]);
  const [view, setView] = React.useState('record');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    console.log('Component mounted, loading data');
    loadData();
    
    // Chart.js checking REMOVED - now handled by lazy loading in InsightsView (#14)
    // Charts will only load when user navigates to Insights view
  }, []);

  const loadData = async () => {
    console.time('Data Load');
    try {
      // Wait for Firebase to be ready
      let attempts = 0;
      while (!window.db && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
      }
      
      if (!window.db) {
        throw new Error('Firebase not initialized');
      }

      const [loadedPlayers, loadedSessions] = await Promise.all([
        window.firebaseService.loadPlayers(),
        window.firebaseService.loadSessions()
      ]);
      
      console.log(`Loaded ${loadedPlayers.length} players, ${loadedSessions.length} sessions`);
      console.timeEnd('Data Load');
      
      setPlayers(loadedPlayers);
      setSessions(loadedSessions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + error.message);
      setLoading(false);
    }
  };

  const handlePlayerAdded = (newPlayer) => {
    setPlayers([...players, newPlayer]);
  };

  const handleSessionSaved = (newSession) => {
    setSessions([newSession, ...sessions]);
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
    React.createElement(window.Components.Navigation, { view, setView, key: 'nav' }),
    React.createElement('main', { key: 'main' },
      view === 'record'
        ? React.createElement(window.Components.RecordView, {
            players,
            sessions,
            onPlayerAdded: handlePlayerAdded,
            onSessionSaved: handleSessionSaved
          })
        : view === 'insights'
        ? React.createElement(window.Components.InsightsView, {
            players,
            sessions
          })
        : React.createElement(window.Components.HistoryView, {
            players,
            sessions
          })
    )
  ]);
};

// ========================================
// APP INITIALIZATION
// ========================================
const initApp = async () => {
  console.time('Total Load Time');
  console.log('Initializing app...');
  
  try {
    // Wait for all dependencies
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const reactReady = window.React && window.ReactDOM;
      const componentsReady = window.Components;
      const servicesReady = window.firebaseService && window.analyticsService;
      const utilsReady = window.utils;
      const iconsReady = window.Icons;
      
      if (reactReady && componentsReady && servicesReady && utilsReady && iconsReady) {
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
        React.createElement(AthleteTracker)
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

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}