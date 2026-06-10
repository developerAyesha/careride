const Config = require("./../config.js");
const express = require('express');
const router = new express.Router();

const asyncHandler = require('../utils/asyncHandler');
const logger = require('../services/winston').logger;
const { validate, ValidationError, Joi } = require('express-validation');
const { CustomError } = require('../utils/errors');
const withAuth = require('../middlewares/auth');

const Models = require("../models");


// DEV ONLY: simulate Stripe hold webhook after client redirect from Stripe
router.post('/dev-hold',
	asyncHandler(async (req, res) => {
		if (process.env.NODE_ENV === 'production') throw new CustomError(403, 'NOT_ALLOWED');
		try {
			const orderId = parseInt(req.body.order_id, 10);
			if (!orderId) throw new Error('INVALID_ORDER_ID');
			await Models.knex('order_inf')
				.where({ id: orderId, status: 1 })
				.update({ status: 3, payAt: new Date(), updatedAt: new Date() });
			res.status(200).json({ result: 1 });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);

router.post('/create-payment-intent',
	asyncHandler(async (req, res) => {
		try {

			const order = await Models.Order.getById(req.body.order_id);
			if (!order) throw new Error('NOT_FOUND');
			//if (order.v('client_id') != req.User.id) throw new Error('NO_PERMISSION');

			const paymentIntent = await order.initPay();

			res.status(200).json(Object.assign({result: 1}, paymentIntent) );
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);


router.post('/webhook', express.raw({type: 'application/json'}),
	asyncHandler(async (req, res) => {
		try {

			const r = await Models.Payment.callback(req, {mode: 'norm'});

			res.status(200).json({result: 1 });
		} catch (er) {
			console.log(er);
			throw new CustomError(403, er.message);
		}
	})
);

router.post('/webhookacc', express.raw({type: 'application/json'}),
	asyncHandler(async (req, res) => {
		try {

			const r = await Models.Payment.callback(req, {mode: 'connect'});

			res.status(200).json({result: 1 });
		} catch (er) {
			console.log(er);
			throw new CustomError(403, er.message);
		}
	})
);




module.exports = router;
