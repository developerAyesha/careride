const Config = require("./../config.js");
const DB = require("./db.model");
const _ = require('lodash');
const Decimal = require('decimal.js');
const Sms = require('../services/aws/sms');
const mailer = require('../services/email');
const Delayjob = require('../services/delayjob');

const TABLE = 'order_inf';
const TABLE_HIST = 'order_hist';
const TABLE_CHG = 'order_chg';
const TABLE_VND = 'order_vendor';


class OrderModel extends DB.ModelBase{
	table = TABLE;
	CSHEMA = {
		//0-new,  1=accepted, 3=pick up, 4=work, 10-complete,  20-cancel, 21-reject, 22-expired, 25-cancel by client, 26-cancel vendor, 27-cancel admin
		status: {type: 'int', def:0 },
		client_id: {type: 'int', def:0 },
		vendor_id: {type: 'int', def:0 },
		car_id: {type: 'int', def:0 },
		driver_id: {type: 'int', def:0 },

		pfrom_addr: {type: 'string', len: 120, def:''},
		pfrom_city: {type: 'string', len: 32, def:''},
		pfrom_city_id: {type: 'int', def:0 },
		pto_addr: {type: 'string', len: 120, def:''},
		pto_city: {type: 'string', len: 32, def:''},
		pto_city_id: {type: 'int', def:0 },
		p_dat: {type: 'json', len: 32000, def:''},

		distance: {type: 'numeric', def:0},
		price: {type: 'numeric', def:0},
		whoride: {type: 'int', def:0 },   //1-Me, 2=Patient
		cartype: {type: 'int', def:0 },   //1=Wheelchair, 2=Gurney
		weight: {type: 'numeric', def:0},
		height: {type: 'numeric', def:0},
		gender: {type: 'string', len: 1, def:'' },   // m, f
		datebirth: {type: 'int', def:0 },
		wheelchair: {type: 'int', def:0 },
		escort: {type: 'int', def:0 },   //1=Spouse, 2=Son, 3=Daughter, 4=Other
		covtst: {type: 'int', def:0 },
		//rate: {type: 'int', def:0 },
		roundtrip: {type: 'int', def:0 },

		services: {type: 'int', def:0 },  //sets of services
		overtime: {type: 'json', len: 250, def:'{}'},
		contact: {type: 'string', len: 16, def:''},
		contact_first: {type: 'string', len: 64, def:''},   //for whoride=1 Patient
		contact_last: {type: 'string', len: 64, def:''},
		contact_phone: {type: 'string', len: 16, def:''},
		instruction: {type: 'string', len: 32000, def:''},
		reason: {type: 'string', len: 120, def:''},
		pricemk: {type: 'json', len: 250, def:'{}'},

		utc_offset: {type: 'int', def:0 },
		//orderAt   datetime
		//acceptedAt
		//payAt
	}
	_CHG = {};



	constructor(vars) {
		super(vars);
		this.init(vars);
	}

	get status () {
		return this.Fields.status;
	}
	get car_id () {
		return this.Fields.car_id;
	}
	get driver_id () {
		return this.Fields.driver_id;
	}
	get services() {
		return DB.Vendor.unpackServices(this.Fields.services);
	}


	get Vendor() {
		return new DB.Vendor.VendorUserModel({id: this.Fields.vendor_id});
	}
	get Client() {
		return new DB.User.UserModel({id: this.Fields.client_id});
	}



