const _ = require('lodash');
const DB = require("./db.model");


const TABLE = 'car_inf';
const TABLE_CITY = 'car_city';

class VendorCarModel extends DB.ModelBase{
	table = TABLE;
	CSHEMA = {
		vendor_id: {type: 'int', def:0 },
		busy: {type: 'int', def:0 },
		block: {type: 'int', def:0 },    //0-norm,  1-blocked
		model: {type: 'string', len: 64, def:''},
		plate: {type: 'string', len: 32, def:''},
		color: {type: 'string', len: 32, def:''},
		city: {type: 'string', len: 64, def:''},
		city_id: {type: 'int', def:0 },
		city_radius: {type: 'int', def:0 },
		cartype: {type: 'int', def:0 },         //1=Wheelchair, 2=Gurney
		pricemile: {type: 'numeric', def:0},
	}


	constructor(vars) {
		super(vars);
		this.init(vars);
	}

	get Vendor() {
		return new DB.Vendor.VendorUserModel({id: this.Fields.vendor_id});
	}



	async onPreCreate(Fields) {
		if (String(Fields.model).length < 1) throw new Error('EMPTY_MODEL');

		let inf = await DB.knex(this.table).where({vendor_id: this.Fields.vendor_id, plate: Fields.plate}).first();
		if (inf && (inf.id != this.id) ) throw new Error('PLATE_NUMBER_USED');

		if (String(Fields.city).length > 1) {
			Fields.city_id = await DB.City.findId(Fields.city);
		}

		const vendor = await DB.Vendor.getUserById(Fields.vendor_id);

	}
	async onPostCreate() {
		await this.Vendor.updateCarCount();
	}


	async onPreUpdate(flds) {
		if ('plate' in flds) {
			let inf = await DB.knex(this.table).where({vendor_id: this.Fields.vendor_id, plate: flds.plate}).first();
			if (inf && (inf.id != this.id) ) throw new Error('PLATE_NUMBER_USED');
		}
		if ('city' in flds) {
			if (String(flds.city).length > 1) {
				flds.city_id = await DB.City.findId(flds.city);
			}
		}
	}



	isBusy() {
		return this.Fields.busy > 0;
	}
	async setBusy(order_id) {
		await this.update({busy: order_id});
	}



	async doBlock(g) {
		if (g == 0) await this.update({block: 0});
		if (g == 1) await this.update({block: 1});
	}



	async setCities(list) {
		if (!_.isArray(list)) return;
		try {
			await DB.knex(TABLE_CITY).where({car_id: this.Fields.id}).delete();
			this.Fields.cities = [];
			for (let name of list) {
				if (!DB.City.validCity(name)) continue;
				let city_id = await DB.City.findId(name);
				let f = this.Fields.cities.findIndex( (v) => v.city_id === city_id );
				if (f > -1) continue;
				await DB.knex(TABLE_CITY).insert({car_id: this.id, city_id: city_id});
				this.Fields.cities.push({city_id: city_id, title: name});
			}
		} catch (er) {
			console.log(er);
			throw new Error('db error');
		}
	}




	async destroy() {
		await DB.knex(TABLE_CITY).where({car_id: this.Fields.id}).delete();
		await DB.knex(this.table).where({id: this.Fields.id}).delete();
		await this.Vendor.updateCarCount();
	}



}
module.exports.VendorCarModel = VendorCarModel;
module.exports.TABLE = TABLE;





async function getById(id) {
	const row = await DB.knex(TABLE).select().where({id: id}).first();
	if (!row) throw new Error('NOT_FOUND');
	return new VendorCarModel(row);
}
module.exports.getById = getById;


async function addCar(data) {
	const user = await (new VendorCarModel()).create(data);
	if (!user.id) throw new Error('db error');
	return user;
}
module.exports.addCar = addCar;


async function fillCities(cars) {
	const carMap = {};
	let ids = cars.map( (v) => {
		v.cities = [];
		carMap[v.id] = v;
		return v.id;
	} );

	let rows = await DB.knex({T:TABLE_CITY})
		.join({C: 'cities'}, function() {
				this.on('C.id', '=', 'T.city_id');
		})
		.whereIn('T.car_id', ids).select(['T.car_id', 'T.city_id', 'C.title']);
	rows.forEach((v) => { 
		carMap[v.car_id].cities.push({city_id: v.city_id, title: v.title});
	});

}



async function getList(filters) {
	const rez = { page: 0, onpage: 20, total: 0, first:0, last:0, items: []};
	if (filters.page && filters.page > 0) rez.page = filters.page;
	if (filters.onpage && filters.onpage > 0 && filters.onpage < 100) rez.onpage = filters.onpage;
	let fields = ['*'];

	try {
		let query = DB.knex({U:TABLE});
		if (filters.id)  query.where('U.id', filters.id);
		if ('vendor_id' in filters) query.where('U.vendor_id', filters.vendor_id);
		if ('block' in filters) query.where('U.block', filters.block);
		if ( ('busy' in filters) && _.isInteger(filters.busy) ) {
			if (filters.busy == 0) {
				query.where('U.busy', 0);
			}
		}
		if ('city_id' in filters) {
			query.join({M: TABLE_CITY}, function() {
				this.on('M.car_id', '=', 'U.id');
			});
			query.where('M.city_id', filters.city_id);
		}
		if ('plate' in filters) query.where('U.plate', 'like', '%'+DB.escapeLike(filters.plate)+'%');

		if (filters.last && filters.last > 0) query.where('U.id', '<', filters.last);


		let count = await query.clone().count('* as count').first();
		if (count) rez.total = count['count'];

		query = query.offset(rez.page * rez.onpage).limit(rez.onpage).orderBy('U.id', 'desc');
		rez.items = await query.select(fields);

		if (rez.items && rez.items.length) {
			rez.first = rez.items[0].id;
			if (rez.items.length == rez.onpage) rez.last = rez.items[rez.items.length - 1].id;
			if (filters.fillCities) {
				await fillCities(rez.items);
			}
		}

	} catch (er) {
		console.log(er);
		throw new Error('db error');
	}

	return rez;
}
module.exports.getList = getList;








