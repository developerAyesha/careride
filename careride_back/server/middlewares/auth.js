const logger = require('../services/winston').logger;
const { CustomError } = require('../utils/errors');
const Models = require("../models");

async function authMiddleware(req, res, next) {
  try {

    if (!req.User)  {
      throw new CustomError(401, 'TOKEN_IS_INVALID');
    }
    if (req.User.v('block') == 1)  {
      throw new CustomError(401, 'USER_BLOCKED');
    }
    //req.user.isAdmin = (req.user.data.role == 9);

    next();
  } catch(e) {
    logger.error('An ERROR happened at authMiddleware.', e);

    next(e);
  }
}

module.exports = authMiddleware;
