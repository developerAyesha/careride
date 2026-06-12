const Config = require("./../config.js");
const _ = require('lodash');
const { getToken, getResetToken, checkResetTokenOnExpTime } = require('../services/jwt');
const UserBase = require("./userbase");
const DB = require("./db.model");
const bcrypt = require('bcrypt');
const FStorage = require('../services/filestorage');
const Stripe = require('../services/stripe/stripe.js');
const { formatLogin } = require('../utils/phone');
const Sms = require('../services/aws/sms');


const LicenseStorage = new FStorage.FileStorage({
	basedir: Config.ROOT_PATH + '/storage',
	dir: 'vlic',
	basket: '',
	extensions: ['jpg', 'jpeg', 'png', 'pdf'],
});



const VENDOR_SERVICES = {
	1: {id: 1, c: 'OXYGEN',    t: 'Oxygen',               g: 1},
	2: {id: 2, c: 'STAIRS',    t: 'Stairs',               g: 1},
	4: {id: 4, c: 'BARIATRIC', t: 'Bariatric (250lbs +)', g: 2},
};



const TABLE = 'vendor_inf';
const TABLE_SRVC = 'vendor_srvc';
const TABLE_OVERT = 'vendor_overt';
const TABLE_STRIPE = 'vendor_stripe';


class VendorUserModel extends UserBase.UserBase{
	table = TABLE;
	CSHEMA = {
		login: {type: 'string', len: 16, def:'', cast:'formatLogin'},
		passw: {type: 'string', len: 64, def:''},
		status: {type: 'int', def:0 },   //0-new,  1-approved, 2-declined
		block: {type: 'int', def:0 },    //0-norm,  1-blocked
		company_name: {type: 'string', len: 64, def:''},
		first_name: {type: 'string', len: 32, def:''},
		second_name: {type: 'string', len: 32, def:''},
		last_name: {type: 'string', len: 32, def:''},
		email: {type: 'string', len: 64, def:''},
		avatar: {type: 'string', len: 32, def:''},
		address: {type: 'string', len: 64, def:''},
		city: {type: 'string', len: 32, def:''},
		state: {type: 'string', len: 2, def:''},
		zipcode: {type: 'int', def:0 },
		license: {type: 'string', len: 160, def:''},
		costmt1: {type: 'numeric', def:'0'},
		costmt2: {type: 'numeric', def:'0'},
		baseprice1: {type: 'numeric', def:'0.5'},
		baseprice2: {type: 'numeric', def:'0.5'},
		token: {type: 'string', len: 128, def:''},
		approveAt: {type: 'date' },
	}
	Hidden = {passw:1, token:1, updatedAt:1};
	ROLE = 'v';
	static publicFields = ['id', "login", "status", "block", "company_name", "first_name", "second_name", "last_name", "email", "avatar", "address", "city", "state", "zipcode", "license", 'costmt1', 'costmt2', 'baseprice1', 'baseprice2', "car_count", "driver_count", "approveAt", "lastAt", "createdAt", "updatedAt" ];


	constructor(vars) {
		super(vars);
		this.init(vars);
	}

	onlyPublic() {
		this.hideExcept(VendorUserModel.publicFields);
	}

	get status() {
		return this.Fields.status;
	}
	get login() {
		return this.Fields.login;
	}

	getJwt() {
		return getToken({ uId: this.id, ur: this.ROLE });
	}

	formatLogin(v) {
		return formatLogin(v);
	}

	async onPreCreate(Fields) {
		if (String(Fields.login).length < 5) throw new Error('WRONG_LOGIN_FORMAT');
		if (!DB.Region.isCode(Fields.state)) throw new Error('WRONG_STATE');

		const row = await DB.knex(this.table).where({login: Fields.login}).first();
		if (row) throw new Error('LOGIN_USED');

		Fields.passw = makePasswordHash(this.Fields.passw);
		Fields.token = generateToken(8);
	}

	async onPreUpdate(flds) {
		if ( ('state' in flds) && (!DB.Region.isCode(flds.state)) ) throw new Error('WRONG_STATE');
	}


