# 🚀 Request Logger & Analytics Middleware

<p align="center">
  <strong>A lightweight Express.js middleware for request logging, performance monitoring & traffic analytics.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Database-Not%20Required-success?style=for-the-badge" />
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-api-endpoints">API</a> •
  <a href="#-how-it-works">How It Works</a>
</p>

---

## 📌 Overview

**Request Logger & Analytics Middleware** is a small but practical Express.js project demonstrating how to build a custom middleware for monitoring application traffic.

Every request is tracked with:

* 🌐 HTTP method
* 🛣️ Request path
* ⏱️ Response time
* 📊 Response status
* 🕐 Request timestamp

The application also provides an analytics API through `/stats` for understanding traffic, errors, response times, and route performance.

> 💡 **No database required.**
>
> Request logs are stored in `logs/access.log`, while aggregated statistics are maintained in memory and periodically persisted to `data/stats.json`.

---

## ✨ Features

| Feature                | Description                                                                 |
| ---------------------- | --------------------------------------------------------------------------- |
| 📝 Request Logging     | Logs every incoming HTTP request                                            |
| ⚡ Performance Tracking | Measures response time in milliseconds                                      |
| 📊 Analytics           | Aggregates traffic and performance statistics                               |
| 🚨 Error Tracking      | Tracks HTTP errors and calculates error rate                                |
| 🛣️ Route Aggregation  | Groups dynamic routes such as `/users/:id`                                  |
| 💾 File Persistence    | Saves logs and statistics locally                                           |
| 🔄 Recent Requests     | View the latest requests through an API                                     |
| 🧹 Reset Statistics    | Clear aggregated statistics                                                 |
| 🪶 Lightweight         | No database required                                                        |
| 🔌 Database Ready      | Storage layer can easily be replaced with MongoDB, PostgreSQL, SQLite, etc. |

---

## 🏗️ Architecture

```text
                         ┌──────────────────┐
                         │      Client      │
                         └────────┬─────────┘
                                  │
                                  ▼
                     ┌────────────────────────┐
                     │   Request Logger      │
                     │      Middleware       │
                     └───────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
             ┌──────────────┐         ┌──────────────┐
             │   Express    │         │ Stats Store  │
             │    Routes    │         │   In-Memory  │
             └──────┬───────┘         └──────┬───────┘
                    │                         │
                    ▼                         ▼
             ┌──────────────┐         ┌──────────────┐
             │   Response   │         │ stats.json   │
             └──────────────┘         └──────────────┘
                    │
                    ▼
             ┌──────────────┐
             │ access.log   │
             └──────────────┘
```

---

## 📂 Project Structure

```text
request-logger/
│
├── 📁 src/
│   ├── 📄 index.js
│   ├── 📄 app.js
│   │
│   ├── 📁 middleware/
│   │   └── 📄 requestLogger.js
│   │
│   ├── 📁 store/
│   │   └── 📄 statsStore.js
│   │
│   └── 📁 routes/
│       ├── 📄 demo.js
│       └── 📄 stats.js
│
├── 📁 tests/
│   └── 📄 load-test.js
│
├── 📁 logs/
│   └── 📄 access.log
│
├── 📁 data/
│   └── 📄 stats.json
│
├── 📄 package.json
└── 📄 README.md
```

---

## 🛠️ Tech Stack

### Backend

* 🟢 **Node.js**
* ⚫ **Express.js**

### Storage

* 📄 Flat JSON file
* 📝 Access log file
* 🧠 In-memory aggregation

### Development

* 🔄 Nodemon
* 🧪 Custom load testing script

---

## 🚀 Installation

### 1️⃣ Clone the repository

```bash
git clone <your-repository-url>
cd request-logger
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start the server

```bash
npm start
```

The server will start at:

```text
http://localhost:3000
```

### 4️⃣ Development mode

For automatic restart during development:

```bash
npm run dev
```

---

## ⚙️ Configuration

The server supports the following environment variable:

| Variable | Default | Description                     |
| -------- | ------: | ------------------------------- |
| `PORT`   |  `3000` | Port used by the Express server |

Example:

```bash
PORT=4000 npm start
```

---

## 🔥 API Endpoints

### 🏠 Basic Routes

| Method | Endpoint         | Description             |
| :----: | ---------------- | ----------------------- |
|  `GET` | `/`              | Welcome message         |
|  `GET` | `/api/users`     | Get all demo users      |
|  `GET` | `/api/users/:id` | Get a specific user     |
| `POST` | `/api/users`     | Create a demo user      |
|  `GET` | `/api/slow`      | Simulate a slow request |
|  `GET` | `/api/error`     | Generate a test error   |

### 📊 Analytics Routes

| Method | Endpoint        | Description                 |
| :----: | --------------- | --------------------------- |
|  `GET` | `/stats`        | Get aggregated statistics   |
|  `GET` | `/stats/recent` | Get recent requests         |
| `POST` | `/stats/reset`  | Reset aggregated statistics |

---

## 🧪 Try It Yourself

### Get users

```bash
curl http://localhost:3000/api/users
```

### Get a specific user

```bash
curl http://localhost:3000/api/users/1
```

### Test slow requests

```bash
curl http://localhost:3000/api/slow
```

### Test error handling

```bash
curl http://localhost:3000/api/error
```

### Create a user

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Margaret Hamilton"}'
```

### View analytics

```bash
curl http://localhost:3000/stats
```

### View recent requests

```bash
curl "http://localhost:3000/stats/recent?limit=20"
```

---

## 📊 Analytics Example

The `/stats` endpoint returns aggregated information such as:

