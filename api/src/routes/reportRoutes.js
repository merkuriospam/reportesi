const express = require('express');
const router = express.Router();
const { Report, Person, User } = require('../models');
const { Op } = require('sequelize');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 1000);
    const offset = parseInt(req.query.offset) || 0;
    const where = {};
    if (req.query.date) {
      const [year, month, day] = req.query.date.split('-').map(Number);
      where.createdAt = {
        [Op.between]: [new Date(year, month - 1, day, 0, 0, 0, 0), new Date(year, month - 1, day, 23, 59, 59, 999)]
      };
    }
    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [
        { model: User, where: { groupId: req.user.groupId }, attributes: [] },
        Person,
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows, total: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { personId, latitude, longitude, comment, urgency, status } = req.body;
    const report = await Report.create({
      personId, latitude, longitude, comment, urgency, status,
      userId: req.user.id,
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/person/:personId', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = parseInt(req.query.offset) || 0;
    const { count, rows } = await Report.findAndCountAll({
      where: { personId: req.params.personId },
      include: [
        { model: User, where: { groupId: req.user.groupId }, attributes: [] },
        Person,
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows, total: count });
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
      include: [
        { model: User, where: { groupId: req.user.groupId }, attributes: [] },
        Person,
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { comment, urgency, status, latitude, longitude, personId } = req.body;
    const report = await Report.findOne({
      where: { id: req.params.id },
      include: [{ model: User, where: { groupId: req.user.groupId }, attributes: [] }],
    });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    await report.update({ comment, urgency, status, latitude, longitude, personId });
    const updated = await Report.findByPk(report.id, { include: [Person] });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/dates-with-reports', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.findAll({
      attributes: ['createdAt'],
      include: [
        { model: User, where: { groupId: req.user.groupId }, attributes: [] },
      ],
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
