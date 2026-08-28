/**
 * stats.js
 *
 * Read-only analytics endpoints backed by statsStore. Kept as its own
 * router so it's easy to, say, mount it behind auth in a real app.
 */

const express = require('express');

function createStatsRouter(statsStore) {
  const router = express.Router();

  // GET /stats — aggregated overview: totals, per-method, per-status,
  // per-route breakdown with avg/min/max/p95 response times.
  router.get('/', (req, res) => {
    res.json(statsStore.getSnapshot());
  });

  // GET /stats/recent — the last N requests, most recent first. Handy for
  // a live "tail -f" style view without grepping the log file.
  router.get('/recent', (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    res.json(statsStore.getRecent(limit));
  });

  // POST /stats/reset — clears all aggregated stats (does not touch the
  // raw access.log file, only the in-memory/persisted aggregates).
  router.post('/reset', (req, res) => {
    statsStore.reset();
    res.json({ message: 'Stats reset' });
  });

  return router;
}

module.exports = createStatsRouter;
