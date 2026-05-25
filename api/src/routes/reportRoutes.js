const express = require('express');
const router = express.Router();
const { Report, Person, User } = require('../models');
const { Op } = require('sequelize');
const authenticateToken = require('../middleware/auth');

function getOffsetMs(offsetMinutes) {
  return (parseInt(offsetMinutes) || 0) * 60000;
}

function getDateRange(dateStr, offsetMinutes) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const offMs = getOffsetMs(offsetMinutes);
  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) + offMs);
  const end = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999) + offMs);
  return { start, end };
}

function toDateStr(date, offsetMinutes) {
  const offMs = getOffsetMs(offsetMinutes);
  const d = new Date(date.getTime() - offMs);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 1000);
    const pageOffset = parseInt(req.query.offset) || 0;
    const where = {};
    if (req.query.date) {
      const { start, end } = getDateRange(req.query.date, req.query.tz);
      where.reportedAt = { [Op.between]: [start, end] };
    }
    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [
        { model: User, where: { groupId: req.user.groupId }, attributes: ['username'] },
        Person,
      ],
      order: [['reportedAt', 'DESC']],
      limit,
      offset: pageOffset,
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
        { model: User, where: { groupId: req.user.groupId }, attributes: ['username'] },
        Person,
      ],
      order: [['reportedAt', 'DESC']],
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
    const { start, end } = getDateRange(req.params.date, req.query.tz);
    const reports = await Report.findAll({
      where: {
        reportedAt: {
          [Op.between]: [start, end]
        }
      },
      include: [
        { model: User, where: { groupId: req.user.groupId }, attributes: ['username'] },
        Person,
      ],
      order: [['reportedAt', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { comment, urgency, status, latitude, longitude, personId, reportedAt } = req.body;
    const report = await Report.findOne({
      where: { id: req.params.id },
      include: [{ model: User, where: { groupId: req.user.groupId }, attributes: [] }],
    });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    await report.update({ comment, urgency, status, latitude, longitude, personId, reportedAt });
    const updated = await Report.findByPk(report.id, { include: [Person] });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/dates-with-reports', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.findAll({
      attributes: ['reportedAt'],
      include: [
        { model: User, where: { groupId: req.user.groupId }, attributes: [] },
      ],
      raw: true
    });
    const dates = [...new Set(reports.map(r => toDateStr(r.reportedAt, req.query.tz)))];
    res.json(dates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
