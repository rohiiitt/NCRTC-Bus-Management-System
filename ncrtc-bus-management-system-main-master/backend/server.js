// server.js
require('dotenv').config();

const app  = require('./src/app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 NCRTC Backend running on port ${PORT}`);
  console.log(`🌐 Health:   http://localhost:${PORT}/health`);
  console.log(`🔑 Login:    POST http://localhost:${PORT}/auth/login`);
  console.log(`🗺️  Live map: GET  http://localhost:${PORT}/avls/live`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});



