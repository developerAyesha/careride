const fs = require('fs');
const path = require("path");
const sharp = require('sharp');
const _ = require('lodash');
const logger = require('../services/winston').logger;
const UserBase = require("./userbase");
const Sms = require('../services/aws/sms');

const DB = require("./db.model");
const { formatLogin } = require('../utils/phone');
const bcrypt = require('bcrypt');
const Decimal = require('decimal.js');

const ROOT_PATH = path.dirname(path.dirname(require.main.filename));
const AVATAR_PATH = '/web/avatar/';
const AVATAR_EXT = ['jpg', 'jpeg', 'png'];


const TABLE = 'user_inf';
const TABLE_OPT = 'user_opt';
const TABLE_SOCIAL = 'user_soc';
const TABLE_CURORDER = 'user_order';




class UserModel extends UserBase.UserBase{
	table = TABLE;
	CSHEMA = {
		login: {type: 'string', len: 16, def:'', cast:'formatLogin'},
		passw: {type: 'string', len: 64, def:''},
		status: {type: 'int', def:0 },   //0-new
		block: {type: 'int', def:0 },    //0-norm,  1-blocked
		activated: {type: 'int', def:0 },    //0-new,  1-active
		first_name: {type: 'string', len: 32, def:''},
		second_name: {type: 'string', len: 32, def:''},
		last_name: {type: 'string', len: 32, def:''},
		email: {type: 'string', len: 64, def:''},
		avatar: {type: 'string', len: 32, def:''},
		address: {type: 'string', len: 64, def:''},
		city: {type: 'string', len: 32, def:''},
		state: {type: 'string', len: 2, def:''},
		zipcode: {type: 'int', def:0 },
		datebirth: {type: 'int', def:0 },
		gender: {type: 'string', len: 1, def:''},
		facility_name: {type: 'string', len: 32, def:''},
		lastorder_id: {type: 'int', def:0 },
		token: {type: 'string', len: 128, def:''},
	}
	Hidden = {passw:1, token:1, updatedAt:1};
	ROLE = 'c';
	static publicFields = ['id', 'login', 'first_name', 'second_name', 'last_name', 'email', 'block', 'activated', 'avatar', 'address', 'city', 'state', 'zipcode', 'datebirth', 'gender', 'facility_name'];


	constructor(vars) {
		super(vars);
		this.init(vars);
	}

	get isStaff() {
		return false;
	}
	get login() {
		return this.Fields.login;
	}

	getName() {
		return this.Fields.name;
	}
	formatLogin(v) {
		return formatLogin(v);
	}
	publicProfile() {
		this.hideExcept(UserModel.publicFields);
		return this;
	}



	async onPreCreate() {
		if (String(this.Fields.login).length < 10) throw new Error('WRONG_PHONE_FORMAT');
		if ( (String(this.Fields.login).substr(0,1) !== '1') && (String(this.Fields.login).substr(0,1) !== '3') ) {
			throw new Error('WRONG_PHONE_FORMAT');
		}

		const row = await DB.knex(this.table).where({login: this.Fields.login}).first();
		if (row) throw new Error('LOGIN_USED');

		this.Fields.passw = makePasswordHash(this.Fields.passw);
		this.Fields.token = generateToken(8);
	}

	async changeUsername(username) {
		const used = await DB.knex(TABLE).where('username', username).whereNot('id', this.id).first();
		if (used) throw new Error('USERNAME_USED');
		await this.update({username: username});
		return true;
	}


	async sendActivation() {
		let msg = 'Your CareRide Technologies code: '+this.Fields.token+' ';
		await Sms.sendSms(this.Fields.login, msg);
	}

	async changeUserToken() {
		this.Fields.token = genActivateCode(this.Fields.login);
		await DB.knex(this.table).where({id: this.Fields.id}).update({token: this.Fields.token});
		return this.Fields.token;
	}


	async authCheck() {
		if (this.Fields.block == 1) throw new Error('USER_BLOCKED');
		if (this.Fields.block == 9) throw new Error('USER_ON_DELETED');
	}
	async authNext() {
		await this.authCheck();
		await DB.knex(this.table).where({id: this.Fields.id}).update({lastAt: new Date()});
	}



	async doBlock(source_id) {
		await this.update({block: 1});
	}
	async doUnBlock(source_id) {
		await this.update({block: 0});
	}


	//                              Groups
	async setGroup(group_id) {
		await DB.knex(this.table).where({id: this.id}).update({group_id: group_id});
		this.Fields.group_id = group_id;
	}


	//                       Last Order
	async setLastOrder(order) {
		await DB.knex(TABLE_CURORDER).insert({client_id:this.id, order_id: order.id});
		//await this.update({lastorder_id: order.id});
	}

	async getLastOrdersStat() {
		let query = DB.knex({UO: TABLE_CURORDER}).where('UO.client_id', this.id);
		query.leftJoin({O: DB.Order.TABLE}, function() {
			this.on('O.id', '=', 'UO.order_id');
		});
		query.leftJoin({H: DB.Order.TABLE_HIST}, function() {
			this.on('H.id', '=', 'UO.order_id');
		});
		let rows = await query.select(['UO.order_id as id', DB.knex.raw('IF(O.status IS NULL,H.status,O.status) as status'), 'O.vendor_id', 'O.car_id', 'O.driver_id', 'O.createdAt', 'O.acceptedAt']);
		let list = [];
		for (const v of rows) {
			if (v.createdAt) {
				let order = new DB.Order.OrderModel(v);
				await order.checkExpire();
				v.status = order.status;
			}
			list.push({id: v.id, status: v.status});
		}
		return list;
	}
	async getLastOrders() {
		let list = await DB.Order.getList({client_id: this.id, vendorFields:1, page:0, onpage: 50 });
		let listh = await DB.Order.getList({client_id: this.id, vendorFields:1, page:0, onpage: 50, history: 1 });
		listh.items.forEach( (v) => list.items.push(v) );
		list.total = list.items.length;
		if (list.total > 0) {
			await DB.Order.fillCar(list.items);
			for (const order of list.items) {
				await order.checkExpire();
			}
		}
		return list;
	}