	async sendActivation() {
		let msg = 'Your CareRide Technologies code: '+this.Fields.token+' ';
		await Sms.sendSms(this.Fields.login, msg);
	}

	async changeUserToken() {
		this.Fields.token = Math.random().toString(10).substr(2, 4);
		await DB.knex(this.table).where({id: this.Fields.id}).update({token: this.Fields.token});
		return this.Fields.token;
	}

	async authCheck() {
		if (this.Fields.block == 1) throw new Error('PROFILE_BLOCKED');
	}
	async authNext() {
		await this.authCheck();
		await DB.knex(this.table).where({id: this.Fields.id}).update({lastAt: new Date()});
	}


	getToken() {
		return getToken({ userId: this.id });
	}


	async doBlock(block, source_id) {
		if (block == 0) await this.update({block: 0});
		if (block == 1) await this.update({block: 1});
	}

	async doApprove(cod) {
		if (this.Fields.status == cod) return;
		if (cod === 0) {
			await this.update({status:0, approveAt: null});
		}
		if (cod === 1) {
			if (! await this.isStripeComplete() ) throw new Error('STRIPE_ACCOUNT_NOT_COMPLETED');
			await this.update({status:1, approveAt: new Date() });
		}
		if (cod === 2) {
			await this.update({status:2 });
		}
	}



	//                              Counters
	async updateCarCount() {
		await DB.knex.raw(`UPDATE ${TABLE} V JOIN ( SELECT vendor_id, count(vendor_id) as dsize, sum(IF(busy=0,1,0)) as dfree FROM car_inf WHERE vendor_id=? ) T ON V.id = T.vendor_id SET V.car_count = T.dsize, V.car_free = T.dfree`, [this.id]);
	}
	async updateDriverCount() {
		await DB.knex.raw(`UPDATE ${TABLE} V JOIN ( SELECT vendor_id, count(vendor_id) as dsize, sum(IF(busy=0,1,0)) as dfree FROM driver_inf WHERE vendor_id=? ) T ON V.id = T.vendor_id SET V.driver_count = T.dsize, V.driver_free = T.dfree`, [this.id]);
	}

	//                              Services
	async readServices(hard) {
		if ( (!hard) && _.isArray(this.Fields.services) ) return;
		let rows = await DB.knex(TABLE_SRVC).where('vendor_id', this.id).orderBy('service_id', 'asc');
		let tmp = {};
		rows.forEach((v) => { tmp[v.service_id] = v; });
		this.Fields.services = unpackVendorServices(tmp);
	}
	async setServices(par) {
		if (!_.isObject(par)) return;
		let nsvc = 0;
		for (let k in VENDOR_SERVICES) {
			let code = VENDOR_SERVICES[k].c;
			if (par[code] === '' || par[code] === null) {
				await DB.knex(TABLE_SRVC).where({vendor_id: this.id, service_id: VENDOR_SERVICES[k].id }).delete();
				continue;
			}
			let price = _.toNumber(par[code]);
			if (price >= 0) {
				nsvc = nsvc | VENDOR_SERVICES[k].id;
				let add = {vendor_id: this.id, service_id: VENDOR_SERVICES[k].id, price: price, createdAt: new Date() };
				await DB.knex.raw(DB.knex(TABLE_SRVC).insert(add).toQuery() + " ON DUPLICATE KEY UPDATE price=?, updatedAt=?", [add.price, add.createdAt] );
			}
		}
		await DB.knex(TABLE).where('id', this.id).update('services', nsvc);
	}
	findServiceByCode(code) {
		for (let k in VENDOR_SERVICES) {
			if (VENDOR_SERVICES[k].c === code) return k
		}
	}

