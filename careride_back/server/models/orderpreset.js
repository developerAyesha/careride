const Config = require("./../config.js");
const DB = require("./db.model");
const _ = require('lodash');
const Decimal = require('decimal.js');

const TABLE = 'order_preset';


class OrderPresetModel extends DB.ModelBase{
	table = TABLE;
	CSHEMA = {
		client_id: {type: 'int', def:0 },
		vendor_id: {type: 'int', def:0 },
		title: {type: 'string', len: 64, def:''},

		whoride: {type: 'int', def:0 },   //1-Me, 2=Patient
		cartype: {type: 'int', def:0 },   //1=Wheelchair, 2=Gurney
		weight: {type: 'numeric', def:0},
		height: {type: 'numeric', def:0},
		gender: {type: 'string', len: 1, def:'' },   // m, f
		datebirth: {type: 'int', def:0 },
		wheelchair: {type: 'int', def:0 },
		escort: {type: 'int', def:0 },   //1=Spouse, 2=Son, 3=Daughter, 4=Other

		services: {type: 'int', def:0 },  //sets of services

		contact: {type: 'string', len: 16, def:''},
		instruction: {type: 'string', len: 32000, def:''},
		reason: {type: 'string', len: 64, def:''},

	}




	constructor(vars) {
		super(vars);
		this.init(vars);
	}






	async onPreCreate(Fields, vars) {
		if (String(Fields.title).length < 1) throw new Error('EMPTY_TITLE');

		if (!_.isObject(vars.services)) vars.services = {};
		Fields.services = DB.Vendor.packServices(vars.services);
	}
	async onPostCreate(Fields, vars) {
	}








	async destroy() {
		await DB.knex(this.table).where({id: this.Fields.id}).delete();

	}

	toJsonAdd(obj, opt) {
		if ('services' in obj) obj.services = DB.Vendor.unpackServices(obj.services);
	}


}
module.exports.OrderPresetModel = OrderPresetModel;






async function getById(id) {
	const row = await DB.knex(TABLE).where({id: id}).first();
	if (!row) return false;
	return new OrderPresetModel(row);
}
module.exports.getById = getById;


async function addOrderPreset(data) {
	data.services = 0;
	const order = await (new OrderPresetModel()).create(data);
	if (!order.id) throw new Error('db error');
	return order;
}
module.exports.addOrderPreset = addOrderPreset;






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
				rez.items.push( new OrderPresetModel(v));
			});

		}

	} catch (er) {
		console.log(er);
		throw new Error('db error');
	}

	return rez;
}
module.exports.getList = getList;