	async onPreCreate(Fields, vars) {
		if (!vars.orderAt) throw new Error('WRONG_DATE');
		let orderDate = new Date(vars.orderAt);
		if (isNaN(orderDate)) throw new Error('WRONG_DATE');
		let now = new Date();
		if (orderDate < now) throw new Error('WRONG_DATE');
		Fields.orderAt = orderDate;

		if (String(Fields.pfrom_addr).length < 1) throw new Error('EMPTY_ADDRESS');
		if (String(Fields.pfrom_city).length > 1) {
			Fields.pfrom_city_id = await DB.City.findId(Fields.pfrom_city);
		}
		if (String(Fields.pto_city).length > 1) {
			Fields.pto_city_id = await DB.City.findId(Fields.pto_city);
		}

		if (!_.isObject(vars.services)) vars.services = {};
		if (parseInt(vars.weight) > 250) vars.services.BARIATRIC = 1;
		Fields.services = DB.Vendor.packServices(vars.services);
		this.Fields.services = Fields.services;

		if (Fields.vendor_id > 0) {
			let vendor = await DB.Vendor.getUserById(Fields.vendor_id);
			await vendor.readServices();
			await vendor.readOvertimes();
			let prices = this.calculPrices(vendor.Fields);
			this.inRow({
				price: prices.price,
				pricemk: prices.pricemk,
				overtime: prices.overtime,
			});
		}

		let rows = await DB.knex.raw('select max(B.d) as id FROM (select max(id) as d from order_inf UNION select max(id) as d from order_hist UNION select 1 as d) AS B');
		const maxId = parseInt(rows[0][0].id || 0, 10);
		if (isNaN(maxId) || maxId >= 2147483647) throw new Error('ORDER_ID_OVERFLOW');
		Fields.id = maxId + 1;

	}
	async onPostCreate(Fields, vars) {
		if (vars.vendor_ids && _.isArray(vars.vendor_ids) ) {
			let order_id = this.id;
			let add = vars.vendor_ids.map(v=>{return {vendor_id: v, order_id: order_id} })
			await DB.knex(TABLE_VND).insert(add)
		}

		await this.Client.setLastOrder(this);
	}


	async fillCar() {
		await fillCar([this]);
	}
	async readVendor() {
		if (this.Fields.vendor_id == 0) return;
		const vendor = this.Vendor;
		if (await vendor.refresh()) {
			vendor.onlyPublic();
			vendor.hide(['login']);
			this.Fields.vendor = vendor.toJson();
		}
	}
	async fillPayment() {
		await DB.Payment.fillPayment([this]);
	}


	async onPreUpdate(flds) {
		if ( (flds.status) && [20, 25, 26, 27].includes(flds.status) ) {
			if (this.Fields.status > 0) {
				this._CHG.status = 1;
			}
		}
	}
	async onPostUpdate(flds) {
		if (this._CHG.status) {
			let add = {
				order_id: this.id,
				vendor_id: this.Fields.vendor_id,
				status_from: this.Fields.status,
				status_to: flds.status,
				who_id: 0,
			};
			await DB.knex(TABLE_CHG).insert(add);
			delete(this._CHG.status);
		}
	}

	getLocalOrderDate() {
		let orddate = new Date(this.Fields.orderAt);
		orddate.setTime(orddate.getTime() + parseInt(this.Fields.utc_offset) * 60 * 1000);
		return orddate;
	}



	calculPrices(vendor) {
		let pricemk = {}, pricem = 0, baseprice = 0, total = new Decimal(0), overtime = {};

		let orddate = new Date(this.Fields.orderAt);
		orddate.setTime(orddate.getTime() + parseInt(this.Fields.utc_offset) * 60 * 1000);
		let hour = 100 * orddate.getUTCHours();

		if (this.Fields.cartype == 1) {
			pricem = toDecimal(vendor.costmt1, 0);
			baseprice = toDecimal(vendor.baseprice1, 0);
		}
		if (this.Fields.cartype == 2) {
			pricem = toDecimal(vendor.costmt2, 0);
			baseprice = toDecimal(vendor.baseprice2, 0);
		}

		pricemk.pricem = pricem.toFixed(2);
		pricemk.costm = toDecimal(this.Fields.distance, 0).mul(pricem).toFixed(2);
		pricemk.baseprice = baseprice.toFixed(2);
		total = total.add(pricemk.costm).add(pricemk.baseprice);

		if (this.Fields.roundtrip > 0) {
			pricemk.returncostm = pricemk.costm;
			total = total.add(pricemk.costm);
		}

		if (_.isArray(vendor.overtimes)) {
			let periods = [];
			for (let v of vendor.overtimes) {
				if (v.timefrom < v.timeto) {
					periods.push({from: v.timefrom, to:v.timeto, v: v});
				} else {
					periods.push({from: v.timefrom, to:2400 , v: v});
					periods.push({from: 0, to:v.timeto , v: v});
				}
			}
			for (let v of periods) {
				if ( (hour >= v.from) && (hour < v.to) ) {
					overtime = {from: v.v.timefrom, to:v.v.timeto, price: v.v.price}
				}
			}
		}

		if (overtime.price) {
			pricemk.overtime = overtime.price;
			total = total.add(overtime.price);
		}
		
		let svc = DB.Vendor.unpackServices(this.Fields.services);
		if (toDecimal(this.Fields.weight, 0).greaterThanOrEqualTo(250) ) svc.BARIATRIC = 1;

		for (let v of vendor.services) {
			if (svc[v.c]) {
				pricemk[v.c] = toDecimal(v.price, 0).toFixed(2);
				total = total.add(pricemk[v.c]);
			}
		}

		pricemk.commission = total.mul(Config.ORDER_COMMISSION).div(100).toFixed(2);
		pricemk.total = total.add(pricemk.commission).toFixed(2);
		pricemk.payout = total.sub(pricemk.commission).toFixed(2);

		return {price: pricemk.total, distance: this.Fields.distance, pricemk, overtime, services: svc};
	}

