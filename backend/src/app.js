// Express app — middleware setup and route registration only, no business logic
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const env = require('./config/env');

require('./config/passport');

const authRouter = require('./routes/auth');
const githubRouter = require('./routes/github');
const tasksRouter = require('./routes/tasks');
const notesRouter = require('./routes/notes');
const timerRouter = require('./routes/timer');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

// express-session is required by passport for the OAuth state parameter
app.use(session({
  secret: env.jwtSecret,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/auth', authLimiter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRouter);
app.use('/github', githubRouter);
app.use('/tasks', tasksRouter);
app.use('/notes', notesRouter);
app.use('/timer', timerRouter);

module.exports = app;
