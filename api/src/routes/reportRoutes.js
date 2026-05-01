const express = require('express');
const router = express.Router();
const { Report, Person } = require('../models');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.findAll({ include: Person });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { personId, latitude, longitude, comment, urgency, status } = req.body;
    const report = await Report.create({ personId, latitude, longitude, comment, urgency, status });
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/person/:personId', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.findAll({ 
      where: { personId: req.params.personId },
      include: Person,
      order: [['createdAt', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
