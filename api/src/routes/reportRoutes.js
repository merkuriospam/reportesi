const express = require('express');
const router = express.Router();
const { Report, Person } = require('../models');
const { Op } = require('sequelize');
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

router.get('/by-date/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    const [year, month, day] = date.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    const reports = await Report.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      include: Person,
      order: [['createdAt', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/dates-with-reports', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.findAll({
      attributes: ['createdAt'],
      raw: true
    });
    const dates = [...new Set(reports.map(r => {
      const d = new Date(r.createdAt);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }))];
    res.json(dates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
