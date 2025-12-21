const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Initialize SQLite Database
const db = new sqlite3.Database('./athlete_tracker.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Create tables
function initializeDatabase() {
  db.serialize(() => {
    // Players table
    db.run(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Training sessions table
    db.run(`
      CREATE TABLE IF NOT EXISTS training_sessions (
        id TEXT PRIMARY KEY,
        player_id TEXT NOT NULL,
        player_name TEXT NOT NULL,
        date DATE NOT NULL,
        run_time TEXT,
        left_single REAL,
        right_single REAL,
        double_single REAL,
        left_triple REAL,
        right_triple REAL,
        double_triple REAL,
        sprint_1 REAL,
        sprint_2 REAL,
        sprint_3 REAL,
        sprint_4 REAL,
        sprint_5 REAL,
        sprint_6 REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (player_id) REFERENCES players(id)
      )
    `);

    console.log('Database initialized');
  });
}

// ============ PLAYER ENDPOINTS ============

// Get all players
app.get('/api/players', (req, res) => {
  db.all('SELECT * FROM players ORDER BY name', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single player
app.get('/api/players/:id', (req, res) => {
  db.get('SELECT * FROM players WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }
    res.json(row);
  });
});

// Create player
app.post('/api/players', (req, res) => {
  const { id, name } = req.body;
  
  if (!id || !name) {
    res.status(400).json({ error: 'ID and name are required' });
    return;
  }

  db.run(
    'INSERT INTO players (id, name) VALUES (?, ?)',
    [id, name],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name, created_at: new Date().toISOString() });
    }
  );
});

// Delete player
app.delete('/api/players/:id', (req, res) => {
  db.run('DELETE FROM players WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// ============ TRAINING SESSION ENDPOINTS ============

// Get all sessions
app.get('/api/sessions', (req, res) => {
  const { player_id } = req.query;
  
  let query = 'SELECT * FROM training_sessions';
  let params = [];
  
  if (player_id) {
    query += ' WHERE player_id = ?';
    params.push(player_id);
  }
  
  query += ' ORDER BY date DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Transform data to match frontend format
    const sessions = rows.map(row => ({
      id: row.id,
      playerId: row.player_id,
      playerName: row.player_name,
      date: row.date,
      runTime: row.run_time,
      broadJumps: {
        leftSingle: row.left_single,
        rightSingle: row.right_single,
        doubleSingle: row.double_single,
        leftTriple: row.left_triple,
        rightTriple: row.right_triple,
        doubleTriple: row.double_triple
      },
      sprints: [
        row.sprint_1,
        row.sprint_2,
        row.sprint_3,
        row.sprint_4,
        row.sprint_5,
        row.sprint_6
      ]
    }));
    
    res.json(sessions);
  });
});

// Get single session
app.get('/api/sessions/:id', (req, res) => {
  db.get('SELECT * FROM training_sessions WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }
    
    const session = {
      id: row.id,
      playerId: row.player_id,
      playerName: row.player_name,
      date: row.date,
      runTime: row.run_time,
      broadJumps: {
        leftSingle: row.left_single,
        rightSingle: row.right_single,
        doubleSingle: row.double_single,
        leftTriple: row.left_triple,
        rightTriple: row.right_triple,
        doubleTriple: row.double_triple
      },
      sprints: [
        row.sprint_1,
        row.sprint_2,
        row.sprint_3,
        row.sprint_4,
        row.sprint_5,
        row.sprint_6
      ]
    };
    
    res.json(session);
  });
});

// Create training session
app.post('/api/sessions', (req, res) => {
  const { id, playerId, playerName, date, runTime, broadJumps, sprints } = req.body;
  
  if (!id || !playerId || !date) {
    res.status(400).json({ error: 'ID, player ID, and date are required' });
    return;
  }

  db.run(
    `INSERT INTO training_sessions (
      id, player_id, player_name, date, run_time,
      left_single, right_single, double_single,
      left_triple, right_triple, double_triple,
      sprint_1, sprint_2, sprint_3, sprint_4, sprint_5, sprint_6
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      playerId,
      playerName,
      date,
      runTime || null,
      broadJumps?.leftSingle || 0,
      broadJumps?.rightSingle || 0,
      broadJumps?.doubleSingle || 0,
      broadJumps?.leftTriple || 0,
      broadJumps?.rightTriple || 0,
      broadJumps?.doubleTriple || 0,
      sprints?.[0] || 0,
      sprints?.[1] || 0,
      sprints?.[2] || 0,
      sprints?.[3] || 0,
      sprints?.[4] || 0,
      sprints?.[5] || 0
    ],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(req.body);
    }
  );
});

// Update training session
app.put('/api/sessions/:id', (req, res) => {
  const { playerId, playerName, date, runTime, broadJumps, sprints } = req.body;
  
  db.run(
    `UPDATE training_sessions SET
      player_id = ?, player_name = ?, date = ?, run_time = ?,
      left_single = ?, right_single = ?, double_single = ?,
      left_triple = ?, right_triple = ?, double_triple = ?,
      sprint_1 = ?, sprint_2 = ?, sprint_3 = ?, sprint_4 = ?, sprint_5 = ?, sprint_6 = ?
    WHERE id = ?`,
    [
      playerId,
      playerName,
      date,
      runTime || null,
      broadJumps?.leftSingle || 0,
      broadJumps?.rightSingle || 0,
      broadJumps?.doubleSingle || 0,
      broadJumps?.leftTriple || 0,
      broadJumps?.rightTriple || 0,
      broadJumps?.doubleTriple || 0,
      sprints?.[0] || 0,
      sprints?.[1] || 0,
      sprints?.[2] || 0,
      sprints?.[3] || 0,
      sprints?.[4] || 0,
      sprints?.[5] || 0,
      req.params.id
    ],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }
      res.json(req.body);
    }
  );
});

// Delete training session
app.delete('/api/sessions/:id', (req, res) => {
  db.run('DELETE FROM training_sessions WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ deleted: this.changes });
  });
});

// ============ ANALYTICS ENDPOINTS ============

// Get player statistics
app.get('/api/players/:id/stats', (req, res) => {
  const playerId = req.params.id;
  
  db.all(
    'SELECT * FROM training_sessions WHERE player_id = ? ORDER BY date DESC',
    [playerId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (rows.length === 0) {
        res.json({
          totalSessions: 0,
          avgRunTime: null,
          jumpBalance: null,
          fatigueDropoff: null
        });
        return;
      }
      
      // Calculate statistics
      const validRunTimes = rows
        .filter(r => r.run_time && r.run_time.includes(':'))
        .map(r => {
          const [min, sec] = r.run_time.split(':').map(Number);
          return min * 60 + sec;
        });
      
      const avgRunSeconds = validRunTimes.length > 0
        ? validRunTimes.reduce((a, b) => a + b, 0) / validRunTimes.length
        : 0;
      
      const avgRunTime = avgRunSeconds > 0
        ? `${Math.floor(avgRunSeconds / 60)}:${String(Math.floor(avgRunSeconds % 60)).padStart(2, '0')}`
        : null;
      
      const leftJumps = rows.map(r => r.left_single).filter(j => j > 0);
      const rightJumps = rows.map(r => r.right_single).filter(j => j > 0);
      
      const avgLeft = leftJumps.length > 0 ? leftJumps.reduce((a, b) => a + b, 0) / leftJumps.length : 0;
      const avgRight = rightJumps.length > 0 ? rightJumps.reduce((a, b) => a + b, 0) / rightJumps.length : 0;
      
      const jumpBalance = avgLeft > 0 && avgRight > 0
        ? Math.round((Math.min(avgLeft, avgRight) / Math.max(avgLeft, avgRight)) * 100)
        : null;
      
      const sprintDropoffs = rows.map(r => {
        if (r.sprint_1 > 0 && r.sprint_6 > 0) {
          return ((r.sprint_6 - r.sprint_1) / r.sprint_1) * 100;
        }
        return null;
      }).filter(d => d !== null);
      
      const fatigueDropoff = sprintDropoffs.length > 0
        ? Math.round(sprintDropoffs.reduce((a, b) => a + b, 0) / sprintDropoffs.length)
        : null;
      
      res.json({
        totalSessions: rows.length,
        avgRunTime,
        jumpBalance,
        fatigueDropoff
      });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});