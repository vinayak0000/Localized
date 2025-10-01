const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend access
app.use(cors());

// Connect to SQLite database
const dbPath = path.join(__dirname, 'localized_fields.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// API endpoint to get fields by country
app.get('/fields/:country', (req, res) => {
  const country = req.params.country;

  const query = `
    SELECT field_name, label, type, required, validation_rule, options, visibility_condition
    FROM LocalizedFields
    WHERE country_code = ?
  `;

  db.all(query, [country], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const formatted = rows.map(row => ({
        field_name: row.field_name,
        label: row.label,
        type: row.type,
        required: !!row.required,
        validation_rule: row.validation_rule ? JSON.parse(row.validation_rule) : null,
        options: row.options ? JSON.parse(row.options) : null,
        visibility_condition: row.visibility_condition ? JSON.parse(row.visibility_condition) : null
      }));
      res.json(formatted);
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}/fields/:country`);
});
