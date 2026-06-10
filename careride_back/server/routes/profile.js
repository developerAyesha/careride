const express = require('express');
const router = new express.Router();
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../services/winston').logger;

const { CustomError } = require('../utils/errors');
const withAuth = require('../middlewares/auth');

const { validate, ValidationError, Joi } = require('express-validation');
const Models = require("../models");



router.get('/',
  withAuth,
  asyncHandler(async (req, res) => {
    try {
      const user = req.User;
      if (user.isrole(['v'])) await user.readStripe();

      res.status(200).json({ result:1, user: user.toJson({role:1}) });
    } catch (er) {
      throw new CustomError(403, er.message);
    }

  })
);







module.exports = router;
