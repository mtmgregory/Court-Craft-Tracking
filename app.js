// ========================================
// OPTIMIZED MAIN APPLICATION
// No Babel needed - plain React.createElement
// ========================================

console.log('App loading...');

// Use Components from window.Components (defined in components.js)
// Don't destructure to avoid redeclaration errors

const AthleteTracker = () => {
  const [players, setPlayers] = React.useState([]);
  const [sessions, setSessions] = React.useState([]);
  const [view, setView] = React.useState('record');
  const [rechartsLoaded, setRechartsLoaded] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    console.log('Component mounted, loading data');
    
    // Load data
    loadData();
    
    // Check for Chart.js with detailed logging
    const checkChartJS = () => {
      console.log('Checking for Chart.js...', {
        windowChart: !!window.Chart
      });
      
      if (window.Chart) {
        console.log('✅ Chart.js detected and ready');
        setRechartsLoaded(true); // Keep the same state name for compatibility
        return true;
      }
      return false;
    };
    
    // Try immediately
    if (!checkChartJS()) {
      // If not loaded yet, poll for it
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds
      
      const interval = setInterval(() => {
        console.log(`Chart.js check attempt ${attempts + 1}/${maxAttempts}`);
        
        if (checkChartJS()) {
          clearInterval(interval);
          console.log('✅ Chart.js loaded successfully');
        } else if (attempts++ >= maxAttempts) {
          clearInterval(interval);
          console.error('❌ Chart.js failed to load after 5 seconds');
          // Set it to true anyway so users can at least see the rest of the page
          setRechartsLoaded(true);
        }
      }, 100);
      
      return () => clearInterval(interval);
    }
 
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
      }, 'Loading PerformanceDB...')
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
            sessions,
            rechartsLoaded
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