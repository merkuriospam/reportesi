const express = require('express');
const router = express.Router();
const { Person } = require('../models');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
  try {
    const people = await Person.findAll();
    res.json(people);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, alias, ageEstimate, gender, description, lastKnownLocation } = req.body;
    const person = await Person.create({ name, alias, ageEstimate, gender, description, lastKnownLocation });
    res.status(201).json(person);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, alias, ageEstimate, gender, description, lastKnownLocation } = req.body;
    await Person.update({ name, alias, ageEstimate, gender, description, lastKnownLocation }, { where: { id: req.params.id } });
    res.json({ message: 'Person updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await Person.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Person deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
