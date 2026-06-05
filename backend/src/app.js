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
const settingsRouter = require('./routes/settings');
const azureRouter = require('./routes/azure');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}));
app.use(express.json());

app.use(session({
  secret: env.jwtSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: 'none',
    maxAge: 5 * 60 * 1000,
  }
}));

app.use(passport.initialize());
app.use(passport.session());

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
app.use('/settings', settingsRouter);

module.exports = app;