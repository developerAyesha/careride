const fs = require('fs');
const path = require("path");
const { getToken, getResetToken, checkResetTokenOnExpTime } = require('../services/jwt');
const UserBase = require("./userbase");
const DB = require("./db.model");
const bcrypt = require('bcrypt');



const TABLE = 'staff_inf';


class StaffUserModel extends UserBase.UserBase{
	table = TABLE;
	CSHEMA = {
		login: {type: 'string', len: 16, def:''},
		passw: {type: 'string', len: 64, def:''},
		name: {type: 'string', len: 128, def:''},
		email: {type: 'string', len: 64, def:''},
		role: {type: 'string', len:2, def:'' },
		block: {type: 'int', def:0 },
		gid: {type: 'int', def:0 },
		avatar: {type: 'string', len: 64, def:''},
		language: {type: 'string', len: 2, def:''},
		token: {type: 'string', len: 128, def:''},
	}
	Hidden = {passw:1, token:1, updatedAt:1};
	ROLE = 'a';


	constructor(vars) {
		super(vars);
		this.init(vars);
	}

	get isStaff() {
		return true;
	}

	get name() {
		return this.Fields.name;
	}
	get role() {
		return this.Fields.role;
	}


	isRole(s) {
		return s.indexOf(this.Fields.role) > -1;
	}
	getJwt() {
		return getToken({ uId: this.id, ur: this.ROLE });
	}



	async onPreCreate() {
		if (String(this.Fields.login).length < 5) throw new Error('WRONG_LOGIN_FORMAT');

		const row = await DB.knex(this.table).where({login: this.Fields.login}).first();
		if (row) throw new Error('LOGIN_USED');

		this.Fields.passw = makePasswordHash(this.Fields.passw);
		this.Fields.token = generateToken(8);
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


	toJsonAdd(obj) {
	}




	static getUserById(id) {
		return new StaffUserModel(row);
	}


}
module.exports.StaffUserModel = StaffUserModel;


function formatLogin(t){
	return t;
}





async function getUserById(id) {
	const row = await DB.knex(TABLE).select().where({id: id}).first();
	if (!row) throw new Error('NOT_FOUND');
	return new StaffUserModel(row);
}
module.exports.getUserById = getUserById;

async function getUserByLogin(login) {
	var row = await DB.knex(TABLE).select().where({login: formatLogin(login) }).first();
	if (!row) throw new Error('NOT_FOUND');
	return new StaffUserModel(row);
}
module.exports.getUserByLogin = getUserByLogin;

module.exports.authUser = async function(data) {
	var row = await DB.knex(TABLE).where({login: formatLogin(data.login) }).first();
	if (!row) throw new Error('WRONG_AUTH');

	if (!comparePasswords(data.passw, row.passw)) throw new Error('WRONG_AUTH');

	const user = new StaffUserModel(row);
	await user.authNext();

	return user;
}





async function addUser(data) {
	const user = await (new StaffUserModel()).create(data);
	if (!user.id) throw new Error('db error');
	return user;
}
module.exports.addUser = addUser;





async function getList(filters) {
	const rez = { page: 0, onpage: 20, total: 0, first:0, last:0, items: []};
	if (filters.page && filters.page > 0) rez.page = filters.page;
	if (filters.onpage && filters.onpage > 0 && filters.onpage < 100) rez.onpage = filters.onpage;
	let fields = ['*'];

	try {
		let query = DB.knex({U:TABLE});
		if (filters.id) query = query.where('U.id', filters.id);
		if ('block' in filters) query = query.where('U.block', filters.block);
		if (filters.login) query = query.where('U.login', 'like', '%'+DB.escapeLike(filters.login)+'%');
		if (filters.name) query = query.where('U.name', 'like', '%'+DB.escapeLike(filters.name)+'%');
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








