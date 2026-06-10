const _ = require('lodash');
const express = require('express');
const router = new express.Router();
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../services/winston').logger;

const mailer = require('../services/email');
const { CustomError } = require('../utils/errors');
const withAuth = require('../middlewares/auth');
const withAuthDriver = require('../middlewares/authdriver');
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
			const user = await Models.Driver.authUser({login: req.body.login, passw:req.body.password});
			const token = user.getJwt();

			res.status(200).json({ result:1, token, user: user.toJson() });
		} catch (er) {
			logger.error(er);
			throw new CustomError(403, er.message);
		}
	})
);

router.get('/profile',
	withAuthDriver,
	asyncHandler(async (req, res) => {
		try {
			const user = await Models.Driver.getUserById(req.User.id);

			const out = { result:1, user: user.toJson({role:1}) }

			out.currenttime = (new Date()).toISOString();

			out.lastorders = { total: 0, items: [], };

			const order = await user.getLastOrder();
			if (order) {
				await order.fillCar();
				await order.readVendor();
				await order.fillPayment();

				out.lastorders.total++;
				out.lastorders.items.push(order.toJson());
			}

			res.status(200).json(out);
		} catch (er) {
			throw new CustomError(403, er.message);
		}

	})
);



router.get('/orders',
	withAuthDriver,
	asyncHandler(async (req, res) => {
		try {
			const out = { result:1, currenttime: (new Date()).toISOString() };

			const list = await Models.Order.getList({driver_id: req.User.id, page:0, onpage: 5, status: [3,4], fillServices: 1, fillCar: 1 });
			out.order_list = list.toJson();

			out.lastorders = { total: 0, items: [], };

			const order = await req.User.getLastOrder();
			if (order) {
				await order.fillCar();
				await order.readVendor();
				await order.fillPayment();

				out.lastorders.total++;
				out.lastorders.items.push(order.toJson());
			}

			res.status(200).json(out);
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);


router.post('/order/pickup',
	withAuthDriver,
	validate({
		body: Joi.object({
			order_id: Joi.number().integer().required(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {

			const order = await Models.Order.getById(req.body.order_id);
			if (!order) throw new Error('ORDER_NOT_FOUND');
			if (order.v('driver_id') != req.User.id ) throw new Error('NO_PERMISSION');

			await order.doPickUp();

			res.status(200).json({ result:1, order: order.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);


router.post('/order/complete',
	withAuthDriver,
	validate({
		body: Joi.object({
			order_id: Joi.number().integer().optional().allow(null, ''),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {

			const order = await Models.Order.getById(req.body.order_id);
			if (!order) throw new Error('ORDER_NOT_FOUND');
			if (order.v('driver_id') != req.User.id ) throw new Error('NO_PERMISSION');

			await order.doComplete();

			res.status(200).json({ result:1, order: order.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);

router.post('/order/detach',
	withAuthDriver,
	validate({
		body: Joi.object({
			order_id: Joi.number().integer().required(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {

			const order = await Models.Order.getHistById(req.body.order_id);
			if (!order) throw new Error('NOT_FOUND');
			if (order.v('driver_id') != req.User.id) throw new Error('NO_PERMISSION');

			await req.User.detachLastOrder({order_id: req.body.order_id});

			res.status(200).json({ result: 1 });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);


router.post('/order/history',
	withAuthDriver,
	validate({
		body: Joi.object({
			page: Joi.number().integer().optional().allow(null, ''),
			onpage: Joi.number().integer().optional().allow(null, ''),
			status: Joi.number().integer().optional().allow(null, ''),
			car_id: Joi.number().integer().optional().allow(null, ''),
			car_plate: Joi.string().max(32).allow(null, ''),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {

			const filters = {page:0, onpage:100, driver_id: req.User.id, fillCar: 1, vendorFields: 1, history: 1 };
			if (req.body.page) filters.page = req.body.page;
			if (req.body.onpage) filters.onpage = req.body.onpage;
			if (req.body.status) filters.status = req.body.status;
			if (req.body.car_id) filters.car_id = req.body.car_id;
			if (req.body.car_plate) {
				let cars = await Models.Car.getList({page:0, onpage:3, vendor_id: req.User.vendor_id, plate: req.body.car_plate});
				if (cars.items[0]) {
					filters.car_id = cars.items[0].id;
				} else {
					filters.car_id = -1;
				}
			}

			const order_list = await Models.Order.getList(filters);

			res.status(200).json({ result: 1, order_list: order_list.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);







module.exports = router;