	//                              Overtimes
	async readOvertimes(hard) {
		if ( (!hard) && _.isArray(this.Fields.overtimes) ) return;
		this.Fields.overtimes = [];
		let rows = await DB.knex(TABLE_OVERT).where('vendor_id', this.id).orderBy('timefrom', 'asc').select(['id', 'timefrom', 'timeto', 'price', 'createdAt']);
		for (let v of rows) {
			v.timefrom_h = String(v.timefrom).padStart(4, '0').match(/.{2}/g).join(':');
			v.timeto_h = String(v.timeto).padStart(4, '0').match(/.{2}/g).join(':');
			this.Fields.overtimes.push(v);
		}
	}
	async setOvertimes(par) {
		if (!_.isArray(par)) return;
		await DB.knex(TABLE_OVERT).where('vendor_id', this.id).delete();
		for (let v of par) {
			if (! /^\d{1,2}:\d{1,2}$/s.test(v.timefrom) || ! /^\d{1,2}:\d{1,2}$/s.test(v.timeto) || !(_.toNumber(v.price) > 0) ) continue;
			let add = {
				vendor_id: this.id, 
				timefrom: String(v.timefrom).replace(':',''), 
				timeto: String(v.timeto).replace(':',''), 
				price: _.toNumber(v.price),
				createdAt: new Date(), 
			};
			await DB.knex(TABLE_OVERT).insert(add);
		}
	}

	//                        license
	async addLicenseFiles(files) {
		if (!_.isArray(files)) return;
		const row = await DB.knex(this.table).where({id: this.id}).select(['license']).first();
		if (row) this.Fields.license = row.license;
		let items = String(this.Fields.license).split(';');
		for (let i=0; i<5; i++) {
			if (!items[i]) items[i] = '';
		}
		files.forEach( (file) => {
			if (!LicenseStorage.checkValidFile(file)) return;
			let ext = LicenseStorage.getExt(file.originalname);

			let idx = items.findIndex( (v, i) => v=='' && i<5 );
			if (idx < 0) return;

			let name = idx + '.' + ext;

			LicenseStorage.saveFile(file, {name: this.id + '_' + name });
			items[idx] = name;
		});
		await this.update({license: items.join(';')});
	}
	async deleteLicenseFiles(ids) {
		if (!_.isArray(ids)) return;
		const row = await DB.knex(this.table).where({id: this.id}).select(['license']).first();
		if (row) this.Fields.license = row.license;
		let items = String(this.Fields.license).split(';');
		for (let i of ids) {
			if (items[i]) {
				LicenseStorage.delete(this.id + '_' + items[i]);
				items[i] = '';
			}
		}
		await this.update({license: items.join(';')});
	}

	makeLicenseFiles() {
		let tmp = String(this.Fields.license).split(';')
		this.Fields.license_files = [];
		tmp.forEach ( (v, i) => {
			if (!v) return;
			this.Fields.license_files.push({id: i, name: v, path: LicenseStorage.mkpath(this.id + '_' + v) });
		});
		return this.Fields.license_files;
	}


	//--------stripe
	async readStripe() {
		let row = await DB.knex(TABLE_STRIPE).where('id', this.id).first();
		if (!row) row = {};
		this.Fields.stripe_opt = row;
	}
	async regStripe() {
		await this.readStripe();
		if (this.Fields.stripe_opt.acc_id) return;

		const par = {email: this.Fields.email, company_name: this.Fields.company_name};
		const account = await Stripe.accountCreate(par);
		if (!account || !account.id) throw new Error('STRIPE_ACCOUNT_ERROR');

		const row = {id: this.id, acc_id: account.id, acc_complete: 0, createdAt: new Date()};
		await DB.knex(TABLE_STRIPE).insert(row);
		this.Fields.stripe_opt = row;
	}
	async getStripeAccLink() {
		await this.readStripe();
		if (!this.Fields.stripe_opt.acc_id) {
			await this.regStripe();
		}
		if (!this.Fields.stripe_opt.acc_id) throw new Error('STRIPE_ACCOUNT_ERROR');

		const accountLink = await Stripe.accountLinksCreate({account: this.Fields.stripe_opt.acc_id });
		return accountLink;
	}
	async isStripeComplete() {
		await this.readStripe();
		return this.Fields.stripe_opt.acc_complete == 1;
	}
	static async onStripeAccComplete(par) {
		if (!par.acc) throw new Error('PAY_API_ERROR');
		await DB.knex(TABLE_STRIPE).where('acc_id', par.acc).update({acc_complete:1, updatedAt: new Date() });
	}



