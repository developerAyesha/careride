const DB = require("./db.model");
const { dateFormat } = require('../utils/dateformat');
const BaseConvert = require('../utils/baseconvert.js');


const TABLE = 'throttles';

class Throttle {
	_sign;
	_attempt;
	_time;
	_opt;

	constructor(key, opt) {
		this._sign = String(key);
		this._opt = opt;
	}


	async init() {
		if (this._opt.base62) {
			this._sign = String(this._sign).split('-').join('');
			this._sign = BaseConvert.convertBase(this._sign, 16, 62);
		}

		if (!this._sign) throw new Error('API_ERROR');

		const row = await DB.knex(TABLE).where({signature: this._sign}).first();
		if (row) {
			this._attempt = row.attempt;
			this._time = row.time;
			if (this._opt.resetonper) {
				await this.resetIfPer();
			}
		}

	}


	islast() {
		if (!this._time) return false;
		const today=new Date();
		const d = new Date(today.getTime() - str2time(this._opt.per)*1000);
		if (this._time > d) return true;
		return false;
	}

	islimit() {
		return (this._attempt >= this._opt.limit);
	}

	async resetIfPer() {
		if (!this._time) return false;
		if (this.islast() === false) {
			await DB.knex(TABLE).where({signature: this._sign}).update({attempt: 0, time: dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss') } );
			this._attempt = 0;
		}
	}

	async banTime(dt) {
		const today=new Date();
		const d = new Date(today.getTime() + str2time(dt)*1000);
		await DB.knex(TABLE).where({signature: this._sign}).update({time: dateFormat(d, 'yyyy-mm-dd HH:MM:ss') } );
	}



	async increment() {
		const data = {
			signature: this._sign,
			attempt: 1,
			time: new Date(),
		};

		return await DB.knex.raw(DB.knex(TABLE).insert(data).toQuery() + " ON DUPLICATE KEY UPDATE attempt=attempt+1,time='"+dateFormat(data.time, 'yyyy-mm-dd HH:MM:ss')+"'" );
	}

}






async function throttle(key, opt) {
	const Thr = new Throttle(key, opt);
	await Thr.init();
	return Thr;
}
module.exports.throttle = throttle;


module.exports.cronRun = async function() {
	const today=new Date();
	await DB.knex(TABLE).where('time', '<', new Date(today.getTime() - 86400 * 1000) ).del();
}





function str2time(t) {
	if (typeof t == 'number') return t;
	var d = parseInt(t.substring(0, t.length -1)), g = t.substring(t.length -1);
	switch(g) {
		case 'm': 
			return d * 60;
			break;
		case 'h': 
			return d * 60 * 60;
			break;
	}
	return d;
}


