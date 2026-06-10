const get = require('lodash/get');

const models = require('../models');
const { getPasswordHash } = require('../services/password');
const { CustomError } = require('../utils/errors');
//const { sendPremiumLetter } = require('../services/email');

//const { Op } = models.sequelize;

async function isUserAdminById(id) {
  if (!id) {
    return false;
  }

  const user = await getUser(id);

  return user.role === 'admin';
}

async function getUserFromReq({ user }) {
  if (!user || !user.data.id) {
    throw new CustomError(401);
  }

  const userFromDb = await getUser(user.data.id);

  return userFromDb.toJSON()
}

async function getUserByResetToken(resetPasswordToken) {
  return models.User.findOne({
    where: {
      resetPasswordToken
    }
  });
}

async function updateUserField({ user, field, value }) {
  const updatedUser = await user.update({ [field]: value });

  return getUserFromJson(updatedUser);
}

async function getUsers() {
  return models.User.findAll();
}

async function searchUsersByName(query) {
  const { sequelize: S } = models;
  return models.User.findAll({
    where: {
      [Op.or]: [
        S.where(
            S.fn('lower', S.fn("concat", S.col("firstName"), ' ', S.col("lastName"))), {
                [Op.like]: S.fn('lower', '%' + query + '%')
            }),
        S.where(S.fn('lower', S.col("username")), {
            [Op.like]: S.fn('lower', '%' + query + '%')
        }),
      ]
    }
  });
}

async function searchUsersByEmail(query) {
  const { sequelize: S } = models;

  return models.User.findAll({
    where: {
      [Op.or]: [
        S.where(S.fn('lower', S.col("email")), { [Op.like]: S.fn('lower', S.fn('lower', '%' + query + '%'))})
      ],
    }
  });
}

async function getPaginatedPremiumUsers({ offset, limit }) {
  const { User } = models;

  return User.findAndCountAll({
    attributes: ['*'],
    order: [['isPremium', 'DESC']],
    raw: true,
    offset,
    limit
  });
}

async function getPaginatedUsers({ offset, limit }) {
  const { User, sequelize: S } = models;

  return User.findAll({
    attributes: [[S.col('inviterId'), 'inviterId'], [S.fn('count', S.col('inviterId')), 'invites']],
    group: ['inviterId'],
    order: [[S.literal('invites'), 'DESC']],
    raw: true,
    offset,
    limit
  });
}

async function getUsersListByIds(ids) {
  return models.User.findAll({
    where: {
      id: {
        [Op.in]: ids
      }
    }
  });
}


async function getUser(id) {
  const user = await models.User.findById(id);

  if (!user) {
    throw new CustomError(404, `User with id ${id} doesn't exist`);
  }

  return user;
}

function getUserByEmail(email) {
  return models.User.findOne({
    where: {
      email
    }
  });
}





async function createUser({ email, password, googleId, facebookId, inviterId, ...rest }) {
  if (!email && !facebookId && !googleId) {
    throw new CustomError(401, 'Missed credentials');
  }

  const existUser = await getUserByEmail(email);

  if (existUser) {
    throw new CustomError(409, 'User with this email already exist');
  }

  const inviterUser = await getUserByInviterCode(inviterId);

  const createdUser = await models.User.create({
    email,
    password: getPasswordHash(password),
    googleId,
    facebookId,
    inviterId: get(inviterUser, 'id'),
    ...rest
  });

  if (inviterUser) {
    await activatePremium(inviterUser);
  }

  return getUserFromJson(createdUser);
}

async function deleteUser(id) {
  const user = await getUser(id);

  await user.destroy();

  return user;
}



module.exports = {
  getUsers,
  getUser,
  getUserByEmail,
  createUser,
  getUserByResetToken,
  deleteUser,
  updateUserField,
  getUsersListByIds,
  getUserFromReq,
  isUserAdminById,
  searchUsersByEmail,
  searchUsersByName,
};