	toJsonAdd(obj, opt) {
		if (opt.role) obj.role = this.ROLE;
		if ('license' in obj) obj.license_files = this.makeLicenseFiles();
		if ('stripe_opt' in obj) {
			obj.stripe_acc_complete = ('acc_complete' in obj.stripe_opt) ? obj.stripe_opt.acc_complete : null;
			delete(obj.stripe_opt);
		}
	}




	static getUserById(id) {
		return new VendorUserModel(row);
	}


}
module.exports.VendorUserModel = VendorUserModel;
module.exports.TABLE = TABLE


async function getUserById(id) {
	const row = await DB.knex(TABLE).select().where({id: id}).first();
	if (!row) throw new Error('VENDOR_NOT_FOUND');
	return new VendorUserModel(row);
}
module.exports.getUserById = getUserById;

async function getUserByLogin(login) {
	var row = await DB.knex(TABLE).select().where({login: formatLogin(login) }).first();
	if (!row) throw new Error('NOT_FOUND');
	return new VendorUserModel(row);
}
module.exports.getUserByLogin = getUserByLogin;

module.exports.authUser = async function(data) {
	var row = await DB.knex(TABLE).where({login: formatLogin(data.login) }).first();
	if (!row) throw new Error('WRONG_AUTH');

	if (!comparePasswords(data.passw, row.passw)) throw new Error('WRONG_AUTH');

	const user = new VendorUserModel(row);
	await user.authNext();

	return user;
}


module.exports.changeUserPassword = async function(id, password, newpassword) {
	var user = await DB.knex(TABLE).where({id: id}).first();
	if (!user) throw new Error('NOT_FOUND');
	if (!comparePasswords(password, user.passw)) throw new Error('WRONG_PASSWORD');

	await DB.knex(TABLE).where({id: id}).update({passw: makePasswordHash(newpassword) });
	return true;
}
module.exports.setUserPassword = async function(id, password) {
	var user = await DB.knex(TABLE).where({id: id}).first();
	if (!user) throw new Error('NOT_FOUND');

	await DB.knex(TABLE).where({id: id}).update({passw: makePasswordHash(password) });
	return true;
}


async function addUser(data) {
	const user = await (new VendorUserModel()).create(data);
	if (!user.id) throw new Error('db error');
	return user;
}
module.exports.addUser = addUser;




module.exports.getServices = function() {
	return Object.values(VENDOR_SERVICES);
}
function packServices(par) {
	let nsvc = 0;
	if (!_.isObject(par)) return nsvc;
	for (let k in VENDOR_SERVICES) {
		let code = VENDOR_SERVICES[k].c;
		if (par[code]) {
			nsvc = nsvc | VENDOR_SERVICES[k].id;
		}
	}
	return nsvc;
}
module.exports.packServices = packServices;
function unpackServices(nsvc) {
	if (_.isObject(nsvc)) return nsvc;
	let par = {};
	nsvc = +nsvc;
	for (let k in VENDOR_SERVICES) {
		let code = VENDOR_SERVICES[k].c;
		if ((nsvc & VENDOR_SERVICES[k].id) > 0) {
			par[code] = 1;
		}
	}
	return par;
}
module.exports.unpackServices = unpackServices;

function unpackVendorServices(par) {
	let list = [];
	for (let k in VENDOR_SERVICES) {
		let v = _.clone(VENDOR_SERVICES[k]);
		v.price = par[k] ? par[k].price : null;
		list.push(v);
	}
	return list;
}

async function fillServices(vendors) {
	const vendorMap = {};
	let ids = vendors.map( (v) => {
		v.Fields.services = {};
		v.Fields.overtimes = [];
		vendorMap[v.id] = v;
		return v.id;
	} );
	let rows = await DB.knex(TABLE_SRVC).whereIn('vendor_id', ids).select(['vendor_id', 'service_id', 'price']);
	rows.forEach((v) => { 
		vendorMap[v.vendor_id].Fields.services[v.service_id] = v;
	});
	vendors.forEach((v) => { 
		v.Fields.services = unpackVendorServices(v.Fields.services);
	});

	rows = await DB.knex(TABLE_OVERT).whereIn('vendor_id', ids).orderBy('vendor_id', 'asc').orderBy('timefrom', 'asc').select(['id', 'vendor_id', 'timefrom', 'timeto', 'price', 'createdAt']);
	rows.forEach((v) => { 
		v.timefrom_h = String(v.timefrom).padStart(4, '0').match(/.{2}/g).join(':');
		v.timeto_h = String(v.timeto).padStart(4, '0').match(/.{2}/g).join(':');
		vendorMap[v.vendor_id].Fields.overtimes.push(v);
	});
}





