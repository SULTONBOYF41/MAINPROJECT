const db = require('../db/database');

const getOrders = (req, res) => {
  db.all('SELECT * FROM orders ORDER BY date DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

const addOrder = (req, res) => {
  const { name, phone, product, source, date } = req.body;

  if (!name || !phone || !product || !source || !date) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  db.run(
    `INSERT INTO orders (name, phone, product, source, date) VALUES (?, ?, ?, ?, ?)`,
    [name, phone, product, source, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
};

module.exports = { getOrders, addOrder };