	calculVirtualPrices(vendor) {
		let prices = this.calculPrices(vendor.Fields);
		this.inRow({
			price: prices.price,
			pricemk: prices.pricemk,
			overtime: prices.overtime,
			services: DB.Vendor.packServices(prices.services), 
		});
	}





	async doAccept(par) {
		if (this.status > 0) throw new Error('ALREADY_ACCEPTED');
		const vendor = await DB.Vendor.getUserById(par.vendor_id);
		await vendor.readServices();
		await vendor.readOvertimes();
		const car = await DB.Car.getById(par.car_id);
		if (car.isBusy()) throw new Error('CAR_IS_BUSY');
		const driver = await DB.Driver.getUserById(par.driver_id);
		if (driver.isBusy()) throw new Error('DRIVER_IS_BUSY');

		const prices = this.calculPrices(vendor.Fields);

		await this.update({
			status: 1, 
			vendor_id: par.vendor_id, 
			car_id: car.id, 
			driver_id: driver.id, 
			services: DB.Vendor.packServices(prices.services), 
			reason: par.reason,
			price: prices.price,
			pricemk: prices.pricemk,
			overtime: prices.overtime,
		});
		await DB.knex(this.table).where('id', this.id).update({acceptedAt: new Date() });
		await DB.knex(TABLE_VND).where({order_id: this.Fields.id}).delete();
		//await car.setBusy(this.id);     //disable busy
		//await driver.setBusy(this.id);
		await this.Vendor.updateCarCount();
		await this.Vendor.updateDriverCount();

		let client = this.Client;
		await client.refresh();
		const smsTxt = 'Your order number '+ this.id + ' was accepted. Please log in to make a payment.';
		Sms.sendSms(client.login, smsTxt);

	}
	async doReject(par) {
		if (par.reason) {
			await this.update({reason: par.reason });
		}
		await this.clearCar();
		await this.moveHistory({status: 21});   //21-reject
	}
	async doPickUp(par) {
		if (this.status !=3 ) throw new Error('ERROR');
		await this.update({status: 4});
	}
	async doComplete(par) {
		if (this.status > 10) throw new Error('ERROR');
		await this.capturePayFunds({});
		await this.clearCar();
		await this.moveHistory({status: 10});   //10-complete
	}

	// par = { }
	async doCancelByClient(par) {
		if (this.status > 10) throw new Error('ORDER_CANNOT_BE_CANCELED');

		let newstatus = 20;   //20=cancel

		if (this.status >= 3) {
			newstatus = 25;   //25=cancel client

			if (this.status == 3) {
				await this.capturePayFunds({capture_percent: 20});   //before pick up
			}
			if (this.status > 3) {
				await this.capturePayFunds({capture_percent: 50});   //after start ride
			}
		}

		await this.Client.detachLastOrder({order_id: this.id});
		await this.clearCar();
		await this.moveHistory({status: newstatus});

	}
	async doCancelByVendor(par) {
		if (this.status > 10) throw new Error('ORDER_CANNOT_BE_CANCELED');

		if (par.reason) {
			await this.update({reason: par.reason});
		}

		await this.capturePayFunds({capture_percent: 0});

		await this.clearCar();
		await this.moveHistory({status: 26});   //25=cancel vendor
	}
	async doCancelByAdmin(par) {
		if (this.status > 10) throw new Error('ORDER_CANNOT_BE_CANCELED');
		if ( (par.capture_percent < 0) || (par.capture_percent > 100) ) {
			throw new Error('WRONG_CAPTURE_PERCENT');
		}

		if (par.reason) {
			await this.update({reason: par.reason});
		}

		await this.capturePayFunds({capture_percent: par.capture_percent});

		await this.clearCar();
		await this.moveHistory({status: 27});   //25=cancel admin
	}





