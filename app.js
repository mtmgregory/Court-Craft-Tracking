// Add console logs to debug
console.log('App.js loaded');
console.log('React available:', typeof React !== 'undefined');
console.log('ReactDOM available:', typeof ReactDOM !== 'undefined');

const { useState, useEffect } = React;

// Wait for Recharts to load properly
const checkRecharts = () => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 100; // 5 seconds max
    
    const check = () => {
      attempts++;
      if (window.Recharts && window.Recharts.LineChart) {
        console.log('Recharts loaded successfully after', attempts, 'attempts');
        resolve(window.Recharts);
      } else if (attempts >= maxAttempts) {
        console.warn('Recharts took too long to load, proceeding anyway');
        resolve(null);
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  });
};

// Icon Components (simplified versions)
const Activity = () => <span>🏃</span>;
const Users = () => <span>👥</span>;
const Calendar = () => <span>📅</span>;
const TrendingUp = () => <span>📈</span>;

const AthleteTracker = () => {
  console.log('AthleteTracker component rendering');
  
  const [players, setPlayers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [view, setView] = useState('record');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [rechartsLoaded, setRechartsLoaded] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    runTime: '',
    leftSingle: '',
    rightSingle: '',
    doubleSingle: '',
    leftTriple: '',
    rightTriple: '',
    doubleTriple: '',
    sprint1: '',
    sprint2: '',
    sprint3: '',
    sprint4: '',
    sprint5: '',
    sprint6: ''
  });

  useEffect(() => {
    console.log('Component mounted, loading Recharts and data');
    checkRecharts().then(() => {
      console.log('Recharts ready, setting state');
      setRechartsLoaded(true);
    });
    loadData();
  }, []);

  const loadData = async () => {
    console.log('Loading data...');
    console.log('window.storage available:', typeof window.storage !== 'undefined');
    
    // For now, just use empty data to test rendering
    setPlayers([]);
    setSessions([]);
    console.log('Data loaded (empty for now)');
  };

  const addPlayer = async () => {
    if (!newPlayerName.trim()) return;

    const newPlayer = {
      id: `player_${Date.now()}`,
      name: newPlayerName.trim()
    };

    console.log('Adding player:', newPlayer);
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
    alert('Player added! (Note: No backend storage yet)');
  };

  const handleSubmit = async () => {
    if (!selectedPlayer) {
      alert('Please select a player');
      return;
    }

    const session = {
      id: `session_${Date.now()}`,
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

    console.log('Saving session:', session);
    setSessions([session, ...sessions]);
    
    setFormData({
      date: new Date().toISOString().split('T')[0],
      runTime: '',
      leftSingle: '',
      rightSingle: '',
      doubleSingle: '',
      leftTriple: '',
      rightTriple: '',
      doubleTriple: '',
      sprint1: '',
      sprint2: '',
      sprint3: '',
      sprint4: '',
      sprint5: '',
      sprint6: ''
    });
    
    alert('Training session saved! (Note: No backend storage yet)');
  };

  const getPlayerSessions = (playerId) => {
    return sessions.filter(s => s.playerId === playerId);
  };

  const calculateInsights = (playerId) => {
    const playerSessions = getPlayerSessions(playerId);
    
    if (playerSessions.length === 0) {
      return {
        avgRunTime: 'N/A',
        jumpBalance: 'N/A',
        fatigueDropoff: 'N/A',
        totalSessions: 0
      };
    }

    const validRunTimes = playerSessions
      .map(s => s.runTime)
      .filter(t => t && t.includes(':'))
      .map(t => {
        const [min, sec] = t.split(':').map(Number);
        return min * 60 + sec;
      });

    const avgRunSeconds = validRunTimes.length > 0 
      ? validRunTimes.reduce((a, b) => a + b, 0) / validRunTimes.length
      : 0;
    
    const avgRunTime = avgRunSeconds > 0
      ? `${Math.floor(avgRunSeconds / 60)}:${String(Math.floor(avgRunSeconds % 60)).padStart(2, '0')}`
      : 'N/A';

    const leftJumps = playerSessions.map(s => s.broadJumps.leftSingle).filter(j => j > 0);
    const rightJumps = playerSessions.map(s => s.broadJumps.rightSingle).filter(j => j > 0);
    
    const avgLeft = leftJumps.length > 0 ? leftJumps.reduce((a, b) => a + b, 0) / leftJumps.length : 0;
    const avgRight = rightJumps.length > 0 ? rightJumps.reduce((a, b) => a + b, 0) / rightJumps.length : 0;
    
    const jumpBalance = avgLeft > 0 && avgRight > 0
      ? `${Math.round((Math.min(avgLeft, avgRight) / Math.max(avgLeft, avgRight)) * 100)}%`
      : 'N/A';

    const sprintDropoffs = playerSessions.map(s => {
      const sprints = s.sprints.filter(sp => sp > 0);
      if (sprints.length < 2) return null;
      return ((sprints[sprints.length - 1] - sprints[0]) / sprints[0]) * 100;
    }).filter(d => d !== null);

    const fatigueDropoff = sprintDropoffs.length > 0
      ? `${Math.round(sprintDropoffs.reduce((a, b) => a + b, 0) / sprintDropoffs.length)}%`
      : 'N/A';

    return {
      avgRunTime,
      jumpBalance,
      fatigueDropoff,
      totalSessions: playerSessions.length
    };
  };

  const getChartData = (playerId) => {
    const playerSessions = getPlayerSessions(playerId).slice(0, 10).reverse();
    
    return playerSessions.map(session => ({
      date: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sprint1: session.sprints[0] || 0,
      sprint6: session.sprints[5] || 0,
      leftJump: session.broadJumps.leftSingle,
      rightJump: session.broadJumps.rightSingle
    }));
  };

  const insights = selectedPlayer ? calculateInsights(selectedPlayer) : null;
  const chartData = selectedPlayer ? getChartData(selectedPlayer) : [];

  // Get Recharts components only after they're loaded
  const LineChart = rechartsLoaded ? window.Recharts.LineChart : null;
  const Line = rechartsLoaded ? window.Recharts.Line : null;
  const XAxis = rechartsLoaded ? window.Recharts.XAxis : null;
  const YAxis = rechartsLoaded ? window.Recharts.YAxis : null;
  const CartesianGrid = rechartsLoaded ? window.Recharts.CartesianGrid : null;
  const Tooltip = rechartsLoaded ? window.Recharts.Tooltip : null;
  const Legend = rechartsLoaded ? window.Recharts.Legend : null;
  const ResponsiveContainer = rechartsLoaded ? window.Recharts.ResponsiveContainer : null;
  const BarChart = rechartsLoaded ? window.Recharts.BarChart : null;
  const Bar = rechartsLoaded ? window.Recharts.Bar : null;

  console.log('Rendering with view:', view);

  return (
    <div>
      <nav>
        <div className="nav-container">
          <h1 className="nav-title">
            <Activity />
            PerformanceDB
          </h1>
          <div className="nav-buttons">
            <button
              onClick={() => setView('record')}
              className={`nav-button ${view === 'record' ? 'active' : ''}`}
            >
              Record Session
            </button>
            <button
              onClick={() => setView('insights')}
              className={`nav-button ${view === 'insights' ? 'active' : ''}`}
            >
              Insights
            </button>
            <button
              onClick={() => setView('history')}
              className={`nav-button ${view === 'history' ? 'active' : ''}`}
            >
              History
            </button>
          </div>
        </div>
      </nav>

      <main>
        {view === 'record' && (
          <div className="grid-3">
            <div className="space-y-6">
              <div className="card">
                <h2 className="section-header">
                  <Users />
                  Add New Player
                </h2>
                <div className="flex flex-gap">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                    placeholder="Player name"
                  />
                  <button onClick={addPlayer} className="btn btn-success">
                    Add
                  </button>
                </div>
              </div>

              <div className="card">
                <h2 className="section-header">
                  <Calendar />
                  Record Training Session
                </h2>
                <div className="space-y-4">
                  <div>
                    <label>Player</label>
                    <select
                      value={selectedPlayer}
                      onChange={(e) => setSelectedPlayer(e.target.value)}
                    >
                      <option value="">Select Player...</option>
                      {players.map(player => (
                        <option key={player.id} value={player.id}>{player.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label>Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>

                  <div className="border-t">
                    <label className="section-label">1. Endurance (2km Run)</label>
                    <input
                      type="text"
                      placeholder="MM:SS (e.g., 07:30)"
                      value={formData.runTime}
                      onChange={(e) => setFormData({...formData, runTime: e.target.value})}
                    />
                  </div>

                  <div className="border-t">
                    <label className="section-label">2. Broad Jumps (Distance in cm)</label>
                    <div className="grid-2">
                      <input
                        type="number"
                        placeholder="L Single"
                        value={formData.leftSingle}
                        onChange={(e) => setFormData({...formData, leftSingle: e.target.value})}
                      />
                      <input
                        type="number"
                        placeholder="R Single"
                        value={formData.rightSingle}
                        onChange={(e) => setFormData({...formData, rightSingle: e.target.value})}
                      />
                      <input
                        type="number"
                        placeholder="Double"
                        value={formData.doubleSingle}
                        onChange={(e) => setFormData({...formData, doubleSingle: e.target.value})}
                        className="col-span-2"
                      />
                      <input
                        type="number"
                        placeholder="L Triple"
                        value={formData.leftTriple}
                        onChange={(e) => setFormData({...formData, leftTriple: e.target.value})}
                      />
                      <input
                        type="number"
                        placeholder="R Triple"
                        value={formData.rightTriple}
                        onChange={(e) => setFormData({...formData, rightTriple: e.target.value})}
                      />
                      <input
                        type="number"
                        placeholder="Double Triple"
                        value={formData.doubleTriple}
                        onChange={(e) => setFormData({...formData, doubleTriple: e.target.value})}
                        className="col-span-2"
                      />
                    </div>
                  </div>

                  <div className="border-t">
                    <label className="section-label">3. Court Sprints (6 x 30s)</label>
                    <div className="grid-3-cols">
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <input
                          key={num}
                          type="number"
                          placeholder={`Set ${num}`}
                          value={formData[`sprint${num}`]}
                          onChange={(e) => setFormData({...formData, [`sprint${num}`]: e.target.value})}
                        />
                      ))}
                    </div>
                  </div>

                  <button onClick={handleSubmit} className="btn btn-primary">
                    Save Training Session
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h3 className="section-header">
                  <Users />
                  Current Players ({players.length})
                </h3>
                <div className="grid-2 grid-players">
                  {players.map(player => (
                    <div key={player.id} className="player-card">
                      <p className="player-name">{player.name}</p>
                      <p className="player-sessions">
                        {getPlayerSessions(player.id).length} sessions
                      </p>
                    </div>
                  ))}
                  {players.length === 0 && (
                    <p className="text-gray-500 text-center py-8 col-span-2">No players added yet</p>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 className="section-header">Recent Training Sessions</h3>
                <div className="space-y-4 overflow-auto max-h-96">
                  {sessions.slice(0, 5).map(session => (
                    <div key={session.id} className="session-card">
                      <div className="session-header">
                        <div>
                          <p className="session-player">{session.playerName}</p>
                          <p className="session-date">{new Date(session.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="session-time">{session.runTime || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {sessions.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No training sessions recorded yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'insights' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="section-header">Select Player for Insights</h2>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                style={{maxWidth: '28rem'}}
              >
                <option value="">Select Player...</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </div>

            {selectedPlayer && insights && (
              <>
                <div className="grid-4">
                  <div className="insight-card green">
                    <p className="insight-label">Total Sessions</p>
                    <p className="insight-value">{insights.totalSessions}</p>
                  </div>
                  <div className="insight-card blue">
                    <p className="insight-label">Avg 2km Time</p>
                    <p className="insight-value">{insights.avgRunTime}</p>
                  </div>
                  <div className="insight-card orange">
                    <p className="insight-label">Jump Balance</p>
                    <p className="insight-value">{insights.jumpBalance}</p>
                  </div>
                  <div className="insight-card purple">
                    <p className="insight-label">Fatigue Drop</p>
                    <p className="insight-value">{insights.fatigueDropoff}</p>
                  </div>
                </div>

                {rechartsLoaded && chartData.length > 0 && (
                  <>
                    <div className="card">
                      <h3 className="section-header">
                        <TrendingUp />
                        Sprint Performance Trend
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="sprint1" stroke="#2563eb" strokeWidth={2} name="Sprint Set 1 (Fresh)" />
                          <Line type="monotone" dataKey="sprint6" stroke="#9333ea" strokeWidth={2} name="Sprint Set 6 (Fatigued)" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="card">
                      <h3 className="section-header">Jump Performance (Left vs Right)</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="leftJump" fill="#3b82f6" name="Left Single Jump (cm)" />
                          <Bar dataKey="rightJump" fill="#8b5cf6" name="Right Single Jump (cm)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
                
                {!rechartsLoaded && (
                  <div className="card">
                    <p className="text-center py-8">Loading charts...</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {view === 'history' && (
          <div className="card">
            <h2 className="section-header">Training History</h2>
            <div className="mb-4">
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                style={{maxWidth: '28rem'}}
              >
                <option value="">All Players</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>{player.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-4 overflow-auto max-h-600">
              {(selectedPlayer ? getPlayerSessions(selectedPlayer) : sessions).map(session => (
                <div key={session.id} className="history-detail">
                  <div className="session-header mb-4">
                    <div>
                      <h3 className="session-player" style={{fontSize: '1.125rem'}}>{session.playerName}</h3>
                      <p className="session-date">{new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="session-date">2km Run Time</p>
                      <p className="session-time">{session.runTime || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="detail-grid">
                    <div className="detail-section">
                      <p className="detail-title">Broad Jumps (cm)</p>
                      <div style={{marginTop: '0.5rem'}}>
                        <p>L Single: {session.broadJumps.leftSingle || '-'}</p>
                        <p>R Single: {session.broadJumps.rightSingle || '-'}</p>
                        <p>Double: {session.broadJumps.doubleSingle || '-'}</p>
                        <p>L Triple: {session.broadJumps.leftTriple || '-'}</p>
                        <p>R Triple: {session.broadJumps.rightTriple || '-'}</p>
                        <p>Double Triple: {session.broadJumps.doubleTriple || '-'}</p>
                      </div>
                    </div>
                    <div className="detail-section">
                      <p className="detail-title">Sprint Sets</p>
                      <div className="sprint-grid" style={{marginTop: '0.5rem'}}>
                        {session.sprints.map((sprint, idx) => (
                          <div key={idx} className="sprint-box">
                            <p className="sprint-label">Set {idx + 1}</p>
                            <p className="sprint-value">{sprint || '-'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(selectedPlayer ? getPlayerSessions(selectedPlayer) : sessions).length === 0 && (
                <p className="text-gray-500 text-center py-8">No training sessions found</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Function to initialize the app
const initApp = async () => {
  console.log('Initializing app...');
  console.log('Checking for root element:', document.getElementById('root'));
  
  try {
    console.log('Waiting for Recharts...');
    await checkRecharts();
    console.log('Recharts loaded successfully!');
    
    console.log('About to create React root');
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('Root element not found!');
      return;
    }
    
    console.log('Creating React root...');
    const root = ReactDOM.createRoot(rootElement);
    console.log('React root created successfully!');
    
    console.log('Rendering app component...');
    root.render(<AthleteTracker />);
    console.log('App rendered successfully! Check if you see content above.');
  } catch (error) {
    console.error('Error rendering app:', error);
    console.error('Error stack:', error.stack);
    // Try to show error on page
    document.getElementById('root').innerHTML = `
      <div style="padding: 20px; background: #fee; border: 2px solid #f00; margin: 20px; border-radius: 8px;">
        <h2>Error Loading App</h2>
        <p><strong>Error:</strong> ${error.message}</p>
        <pre>${error.stack}</pre>
      </div>
    `;
  }
};

// Check if DOM is already loaded
if (document.readyState === 'loading') {
  console.log('DOM still loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  console.log('DOM already loaded, initializing immediately');
  initApp();
}