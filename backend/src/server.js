// Entry point — starts the HTTP server and verifies the database connection
const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./config/database');

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established.');
    return sequelize.sync();
  })
  .then(() => console.log('Database tables synced.'))
  .catch((err) => console.error('Database startup error:', err));

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
