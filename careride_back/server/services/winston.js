const appRoot = require('app-root-path');
const winston = require('winston');


const customFormat = winston.format.combine(
    //winston.format.prettyPrint(),
    //winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY/MM/DD HH:mm:ss' }),
    winston.format.splat(),
    //winston.format.simple(),
    winston.format.metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
    winston.format.printf((info) => {
      if (typeof info.message === 'object') {
        info.message = JSON.stringify(info.message, null, 3)
      }
      return `[${info.timestamp}] ${info.level}: ${info.message} ` + (info.metadata ? JSON.stringify(info.metadata, null, 3) : '');
    }),
  );


const logger = new winston.createLogger({
  format: customFormat,
  transports: [
    new (winston.transports.File)({
        level: 'info',
        filename: `${appRoot}/logs/app.log`,
        json: false,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    }),
    new (winston.transports.File)({
        handleExceptions: true,
        name: 'error-file',
        filename: `${appRoot}/logs/error.log`,
        level: 'error'
    }),
    new (winston.transports.Console)({
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    })
  ],
  exitOnError: false, // do not exit on handled exceptions
});
//logger.info("Winston is running !!!");

logger.stream = {
    write: (message) => logger.info(message),
};

const paylogger = new winston.createLogger({
  format: customFormat,
  level: 'info',
  transports: [
    new (winston.transports.File)({
        level: 'info',
        filename: `${appRoot}/logs/pay.log`,
        json: false,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
    }),
    new (winston.transports.Console)({
        level: 'debug',
        handleExceptions: false,
        json: false,
        colorize: true,
    })
  ]
});





module.exports = {
	logger,
	paylogger,
}
