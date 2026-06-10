const Config = require("./../config.js");
const DB = require("./db.model");
const _ = require('lodash');
const Decimal = require('decimal.js');
const paylogger = require('../services/winston').paylogger;
const Stripe = require('../services/stripe/stripe.js');

const TABLE = 'pay_inf';


class PaymentModel extends DB.ModelBase{
	table = TABLE;
	CSHEMA = {
		order_id: {type: 'int', def:0 },
		client_id: {type: 'int', def:0 },

		status: {type: 'int', def:0 },   //0-new, 1-holded, 10-complete, 11-partial complete, 20-cancel
		holded: {type: 'int', def:0 },

		payment_id: {type: 'string', len: 32, def:''},
		amount: {type: 'int', def:0 },   //multiple by 10
		token: {type: 'string', len: 128, def:''},

		paiment_tx: {type: 'string', len: 128, def:''},
		detail: {type: 'json', len: 32000, def:'{}'},

	}

	constructor(vars) {
		super(vars);
		this.init(vars);
	}


	get status () {
		return this.Fields.status;
	}
	get Order() {
		return new DB.Order.OrderModel({id: this.Fields.order_id});
	}



	async initPayOrder(Order) {
		if (this.status != 0) throw new Error('PAY_STATUS_FAILD');

		const isDevMode = Config.NODE_ENV !== 'production';
		let account = '';

		if (!isDevMode) {
			const Vendor = Order.Vendor;
			if (! await Vendor.isStripeComplete() ) throw new Error('STRIPE_ACCOUNT_NOT_COMPLETED');
			account = Vendor.Fields.stripe_opt.acc_id;
		}

		if (this.Fields.token != '') {
			return {clientSecret: this.Fields.token, pk: Stripe.getPublicKey(), acc: account };
		}

		const rawAmount = parseInt((new Decimal(Order.v('price') || '0')).mul(100).toFixed(0), 10);
		const amount = Math.max(rawAmount, 50).toString(); // enforce Stripe minimum $0.50

		let intentParams = {amount, currency: "usd"};
		if (!isDevMode && account) {
			const application_fee = (new Decimal(Order.getFldJson('pricemk','commission'))).mul(2).mul(100).toFixed(0);
			intentParams.stripeAccount = account;
			intentParams.application_fee_amount = application_fee;
		}

		const paymentIntent = await Stripe.createPaymentIntent(intentParams);

		this.setFlds({payment_id: getTokenPid(paymentIntent.clientSecret), amount: amount, token: paymentIntent.clientSecret});
		this.setFldJson('detail', {acc: account});
		await this.save();

		return paymentIntent;
	}

	// par = {capture_percent: int }
	async runCaptureFunds(par) {
		paylogger.info('runCaptureFunds: '+ this.id + ' capture_percent: ' + par.capture_percent );
		if (this.status != 1) {
			paylogger.info('NOT_HOLDED, status: '+this.status);
			return;
		}

		const captureOpt = {pi: 'pi_' + this.Fields.payment_id, stripeAccount: this.getFldJson('detail','acc') };

		if ('capture_percent' in par) {
			let amount_to_capture = (new Decimal(this.Fields.amount)).mul(par.capture_percent).div(100).toFixed(0);

			this.setFldJson('detail', {capture_percent: par.capture_percent});

			if (par.capture_percent <= 100 ) {
				captureOpt.amount_to_capture = amount_to_capture;
				this.setFldJson('detail', {amount_to_capture: amount_to_capture});
			}

			if (parseInt(par.capture_percent) === 0) {
				await Stripe.cancelPaymentIntent(captureOpt);
				await this.save();
				return;
			}
		}

		await Stripe.capturePaymentIntent(captureOpt);
		await this.save();

	}

	async eventHold(resp) {
		if (this.status != 0) return;
		paylogger.info('eventHold');

		let tr = await DB.knex.transaction();
		try {
			await this.updateTr(tr, {status: 1, holded: 1});
			await this.Order.payHoldBy(tr, {});

			await tr.commit();
		} catch (er) {
			await tr.rollback();
			console.log(er);
			throw new Error('DB_ERROR');
		}

	}

	async eventSucces(resp) {
		if (this.status != 1) return;
		paylogger.info('eventSucces', resp);

		this.setFldJson('detail', resp.detail);
		this.setFlds({paiment_tx: resp.detail.id, status: 10});
		await this.save();
	}




