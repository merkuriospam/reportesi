const express = require('express');
const router = express.Router();
const { Person, Report, User } = require('../models');
const sequelize = require('../config/database');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = parseInt(req.query.offset) || 0;
    const { count, rows } = await Person.findAndCountAll({
      include: [{ model: User, where: { groupId: req.user.groupId }, attributes: [] }],
      attributes: {
        include: [
          [sequelize.literal(`(SELECT COUNT(*) FROM Reports WHERE Reports.personId = Person.id AND Reports.deletedAt IS NULL)`), 'visitCount'],
          [sequelize.literal(`(SELECT urgency FROM Reports WHERE Reports.personId = Person.id AND Reports.deletedAt IS NULL ORDER BY Reports.reportedAt DESC LIMIT 1)`), 'lastUrgency'],
          [sequelize.literal(`(SELECT status FROM Reports WHERE Reports.personId = Person.id AND Reports.deletedAt IS NULL ORDER BY Reports.reportedAt DESC LIMIT 1)`), 'lastStatus'],
          [sequelize.literal(`(SELECT reportedAt FROM Reports WHERE Reports.personId = Person.id AND Reports.deletedAt IS NULL ORDER BY Reports.reportedAt DESC LIMIT 1)`), 'lastVisitDate'],
        ],
      },
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
    const { name, alias, ageEstimate, gender, description, lastKnownLocation } = req.body;
    const person = await Person.create({
      name, alias, ageEstimate, gender, description, lastKnownLocation,
      userId: req.user.id,
    });
    res.status(201).json(person);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, alias, ageEstimate, gender, description, lastKnownLocation } = req.body;
    const person = await Person.findOne({
      where: { id: req.params.id },
      include: [{ model: User, where: { groupId: req.user.groupId } }],
    });
    if (!person) return res.status(404).json({ error: 'Person not found' });
    await person.update({ name, alias, ageEstimate, gender, description, lastKnownLocation });
    res.json({ message: 'Person updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await sequelize.query(
      `UPDATE Reports SET deletedAt = NOW() WHERE personId = :id AND deletedAt IS NULL`,
      { replacements: { id: req.params.id } }
    );
    await sequelize.query(
      `UPDATE People SET deletedAt = NOW() WHERE id = :id AND deletedAt IS NULL`,
      { replacements: { id: req.params.id } }
    );
    res.json({ message: 'Person and associated reports deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
