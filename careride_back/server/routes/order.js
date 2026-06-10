const express = require('express');
const multer  = require('multer');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../services/winston').logger;
const router = new express.Router();
const { validate, ValidationError, Joi } = require('express-validation');

const mailer = require('../services/email');
const { CustomError } = require('../utils/errors');
const withAuth = require('../middlewares/auth');

const Models = require("../models");



router.post('/current',
	withAuth,
	validate({
		body: Joi.object({
			page: Joi.number().integer().optional().allow(null, ''),
			onpage: Joi.number().integer().optional().allow(null, ''),
			id: Joi.number().integer().optional().allow(null, ''),
			status: Joi.number().integer().optional().allow(null, ''),
			vendor_id: Joi.number().integer().optional().allow(null, ''),
			client_id: Joi.number().integer().optional().allow(null, ''),
			car_id: Joi.number().integer().optional().allow(null, ''),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {
			if (!req.User.isrole(['a'])) throw new Error('NO_PERMISSION');

			const filters = {page:0, onpage:100, vendorFields: 1, fillCar: 1, fillPayment: 1, checkExp: 1 };
			if (req.body.page) filters.page = req.body.page;
			if (req.body.onpage) filters.onpage = req.body.onpage;
			if ('status' in req.body) filters.status = req.body.status;
			if (req.body.vendor_id) filters.vendor_id = req.body.vendor_id;
			if (req.body.client_id) filters.client_id = req.body.client_id;
			if (req.body.car_id) filters.car_id = req.body.car_id;

			const order_list = await Models.Order.getList(filters);

			res.status(200).json({ result: 1, order_list: order_list.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);



router.post('/history',
	withAuth,
	validate({
		body: Joi.object({
			page: Joi.number().integer().optional().allow(null, ''),
			onpage: Joi.number().integer().optional().allow(null, ''),
			id: Joi.number().integer().optional().allow(null, ''),
			status: Joi.number().integer().optional().allow(null, ''),
			vendor_id: Joi.number().integer().optional().allow(null, ''),
			client_id: Joi.number().integer().optional().allow(null, ''),
			car_id: Joi.number().integer().optional().allow(null, ''),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {
			if (!req.User.isrole(['a'])) throw new Error('NO_PERMISSION');

			const filters = {page:0, onpage:100, vendorFields: 1, fillCar: 1, history: 1, fillPayment:1 };
			if (req.body.page) filters.page = req.body.page;
			if (req.body.onpage) filters.onpage = req.body.onpage;
			if ('status' in req.body) filters.status = req.body.status;
			if (req.body.vendor_id) filters.vendor_id = req.body.vendor_id;
			if (req.body.client_id) filters.client_id = req.body.client_id;
			if (req.body.car_id) filters.car_id = req.body.car_id;

			const order_list = await Models.Order.getList(filters);

			res.status(200).json({ result: 1, order_list: order_list.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);


router.post('/cancel', 
	withAuth,
	validate({
		body: Joi.object({
			order_id: Joi.number().integer().required(),
			capture_percent: Joi.number().integer().min(0).max(100).required(),
			reason: Joi.string().max(32).allow(null, ''),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {
			if (!req.User.isrole(['a'])) throw new Error('NO_PERMISSION');

			const order = await Models.Order.getById(req.body.order_id);
			if (!order) throw new Error('ORDER_NOT_FOUND');

			await order.doCancelByAdmin({capture_percent: req.body.capture_percent, reason: req.body.reason});

			res.status(200).json({ result: 1, order: order.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);



module.exports = router;
