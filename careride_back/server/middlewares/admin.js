const logger = require('../services/winston').logger;
const { CustomError } = require('../utils/errors.js');

async function adminMiddleware(req, res, next) {
  try {

    if (!req.User) {
      throw new CustomError(401, 'NO_PERMISSION');
    }
    if (req.User.ROLE !== 'a') {
      throw new CustomError(401, 'NO_PERMISSION');
    }
    if (req.User.v('block') == 1)  {
      throw new CustomError(401, 'USER_BLOCKED');
    }

    next();
  } catch (e) {
    logger.error('An ERROR happened at the adminMiddleware.', e);
    next(e);
  }
}

module.exports = adminMiddleware;