	async clearCar() {
		if (this.Fields.car_id > 0) {
			await DB.knex(DB.Car.TABLE).where('id', this.Fields.car_id).update({busy: 0});
		}
		if (this.Fields.driver_id > 0) {
			await DB.knex(DB.Driver.TABLE).where('id', this.Fields.driver_id).update({busy: 0});
		}
		await this.Vendor.updateCarCount();
		await this.Vendor.updateDriverCount();
	}



	async checkExpire() {
		if (this.status == 0 || this.status == 1 ) {   //0-new,1=accepted
			let orderAt = new Date(this.Fields.orderAt), now = new Date();
			if (now > orderAt ) {
				await this.moveHistory({status: 22});   //22-expired
				return true;
			}
		}
	}

	isHistory() {
		return this.table === TABLE_HIST;
	}


	//TODO  next calculation vendor rating
	async doRate(par) {
		if (!this.isHistory()) throw new Error('NO_PERMISSION');
		par.rate = parseInt(par.rate);
		if ( (par.rate<1) || (par.rate>5) ) throw new Error('ERROR_RATE');
		if (this.Fields.rate > 0) throw new Error('ALREADY_RATE');
		await DB.knex(this.table).where('id', this.id).update({rate: par.rate });
		this.Fields.rate = par.rate;
	}


	async moveHistory(par) {
		if (this.isHistory()) return;

		let tr = await DB.knex.transaction();
		try {
			if (par.status) {
				await this.updateTr(tr, {status: par.status});
				this.Fields.status = par.status;
			}

			await tr.raw(`INSERT INTO ${TABLE_HIST} SELECT * FROM ${TABLE} WHERE id=?`, [this.id]);
			await tr(TABLE).where({id: this.Fields.id}).delete();
			await DB.knex(TABLE_VND).where({order_id: this.Fields.id}).delete();
			await tr.commit();
		} catch (er) {
			console.log(er);
			await tr.rollback();
			throw new Error('DB_ERROR');
		}
		this.table = TABLE_HIST;   //TODO stupid
	}


	async sendSmsVendors() {
		const ids = [];
		if (this.Fields.vendor_id > 0) {
			ids.push(this.Fields.vendor_id);
		} else {
			let rows = await DB.knex(TABLE_VND).where({order_id: this.Fields.id}).select();
			for (let v of rows) {
				ids.push(v.vendor_id);
			}
		}
		if (!ids.length) return;

		const vendorlist = await DB.Vendor.getList({page:0, onpage:100, id: ids});

		const smsTxt = 'You have a new order '+ this.Fields.id + ' on CareRide Technologies. Please log on to accept or decline';
		for (let v of vendorlist.items) {
			Sms.sendSms(v.login, smsTxt);
		}

	}

	async sendNotifyAdmin() {
		const ids = [];
		if (this.Fields.vendor_id > 0) {
			ids.push(this.Fields.vendor_id);
		} else {
			let rows = await DB.knex(TABLE_VND).where({order_id: this.Fields.id}).select();
			for (let v of rows) {
				ids.push(v.vendor_id);
			}
		}
		if (!ids.length) return;

		const filters = {page:0, onpage:100, id:ids };
		filters.fillServices = 1;
		filters.order = this;

		const vendorlist = await DB.Vendor.getList(filters);

		const staff = await DB.Staff.getUserById(1);   //admin
		mailer.sendNewOrderAdmin( {order: this, vendors: vendorlist.items, email: staff.v('email') } );
	}





	//-------payment
	async initPay() {
		if (this.status != 1) throw new Error('WRONG_ORDER_FOR_PAY');
		const payment = await DB.Payment.getByOrderOrCreate({order_id: this.id, client_id: this.v('client_id') });
		if (!payment.id) throw new Error('db error');
		const res = await payment.initPayOrder(this);
		return res;
	}
	async payHoldBy(tr, par) {
		await this.refresh();
		if (this.status != 1) throw new Error('ERROR');
		await this.updateTr(tr, {status: 3});
		await tr(this.table).where('id', this.id).update({payAt: new Date() });
	}
	async capturePayFunds(par) {
		const payment = await DB.Payment.getByOrderId(this.id);
		if (!payment) return;
		await payment.runCaptureFunds(par);
	}