async function getList(filters) {
	const rez = new DB.PaginateCollection();
	if (filters.page && filters.page > 0) rez.page = filters.page;
	if (filters.onpage && filters.onpage > 0 && filters.onpage < 101) rez.onpage = filters.onpage;
	let fields = VendorUserModel.publicFields.map( (v)=> 'U.'+v );

	try {
		let query = DB.knex({U:TABLE});
		if (filters.id) {
			if (_.isArray(filters.id)) query.whereIn('U.id', filters.id.map( (v) => +v ) );
			if (_.isInteger(filters.id) ) query.where('U.id', _.toInteger(filters.id));
		}

		if ('status' in filters) query = query.where('U.status', filters.status);
		if ('block' in filters) query = query.where('U.block', filters.block);
		if ('company_name' in filters) query.where('U.company_name', 'like', '%'+DB.escapeLike(filters.company_name)+'%');

		if ('busy' in filters) {
			filters.joinC = 1;
			if (filters.busy == 0) {
				query.where('C.busy', 0);
			}
		}
		if (filters.cartype) {  //TODO 1,2
			filters.joinC = 1;
			query.where('C.cartype', filters.cartype);
		}
		if (filters.pfrom_city) {
			let city_id = await DB.City.getId(filters.pfrom_city);
			if (city_id > 0) {
				filters.joinM = 1;
				query.where('M.city_id', city_id);
			}
		}
		if (filters.services) {
			let svc = packServices(filters.services);
			if (svc > 0) query.whereRaw('U.services & ? = ?', [svc, svc]);
		}

		if (filters.joinC) {
			query.join({C: 'car_inf'}, function() {
				this.on('C.vendor_id', '=', 'U.id');
			});
			filters.groupBy = 'U.id';
		}
		if (filters.joinM) {
			query.join({M: 'car_city'}, function() {
				this.on('M.car_id', '=', 'C.id');
			});
		}
		if (filters.joinD) {
			query.join({D: 'driver_inf'}, function() {
				this.on('D.vendor_id', '=', 'U.id');
			});
			filters.groupBy = 'U.id';
		}

		if (filters.last && filters.last > 0) query.where('U.id', '<', filters.last);
		if (filters.groupBy) query.groupBy(filters.groupBy);


		let count = await query.clone().count('* as count').first();
		if (count) rez.total = count['count'];

		query.leftJoin({ST: TABLE_STRIPE}, function() {
			this.on('ST.id', '=', 'U.id');
		});
		fields.push('ST.acc_complete as stripe_acc_complete');


		query = query.offset(rez.page * rez.onpage).limit(rez.onpage).orderBy('U.id', 'desc');
		let items = await query.select(fields);

		if (items && items.length) {
			rez.first = items[0].id;
			if (items.length == rez.onpage) rez.last = items[items.length - 1].id;

			items.forEach( (v) => {
				rez.items.push( new VendorUserModel(v));
			});

			if (filters.fillServices) {
				await fillServices(rez.items);
				if (filters.order) {
					rez.items.forEach((v) => { 
						let prices = filters.order.calculPrices(v.Fields);
						v.Fields.order = prices;
					});
				}
			}
		}


	} catch (er) {
		console.log(er);
		throw new Error('db error');
	}

	return rez;
}
module.exports.getList = getList;










function generateToken(a) {
	return Math.random().toString(32).substring(2);
}

function makePasswordHash(password) {
	const salt = bcrypt.genSaltSync(10);
	const hash = bcrypt.hashSync(password, salt);
	return hash;
}

function comparePasswords(password, hash) {
	return bcrypt.compareSync(password, hash);
}








