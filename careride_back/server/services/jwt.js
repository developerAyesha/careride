const jwt = require('jsonwebtoken');
const Config = require("../config.js");
const logger = require('../services/winston').logger;

const jwtKey = Config.JWT_SECRET;
const resetKey = 'carerideSECRETKEY';

function veryfyToken(token) {
  try {
    return jwt.verify(token, jwtKey, {algorithm: 'HS256' });
  } catch (error) {
    return false;
  }
}

function getToken(data) {
  return jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 31,
      data
    },
    jwtKey
  );
}

function getResetToken(data) {
  return jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      data
    },
    resetKey
  );
}

function checkResetTokenOnExpTime(token) {
  try {
    const decoded = jwt.verify(token, resetKey);
    const getTime = Date.now() / 1000;
    return decoded.exp > getTime;
  } catch (error) {
    logger.error('An ERROR happened while checking the reset token on exp time.', JSON.stringify(error));
    throw new Error(401, 'Token is malformed');
  }
}

module.exports = {
  veryfyToken,
  getToken,
  jwtKey,
  getResetToken,
  checkResetTokenOnExpTime
};
