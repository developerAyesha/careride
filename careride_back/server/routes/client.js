const _ = require('lodash');
const express = require('express');
const router = new express.Router();
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../services/winston').logger;

const mailer = require('../services/email');
const { CustomError } = require('../utils/errors');
const withAuth = require('../middlewares/auth');
const withAuthClient = require('../middlewares/authclient');
const { validate, ValidationError, Joi } = require('express-validation');

const Models = require("../models");



router.post('/auth', 
	validate({
		body: Joi.object({
			login: Joi.string().required(),
			password: Joi.string().trim(true).min(4).required(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {

		try {

			const user = await Models.User.authUser({login: req.body.login, passw:req.body.password});
			const token = user.getJwt();

			res.status(200).json({ result:1, token, user: user.toJson({role:1}) });
		} catch (er) {
			logger.error(er);
			throw new CustomError(403, er.message);
		}
	})
);


router.post('/signup',
	validate({
		body: Joi.object({
			login: Joi.string().min(8).required(),
			d: Joi.any().optional(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {

		const addData = {
			login: req.body.login, 
			block: 0,
			role: 1,
		};
		logger.info('clientsignup: ' + addData.login);

		try {

			//if user is reg
			const reguser = await Models.User.getUserByLogin(req.body.login);
			if (reguser && (reguser.v('activated')==0)) {
				await reguser.changeUserToken();
				addData.passw = '#'+ reguser.v('token');

				await Models.User.setUserPassword(reguser.id, addData.passw);
				await reguser.sendActivation();
				res.status(200).json({ result: 1, user: {login: reguser.v('login')} });
				return;
			}

			//if no user
			addData.passw = '#'+ Models.User.genActivateCode(addData.login);
			const user = await Models.User.addUser(addData);
			await user.changeUserToken();
			addData.passw = '#'+ user.v('token');
			await Models.User.setUserPassword(user.id, addData.passw);

			//await mailer.sendActivationMail(user.email, {code: user.token});
			await user.sendActivation();
			res.status(200).json({ result: 1, user: {login: user.v('login')} });
		} catch (er) {
			logger.error(er);
			throw new CustomError(403, er.message);
		}
	})
);
router.post('/signupcode', 
	validate({
		body: Joi.object({
			login: Joi.string().required(),
			code: Joi.string().min(4).required(),
			d: Joi.any().optional(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {

		try {

			const passw = '#'+req.body.code;
			const user = await Models.User.authUser({login: req.body.login, passw: passw});
			const token = user.getJwt();

			res.status(200).json({ result:1, token, user: user.toJson({role:1}) });
		} catch (er) {
			if (er.message === 'WRONG_AUTH') throw new CustomError(403, 'WRONG_CODE');
			throw new CustomError(403, er.message);
		}
	})
);
router.post('/signup2',
	withAuth,
	validate({
		body: Joi.object({
			first_name: Joi.string().optional().max(32).allow(null, ''),
			second_name: Joi.string().optional().max(32).allow(null, ''),
			last_name: Joi.string().optional().max(32).allow(null, ''),
			facility_name: Joi.string().optional().max(32).allow(null, ''),
			email: Joi.string().optional().email().allow(null, ''),
			password: Joi.string().regex(/^[^ ]{6,30}$/).required(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		if (!req.User.isrole(['c'])) throw new Error('NO_PERMISSION');

		try {
			const user = req.User;
			if (user.v('activated') != 0) throw new Error('ACCESS_DENIED');

			const toedit = {}
			for (let v of ['first_name', 'second_name', 'last_name', 'facility_name', 'email']) {
				if (req.body[v]) toedit[v] = req.body[v];
			}
			await user.update(toedit);

			await Models.User.setUserPassword(user.id, req.body.password);
			await Models.User.activateUser({id: user.id});
			await user.changeUserToken();

			res.status(200).json({ result: 1, user: user.toJson()});
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);



router.post('/forgot_password', 
	validate({
		body: Joi.object({
			login: Joi.string().required(),
			d: Joi.any().optional(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		logger.info('forgot_password: ' + req.body.login);

		try {
			const user = await Models.User.getUserByLogin(req.body.login);
			if (!user) throw new Error('NOT_FOUND');
			if (user.v('activated') == 0) throw new Error('NOT_FOUND');
			await user.authNext();

			const token = await user.changeUserToken();
			await user.sendActivation();
			//await mailer.sendResetMail(user.email, {code: 'rp' + user.token});

			res.status(200).json({ result:1 });
		} catch (er) {
			throw new CustomError(403, er.message);
		}

	})
);

router.post('/password', 
	validate({
		body: Joi.object({
			login: Joi.string().required().min(6),
			code: Joi.string().required().min(4),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {

		try {
			const user = await Models.User.getUserByLogin(req.body.login);
			if (!user) throw new Error('NOT_FOUND');
			if (!user.v('token') || (user.v('token') != req.body.code) ) {
				throw new Error('WRONG_CODE');
			}
			const token = await user.changeUserToken();

			//await mailer.sendResetMail(user.email, {code: 'rp' + user.token});

			res.status(200).json({ result:1, reset_token: token });
		} catch (er) {
			throw new CustomError(403, er.message);
		}

	})
);

router.put('/password', 
	validate({
		body: Joi.object({
			login: Joi.string().required().min(6),
			reset_token: Joi.string().required().min(4),
			password: Joi.string().regex(/^[^ ]{6,30}$/).required(),
		}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {

		try {
			const user = await Models.User.getUserByLogin(req.body.login);
			if (!user) throw new Error('NOT_FOUND');
			if (!user.v('token') || (user.v('token') != req.body.reset_token) ) {
				throw new Error('WRONG_TOKEN');
			}
			await user.changeUserToken();
			await Models.User.setUserPassword(user.id, req.body.password);

			const token = user.getJwt();

			res.status(200).json({ result:1, token: token, user: user.toJson({role:1}) });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);



router.get('/profile',
	withAuth,
	asyncHandler(async (req, res) => {
		try {
			const user = await Models.User.getUserById(req.User.id);

			const out = { result:1, user: user.toJson({role:1}) }

			out.currenttime = (new Date()).toISOString();

			out.orderstatuses = await user.getLastOrdersStat();

			res.status(200).json(out);
		} catch (er) {
			throw new CustomError(403, er.message);
		}

	})
);


router.post('/profile',
	withAuthClient,
	asyncHandler(async (req, res) => {
		const allowedFields = ['first_name', 'second_name', 'last_name', 'email', 'address', 'city', 'state', 'zipcode', 'datebirth', 'gender', 'facility_name'];
		const data = {};
		allowedFields.forEach(function(fld) {
			if (fld in req.body) {
				data[fld] = req.body[fld];
				}
			});

		try {
			const user = req.User;
			await user.update(data);

			res.status(200).json({ result:1, user: user.toJson({role:1}) });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);

router.post('/profile/change_password', 
	withAuthClient,
	validate({
		body: Joi.object({
			password: Joi.string().regex(/[^ ]{6,30}/).required(),
			newpassword: Joi.string().regex(/[^ ]{6,30}/).required(),
		}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {

		try {
			await Models.User.changeUserPassword(req.User.id, req.body.password, req.body.newpassword);

			res.status(200).json({ result:1 });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);






router.post('/list', 
	withAuth,
	asyncHandler(async (req, res) => {
		try {
			if (!req.User.isrole(['a'])) throw new Error('NO_PERMISSION');

			const filters = {page:0, onpage:20 };
			if (req.body.page) filters.page = req.body.page;
			if (req.body.onpage) filters.onpage = req.body.onpage;
			if (req.body.id) filters.id = req.body.id;
			if (req.body.block) filters.block = req.body.block;
			if (req.body.login) filters.login = req.body.login;

			const client_list = await Models.User.getList(filters);

			res.status(200).json({ result:1, client_list: client_list });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);
router.post('/info', 
	withAuth,
	asyncHandler(async (req, res) => {
		try {
			if (!req.User.isrole(['a'])) throw new Error('NO_PERMISSION');

			const user = await Models.User.getUserById(req.body.id);

			if ('block' in req.body) {
				if (req.body.block == 1) await user.doBlock();
				if (req.body.block == 0) await user.doUnBlock();
			}

			res.status(200).json({ result:1, user: user.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);





router.post('/order/create',
	withAuthClient,
	validate({
		body: Joi.object({
			//vendor_id: Joi.number().integer().optional().allow(null, ''),
			vendor_ids: Joi.array().min(1).optional(),
			//orderAt: Joi.date().greater('now').max( Date.now() + (6 * 24 * 60 * 60 * 1000) ).required(),
			orderAt: Joi.date().custom((value, helper) => {
				let now = Date.now();
				if (value < now) return helper.message({custom: "Date must be later than Now"});
				if (value > now + (6 * 24 * 60 * 60 * 1000)) return helper.message({custom: "Date must be less than 6 days from Now"});
				return true;
			}).required(),

			pfrom_addr: Joi.string().min(1).max(120).required(),
			pfrom_city: Joi.string().min(2).max(32).required(),
			pto_addr: Joi.string().min(1).max(120).required(),
			pto_city: Joi.string().min(2).max(32).required(),
			p_dat: Joi.any(),

			distance: Joi.number().required(),
			whoride: Joi.number().integer(),
			cartype: Joi.number().integer(),
			weight: Joi.number().required(),
			height: Joi.number().required(),
			gender: Joi.string().max(1).allow(null, ''),
			datebirth: Joi.number().integer(),
			wheelchair: Joi.number().integer(),
			roundtrip: Joi.number().allow(null, ''),
			escort: Joi.number().integer(),
			covtst: Joi.number().integer(),

			contact: Joi.string().max(16).allow(null, ''),
			contact_first: Joi.string().max(64).allow(null, ''),
			contact_last: Joi.string().max(64).allow(null, ''),
			contact_phone: Joi.string().max(16).allow(null, ''),

			instruction: Joi.string().max(16000).allow(null, ''),
			utc_offset: Joi.number().integer().required(),
			services: Joi.any().allow(null, ''),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {
			const dat = _.cloneDeep(req.body);
			dat.client_id = req.User.id;

			const ORDER_LIMIT_PER_HOUR = 50;
			const orders = await Models.Order.getList({client_id: req.User.id, page:0, onpage: ORDER_LIMIT_PER_HOUR, history: 1});
			if (orders.items.length == ORDER_LIMIT_PER_HOUR) {
				let lastdate = new Date(orders.getLast().Fields.createdAt);
				let diff = Math.abs(new Date() - lastdate);
				let minutes = Math.floor((diff/1000)/60);
				if (minutes < 60) throw new CustomError(403, 'You have reached the limit of orders per hour. Please try again later');//ORDER_LIMIT_REACHED
			}

			const order = await Models.Order.addOrder(dat);

			res.status(200).json({ result: 1, currenttime: (new Date()).toISOString(), order: order.toJson()});
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);

router.get('/order/current',
	withAuthClient,
	asyncHandler(async (req, res) => {
		try {
			const list = await req.User.getLastOrders();

			res.status(200).json({ result: 1, currenttime: (new Date()).toISOString(), order_list: list.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);

router.get('/order/single',
	withAuthClient,
	asyncHandler(async (req, res) => {
		try {
			const orderId = parseInt(req.query.id, 10);
			if (!orderId) throw new Error('INVALID_ORDER_ID');

			let order = await Models.Order.getById(orderId);
			if (!order) order = await Models.Order.getHistById(orderId);
			if (!order) throw new Error('NOT_FOUND');

			if (String(order.v('client_id')) !== String(req.User.id)) throw new Error('NO_PERMISSION');

			await order.fillCar();
			await order.readVendor();

			res.status(200).json({ result: 1, order: order.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);

// DEV ONLY: force-accept a pending order for end-to-end testing without a vendor portal
router.post('/order/dev-accept',
	withAuthClient,
	asyncHandler(async (req, res) => {
		if (process.env.NODE_ENV === 'production') throw new CustomError(403, 'NOT_ALLOWED');
		try {
			const orderId = parseInt(req.body.order_id, 10);
			if (!orderId) throw new Error('INVALID_ORDER_ID');

			const order = await Models.Order.getById(orderId);
			if (!order) throw new Error('ORDER_NOT_FOUND');
			if (order.v('client_id') !== req.User.id) throw new Error('NO_PERMISSION');
			if (order.status !== 0) throw new Error('ORDER_NOT_PENDING');

			// Find first approved vendor and their first car for test acceptance
			const vendor = await Models.knex('vendor_inf').where({status: 1, block: 0}).first();
			if (!vendor) throw new Error('NO_TEST_VENDORS – run seed-test-vendors.js first');
			const car = await Models.knex('car_inf').where({vendor_id: vendor.id, block: 0}).first();
			if (!car) throw new Error('NO_TEST_CARS');

			// Load vendor model to calculate proper prices for the order
			const vendorModel = await Models.Vendor.getUserById(vendor.id);
			await vendorModel.readServices();
			await vendorModel.readOvertimes();
			const prices = order.calculPrices(vendorModel.Fields);

			await Models.knex('order_inf').where({id: orderId}).update({
				status: 1,
				vendor_id: vendor.id,
				car_id: car.id,
				acceptedAt: new Date(),
				updatedAt: new Date(),
				price: prices.price,
				pricemk: JSON.stringify(prices.pricemk),
				overtime: JSON.stringify(prices.overtime),
			});

			res.status(200).json({ result: 1 });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);

router.delete('/order/current',
	withAuthClient,
	asyncHandler(async (req, res) => {
		try {
			let order = await Models.Order.getById(req.body.id);
			if (order) {
				if (order.v('client_id') != req.User.id) throw new Error('NO_PERMISSION');
				await order.doCancelByClient({client: req.User});
			} else {
				order = await Models.Order.getHistById(req.body.id);
				if (!order) throw new Error('NOT_FOUND');
				await req.User.detachLastOrder({order_id: order.id});
			}

			res.status(200).json({ result: 1, order: order.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);


router.get('/vendor/price-range',
	asyncHandler(async (req, res) => {
		const cartype  = parseInt(req.query.cartype, 10) || 1;
		const distance = parseFloat(req.query.distance) || 0;
		const commission = Config.ORDER_COMMISSION / 100;

		const baseCol = cartype === 2 ? 'baseprice2' : 'baseprice1';
		const costCol = cartype === 2 ? 'costmt2'    : 'costmt1';

		const vendors = await DB.knex('vendor_inf')
			.where({ status: 1, block: 0 })
			.select(baseCol, costCol);

		if (!vendors.length) return res.json({ result: 1, min: null, max: null });

		const prices = vendors
			.map(v => {
				const base = parseFloat(v[baseCol]) || 0;
				const perMile = parseFloat(v[costCol]) || 0;
				const subtotal = base + perMile * distance;
				return Math.round(subtotal * (1 + commission));
			})
			.filter(p => p > 0);

		if (!prices.length) return res.json({ result: 1, min: null, max: null });

		res.json({ result: 1, min: Math.min(...prices), max: Math.max(...prices) });
	})
);

router.post('/vendor/search',
	validate({
		body: Joi.object({
			page: Joi.number().integer().optional().allow(null, ''),
			onpage: Joi.number().integer().optional().allow(null, ''),
			vendor_id: Joi.number().integer().optional().allow(null, ''),
			orderAt: Joi.date().custom((value, helper) => {
				let now = Date.now();
				if (value < now) return helper.message({custom: "Date must be later than Now"});
				if (value > now + (6 * 24 * 60 * 60 * 1000)) return helper.message({custom: "Date must be less than 6 days from Now"});
				return true;
			}).required(),
			pfrom_city: Joi.string().min(2).max(32).required(),
			pto_city: Joi.string().min(2).max(32).allow(null, ''),
			distance: Joi.number().allow(null, ''),
			cartype: Joi.number().integer().required(),
			wheelchair: Joi.number().allow(null, ''),
			roundtrip: Joi.number().allow(null, ''),
			weight: Joi.number().required(),
			height: Joi.number().required(),
			utc_offset: Joi.number().integer().required(),

			services: Joi.any().allow(null, ''),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {
			const order = new Models.Order.OrderModel();
			req.body.createdAt = new Date();
			req.body.orderAt = req.body.orderAt;
			order.init(req.body);

			const filters = {page:0, onpage:100, status: 1, block: 0, busy: 0, fillServices: 1, order: order };
			if (req.body.page) filters.page = req.body.page;
			if (req.body.onpage) filters.onpage = req.body.onpage;
			if (req.body.pfrom_city) filters.pfrom_city = req.body.pfrom_city;
			if (req.body.cartype) filters.cartype = req.body.cartype;
			if (req.body.services) filters.services = req.body.services;

			const vendorlist = await Models.Vendor.getList(filters);

			res.status(200).json({ result:1, vendorlist: vendorlist.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);






router.get('/orderpresets',
	withAuthClient,
	asyncHandler(async (req, res) => {
		try {
			const filters = {page:0, onpage:20, client_id: req.User.id };
			if (req.body.page) filters.page = req.body.page;
			if (req.body.onpage) filters.onpage = req.body.onpage;

			const orderpreset_list = await Models.OrderPreset.getList(filters);

			res.status(200).json({ result:1, orderpreset_list: orderpreset_list.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);

router.post('/orderpreset',
	withAuthClient,
	validate({
		body: Joi.object({
			title: Joi.string().min(1).max(32).required(),
			whoride: Joi.number().integer(),
			cartype: Joi.number().required(),
			weight: Joi.number().required(),
			height: Joi.number().required(),
			gender: Joi.string().max(1).allow(null, ''),
			datebirth: Joi.number().integer(),
			wheelchair: Joi.number().integer(),
			escort: Joi.number().integer(),

			contact: Joi.string().max(16).allow(null, ''),
			instruction: Joi.string().max(16000).allow(null, ''),
			services: Joi.any().allow(null, ''),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {
			const dat = _.cloneDeep(req.body);
			dat.client_id = req.User.id;
			dat.services

			const last = await Models.OrderPreset.getList({client_id: req.User.id, page:0, onpage: 1});
			if (last.total > 10) throw new Error('LIMIT_REACHED');

			const orderpreset = await Models.OrderPreset.addOrderPreset(dat);

			res.status(200).json({ result: 1, orderpreset: orderpreset.toJson()});
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);

router.put('/orderpreset',
	withAuthClient,
	validate({
		body: Joi.object({
			id: Joi.number().integer().required(),
			title: Joi.string().max(32).required(),
			whoride: Joi.number().integer(),
			cartype: Joi.number().required(),
			weight: Joi.number().required(),
			height: Joi.number().required(),
			gender: Joi.string().max(1).allow(null, ''),
			datebirth: Joi.number().integer(),
			wheelchair: Joi.number().integer(),
			escort: Joi.number().integer(),

			contact: Joi.string().max(16).allow(null, ''),
			instruction: Joi.string().max(16000).allow(null, ''),
			services: Joi.any().allow(null, ''),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {

			const orderpreset = await Models.OrderPreset.getById(req.body.id);
			if (!orderpreset) throw new Error('NOT_FOUND');
			if (orderpreset.v('client_id') != req.User.id) throw new Error('NO_PERMISSION');

			req.body.services = 0;
			await orderpreset.update(req.body);

			res.status(200).json({ result: 1, orderpreset: orderpreset.toJson()});
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);

router.delete('/orderpreset',
	withAuthClient,
	asyncHandler(async (req, res) => {
		try {
			const order = await Models.OrderPreset.getById(req.body.id);
			if (!order) throw new Error('NOT_FOUND');
			if (order.v('client_id') != req.User.id) throw new Error('NO_PERMISSION');

			await order.destroy();

			res.status(200).json({ result: 1 });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);



router.post('/order/history',
	withAuthClient,
	validate({
		body: Joi.object({
			page: Joi.number().integer().optional().allow(null, ''),
			onpage: Joi.number().integer().optional().allow(null, ''),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {

			const filters = {page:0, onpage:100, client_id: req.User.id, fillCar: 1, vendorFields: 1, history: 1, fillPayment:1 };
			if (req.body.page) filters.page = req.body.page;
			if (req.body.onpage) filters.onpage = req.body.onpage;

			const order_list = await Models.Order.getList(filters);


			res.status(200).json({ result: 1, order_list: order_list.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);



router.post('/order/rate',
	withAuthClient,
	validate({
		body: Joi.object({
			order_id: Joi.number().integer().required(),
			rate: Joi.number().integer().required(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {

			const order = await Models.Order.getHistById(req.body.order_id);
			if (!order) throw new Error('NOT_FOUND');
			if (order.v('client_id') != req.User.id) throw new Error('NO_PERMISSION');

			await order.doRate({rate: req.body.rate});

			res.status(200).json({ result: 1, order: order.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);

router.post('/order/detach',
	withAuthClient,
	validate({
		body: Joi.object({
			order_id: Joi.number().integer().required(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {

			const order = await Models.Order.getHistById(req.body.order_id);
			if (!order) throw new Error('NOT_FOUND');
			if (order.v('client_id') != req.User.id) throw new Error('NO_PERMISSION');

			await req.User.detachLastOrder({order_id: req.body.order_id});

			res.status(200).json({ result: 1 });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);





//TODO  this is only for test
/*router.post('/order/pay',
	withAuthClient,
	validate({
		body: Joi.object({
			order_id: Joi.number().integer().required(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {
			const order = await Models.Order.getById(req.body.order_id);
			if (!order) throw new Error('NOT_FOUND');
			if (order.v('client_id') != req.User.id) throw new Error('NO_PERMISSION');

			await order.payBy({});

			res.status(200).json({ result: 1, order: order.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);*/


module.exports = router;
