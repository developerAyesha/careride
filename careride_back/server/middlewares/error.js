const bugsnag = require('bugsnag');
const logger = require('../services/winston').logger;
const errorMessages = require('../locales/errorMessages');
const { CustomError } = require('../utils/errors');

//  errorMiddleware must have 4 arg
//  eslint-disable-next-line
function errorMiddleware(error, req, res, next) {

  logger.error(`${error.status || 500} | ${error.message} | ${req.originalUrl} | ${req.method} | ${req.ip} | ${error.stack}`);

  //bugsnag.notify(error);

  const isCustomError = error instanceof CustomError;
  let { message, status = 500 } = error; // eslint-disable-line prefer-const

  if (error.name === 'UnauthorizedError') {
    message = 'Your session has expired, please log in one more time';
  }

  if (!isCustomError) {
    message = errorMessages.sorryMessage;
  }

  res.status(status).json({ error: message, statusCode: status });
}

module.exports = errorMiddleware;
