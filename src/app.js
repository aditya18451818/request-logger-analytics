/**
 * app.js
 *
 * Wires everything together. Middleware/route ORDER matters in Express —
 * see the comments below for why each thing is placed where it is.
 */

const express = require('express');

const requestLogger = require('./middleware/requestLogger');
const statsStore = require('./store/statsStore');
const createStatsRouter = require('./routes/stats');
const demoRoutes = require('./routes/demo');

function createApp() {
  const app = express();

  // 1. Logger goes FIRST (before routes) so it wraps literally every
  //    request, including ones that 404 or error out later. If we put
  //    this after the routes, requests that match nothing would never
  //    reach it.
  app.use(requestLogger(statsStore));

  // 2. Demo/business routes.
  app.use('/', demoRoutes);

  // 3. Stats routes, mounted at /stats. Note /stats requests are
  //    themselves logged too, since the logger sits above everything.
  app.use('/stats', createStatsRouter(statsStore));

  // 4. 404 handler — only reached if nothing above matched.
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // 5. Error handler goes LAST, and must take 4 args for Express to
  //    recognize it as an error handler. Because our logger already
  //    attached its 'finish' listener earlier in the chain, this response
  //    still gets logged with the correct error status code.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  });

  return app;
}

module.exports = createApp;
