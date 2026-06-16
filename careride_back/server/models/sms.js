const DB = require("./db.model");
const SmsService = require('../services/aws/sms');
const { dateFormat } = require('../utils/dateformat');



const BLOCK_SET = {
	list: [],
	last: 0,
	refresh_dt: 600 * 1000,   //10 min
};

const TABLE_BLOCK = 'sms_block';
const TABLE_STAT = 'sms_stat';


class SmsBlockModel extends DB.ModelBase{
	table = TABLE_BLOCK;
	CSHEMA = {
		phone: {type: 'string', len: 16, def:''},
		title: {type: 'string', len: 64, def:''},
	}


	constructor(vars) {
		super(vars);
		this.init(vars);
	}

	async onPreCreate() {
		if (String(this.Fields.title).length < 1) throw new Error('WRONG_PHONE_FORMAT');
		const row = await DB.knex(this.table).where({phone: this.Fields.phone}).first();
		if (row) throw new Error('USED');
	}


	async destroy() {
		await DB.knex(TABLE_BLOCK).where({id: this.id}).delete();
	}


}


function formatPhone(v) {
	v = String(v).replace( /[^0-9]/g, '');
	if (v.length > 13) v = v.substring(v.length - 12);
	let area = '';
	let number = v.substr(-8);
	let first = v.substr(0, v.length-8);
	let country = first.substr(0,3);

	return {phone: v, country: country, area: area, number: number };
}



async function getBlockById(id) {
	const row = await DB.knex(TABLE_BLOCK).select().where({id: id}).first();
	if (!row) throw new Error('NOT_FOUND');
	return new SmsBlockModel(row);
}
module.exports.getBlockById = getBlockById;

async function addBlock(data) {
	const user = await (new SmsBlockModel()).create(data);
	if (!user.id) throw new Error('db error');
	return user;
}
module.exports.addBlock = addBlock;



async function readBlockList() {
	BLOCK_SET.list = [];
	const rows = await DB.knex({U:TABLE_BLOCK}).select();
	rows.forEach((v) => {
		BLOCK_SET.list.push(v);
	});
	BLOCK_SET.last = (new Date()).getTime();
}
function checkBlockPhone(phone) {
	for (var v of BLOCK_SET.list) {
		let part = v.phone.split('*');
		if (!part[0]) continue;
		if (phone.substr(0, part[0].length) === part[0]) {
			return v;
		}
	}
	return false;
}

async function sendSms(phone, msg) {
	const phonePart = formatPhone(phone);
	try {
		if (phonePart.country==='') throw new Error('WRONG_PHONE_FORMAT');

		const today = new Date();
		if (BLOCK_SET.last < today.getTime() - BLOCK_SET.refresh_dt) {
			await readBlockList();
		}
		let dat = {
			day: dateFormat(today, 'yymmdd'),
			phone: phonePart.country, 
			size: 1,
			type: 0,
		};
		let block = checkBlockPhone(phonePart.phone);
		if (block) {
			await DB.knex(TABLE_BLOCK).where('id', block.id).increment('size');
			dat.type = 1;
		} else {
			await SmsService.sendSms(phonePart.phone, msg);
		}
		let row = await DB.knex(TABLE_STAT).where({day: dat.day, phone: dat.phone}).first();
		if (row) {
			await DB.knex(TABLE_STAT).where({day: dat.day, phone: dat.phone}).increment('size');
		} else {
			await DB.knex(TABLE_STAT).insert(dat);
		}

	} catch (er) {
		console.log('sendSms error:', er.message || er);
		throw new Error('SMS_FAILD');
	}
}
module.exports.sendSms = sendSms;






async function getStatList(filters) {
	const rez = { page: 0, onpage: 20, total: 0, first:0, last:0, items: []};
	if (filters.page && filters.page > 0) rez.page = filters.page;
	if (filters.onpage && filters.onpage > 0 && filters.onpage < 100) rez.onpage = filters.onpage;
	let fields = ['*'];

	try {
		let query = DB.knex({U:TABLE_STAT});
		if (filters.id) query = query.where('U.id', filters.id);
		if (filters.dayfrom) query = query.where('U.day', '>=', date2day(filters.dayfrom));
		if (filters.dayto) query = query.where('U.day', '<=', date2day(filters.dayto));
		if (filters.last && filters.last > 0) query.where('U.id', '<', filters.last);

		let count = await query.clone().count('* as count').first();
		if (count) rez.total = count['count'];

		query = query.offset(rez.page * rez.onpage).limit(rez.onpage).orderBy('U.day', 'desc');
		rez.items = await query.select(fields);

	} catch (er) {
		console.log(er);
		throw new Error('db error');
	}

	return rez;
}
module.exports.getStatList = getStatList;


async function getBlockList(filters) {
	const rez = { page: 0, onpage: 20, total: 0, first:0, last:0, items: []};
	if (filters.page && filters.page > 0) rez.page = filters.page;
	if (filters.onpage && filters.onpage > 0 && filters.onpage < 100) rez.onpage = filters.onpage;
	let fields = ['*'];

	try {
		let query = DB.knex({U:TABLE_BLOCK});
		if (filters.id) query = query.where('U.id', filters.id);
		if (filters.phone) query = query.where('U.phone', 'like', '%'+DB.escapeLike(filters.phone)+'%');
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
module.exports.getBlockList = getBlockList;


function date2day(t) {
	t = String(t);
	if (t.length <=6) return t;
	t = t.split('-').join('').substr(2);
	return t;
}










