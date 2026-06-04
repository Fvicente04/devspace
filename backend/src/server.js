// Entry point — starts the HTTP server and verifies the database connection
const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./config/database');

sequelize
  .authenticate()
  .then(() => console.log('Database connection established.'))
  .catch((err) => console.error('Unable to connect to the database:', err));

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});
