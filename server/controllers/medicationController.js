const db = require('../db/sqlite');
const today = new Date().toISOString().split('T')[0];

exports.addMedication = (req, res) => {
  const { name, dosage, frequency } = req.body;
  const stmt = `INSERT INTO medications (userId, name, dosage, frequency) VALUES (?, ?, ?, ?)`;
  db.run(stmt, [req.user.id, name, dosage, frequency], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ id: this.lastID });
  });
};

exports.getMedications = (req, res) => {
  db.all(`SELECT * FROM medications WHERE userId = ?`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.markMedicationTaken = (req, res) => {
  const { id } = req.params;
  db.run(
    `INSERT INTO medication_logs (medicationId, date, taken) VALUES (?, ?, 1)`,
    [id, today],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
};

exports.getAdherence = (req, res) => {
  const query = `
    SELECT COUNT(DISTINCT m.id) as total, COUNT(DISTINCT l.medicationId) as taken
    FROM medications m
    LEFT JOIN medication_logs l ON m.id = l.medicationId AND l.date = ?
    WHERE m.userId = ?;
  `;

  db.get(query, [today, req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    const percent = row.total ? Math.round((row.taken / row.total) * 100) : 0;
    res.json({ adherence: `${percent}%` });
  });
};
