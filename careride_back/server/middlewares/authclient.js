const logger = require('../services/winston').logger;
const { CustomError } = require('../utils/errors');
const Models = require("../models");

async function authMiddleware(req, res, next) {
  try {

    // DEV bypass: if no token provided, auto-use first active client in DB
    if (!req.User && process.env.NODE_ENV !== 'production') {
      try {
        const row = await Models.knex('user_inf').where({ block: 0, activated: 1 }).first();
        if (row) req.User = new Models.User.UserModel(row);
      } catch (dbErr) {
        console.log('[dev-bypass] DB error:', dbErr.message);
      }
    }

    if (!req.User) throw new CustomError(401, 'TOKEN_IS_INVALID');
    if (!req.User.isrole(['c'])) throw new CustomError(401, 'NO_PERMISSION');
    if (req.User.v('block') == 1) throw new CustomError(401, 'USER_BLOCKED');
    if (req.User.v('activated') == 0) throw new CustomError(401, 'USER_NOT_ACTIVATED');

    next();
  } catch(e) {
    logger.error('An ERROR happened at authMiddleware.', e);
    next(e);
  }
}

module.exports = authMiddleware;
