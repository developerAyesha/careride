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



router.post('/auth', 
	validate({
		body: Joi.object({
			login: Joi.string().required(),
			password: Joi.string().min(4).required(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {

		try {
			const user = await Models.Vendor.authUser({login: req.body.login, passw:req.body.password});
			const token = user.getJwt();

			res.status(200).json({ result:1, token, user: user.toJson({role:1}) });
		} catch (er) {
			logger.error(er);
			throw new CustomError(403, er.message);
		}
	})
);

const uploadVendorFile = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1000 * 1000, fieldNameSize: 100, files: 5 } });
router.post('/signup',
	uploadVendorFile.array('filelicense', 5),
	validate({
		body: Joi.object({
			login: Joi.string().min(5).max(32).required(),
			passw: Joi.string().min(5).max(32).required(),
			company_name: Joi.string().min(1).max(64).required(),
			first_name: Joi.string().min(1).max(32).required(),
			second_name: Joi.string().min(1).max(32).allow(null, ''),
			last_name: Joi.string().min(1).max(32).allow(null, ''),
			address: Joi.string().min(5).max(32).required(),
			city: Joi.string().min(2).max(32).required(),
			state: Joi.string().min(1).max(2).required(),
			email: Joi.string().max(64).allow(null, ''),
			zipcode: Joi.number().integer().required(),
			costmt1: Joi.number().optional().allow(null, ''),
			costmt2: Joi.number().optional().allow(null, ''),
			baseprice1: Joi.number().optional().allow(null, ''),
			baseprice2: Joi.number().optional().allow(null, ''),
			filelicense: Joi.any().optional(),
			services: Joi.any().optional(),
			overtimes: Joi.any().optional(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {

		const addData = {
			login: req.body.login, 
			passw: req.body.passw, 
			block: 0,
			status: 0,
			company_name: req.body.company_name, 
			first_name: req.body.first_name, 
			second_name: req.body.second_name, 
			last_name: req.body.last_name, 
			address: req.body.address, 
			city: req.body.city, 
			state: req.body.state, 
			zipcode: req.body.zipcode, 
		};
		if (req.body.email) addData.email = req.body.email;
		if (req.body.costmt1) addData.costmt1 = req.body.costmt1;
		if (req.body.costmt2) addData.costmt2 = req.body.costmt2;
		if (req.body.baseprice1 > 0.5) addData.baseprice1 = req.body.baseprice1;
		if (req.body.baseprice2 > 0.5) addData.baseprice2 = req.body.baseprice2;

		logger.info('vendorsignup: ' + addData.login);

		try {

			//if no reg
			const vendor = await Models.Vendor.addUser(addData);
			await vendor.changeUserToken();
			if (req.body.services) await vendor.setServices(req.body.services);
			if (req.body.overtimes) await vendor.setOvertimes(req.body.overtimes);

			if (req.files && req.files.length) await vendor.addLicenseFiles(req.files);

			//await mailer.sendActivationMail(user.email, {code: user.token});
			res.status(200).json({ result: 1, user: {login: vendor.v('login')} });
		} catch (er) {
			console.log(er);
			throw new CustomError(403, er.message);
		}
	})
);


router.post('/profile', 
	withAuth,
	validate({
		body: Joi.object({
			id: Joi.number().integer().required(),
			block: Joi.number().integer().optional().allow(null, ''),
			company_name: Joi.string().min(1).max(32).allow(null, ''),
			first_name: Joi.string().min(1).max(32).allow(null, ''),
			second_name: Joi.string().min(1).max(32).allow(null, ''),
			last_name: Joi.string().min(1).max(32).allow(null, ''),
			address: Joi.string().min(5).max(32).allow(null, ''),
			city: Joi.string().min(2).max(32).allow(null, ''),
			state: Joi.string().min(1).max(2).allow(null, ''),
			zipcode: Joi.number().integer().allow(null, ''),
			email: Joi.string().max(32).allow(null, ''),
			costmt1: Joi.number().optional().allow(null, ''),
			costmt2: Joi.number().optional().allow(null, ''),
			baseprice1: Joi.number().optional().allow(null, ''),
			baseprice2: Joi.number().optional().allow(null, ''),
			filelicense: Joi.any().optional(),
			services: Joi.any().optional(),
			overtimes: Joi.any().optional(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		if (!req.User.isrole(['a','v'])) throw new Error('NO_PERMISSION');

		let addData = {};
		let deapprove = 0;
		const allowedFields = ['company_name', 'first_name', 'second_name', 'last_name', 'address', 'city', 'state', 'zipcode', 'email'];
		allowedFields.forEach(function(fld) {
			if (req.body[fld]) {
				addData[fld] = req.body[fld];
				deapprove = 1;
				}
			});
		const allowedFields2 = ['costmt1', 'costmt2', 'baseprice1', 'baseprice2'];
		allowedFields2.forEach(function(fld) {
			if (fld in req.body) {
				addData[fld] = req.body[fld];
				}
			});

		try {
			const vendor = await Models.Vendor.getUserById(req.body.id);
			if (req.User.isrole(['v'])) {
				if (vendor.id != req.User.id) throw new Error('NO_PERMISSION');
			}

			if (req.User.isrole(['a'])) {
				if ('block' in req.body) await vendor.doBlock(req.body.block);
			}

			await vendor.update(addData);

			if (req.User.isrole(['v'])) {
				if (deapprove) {
					await vendor.doApprove(0);
				}
			}

			if (req.body.services) await vendor.setServices(req.body.services);
			if (req.body.overtimes) await vendor.setOvertimes(req.body.overtimes);

			await vendor.readServices();
			await vendor.readOvertimes();
			await vendor.readStripe();

			res.status(200).json({ result: 1, vendor: vendor.toJson({role:1}) });
		} catch (er) {
			console.log(er);
			throw new CustomError(403, er.message);
		}
	})
);


router.post('/profile/license/file', 
	withAuth,
	uploadVendorFile.array('filelicense', 5),
	asyncHandler(async (req, res) => {
		if (!req.User.isrole(['v'])) throw new Error('NO_PERMISSION');

		try {
			const vendor = await req.User;

			if (req.body.todelete) {
				if (typeof req.body.todelete === 'string') req.body.todelete = req.body.todelete.split(',').map( v=> +v) ;
				await vendor.deleteLicenseFiles(req.body.todelete);
				await vendor.doApprove(0);
			}

			if (req.files && req.files.length) {
				await vendor.addLicenseFiles(req.files);
				await vendor.doApprove(0);
			}

			await vendor.readServices();
			await vendor.readOvertimes();

			res.status(200).json({ result: 1, vendor: vendor.toJson({role:1}) });
		} catch (er) {
			console.log(er);
			throw new CustomError(403, er.message);
		}
	})
);



router.post('/info',
	withAuth,
	validate({
		body: Joi.object({
			id: Joi.number().integer().required(),
		}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {
			const vendor = await Models.Vendor.getUserById(req.body.id);
			await vendor.readServices();
			await vendor.readOvertimes();
			await vendor.readStripe();

			res.status(200).json({ result:1, user: vendor.toJson({role:1}) });
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
		logger.info('vforgot_password: ' + req.body.login);

		try {
			const vendor = await Models.Vendor.getUserByLogin(req.body.login);
			if (!vendor) throw new Error('NOT_FOUND');
			//if (vendor.status == 0) throw new Error('NOT_FOUND');  //any vendor

			await vendor.authNext();

			const token = await vendor.changeUserToken();
			await vendor.sendActivation();

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
			const vendor = await Models.Vendor.getUserByLogin(req.body.login);
			if (!vendor) throw new Error('NOT_FOUND');
			if (!vendor.v('token') || (vendor.v('token') != req.body.code) ) {
				throw new Error('WRONG_CODE');
			}
			const token = await vendor.changeUserToken();

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
			const vendor = await Models.Vendor.getUserByLogin(req.body.login);
			if (!vendor) throw new Error('NOT_FOUND');
			if (!vendor.v('token') || (vendor.v('token') != req.body.reset_token) ) {
				throw new Error('WRONG_TOKEN');
			}
			await vendor.changeUserToken();
			await Models.Vendor.setUserPassword(vendor.id, req.body.password);

			const token = vendor.getJwt();

			res.status(200).json({ result:1, token: token, user: vendor.toJson({role:1}) });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);


router.post('/profile/change_password', 
	withAuth,
	validate({
		body: Joi.object({
			password: Joi.string().regex(/[^ ]{6,30}/).required(),
			newpassword: Joi.string().regex(/[^ ]{6,30}/).required(),
		}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		if (!req.User.isrole(['v'])) throw new Error('NO_PERMISSION');

		try {
			await Models.Vendor.changeUserPassword(req.User.id, req.body.password, req.body.newpassword);

			res.status(200).json({ result:1 });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);


router.get('/stripeacc',
	withAuth,
	asyncHandler(async (req, res) => {
		if (!req.User.isrole(['v'])) throw new Error('NO_PERMISSION');

		try {
			const vendor = req.User;
			const links = await vendor.getStripeAccLink();

			res.status(200).json({ result:1, links: links });
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

      const filters = {page:0, onpage:20, fillServices:1 };
      if (req.body.page) filters.page = req.body.page;
      if (req.body.onpage) filters.onpage = req.body.onpage;
      if (req.body.id) filters.id = req.body.id;
      if (req.body.status) filters.status = req.body.status;
      if (req.body.block) filters.block = req.body.block;
      if (req.body.login) filters.login = req.body.login;
      if (req.body.company_name) filters.company_name = req.body.company_name;

      const vendorlist = await Models.Vendor.getList(filters);

      res.status(200).json({ result:1, vendorlist: vendorlist.toJson() });
    } catch (er) {
      throw new CustomError(403, er.message);
    }
  })
);



router.post('/approve', 
  withAuth,
  validate({
    body: Joi.object({
        id: Joi.number().integer().required(),
        approve: Joi.number().integer().required(),
      }),
    }, {keyByField:true}, {}), 
  asyncHandler(async (req, res) => {
    try {
      if (!req.User.isrole(['a'])) throw new Error('NO_PERMISSION');

      let vendor = await Models.Vendor.getUserById(req.body.id);

      await vendor.doApprove(req.body.approve);
      await vendor.readServices();
      await vendor.readOvertimes();
      await vendor.readStripe();

      res.status(200).json({ result:1, vendor: vendor.toJson() });
    } catch (er) {
      throw new CustomError(403, er.message);
    }
  })
);



router.post('/driver/list', 
	withAuth,
	asyncHandler(async (req, res) => {
		try {
			if (!req.User.isrole(['a','v'])) throw new Error('NO_PERMISSION');

			const filters = {page:0, onpage:20 };
			if (req.body.page) filters.page = req.body.page;
			if (req.body.onpage) filters.onpage = req.body.onpage;
			if (req.body.id) filters.id = req.body.id;
			if (req.body.vendor_id) filters.vendor_id = req.body.vendor_id;
			if (req.body.block) filters.block = req.body.block;
			if (req.body.login) filters.login = req.body.login;
			if (req.User.isrole(['v'])) filters.vendor_id = req.User.id;


			const driverlist = await Models.Driver.getList(filters);

			res.status(200).json({ result:1, driverlist: driverlist.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);


const uploadDriverFile = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1000 * 1000, fieldNameSize: 100 } });
router.post('/driver/',
	withAuth,
	uploadDriverFile.single('filelicense'),
	validate({
		body: Joi.object({
			login: Joi.string().min(5).max(32).required(),
			passw: Joi.string().min(5).max(32).required(),
			vendor_id: Joi.number().integer().required(),
			first_name: Joi.string().min(1).max(32).required(),
			second_name: Joi.string().min(1).max(32).allow(null, ''),
			last_name: Joi.string().min(1).max(32).allow(null, ''),
			filelicense: Joi.any().optional(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		if (!req.User.isrole(['a','v'])) throw new Error('NO_PERMISSION');

		const addData = {
			login: req.body.login, 
			passw: req.body.passw, 
			block: 0,
			vendor_id: req.body.vendor_id, 
			first_name: req.body.first_name, 
			second_name: req.body.second_name, 
			last_name: req.body.last_name, 
		};
		if (req.User.isrole(['v'])) addData.vendor_id = req.User.id;

		logger.info('driversignup: ' + addData.login);

		try {

			//if no reg
			const driver = await Models.Driver.addUser(addData);
			await driver.changeUserToken();
			if (req.file) await driver.addLicenseFiles([req.file]);

			res.status(200).json({ result: 1, driver: driver.toJson({role:1}) });
		} catch (er) {
			console.log(er);
			throw new CustomError(403, er.message);
		}
	})
);

router.put('/driver/',
	withAuth,
	uploadDriverFile.single('filelicense'),
	validate({
		body: Joi.object({
			id: Joi.number().integer().required(),
			block: Joi.any().optional(),
			passw: Joi.string().min(5).max(32).allow(null, ''),
			first_name: Joi.string().min(1).max(32).allow(null, ''),
			second_name: Joi.string().min(1).max(32).allow(null, ''),
			last_name: Joi.string().min(1).max(32).allow(null, ''),
			filelicense: Joi.any().optional(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		if (!req.User.isrole(['a','v'])) throw new Error('NO_PERMISSION');

		const addData = {};
		if (req.body.first_name) addData.first_name = req.body.first_name;
		if (req.body.second_name) addData.second_name = req.body.second_name;
		if (req.body.last_name) addData.last_name = req.body.last_name;

		try {
			const driver = await Models.Driver.getUserById(req.body.id);
			if (req.User.isrole(['v'])) {
				if (driver.v('vendor_id') != req.User.id) {
					throw new Error('NO_PERMISSION');
				}
			}
			if (req.body.passw) await driver.setPassword(req.body.passw);
			if ('block' in req.body) await driver.doBlock(req.body.block);

			await driver.update(addData);
			if (req.file) await driver.addLicenseFiles([req.file]);

			res.status(200).json({ result: 1, driver: driver.toJson({role:1}) });
		} catch (er) {
			console.log(er);
			throw new CustomError(403, er.message);
		}
	})
);

router.delete('/driver/',
	withAuth,
	validate({
		body: Joi.object({
			id: Joi.number().integer().required(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		if (!req.User.isrole(['a','v'])) throw new Error('NO_PERMISSION');

		try {
			const driver = await Models.Driver.getUserById(req.body.id);
			if (req.User.isrole(['v'])) {
				if (driver.v('vendor_id') != req.User.id) {
					throw new Error('NO_PERMISSION');
				}
			}

			await driver.destroy();

			res.status(200).json({ result: 1, driver: {} });
		} catch (er) {
			console.log(er);
			throw new CustomError(403, er.message);
		}
	})
);






router.post('/car/list', 
	withAuth,
	asyncHandler(async (req, res) => {
		try {
			if (!req.User.isrole(['a','v'])) throw new Error('NO_PERMISSION');

			const filters = {page:0, onpage:20, fillCities:1 };
			if (req.body.page) filters.page = req.body.page;
			if (req.body.onpage) filters.onpage = req.body.onpage;
			if (req.body.id) filters.id = req.body.id;
			if (req.body.vendor_id) filters.vendor_id = req.body.vendor_id;
			if (req.body.block) filters.block = req.body.block;
			if (req.body.plate) filters.plate = req.body.plate;
			if (req.User.isrole(['v'])) filters.vendor_id = req.User.id;

			const carlist = await Models.Car.getList(filters);

			res.status(200).json({ result:1, carlist: carlist });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);

router.post('/car/',
	withAuth,
	validate({
		body: Joi.object({
			vendor_id: Joi.number().integer().required(),
			model: Joi.string().min(1).max(50).required(),
			plate: Joi.string().min(1).max(32).required(),
			color: Joi.string().min(1).max(32).required(),
			city: Joi.string().min(1).max(64).allow(null, ''),
			cartype: Joi.number().integer().required(),
			pricemile: Joi.number().allow(null, ''),
			city_radius: Joi.number().integer().allow(null, ''),
			cities: Joi.any().allow(null, ''),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		if (!req.User.isrole(['a','v'])) throw new Error('NO_PERMISSION');

		const addData = {
			vendor_id: req.body.vendor_id, 
			block: 0,
			model: req.body.model, 
			plate: req.body.plate, 
			color: req.body.color, 
			cartype: req.body.cartype, 
			pricemile: req.body.pricemile, 
		};
		if (req.body.city) addData.city = req.body.city;
		if (req.body.city_radius) addData.city_radius = req.body.city_radius;


		if (req.User.isrole(['v'])) addData.vendor_id = req.User.id;

		try {
			const car = await Models.Car.addCar(addData);

			if (req.body.cities) await car.setCities(req.body.cities);

			res.status(200).json({ result: 1, car: car.toJson() });
		} catch (er) {
			console.log(er);
			throw new CustomError(403, er.message);
		}
	})
);

router.put('/car/',
	withAuth,
	validate({
		body: Joi.object({
			id: Joi.number().integer().required(),
			block: Joi.any().optional().allow(null, ''),
			model: Joi.string().min(1).max(50).allow(null, ''),
			plate: Joi.string().min(1).max(32).allow(null, ''),
			color: Joi.string().min(1).max(32).allow(null, ''),
			city: Joi.string().min(1).max(64).allow(null, ''),
			cartype: Joi.number().integer().allow(null, ''),
			pricemile: Joi.number().allow(null, ''),
			city_radius: Joi.number().integer().allow(null, ''),
			cities: Joi.any().allow(null, ''),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		if (!req.User.isrole(['a','v'])) throw new Error('NO_PERMISSION');

		const addData = {};
		for (let v of ['model', 'plate', 'color', 'city', 'cartype', 'pricemile', 'city_radius']) {
			if (req.body[v]) addData[v] = req.body[v];
		}

		try {
			const car = await Models.Car.getById(req.body.id);
			if (req.User.isrole(['v'])) {
				if (car.v('vendor_id') != req.User.id) {
					throw new Error('NO_PERMISSION');
				}
			}
			if ('block' in req.body) await car.doBlock(req.body.block);

			await car.update(addData);
			if (req.body.cities) await car.setCities(req.body.cities);

			res.status(200).json({ result: 1, car: car.toJson() });
		} catch (er) {
			console.log(er);
			throw new CustomError(403, er.message);
		}
	})
);

router.delete('/car/',
	withAuth,
	validate({
		body: Joi.object({
			id: Joi.number().integer().required(),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		if (!req.User.isrole(['a','v'])) throw new Error('NO_PERMISSION');

		try {
			const car = await Models.Car.getById(req.body.id);
			if (req.User.isrole(['v'])) {
				if (car.v('vendor_id') != req.User.id) {
					throw new Error('NO_PERMISSION');
				}
			}
			if (car.isBusy()) throw new Error('CAR_IS_BUSY');


			await car.destroy();

			res.status(200).json({ result: 1, car: {} });
		} catch (er) {
			console.log(er);
			throw new CustomError(403, er.message);
		}
	})
);



router.post('/order/list', 
  withAuth,
  asyncHandler(async (req, res) => {
    try {
      if (!req.User.isrole(['v'])) throw new Error('NO_PERMISSION');

      const filters = {page:0, onpage:100, fillCar:1, fillPayment:1, checkExp:1, vendororfree: req.User.id };
      if (req.body.page) filters.page = req.body.page;
      if (req.body.onpage) filters.onpage = req.body.onpage;
      if (req.body.id) filters.id = req.body.id;
      if ('status' in req.body) filters.status = req.body.status;
      filters.vendor = req.User;

      const orderlist = await Models.Order.getList(filters);
      const changes = await Models.Order.getChangesList({page:0, onpage:100, vendor_id: req.User.id});

      res.status(200).json({ result:1, orderlist: orderlist.toJson(), changes: changes });
    } catch (er) {
      throw new CustomError(403, er.message);
    }
  })
);

router.post('/order/info', 
  withAuth,
  asyncHandler(async (req, res) => {
    try {
      if (!req.User.isrole(['v'])) throw new Error('NO_PERMISSION');

      let vendor = req.User;
      let order = await Models.Order.getById(req.body.id);
      if (!order) throw new Error('ORDER_NOT_FOUND');
      if ( (order.v('vendor_id') > 0) && (order.v('vendor_id') != vendor.id) ) throw new Error('NO_PERMISSION');


      if (order.v('vendor_id') == 0) {
        await vendor.readServices();
        await vendor.readOvertimes();
        order.calculVirtualPrices(vendor);
      }

      await order.fillCar();

      const carfilters = {page:0, onpage:50, vendor_id: req.User.id, busy: 0, city_id: order.v('pfrom_city_id') };
      const carlist = await Models.Car.getList(carfilters);

      const drfilters = {page:0, onpage:50, vendor_id: req.User.id, block:0, busy: 0 };
      const driverlist = await Models.Driver.getList(drfilters);

      res.status(200).json({ result:1, order: order.toJson(), carlist: carlist, driverlist: driverlist.toJson() });
    } catch (er) {
      throw new CustomError(403, er.message);
    }
  })
);


router.post('/order/accept', 
  withAuth,
  validate({
    body: Joi.object({
        order_id: Joi.number().integer().required(),
        accept: Joi.number().integer().required(),
        car_id: Joi.number().integer().required(),
        driver_id: Joi.number().integer().required(),
        reason: Joi.string().min(1).max(64).allow(null, ''),
      }),
    }, {keyByField:true}, {}), 
  asyncHandler(async (req, res) => {
    try {
      if (!req.User.isrole(['v'])) throw new Error('NO_PERMISSION');

      const order = await Models.Order.getById(req.body.order_id);
      if (!order) throw new Error('ORDER_NOT_FOUND');
      if ( (order.v('vendor_id') > 0) && (order.v('vendor_id') != req.User.id) ) throw new Error('NO_PERMISSION');

      const acpar = {
        vendor_id: req.User.id,
        car_id: req.body.car_id,
        driver_id: req.body.driver_id,
        reason: req.body.reason,
      };

      if (req.body.accept == 1) {   // 1=accept
        await order.doAccept(acpar);
      }
      if (req.body.accept == 2) {   // 2=reject
        if (order.v('vendor_id') != req.User.id) throw new Error('NO_PERMISSION');
        await order.doReject(acpar);
      }

      res.status(200).json({ result:1, order: order.toJson() });
    } catch (er) {
      throw new CustomError(403, er.message);
    }
  })
);


router.post('/order/cancel', 
	withAuth,
	validate({
		body: Joi.object({
			order_id: Joi.number().integer().required(),
			reason: Joi.string().max(32).allow(null, ''),
			}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {
			if (!req.User.isrole(['v'])) throw new Error('NO_PERMISSION');

			const order = await Models.Order.getById(req.body.order_id);
			if (!order) throw new Error('ORDER_NOT_FOUND');
			if ( (order.v('vendor_id') > 0) && (order.v('vendor_id') != req.User.id) ) throw new Error('NO_PERMISSION');

			await order.doCancelByVendor({reason: req.body.reason});

			res.status(200).json({ result: 1, order: order.toJson() });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);




router.post('/order/history',
	withAuth,
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
			if (!req.User.isrole(['v'])) throw new Error('NO_PERMISSION');

			const filters = {page:0, onpage:100, vendor_id: req.User.id, fillCar: 1, history: 1, fillPayment:1 };
			if (req.body.page) filters.page = req.body.page;
			if (req.body.onpage) filters.onpage = req.body.onpage;
			if (req.body.status) filters.status = req.body.status;
			if (req.body.car_id) filters.car_id = req.body.car_id;
			if (req.body.car_plate) {
				let cars = await Models.Car.getList({page:0, onpage:3, vendor_id: filters.vendor_id, plate: req.body.car_plate});
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


router.post('/order/change/readed', 
	withAuth,
	validate({
		body: Joi.object({
			order_id: Joi.array().items(
				Joi.number().integer().required()
			)
		}),
		}, {keyByField:true}, {}), 
	asyncHandler(async (req, res) => {
		try {
			if (!req.User.isrole(['v'])) throw new Error('NO_PERMISSION');

			Models.Order.readedChanges(req.body.order_id);

			res.status(200).json({ result: 1 });
		} catch (er) {
			throw new CustomError(403, er.message);
		}
	})
);








module.exports = router;
