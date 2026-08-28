const createApp = require('./app');

const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Try:  curl http://localhost:${PORT}/api/users`);
  console.log(`Then: curl http://localhost:${PORT}/stats`);
});
