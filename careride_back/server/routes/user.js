const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const multer  = require('multer');

const Models = require("../models");
const mailer = require('../services/email');

const { veryfyToken, getToken } = require('../services/jwt');
const withAuth = require('../middlewares/auth');
const { CustomError } = require('../utils/errors');
const { validate, ValidationError, Joi } = require('express-validation');

const router = new express.Router();




router.post('/profile',
  withAuth,
  asyncHandler(async (req, res) => {

    const allowedFields = ['name', 'surname', 'language', 'email', 'descr', 'country', 'city', 'notifyopt'];
    const data = {};
    allowedFields.forEach(function(fld) {
      if (fld in req.body) {
        data[fld] = req.body[fld];
      }
    });

    try {
      const user = req.User;

      await user.update(data);
      user.setFlds({
        referal_code: user.getReferalCode(),
        tariff: user.getTariff().toJson({mini:1}),
      });

      res.status(200).json({ result:1, user: user.toJson() });
    } catch (er) {
      throw new CustomError(403, er.message);
    }
  })
);



router.post('/profile/change_password', 
  withAuth,
  validate({
    body: Joi.object({
        password: Joi.string().regex(/[^ ]{10,30}/).required(),
        newpassword: Joi.string().regex(/[^ ]{10,30}/).required(),
      }),
    }, {keyByField:true}, {}), 
  asyncHandler(async (req, res) => {

    try {
      await Models.User.changeUserPassword(req.user.data.id, req.body.password, req.body.newpassword);

      res.status(200).json({ result:1 });
    } catch (er) {
      throw new CustomError(403, er.message);
    }
  })
);






router.post('/info/', 
  validate({
    body: Joi.object({
        id: Joi.number().integer().optional(),
      }),
    }, {keyByField:true}, {}), 
  asyncHandler(async (req, res) => {
    try {
      const user = await Models.User.getUserById(req.body.id);
      user.publicProfile();
      const vars = user.toJson();
      if (req.User) {
        const followeds = await user.getFollowers({onpage:10, last:0, target_id:req.User.id })
        vars.followed = (followeds.last > 0) ? 1 : 0;
      } else {
        vars.followed = 0;
      }

      res.status(200).json({ result:1, user: vars });
    } catch (er) {
      throw new CustomError(403, er.message);
    }
  })
);





/*
router.post('/profile/change_email', 
  withAuth,
  validate({
    body: Joi.object({
        email: Joi.string().email().required(),
      }),
    }, {keyByField:true}, {}), 
  asyncHandler(async (req, res) => {


    res.status(200).json({ result:1 });
  })
);

router.get('/profile/change_email', 
  validate({
    query: Joi.object({
        token: Joi.string().required(),
      }),
    }, {keyByField:true}, {}), 
  asyncHandler(async (req, res) => {

    try {
      await Models.User.updateUser(tokenData.data.id, {email: tokenData.data.email});
      res.status(200).json({ result:1 });
    } catch (er) {
      throw new CustomError(403, er.message);
    }
  })
);
*/





module.exports = router;
