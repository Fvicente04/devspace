// Entry point — starts the HTTP server and verifies the database connection
const app = require('./app');
require('./config/env');
const { sequelize } = require('./config/database');

const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established.');
    return sequelize.sync();
  })
  .then(() => console.log('Database tables synced.'))
  .catch((err) => console.error('Database startup error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
