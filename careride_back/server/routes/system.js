const express = require('express');
const router = new express.Router();
const asyncHandler = require('../utils/asyncHandler');
const Config = require("../config.js");
const Models = require("../models");
const FStorage = require('../services/filestorage');

const withAuth = require('../middlewares/auth');
const { CustomError } = require('../utils/errors');
const { validate, ValidationError, Joi } = require('express-validation');






router.get('/opt',
  asyncHandler(async (req, res) => {

    try {
      const opt = {
        STATES: Models.Region.getList(),
        VENDOR_SERVICES: Models.Vendor.getServices(),
      }

      res.status(200).json({ result:1, opt });
    } catch (er) {
      throw new CustomError(403, er.message);
    }
  })
);


const Storage = new FStorage.FileStorage({
	basedir: Config.ROOT_PATH + '/storage',
});

router.post('/storage/get',
  withAuth,
  asyncHandler(async (req, res) => {

    try {

      Storage.download(res, req.body.fname);

    } catch (er) {
      throw new CustomError(403, er.message);
    }
  })
);






module.exports = router;
