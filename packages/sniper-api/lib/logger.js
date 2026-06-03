const fs = require('fs');
const path = require('path');

const LOG_LEVEL = process.env.LOGGING_LEVEL || 'info';
const LOG_DIR = path.join(__dirname, '../../logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = LEVELS[LOG_LEVEL] || LEVELS.info;

function formatLog(level, message, context = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  });
}

function writeLog(level, message, context) {
  if (LEVELS[level] < currentLevel) return;

  const logLine = formatLog(level, message, context);
  const logFile = path.join(LOG_DIR, `${level}.log`);

  // Write to file (async, non-blocking)
  fs.appendFile(logFile, logLine + '\n', (err) => {
    if (err) console.error('Log write failed:', err.message);
  });

  // Also write to console in dev
  if (process.env.NODE_ENV !== 'production') {
    console.log(logLine);
  }
}

module.exports = {
  debug: (message, context) => writeLog('debug', message, context),
  info: (message, context) => writeLog('info', message, context),
  warn: (message, context) => writeLog('warn', message, context),
  error: (message, context) => writeLog('error', message, context),
};
