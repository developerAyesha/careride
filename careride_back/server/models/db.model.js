"use strict";
const mysql = require('mysql2');
const logger = require('../services/winston').logger;
const Config = require("../config.js");
const isDev = Config.NODE_ENV === 'development';


const pool = ''/*mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    charset: 'utf8',
    debug: false
}).promise();
*/

const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host : Config.DB_HOST,
    user : Config.DB_USER,
    password : Config.DB_PASSWORD,
    database : Config.DB_DATABASE
  },
/*
  pool: { min: 0, max: 7,
    afterCreate: function (conn, done) {
console.log('conn+');
    }
  },
*/

  debug: isDev,
  log: {
    warn(message) {
      logger.error(message);
console.log('warn', message);
    },
    error(message) {
console.log('error', message);
      logger.error(message);
    },
    deprecate(message) {
console.log('deprecate', message);
    },
    debug(message) {
console.log('debug:', message.sql);
    },
  }
});

function escapeLike(t) {
	return String(t).replace(/\%/g, '\\%').replace(/_/g, '\\_').replace(/\?/g, '\\?');
}


class ModelBase {
	table = '';
	primaryKey = 'id';
	Fields = {};
	Hidden = {};
	CSHEMA = {};
	UpdateFields = {};
	timestamps = true;
	Transaction = null;

	constructor() {
	}
	init(vars) {
		this.Fields[this.primaryKey] = 0;
		for (const v in this.CSHEMA) {
			this.Fields[v] = this.CSHEMA[v].def;
		}
		if (vars) {
			for (const key in vars) {
				this.Fields[key] = vars[key];
			}
		}
	}

	async create(vars) {
		this.inRow(vars);
		if (this.timestamps) this.Fields.createdAt = new Date();
		await this.onPreCreate(this.Fields, vars);

		const tr = this.Transaction || knex;
		const id = await tr(this.table).insert(this.Fields);
		if (!id[0]) throw new Error('DB_ERROR');
		this.Fields[this.primaryKey] = id[0];

		await this.onPostCreate(this.Fields, vars);
		return this;
	}
	async onPreCreate() {
	}
	async onPostCreate() {
	}


	async update(vars) {
		const flds = {};
		for (const key in vars) {
			if (this.CSHEMA[key]) {
				flds[key] = this.inFld(vars[key], this.CSHEMA[key]);
			}
		}
		if (this.timestamps) flds.updatedAt = new Date();
		await this.onPreUpdate(flds);
		const tr = this.Transaction || knex;
		await tr(this.table).where({id: this.Fields[this.primaryKey]}).update(flds);
		await this.onPostUpdate(flds);
		for (const key in flds) {
			this.Fields[key] = flds[key];
		}
	}
	async updateTr(tr, vars) {
		let old = this.Transaction;
		this.Transaction = tr;
		await this.update(vars);
		this.Transaction = old;
	}

	async onPreUpdate(flds) {
	}
	async onPostUpdate(flds) {
	}

	async save() {
		if (Object.keys(this.UpdateFields).length === 0) return;
		const flds = {};
		for (const key in this.UpdateFields) {
			flds[key] = this.Fields[key];
			delete(this.UpdateFields[key]);
		}
		await this.update(flds);
	}

	setFlds(vars) {
		for (const key in vars) {
			if (this.CSHEMA[key]) {
				this.Fields[key] = this.inFld(vars[key], this.CSHEMA[key]);
				this.UpdateFields[key] = 1;
			} else {
				this.Fields[key] = vars[key];
			}
		}
	}

