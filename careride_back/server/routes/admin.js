const Config = require("./../config.js");
const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../services/winston').logger;
const fs = require('fs');
const path = require("path");

const { CustomError } = require('../utils/errors');
const withAuthAdmin = require('../middlewares/admin');

const router = new express.Router();
const { validate, ValidationError, Joi } = require('express-validation');

const Models = require("../models");



router.post('/auth', 
	validate({
		body: Joi.object({
			login: Joi.string().required(),
			password: Joi.string().min(4).required(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {

		try {
			const user = await Models.Staff.authUser({login: req.body.login, passw:req.body.password});
			const token = user.getJwt();

			res.status(200).json({ result:1, token, user: user.toJson() });
		} catch (er) {
			logger.error(er);
			throw new CustomError(403, er.message);
		}
	})
);




router.post('/log',
	withAuthAdmin,
	asyncHandler(async (req, res) => {
		try {
			var data = '';
			var name = '';
			var size, position;
			if (req.body.name == 'app') {
				name = 'app.log';
			}
			if (req.body.name == 'error') {
				name = 'error.log';
			}
			if (req.body.name == 'pay') {
				name = 'pay.log';
			}


			if (name) {
				const path = Config.ROOT_PATH + '/logs/' + name;

				const bytesToRead = 250024;
				var { size } = await fs.statSync(path);
				const handle = await fs.openSync(path, 'r');

				position = size - bytesToRead;
				if (position < 0) position = 0;
				if (req.body.from && (String(req.body.from).length>0)) {
					position = parseInt(req.body.from);
				}


				const buffer = Buffer.alloc(bytesToRead);
				await fs.readSync(handle, buffer, 0, bytesToRead, position);
				fs.closeSync(handle);
				data = buffer.toString().replace(/[\s\uFEFF\0]+$/g, "").split("\n");
			}
			res.status(200).json({ result:1, fsize: size, from: position, data: data });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);




module.exports = router;
