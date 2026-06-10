const DB = require("./db.model");


const TABLE = 'cities';



function strCity(s) {
	return String(s).trim().replace(/\s{2,}/g, ' ').replace(/\s,/g,',')
}

function validCity(title) {
	title = strCity(title);
	return title.split(',').length === 2;
}
module.exports.validCity = validCity;



async function findId(title) {
	title = strCity(title);

	const row = await DB.knex(TABLE).where({title: title}).first();
	if (row) return row.id;
	const add = await DB.knex(TABLE).insert({code: 0, title: title, createdAt: new Date() });

	return add[0];
}
module.exports.findId = findId;

async function getId(title) {
	title = strCity(title);
	const row = await DB.knex(TABLE).where({title: title}).first();
	if (row) return row.id;
	return 0;
}
module.exports.getId = getId;



async function getList(filters) {
	const rez = { page: 0, onpage: 20, total: 0, first:0, last:0, items: []};
	if (filters.page && filters.page > 0) rez.page = filters.page;
	if (filters.onpage && filters.onpage > 0 && filters.onpage < 100) rez.onpage = filters.onpage;
	let fields = ['*'];

	try {
		let query = DB.knex({U:TABLE});
		if (filters.id) query = query.where('U.id', filters.id);
		if ('vendor_id' in filters) query = query.where('U.vendor_id', filters.vendor_id);
		if ('block' in filters) query = query.where('U.block', filters.block);
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