	inRow(vars) {
		for (const key in vars) {
			if (this.CSHEMA[key]) {
				this.Fields[key] = this.inFld(vars[key], this.CSHEMA[key]);
			}
		}
	}
	inFld(val, fld) {
		if (fld.cast) val = this[fld.cast](val);

		switch (fld.type) {
			case 'int':
				if (typeof val == 'undefined') {
					if ('def' in fld) {
						val = fld.def;
					} else {
						val = 0;
					}
				} else {
					val = parseInt(val, 10);
				}
				break;
			case 'string':
				if (typeof val == 'undefined') val = '';
				val = String(val);
				if ('trim' in fld) val = val.trim();
				if ('min' in fld) {
					if (val.length < fld.min) throw new Error('field min length '+fld.min);
				}

				if (val.length > fld.len) val = val.substring(0, fld.len);
				break;
			case 'bool':
				if (val == 'true') {
					val = 1;
				} else {
					val = +val ? 1 : 0;
				}
				break;
			case 'enum':
				if (!(val in fld.enum)) throw new Error('invalid Enum: '+val);
				break;
			case 'numeric':
				if (! /^-?\d+(\.\d+)?$/.test(val)) val = 0;
				break;
			case 'flag':
				return this.inFldFlag(val, fld);
				break;
			case 'json':
				val = this.inFldJson(val, fld);
				if (val.length > fld.len) val = val.substring(0, fld.len);
				break;
		}
		return val;
	}


	inFldFlag(val, fld) {
		if (typeof val !== 'object') return val;
		if (val === null) return fld.def;
		if (!fld.flags) return val;
		let n = 0;
		for (const v in fld.flags) {
			if (val[fld.flags[v]]) {
				n = n | v;
			}
		}
		return n;
	}
	outFldFlag(val, fld) {
		if (!fld.flags) return val;
		const flags = {};
		for (const v in fld.flags) {
			flags[fld.flags[v]] = (val & v) ? 1 : 0;
		}
		return flags;
	}
	inFldJson(val, fld) {
		return JSON.stringify(val);
	}
	outFldJson(val, fld) {
		try {
			val = JSON.parse(val);
		} catch (e) {
			val = {};
		}
		return val;
	}

	setFldJson(name, vars) {
		let obj = (typeof this.Fields[name] === 'string' || this.Fields[name] instanceof String) ? this.outFldJson(this.Fields[name], this.CSHEMA[name]) : this.Fields[name];
		for (const v in vars) {
			obj[v] = vars[v];
		}
		this.Fields[name] = obj;
		this.UpdateFields[name] = 1;
	}
	getFldJson(name, varname) {
		if (typeof this.Fields[name] === 'string' || this.Fields[name] instanceof String) {
			this.Fields[name] = this.outFldJson(this.Fields[name], this.CSHEMA[name]);
		}
		return this.Fields[name][varname];
	}



	get id() {
		return this.Fields.id;
	}

	v(name) {
		return this.Fields[name];
	}



	hide(vars) {
		for (const v of vars) {
			this.Hidden[v] = v;
		}
		return this;
	}
	hideExcept(vars) {
		const names = new Set(vars);
		const ar = Object.keys(this.Fields).filter(v => !names.has(v));
		this.hide(ar);
	}

	useTransaction(tr) {
		this.Transaction = tr;
	}

	async refresh() {
		const row = await knex(this.table).where({id: this.Fields[this.primaryKey] }).first();
		if (!row) return false;
		this.init(row);
		return this;
	}


	toJson(opt) {
		const obj = {};
		if (!opt) opt = {};
		for (const v in this.Fields) {
			if (!this.Hidden[v]) {
				obj[v] = this.Fields[v];
				if (this.CSHEMA[v] && this.CSHEMA[v].type == 'json') {
					obj[v] = this.outFldJson(obj[v], this.CSHEMA[v]);
				}
			}
		}
		this.toJsonAdd(obj, opt);
		return obj;
	}
	toJsonAdd(obj, opt) {
	}

}



class Collection extends Array {
  constructor() {
    super();
  }

  toJson() {
    return this.map((v)=> v.toJson());
  }
}

class PaginateCollection {
  page= 0;
  onpage= 20;
  total= 0;
  first= 0;
  last= 0;
  items= new Collection();

  getLast() {
    return this.items.slice(-1).pop();
  }


  toJson() {
    return {
      page: this.page,
      onpage: this.onpage,
      total: this.total,
      first: this.first,
      last: this.last,
      items: this.items.toJson(),
    }
  }
}





module.exports = { pool, knex, ModelBase, Collection, PaginateCollection, escapeLike };

