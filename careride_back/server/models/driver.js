const Config = require("./../config.js");
const _ = require('lodash');
const { getToken, getResetToken, checkResetTokenOnExpTime } = require('../services/jwt');
const UserBase = require("./userbase");
const DB = require("./db.model");
const { formatLogin } = require('../utils/phone');
const bcrypt = require('bcrypt');
const FStorage = require('../services/filestorage');


const LicenseStorage = new FStorage.FileStorage({
	basedir: Config.ROOT_PATH + '/storage',
	dir: 'drlic',
	basket: '',
	extensions: ['jpg', 'jpeg', 'png', 'pdf'],
});


const TABLE = 'driver_inf';


class DriverUserModel extends UserBase.UserBase{
	table = TABLE;
	CSHEMA = {
		login: {type: 'string', len: 16, def:'', cast:'formatLogin'},
		passw: {type: 'string', len: 64, def:''},
		vendor_id: {type: 'int', def:0 },
		busy: {type: 'int', def:0 },
		block: {type: 'int', def:0 },    //0-norm,  1-blocked
		first_name: {type: 'string', len: 32, def:''},
		second_name: {type: 'string', len: 32, def:''},
		last_name: {type: 'string', len: 32, def:''},
		email: {type: 'string', len: 64, def:''},
		avatar: {type: 'string', len: 32, def:''},
		city: {type: 'string', len: 32, def:''},
		license: {type: 'string', len: 32, def:''},
		lastorder_id: {type: 'int', def:0 },
		token: {type: 'string', len: 128, def:''},
	}
	Hidden = {passw:1, token:1, updatedAt:1};
	ROLE = 'd';
	static publicFields = ['id', "login", 'vendor_id', "busy", "block", "first_name", "second_name", "last_name", "email", "avatar", "city",  "license", "lastAt", "createdAt", "updatedAt" ];


	constructor(vars) {
		super(vars);
		this.init(vars);
	}

	get Vendor() {
		return new DB.Vendor.VendorUserModel({id: this.Fields.vendor_id});
	}
	get vendor_id() {
		return this.Fields.vendor_id;
	}


	getJwt() {
		return getToken({ uId: this.id, ur: this.ROLE });
	}

	formatLogin(v) {
		return formatLogin(v);
	}

	async onPreCreate(Fields) {
		if (String(Fields.login).length < 5) throw new Error('WRONG_LOGIN_FORMAT');

		const row = await DB.knex(this.table).where({login: Fields.login}).first();
		if (row) throw new Error('LOGIN_USED');
		const vendor = await DB.Vendor.getUserById(Fields.vendor_id);

		Fields.passw = makePasswordHash(Fields.passw);
		Fields.token = generateToken(8);
	}
	async onPostCreate() {
		await this.Vendor.updateDriverCount();
	}



	async changeUserToken() {
		this.Fields.token = Math.random().toString(10).substr(2, 6);
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


	async doBlock(g) {
		if (g == 0) await this.update({block: 0});
		if (g == 1) await this.update({block: 1});
	}

	isBusy() {
		return this.Fields.busy > 0;
	}
	async setBusy(order_id) {
		let upd = {busy: order_id};
		if (order_id > 0 ) upd.lastorder_id = order_id;
		await this.update(upd);
	}


	//                        license
	async addLicenseFiles(files) {
		if (!_.isArray(files)) return;
		const row = await DB.knex(this.table).where({id: this.id}).select(['license']).first();
		if (row) this.Fields.license = row.license;
		let items = String(this.Fields.license).split(';');
		for (let i=0; i<1; i++) {
			items[i] = '';
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

	makeLicenseFiles() {
		let tmp = String(this.Fields.license).split(';')
		this.Fields.license_files = [];
		tmp.forEach ( (v, i) => {
			if (!v) return;
			this.Fields.license_files.push({id: i, name: v, path: LicenseStorage.mkpath(this.id + '_' + v) });
		});
		return this.Fields.license_files;
	}

	//                       Last Order
	async setLastOrder(order) {
		await this.update({lastorder_id: order.id});
	}

	async getLastOrder() {
		if (this.Fields.lastorder_id < 1) return false;
		let current = await DB.Order.getById(this.Fields.lastorder_id);
		if (current) return current;
		let hist = await DB.Order.getHistById(this.Fields.lastorder_id);
		return hist;
	}

	async detachLastOrder(par) {
		if (this.Fields.lastorder_id > 0) {
			await this.update({lastorder_id: 0});
		}
	}




	async destroy() {
		await DB.knex(this.table).where({id: this.Fields.id}).delete();
		await this.Vendor.updateDriverCount();
	}


	toJsonAdd(obj, opt) {
		if (opt.role) obj.role = this.ROLE;
		if ('license' in obj) obj.license_files = this.makeLicenseFiles();
	}




	static getUserById(id) {
		return new DriverUserModel(row);
	}


}
module.exports.DriverUserModel = DriverUserModel;
module.exports.TABLE = TABLE;


async function getUserById(id) {
	const row = await DB.knex(TABLE).select().where({id: id}).first();
	if (!row) throw new Error('NOT_FOUND');
	return new DriverUserModel(row);
}
module.exports.getUserById = getUserById;

async function getUserByLogin(login) {
	var row = await DB.knex(TABLE).select().where({login: formatLogin(login) }).first();
	if (!row) throw new Error('NOT_FOUND');
	return new DriverUserModel(row);
}
module.exports.getUserByLogin = getUserByLogin;

module.exports.authUser = async function(data) {
	var row = await DB.knex(TABLE).where({login: formatLogin(data.login) }).first();
	if (!row) throw new Error('WRONG_AUTH');

	if (!comparePasswords(data.passw, row.passw)) throw new Error('WRONG_AUTH');

	const user = new DriverUserModel(row);
	await user.authNext();

	return user;
}





async function addUser(data) {
	const user = await (new DriverUserModel()).create(data);
	if (!user.id) throw new Error('db error');
	return user;
}
module.exports.addUser = addUser;




async function getList(filters) {
	const rez = new DB.PaginateCollection();
	if (filters.page && filters.page > 0) rez.page = filters.page;
	if (filters.onpage && filters.onpage > 0 && filters.onpage < 100) rez.onpage = filters.onpage;
	let fields = DriverUserModel.publicFields;

	try {
		let query = DB.knex({U:TABLE});
		if (filters.id) query = query.where('U.id', filters.id);
		if ('vendor_id' in filters) query = query.where('U.vendor_id', filters.vendor_id);
		if ('block' in filters) query = query.where('U.block', filters.block);
		if (filters.login) query = query.where('U.login', 'like', '%'+DB.escapeLike(filters.login)+'%');
		if (filters.name) query = query.where('U.name', 'like', '%'+DB.escapeLike(filters.name)+'%');
		if ( ('busy' in filters) && _.isInteger(filters.busy) ) {
			if (filters.busy == 0) {
				query.where('U.busy', 0);
			}
		}
		if (filters.last && filters.last > 0) query.where('U.id', '<', filters.last);

		let count = await query.clone().count('* as count').first();
		if (count) rez.total = count['count'];


		query = query.offset(rez.page * rez.onpage).limit(rez.onpage).orderBy('U.id', 'desc');
		items = await query.select(fields);

		if (items && items.length) {
			rez.first = items[0].id;
			if (items.length == rez.onpage) rez.last = items[items.length - 1].id;
			items.forEach( (v) => {
				rez.items.push( new DriverUserModel(v));
			});
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








