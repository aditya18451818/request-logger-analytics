/**
 * statsStore.js
 *
 * In-memory analytics store for request data, periodically flushed to disk
 * so stats survive a server restart. Deliberately dependency-free (no DB)
 * so the whole project runs with just `npm install express`.
 *
 * If you want to swap this for a real database, this module is the only
 * place you'd need to touch — everything else talks to it through
 * record() / getSnapshot() / reset().
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// Keep only the most recent N response times per route for percentile math,
// so memory doesn't grow unbounded on a long-running server.
const MAX_SAMPLES_PER_ROUTE = 500;
// Flush to disk every N requests (in addition to on a timer + on shutdown).
const FLUSH_EVERY_N_REQUESTS = 20;

function emptyState() {
  return {
    startTime: new Date().toISOString(),
    totalRequests: 0,
    totalErrors: 0, // status >= 400
    byMethod: {}, // { GET: 10, POST: 3 }
    byStatus: {}, // { '200': 10, '404': 1 }
    byRoute: {}, // { 'GET /api/users': { count, totalTimeMs, minMs, maxMs, statusCodes: {}, samples: [] } }
    recent: [], // last N requests, most recent first, for a live tail view
  };
}

class StatsStore {
  constructor() {
    this.state = this._load();
    this._sinceFlush = 0;

    // Belt-and-braces periodic flush in case traffic is bursty then idle.
    this._flushInterval = setInterval(() => this._save(), 10_000).unref();

    // Best-effort flush on graceful shutdown.
    process.on('SIGINT', () => { this._save(); process.exit(0); });
    process.on('SIGTERM', () => { this._save(); process.exit(0); });
  }

  _load() {
    try {
      const raw = fs.readFileSync(STATS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      // Merge with emptyState() so new fields introduced later don't crash
      // on an old stats.json.
      return { ...emptyState(), ...parsed };
    } catch (err) {
      return emptyState();
    }
  }

  _save() {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(STATS_FILE, JSON.stringify(this.state, null, 2));
    } catch (err) {
      console.error('[statsStore] failed to persist stats:', err.message);
    }
  }

  /**
   * Record a single completed request.
   * @param {Object} entry
   * @param {string} entry.method
   * @param {string} entry.route     normalized route pattern, e.g. "/api/users/:id"
   * @param {string} entry.path      the actual URL path requested
   * @param {number} entry.status
   * @param {number} entry.durationMs
   * @param {string} entry.timestamp ISO string
   * @param {string} [entry.ip]
   */
  record(entry) {
    const s = this.state;
    const routeKey = `${entry.method} ${entry.route}`;

    s.totalRequests += 1;
    if (entry.status >= 400) s.totalErrors += 1;

    s.byMethod[entry.method] = (s.byMethod[entry.method] || 0) + 1;
    s.byStatus[entry.status] = (s.byStatus[entry.status] || 0) + 1;

    if (!s.byRoute[routeKey]) {
      s.byRoute[routeKey] = {
        count: 0,
        totalTimeMs: 0,
        minMs: null,
        maxMs: null,
        statusCodes: {},
        samples: [],
      };
    }
    const r = s.byRoute[routeKey];
    r.count += 1;
    r.totalTimeMs += entry.durationMs;
    r.minMs = r.minMs === null ? entry.durationMs : Math.min(r.minMs, entry.durationMs);
    r.maxMs = r.maxMs === null ? entry.durationMs : Math.max(r.maxMs, entry.durationMs);
    r.statusCodes[entry.status] = (r.statusCodes[entry.status] || 0) + 1;
    r.samples.push(entry.durationMs);
    if (r.samples.length > MAX_SAMPLES_PER_ROUTE) r.samples.shift();

    s.recent.unshift({
      method: entry.method,
      route: entry.route,
      path: entry.path,
      status: entry.status,
      durationMs: entry.durationMs,
      timestamp: entry.timestamp,
    });
    if (s.recent.length > 50) s.recent.length = 50;

    this._sinceFlush += 1;
    if (this._sinceFlush >= FLUSH_EVERY_N_REQUESTS) {
      this._sinceFlush = 0;
      this._save();
    }
  }

  /** Percentile helper over a numeric array (sorted ascending internally). */
  static _percentile(arr, p) {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
  }

  /** Build a human/JSON-friendly snapshot of current aggregated stats. */
  getSnapshot() {
    const s = this.state;
    const uptimeMs = Date.now() - new Date(s.startTime).getTime();

    const routes = Object.entries(s.byRoute).map(([key, r]) => ({
      route: key,
      count: r.count,
      avgMs: Number((r.totalTimeMs / r.count).toFixed(2)),
      minMs: r.minMs,
      maxMs: r.maxMs,
      p95Ms: StatsStore._percentile(r.samples, 95),
      statusCodes: r.statusCodes,
    })).sort((a, b) => b.count - a.count);

    const allSamples = Object.values(s.byRoute).flatMap((r) => r.samples);

    return {
      startTime: s.startTime,
      uptimeSeconds: Math.round(uptimeMs / 1000),
      totalRequests: s.totalRequests,
      totalErrors: s.totalErrors,
      errorRate: s.totalRequests ? Number((s.totalErrors / s.totalRequests).toFixed(4)) : 0,
      requestsPerMinute: uptimeMs > 0
        ? Number((s.totalRequests / (uptimeMs / 60000)).toFixed(2))
        : 0,
      avgResponseMs: allSamples.length
        ? Number((allSamples.reduce((a, b) => a + b, 0) / allSamples.length).toFixed(2))
        : 0,
      p95ResponseMs: StatsStore._percentile(allSamples, 95),
      p99ResponseMs: StatsStore._percentile(allSamples, 99),
      byMethod: s.byMethod,
      byStatus: s.byStatus,
      routes,
    };
  }

  getRecent(limit = 20) {
    return this.state.recent.slice(0, limit);
  }

  reset() {
    this.state = emptyState();
    this._sinceFlush = 0;
    this._save();
  }
}

// Singleton — every route/middleware that requires this file shares one store.
module.exports = new StatsStore();