	async destroy() {
		await DB.knex(this.table).where({id: this.Fields.id}).delete();
	}

	toJsonAdd(obj, opt) {
		if ('services' in obj) obj.services = DB.Vendor.unpackServices(obj.services);
	}


}
module.exports.OrderModel = OrderModel;
module.exports.TABLE = TABLE;
module.exports.TABLE_HIST = TABLE_HIST;


class OrderHistModel extends OrderModel{
	table = TABLE_HIST;

}
module.exports.OrderHistModel = OrderHistModel;





function toDecimal(v, def) {
	try {
		var d = new Decimal(v);
	} catch (er) {
		d = new Decimal(def);
	}
	return d;
}


//TODO
async function getById(id) {
	const row = await DB.knex({U:TABLE}).join({C: DB.User.TABLE}, function() {
			this.on('C.id', '=', 'U.client_id');
		}).select(['U.*', 'C.login as client_login', 'C.first_name as client_first_name', 'C.second_name as client_second_name', 'C.last_name as client_last_name']).where('U.id', id).first();
	if (!row) return false;
	return new OrderModel(row);
}
module.exports.getById = getById;

async function getHistById(id) {
	const row = await DB.knex(TABLE_HIST).where({id: id}).first();
	if (!row) return false;
	return new OrderHistModel(row);
}
module.exports.getHistById = getHistById;



async function addOrder(data) {
	try {
		const order = await (new OrderModel()).create(data);
		if (!order.id) throw new Error('db error');

		// Non-fatal: SMS/notification failures should not block order creation
		try { await order.sendSmsVendors(); } catch (e) { console.log('sendSmsVendors error:', e.message); }
		try { await order.sendNotifyAdmin(); } catch (e) { console.log('sendNotifyAdmin error:', e.message); }

		let time1 = new Date(); time1.setMinutes(time1.getMinutes() + 15);
		try { Delayjob.addJob({id: order.id, fn: notify15m, time: time1 }); } catch (e) { console.log('Delayjob error:', e.message); }

		return order;
	} catch (er) {
		console.log('addOrder error:', er);
		throw new Error(er.message || 'db error');
	}
}
module.exports.addOrder = addOrder;
async function notify15m(par) {
	console.log('notify15m', par.id);
	let order = await getById(par.id);
	if (!order) return;
	if (order.status > 0) return;

	await order.sendSmsVendors();
}




async function fillCar(orders) {
	const carIds = new Set(), driverIds = new Set();
	orders.forEach((v) => { 
		if (v.car_id > 0) carIds.add(v.car_id);
		if (v.driver_id > 0) driverIds.add(v.driver_id);
	});
	if (carIds.size > 0) {
		let rows = await DB.knex(DB.Car.TABLE).whereIn('id', [...carIds]).select('*');
		let tmp = {};
		rows.forEach((v) => { 
			tmp[v.id] = v;
		});
		orders.forEach((v) => {
			if (tmp[v.car_id]) {
				v.setFlds({car: tmp[v.car_id] });
			}
		});
	}
	if (driverIds.size > 0) {
		let rows = await DB.knex(DB.Driver.TABLE).whereIn('id', [...driverIds]).select(DB.Driver.DriverUserModel.publicFields);
		let tmp = {};
		rows.forEach((v) => { 
			tmp[v.id] = v;
		});
		orders.forEach((v) => {
			if (tmp[v.driver_id]) {
				v.setFlds({driver: tmp[v.driver_id] });
			}
		});
	}
}
module.exports.fillCar = fillCar;



