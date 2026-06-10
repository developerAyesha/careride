const logger = require('../services/winston').logger;
const { CustomError } = require('../utils/errors');
const { veryfyToken, getToken } = require('../services/jwt');
const Models = require("../models");

async function authMiddleware(req, res, next) {
  try {
    if ( req.headers.authorization ) {
      let heads = req.headers.authorization.split(' ');
      let head = heads[0];
      let token = heads[1];

      if ( head === 'Bearer' ) {
        let tokenData = veryfyToken(token);
        if (!tokenData || !tokenData.data)  {
          throw new CustomError(401, 'TOKEN_EXPIRED');
        } else {
          if (tokenData.data.ur === 'a') {
            req.User = await Models.Staff.getUserById(tokenData.data.uId);
          } else if (tokenData.data.ur === 'v') {
            req.User = await Models.Vendor.getUserById(tokenData.data.uId);
          } else if (tokenData.data.ur === 'c') {
            req.User = await Models.User.getUserById(tokenData.data.uId);
          } else if (tokenData.data.ur === 'd') {
            req.User = await Models.Driver.getUserById(tokenData.data.uId);
          } else {
            throw new CustomError(401, 'TOKEN_EXPIRED');
          }
          try {
            await req.User.authCheck();
          } catch(e) {
            throw new CustomError(401, e.message);
          }
        }
      }
    }

    next();
  } catch(e) {
    logger.error('An ERROR happened at authMiddleware.', e);

    next(e);
  }
}

module.exports = authMiddleware;
