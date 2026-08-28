/**
 * requestLogger.js
 *
 * Custom Express middleware that:
 *  1. Times every request (method, path, response time, status code).
 *  2. Writes a structured JSON line per request to logs/access.log.
 *  3. Feeds the same data into the in-memory statsStore for /stats.
 *
 * KEY CONCEPTS THIS DEMONSTRATES
 * --------------------------------
 * - Middleware order: this must be registered BEFORE your routes so it
 *   wraps every request, but AFTER body parsers if you want to log
 *   parsed body info (we don't need that here).
 * - next(): we call it immediately so the request keeps flowing through
 *   the stack; we do our actual logging in a `finish` event listener
 *   instead of blocking the request.
 * - Response interception: rather than monkey-patching res.end/res.write
 *   (the classic approach — see the comment below for why you'd do that),
 *   we listen to the 'finish' event on the response object, which fires
 *   once Express has flushed headers+body to the socket. That gives us
 *   an accurate status code and timing with zero risk of breaking the
 *   response body.
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'access.log');

fs.mkdirSync(LOG_DIR, { recursive: true });

// Append-only write stream — much cheaper than opening/closing the file
// on every request.
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

/**
 * Figures out a "normalized" route pattern for a request, e.g.
 * "/api/users/:id" instead of "/api/users/42". This is what makes the
 * /stats aggregation useful — otherwise every unique ID would create its
 * own bucket.
 *
 * req.route is only populated *after* Express has matched a route, which
 * has happened by the time the 'finish' event fires, so we read it there.
 */
function getNormalizedRoute(req) {
  if (req.route && req.route.path) {
    const mountPath = req.baseUrl || '';
    return `${mountPath}${req.route.path}` || '/';
  }
  // No matched route (e.g. 404) — fall back to the raw path so we still
  // capture something useful instead of silently dropping the request.
  return req.path;
}

function requestLogger(statsStore) {
  return function requestLoggerMiddleware(req, res, next) {
    const startNs = process.hrtime.bigint();
    const requestTimestamp = new Date().toISOString();

    // NOTE ON THE "MONKEY-PATCH res.end" APPROACH:
    // A common alternative pattern is:
    //   const originalEnd = res.end;
    //   res.end = function (...args) { /* log here */ return originalEnd.apply(res, args); };
    // That works, but it's easy to get wrong (forgetting to forward args,
    // breaking chunked responses, double-counting if something else also
    // patches res.end). Listening for the 'finish' event achieves the same
    // goal — running code once the response is fully sent — without
    // touching Express internals. We register it once per request here.
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startNs) / 1_000_000;
      const route = getNormalizedRoute(req);

      const entry = {
        timestamp: requestTimestamp,
        method: req.method,
        path: req.originalUrl,
        route,
        status: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
        ip: req.ip,
        userAgent: req.get('user-agent') || null,
      };

      // 1. Append to the log file (fire-and-forget; don't block the event loop).
      logStream.write(JSON.stringify(entry) + '\n');

      // 2. Feed the aggregator that powers /stats.
      statsStore.record(entry);
    });

    // Hand off to the next middleware/route immediately — we don't want
    // to delay the actual request just to log it.
    next();
  };
}

module.exports = requestLogger;