	async destroy() {
		//await DB.knex(this.table).where({id: this.Fields.id}).delete();
	}

	toJsonAdd(obj, opt) {
	}


}
module.exports.PaymentModel = PaymentModel;



function getTokenPid(t) {
	t= String(t);
	if (t.substr(0,2) != 'pi') throw new Error('PAY_PID_ERROR');
	return t.split('_')[1];
}





async function getById(id) {
	const row = await DB.knex(TABLE).where({id: id}).first();
	if (!row) return false;
	return new PaymentModel(row);
}
module.exports.getById = getById;

async function getByOrderId(id) {
	const row = await DB.knex(TABLE).where({order_id: id}).first();
	if (!row) return false;
	return new PaymentModel(row);
}
module.exports.getByOrderId = getByOrderId;

async function getByPaymentId(id) {
	const row = await DB.knex(TABLE).where({payment_id: id}).first();
	if (!row) return false;
	return new PaymentModel(row);
}



async function getByOrderOrCreate(data) {
	const row = await DB.knex(TABLE).where({order_id: data.order_id}).first();
	if (row) {
		return new PaymentModel(row);
	}
	const payment = await (new PaymentModel()).create(data);
	if (!payment.id) throw new Error('db error');
	return payment;
}
module.exports.getByOrderOrCreate = getByOrderOrCreate;



module.exports.callback = async function callback(req, params) {
	const out = {};

	const resp = await Stripe.webhook(req, params);
	paylogger.info('resp: '+ JSON.stringify(resp) );

	let payment;

	if (resp.pi) {
		payment = await getByPaymentId(getTokenPid(resp.pi));
		if (!payment) {
			paylogger.info('PAYMENT_NOT_FOUND');
			return out;
		}
	}

	switch (resp.event) {
		case 'HOLD_OK':
			if (!payment.id) throw new Error('PAY_API_ERROR');
			await payment.eventHold(resp);
			break;
		case 'PAY_OK':
			if (!payment.id) throw new Error('PAY_API_ERROR');
			await payment.eventSucces(resp);
			break;
		case 'ACCOUNT_COMPLETE':
			await DB.Vendor.VendorUserModel.onStripeAccComplete(resp);
			break;

	}


	return out;
}





async function fillPayment(orders) {
	const ids = orders.map( (v) => v.id );

	if (ids.length > 0) {
		let rows = await DB.knex(TABLE).whereIn('order_id', ids).select('*');
		let tmp = {};
		rows.forEach((v) => { 
			tmp[v.order_id] = new PaymentModel(v);
		});
		orders.forEach((v) => {
			if (tmp[v.id]) {
				v.setFlds({payment: tmp[v.id].toJson() });
			}
		});
	}
}
module.exports.fillPayment = fillPayment;


async function getList(filters) {
	const rez = new DB.PaginateCollection();
	if (filters.page && filters.page > 0) rez.page = filters.page;
	if (filters.onpage && filters.onpage > 0 && filters.onpage < 100) rez.onpage = filters.onpage;
	let fields = ['U.*'];

	try {
		let query = DB.knex({U:TABLE});
		if (filters.id) query.where('U.id', filters.id);
		if (filters.client_id) query.where('U.client_id', filters.client_id);
		if ('vendor_id' in filters) query.where('U.vendor_id', filters.vendor_id);
		if ('client_id' in filters) query.where('U.client_id', filters.client_id);

		if (filters.last && filters.last > 0) query.where('U.id', '<', filters.last);

		let count = await query.clone().count('* as count').first();
		if (count) rez.total = count['count'];

		query.join({C: DB.User.TABLE}, function() {
			this.on('C.id', '=', 'U.client_id');
		});

		query = query.offset(rez.page * rez.onpage).limit(rez.onpage).orderBy('U.id', 'desc');
		let items = await query.select(fields);

		if (items && items.length) {
			rez.first = items[0].id;
			if (items.length == rez.onpage) rez.last = items[items.length - 1].id;
			items.forEach( (v) => {
				rez.items.push( new PaymentModel(v));
			});

		}

	} catch (er) {
		console.log(er);
		throw new Error('db error');
	}

	return rez;
}
module.exports.getList = getList;








