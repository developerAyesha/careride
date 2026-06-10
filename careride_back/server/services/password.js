const bcrypt = require('bcrypt');

function getPasswordHash(password) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

function comparePasswords(password, hash) {
  return bcrypt.compareSync(password, hash);
}

module.exports = {
  getPasswordHash,
  comparePasswords
};
