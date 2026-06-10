const express = require('express');
const router = new express.Router();
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../services/winston').logger;
const fetch = require('isomorphic-fetch');

const mailer = require('../services/email');
const { CustomError } = require('../utils/errors');
const withAuth = require('../middlewares/auth');
const { validate, ValidationError, Joi } = require('express-validation');

const Models = require("../models");
const Config = require("../config.js");



router.post('/', 
	validate({
		body: Joi.object({
			email: Joi.string().max(64, 'utf8').required(),
			message: Joi.string().max(1024, 'utf8').required(),
			token: Joi.string().max(1024, 'utf8').required(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {

	const msgVars = {
		email: req.body.email, 
		body: req.body.message,
	};

	try {
		await captchaMiddleware(req.body.token);

		await mailer.sendFeedbackMail(Config.FEEDBACK_MAIL_TO, msgVars);

		res.status(200).json({ result: 1 });
	} catch (er) {
		throw new CustomError(403, er.message);
	}
  })
);


async function captchaMiddleware(token) {
	logger.info('recaptcha: ' + token);

	if (!token) throw new Error('NO_TOKEN_PROVIDED');

	const recaptchaUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${Config.RECAPTCHA_SECRET_KEY}&response=${token}`;

	let res = await fetch(recaptchaUrl, {method: "post"});

	if (res.status === 200) {
		let googleResponse = await res.json();
		console.log(googleResponse);
		if (googleResponse['success'] === false) {
			throw new Error('NOT_ENOUGH_HUMAN');
		} else if (googleResponse['success'] === true) {

		}
	} else {
		throw new Error('WRONG_CAPTCHA');
	}

}


module.exports = router;
