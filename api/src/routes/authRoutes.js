const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User, Group } = require('../models');
require('dotenv').config();

router.post('/register', async (req, res) => {
  try {
    const { username, password, pin } = req.body;

    const group = await Group.findOne({ where: { name: pin } });
    if (!group) {
      return res.status(401).json({ error: 'PIN inválido' });
    }

    const user = await User.create({ username, password, groupId: group.id });
    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      where: { username },
      include: [Group],
    });
    if (!user || !(await user.validPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, groupId: user.groupId, groupName: user.Group?.name || '' },
      process.env.JWT_SECRET
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
