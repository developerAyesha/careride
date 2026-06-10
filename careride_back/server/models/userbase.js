const fs = require('fs');
const path = require("path");
const { getToken, getResetToken, checkResetTokenOnExpTime } = require('../services/jwt');

const DB = require("./db.model");
const bcrypt = require('bcrypt');




class UserBase extends DB.ModelBase{


	constructor(vars) {
		super(vars);
		this.init(vars);
	}



	getJwt() {
		return getToken({ uId: this.id, ur: this.ROLE });
	}





	async changeUserToken() {
		this.Fields.token = Math.random().toString(10).substr(2, 6);
		await DB.knex(this.table).where({id: this.Fields.id}).update({token: this.Fields.token});
		return this.Fields.token;
	}


	async authNext() {
		await this.authCheck();
		await DB.knex(this.table).where({id: this.Fields.id}).update({lastAt: new Date()});
	}



	isrole(need) {
		if (!need.includes(this.ROLE)) return false;
		if (this.Fields.block == 1) return false;
		return true;
	}




	async changePassword(id, password, newpassword) {
		var user = await DB.knex(this.table).where({id: this.id}).first();
		if (!user) throw new Error('NOT_FOUND');
		if (!comparePasswords(password, user.passw)) throw new Error('WRONG_PASSWORD');

		await DB.knex(this.table).where({id: this.id}).update({passw: makePasswordHash(newpassword) });
		return true;
	}
	async setPassword(password) {
		if (String(password).length < 5) return;
		await DB.knex(this.table).where({id: this.id}).update({passw: makePasswordHash(password) });
		return true;
	}



	toJsonAdd(obj, opt) {
		if (opt.role) obj.role = this.ROLE;
	}




}
module.exports.UserBase = UserBase;










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