	async detachLastOrder(par) {
		await DB.knex(TABLE_CURORDER).where({client_id:this.id, order_id: par.order_id}).delete();
		//if (this.Fields.lastorder_id > 0) await this.update({lastorder_id: 0});
	}





	toJsonAdd(obj, opt) {
		if (opt.role) obj.role = this.ROLE;
	}

	static makeAvatarPath(obj) {
		obj.avatar_path = obj.avatar ? AVATAR_PATH + obj.id + '_' + obj.avatar : '';
	}


	static getUserById(id) {
		return new UserModel(row);
	}


}
module.exports.UserModel = UserModel;
module.exports.TABLE = TABLE;


function filterLoginAr(phones) {
	const list = [];
	if (!Array.isArray(phones) || (phones.length<1) ) return list;
	for (let phone of phones) {
		phone = formatLogin(phone);
		if (phone.length < 6) continue;
		list.push(phone);
	}
	return list;
}
function genActivateCode(login) {
	let code = Math.random().toString(10).substr(2, 4);
	//code = '7777';   //for testing
	return code;
}
module.exports.genActivateCode = genActivateCode;


async function getUserById(id) {
	const row = await DB.knex(TABLE).select().where({id: id}).first();
	if (!row) throw new Error('NOT_FOUND');
	return new UserModel(row);
}
module.exports.getUserById = getUserById;

async function getUserByLogin(login) {
	var row = await DB.knex(TABLE).select().where({login: formatLogin(login) }).first();
	if (!row) return false;
	return new UserModel(row);
}
module.exports.getUserByLogin = getUserByLogin;

module.exports.authUser = async function(data) {
	var row = await DB.knex(TABLE).where({login: formatLogin(data.login) }).first();
	if (!row) throw new Error('NOT_FOUND');

	if (!comparePasswords(data.passw, row.passw)) throw new Error('WRONG_AUTH');

	const user = new UserModel(row);
	await user.authNext();

	return user;
}


module.exports.activateUser = async function(par) {
	var user = await DB.knex(TABLE).where({id: par.id}).first();
	if (!user) throw new Error('NOT_FOUND');

	await DB.knex(TABLE).where({id: user.id}).update({activated: 1 });
	return true;
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
	const user = await (new UserModel()).create(data);
	if (!user.id) throw new Error('db error');
	return user;
}
module.exports.addUser = addUser;


async function getMapList(filters) {
	const rez = new Map();
	let query = DB.knex({C:TABLE});
	if (filters.ids && Array.isArray(filters.ids) && filters.ids.length) query.whereIn('id', filters.ids);
	const items = await query.select(UserModel.publicFields);

	items.forEach(v => rez.set(v.id, new UserModel(v)));
	return rez;
}
module.exports.getMapList = getMapList;

async function fillListUser(items) {
	if (!items || !Array.isArray(items) || !items.length) return;

	const ids = new Set();
	items.forEach((v) => ids.add(v.user_id) );
	if (ids.size < 1) return;

	const rows = await DB.knex(TABLE).whereIn('id', Array.from(ids)).select('id', 'username', 'avatar');
	const users = {};
	rows.forEach((v) => {
		users[v.id] = v;
	});

	items.forEach((v) => v.user = users[v.user_id] );
}
module.exports.fillListUser = fillListUser;



module.exports.setToDelete = async function(uid) {

	const user = await getUserById(uid);
	logger.info('User setToDelete: ' + user.id);
	if (user.v('block') == 9) return;

	await DB.Video.blockAllUser(user);
	await DB.knex(TABLE).where('id', user.id).update({block: 9});

}




async function getList(filters) {
	const rez = { page: 0, onpage: 20, total: 0, first:0, last:0, items: []};
	if (filters.page && filters.page > 0) rez.page = filters.page;
	if (filters.onpage && filters.onpage > 0 && filters.onpage < 100) rez.onpage = filters.onpage;
	let fields = UserModel.publicFields;
	if (filters.mode && filters.mode === 'mini') {
		fields = ['U.id', 'U.login', 'U.username', 'U.name', 'U.surname', 'U.avatar', 'U.ptype', 'U.group_id'];
	}

	try {
		let query = DB.knex({U:TABLE});
		if (filters.id) query.where('U.id', filters.id);
		if ( ('block' in filters) && (String(filters.block).length>0) ) query.where('U.block', filters.block);
		if (filters.login) query.where('U.login', 'like', '%'+DB.escapeLike(filters.login)+'%');
		if (filters.name) query.where('U.username', 'like', '%'+DB.escapeLike(filters.name)+'%');
		if (filters.last && filters.last > 0) query.where('U.id', '<', filters.last);

		let count = await query.clone().count('* as count').first();
		if (count) rez.total = count['count'];

		query = query.offset(rez.page * rez.onpage).limit(rez.onpage).orderBy('U.id', 'desc');
		rez.items = await query.select(fields);

		if (rez.items && rez.items.length) {
			rez.first = rez.items[0].id;
			if (rez.items.length == rez.onpage) rez.last = rez.items[rez.items.length - 1].id;
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
module.exports.comparePasswords = comparePasswords;











