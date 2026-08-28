/**
 * demo.js
 *
 * A handful of sample routes with different behaviors (fast, slow, error,
 * dynamic params) purely so there's something interesting to point the
 * logger/stats system at. Delete or replace with your real app routes.
 */

const express = require('express');
const router = express.Router();

const FAKE_USERS = [
  { id: 1, name: 'Ada Lovelace' },
  { id: 2, name: 'Alan Turing' },
  { id: 3, name: 'Grace Hopper' },
];

router.get('/', (req, res) => {
  res.json({ message: 'Welcome — see README for available demo routes.' });
});

router.get('/api/users', (req, res) => {
  res.json(FAKE_USERS);
});

router.get('/api/users/:id', (req, res) => {
  const user = FAKE_USERS.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.post('/api/users', express.json(), (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const newUser = { id: FAKE_USERS.length + 1, name };
  FAKE_USERS.push(newUser);
  res.status(201).json(newUser);
});

// Simulates a slow downstream call (e.g. a DB or third-party API) so you
// can see varied response times show up in /stats.
router.get('/api/slow', (req, res) => {
  const delayMs = 200 + Math.floor(Math.random() * 800);
  setTimeout(() => res.json({ message: 'That took a while', delayMs }), delayMs);
});

// Always errors, so you can see error rates / status-code breakdowns.
router.get('/api/error', (req, res, next) => {
  next(new Error('Simulated failure for testing'));
});

module.exports = router;
