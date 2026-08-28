/**
 * load-test.js
 *
 * Fires a batch of requests at the running server so you have something
 * to look at in /stats. Uses only Node's built-in http module — no
 * extra dependencies required.
 *
 * Usage:
 *   1. In one terminal: npm start
 *   2. In another:      npm run load-test
 */

const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const REQUESTS = [
  { method: 'GET', path: '/' },
  { method: 'GET', path: '/api/users' },
  { method: 'GET', path: '/api/users/1' },
  { method: 'GET', path: '/api/users/2' },
  { method: 'GET', path: '/api/users/999' }, // 404
  { method: 'GET', path: '/api/slow' },
  { method: 'GET', path: '/api/error' }, // 500
  { method: 'POST', path: '/api/users', body: { name: 'Margaret Hamilton' } },
];

function request({ method, path, body }) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      `${BASE_URL}${path}`,
      {
        method,
        headers: data
          ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
          : {},
      },
      (res) => {
        res.resume(); // drain response
        res.on('end', () => resolve(res.statusCode));
      }
    );
    req.on('error', () => resolve('ERR'));
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  const ROUNDS = Number(process.argv[2]) || 5;
  console.log(`Sending ${ROUNDS} round(s) of ${REQUESTS.length} requests to ${BASE_URL} ...`);

  for (let round = 0; round < ROUNDS; round += 1) {
    const results = await Promise.all(REQUESTS.map(request));
    console.log(`Round ${round + 1}:`, results.map((s, i) => `${REQUESTS[i].method} ${REQUESTS[i].path} -> ${s}`).join('  |  '));
  }

  console.log(`\nDone. Now check: curl ${BASE_URL}/stats`);
}

main();