```json
{
  "startTime": "2026-08-28T10:00:00.000Z",
  "uptimeSeconds": 42,
  "totalRequests": 37,
  "totalErrors": 3,
  "errorRate": 0.081,
  "requestsPerMinute": 52.86,
  "avgResponseMs": 118.4,
  "p95ResponseMs": 812.3,
  "p99ResponseMs": 910.1,
  "byMethod": {
    "GET": 33,
    "POST": 4
  },
  "byStatus": {
    "200": 32,
    "404": 2,
    "500": 3
  },
  "routes": [
    {
      "route": "GET /api/slow",
      "count": 8,
      "avgMs": 601.2,
      "minMs": 210.4,
      "maxMs": 981.7,
      "p95Ms": 940.1,
      "statusCodes": {
        "200": 8
      }
    }
  ]
}
```

---

## 🧠 How The Middleware Works

The core middleware attaches a listener to Express's response lifecycle:

```js
function requestLogger(statsStore) {
  return function (req, res, next) {

    const start = process.hrtime.bigint();

    res.on("finish", () => {

      const durationMs =
        Number(process.hrtime.bigint() - start) / 1e6;

      const entry = {
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs
      };

      logStream.write(JSON.stringify(entry) + "\n");

      statsStore.record(entry);
    });

    next();
  };
}
```

### 🔑 Important Concepts

#### 1. Middleware Order Matters

The logger should be registered **before the application routes**.

```js
app.use(requestLogger(statsStore));

app.use("/", routes);
```

This ensures requests such as:

* ✅ Successful requests
* ✅ 404 responses
* ✅ Errors

can all be observed.

---

#### 2. `next()` Should Be Called Immediately

The middleware shouldn't block the request.

Instead:

```text
Request
   ↓
Logger starts timer
   ↓
next()
   ↓
Route executes
   ↓
Response finishes
   ↓
Logger records result
```

---

#### 3. Use the `finish` Event

Instead of modifying:

```js
res.end()
```

or:

```js
res.write()
```

the middleware listens for:

```js
res.on("finish", ...)
```

This allows the middleware to capture the final:

* HTTP status
* Response duration
* Request information

without modifying Express's response behavior.

---

#### 4. Normalize Dynamic Routes

For a request like:

```text
/api/users/42
```

the logger can record the Express route pattern:

```text
/api/users/:id
```

This prevents analytics from treating every user ID as a completely different endpoint.

---

#### 5. Errors Are Still Logged

Because the logger registers its `finish` listener before the request reaches the error handler, failed requests can still be recorded.

Example:

```text
GET /api/error
       ↓
500 Internal Server Error
       ↓
Logger records request
```

---

## 🧪 Load Testing

The project includes a simple load-testing script.

Run:

```bash
npm run load-test
```

By default, it performs **5 rounds** of sample traffic.

You can also specify the number of rounds:

```bash
npm run load-test 20
```

Then check:

```bash
curl http://localhost:3000/stats
```

---

## 💾 Storage Design

The project intentionally avoids a database.

### Request Logs

Stored in:

```text
logs/access.log
```

Each request is stored as a JSON object.

### Aggregated Statistics

Stored in memory and periodically persisted to:

```text
data/stats.json
```

This keeps the application simple while demonstrating a storage abstraction that can later be replaced.

---

## 🔄 Database Migration

The application separates storage logic into:

```text
src/store/statsStore.js
```

The rest of the application communicates with this layer through:

```text
record()
getSnapshot()
getRecent()
reset()
```

Therefore, replacing the JSON storage with:

* 🐘 PostgreSQL
* 🍃 MongoDB
* 🪶 SQLite
* 🐬 MySQL

would primarily require changing the storage implementation.

### Example SQL Schema

```sql
CREATE TABLE request_logs (
  id SERIAL PRIMARY KEY,
  method TEXT NOT NULL,
  route TEXT NOT NULL,
  path TEXT NOT NULL,
  status INTEGER NOT NULL,
  duration_ms REAL NOT NULL,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## ⚠️ Troubleshooting

### `EADDRINUSE`

If port `3000` is already being used:

```bash
PORT=4000 npm start
```

---

### `/stats` Shows Old Numbers

Statistics are periodically persisted rather than written after every request.

The current implementation flushes statistics every **20 requests** and every **10 seconds**.

---

### Dynamic Routes Are Not Grouped

Route normalization works when Express successfully matches a route.

For unmatched requests such as:

```text
/api/users/999999
```

the logger may fall back to the literal request path.

---

### `npm install` Fails

Make sure your environment has access to the npm registry.

The project intentionally keeps dependencies minimal:

```text
express
nodemon
```

---

## 🗺️ Roadmap

* [ ] 🗄️ Add PostgreSQL/MongoDB support
* [ ] 🔐 Add authentication for `/stats`
* [ ] 🔐 Protect `/stats/reset`
* [ ] 📈 Build a Chart.js analytics dashboard
* [ ] 📊 Add route-specific time-series analytics
* [ ] 🔄 Add log rotation
* [ ] 🚀 Add Docker support
* [ ] ☁️ Add deployment configuration
* [ ] 🧪 Add automated tests
* [ ] 📡 Add real-time analytics

---

## 🤝 Contributing

Contributions, issues, and pull requests are welcome!

If you want to improve this project:

```bash
git fork
git clone <your-fork-url>
git checkout -b feature/your-feature
```

Keep contributions focused on:

* Readability
* Simplicity
* Maintainability
* Useful functionality

---
<p align="center">
  Built with ❤️ using Node.js + Express.js
</p>