async function getList(filters) {
	const rez = new DB.PaginateCollection();
	if (filters.page && filters.page > 0) rez.page = filters.page;
	if (filters.onpage && filters.onpage > 0 && filters.onpage < 101) rez.onpage = filters.onpage;
	let fields = ['U.*', 'C.login as client_login', 'C.first_name as client_first_name', 'C.second_name as client_second_name', 'C.last_name as client_last_name'];
	let checkExp = filters.checkExp ? true : false;

	try {
		let query = DB.knex({U:TABLE});
		if (filters.history) {
			query = DB.knex({U:TABLE_HIST});
		}
		if (filters.id) query.where('U.id', filters.id);
		if (filters.ids && _.isArray(filters.ids) ) {
			filters.ids = filters.ids.map( (v) => +v );
			query.whereIn('U.id', filters.ids);
			filters.noTotal = 1;
		}
		if (filters.client_id) query.where('U.client_id', filters.client_id);
		if ('vendor_id' in filters) query.where('U.vendor_id', filters.vendor_id);
		if ('driver_id' in filters) query.where('U.driver_id', filters.driver_id);
		if ('car_id' in filters) query.where('U.car_id', filters.car_id);
		if ('status' in filters) {
			if (_.isInteger(filters.status) ) query.where('U.status', filters.status);
			if (_.isArray(filters.status) ) query.whereIn('U.status', filters.status);
		}
		if (filters.vendororfree) {
			query.leftJoin({V: TABLE_VND}, function() {
				this.on('U.id', '=', 'V.order_id');
			});
			query.where(function() {
				this.where('U.vendor_id', filters.vendororfree).orWhere('V.vendor_id', filters.vendororfree);
			});
		}

		if (filters.last && filters.last > 0) query.where('U.id', '<', filters.last);

		if (!filters.noTotal) {
			let count = await query.clone().count('* as count').first();
			if (count) rez.total = count['count'];
		}

		query.leftJoin({C: DB.User.TABLE}, function() {
			this.on('C.id', '=', 'U.client_id');
		});

		if (filters.vendorFields) {
			fields.push('V.company_name as company_name');
			query.leftJoin({V: DB.Vendor.TABLE}, function() {
				this.on('V.id', '=', 'U.vendor_id');
			});
		}

		query = query.offset(rez.page * rez.onpage).limit(rez.onpage).orderBy('U.id', 'desc');
		let items = await query.select(fields);

		if (items && items.length) {
			rez.first = items[0].id;
			if (items.length == rez.onpage) rez.last = items[items.length - 1].id;

			for (let v of items) {
				let order = new OrderModel(v);
				if (checkExp === true) {
					if (await order.checkExpire()) continue;
				}
				rez.items.push( new OrderModel(v));
			}
			if (filters.fillCar) {
				await fillCar(rez.items);
			}
			if (filters.fillPayment) {
				await DB.Payment.fillPayment(rez.items);
			}

			if (filters.vendor) {
				await filters.vendor.readServices();
				await filters.vendor.readOvertimes();
				rez.items.forEach((v) => { 
					v.calculVirtualPrices(filters.vendor);
				});
			}

		}

	} catch (er) {
		console.log(er);
		throw new Error('db error');
	}

	return rez;
}
module.exports.getList = getList;



async function getChangesList(filters) {
	const rez = { page: 0, onpage: 20, total: 0, first:0, last:0, items: []};
	if (filters.page && filters.page > 0) rez.page = filters.page;
	if (filters.onpage && filters.onpage > 0 && filters.onpage < 100) rez.onpage = filters.onpage;

	try {
		let query = DB.knex({G:TABLE_CHG});
		if (filters.id) query.where('G.id', filters.id);
		if (filters.vendor_id) query.where('G.vendor_id', '=', filters.vendor_id);

		let count = await query.clone().count('* as count').first();
		if (count) rez.total = count['count'];

		query = query.offset(rez.page * rez.onpage).limit(rez.onpage).orderBy('G.id', 'desc');
		rez.items = await query.select();

		if (rez.items && rez.items.length) {
			rez.first = rez.items[0].id;
			if (rez.items.length == rez.onpage) rez.last = rez.items[rez.items.length - 1].id;
			let ids = rez.items.map( (v) => v.order_id );

			let ords = await DB.knex(TABLE).whereIn('id', ids)
				.union([
					DB.knex(TABLE_HIST).whereIn('id', ids)
				]);

			let tmp = {};
			ords.forEach((v) => {
				tmp[v.id] = v;
				delete(v.pricemk);
				delete(v.p_dat);
				delete(v.overtime);
			});
			rez.items.forEach((v) => {
				if (tmp[v.order_id]) {
					v.order = tmp[v.order_id];
				}
			});

		}
	} catch (er) {
		console.log(er);
		throw new Error('db error');
	}

	return rez;
}
module.exports.getChangesList = getChangesList;

module.exports.readedChanges = async function(order_ids) {
	await DB.knex(TABLE_CHG).whereIn('order_id', order_ids).delete();
};





