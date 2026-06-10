const _ = require('lodash');
const fs = require('fs');
const path = require("path");





class FileStorage
{
	basedir = '';
	path = '';
	dir = '';
	extensions = [];

	constructor(opt) {
		if (opt.basedir) this.basedir = opt.basedir;
		if (opt.dir) this.dir = opt.dir;
		if (opt.extensions) this.extensions = opt.extensions;
	}

	checkValidFile(file) {
		if (!file.originalname || !(file.size > 10) ) return false;
		let ext = this.getExt(file.originalname);
		if (!this.extensions.includes(ext)) return false;

		return true;
	}

	getExt(name) {
		return String(name).split('.').pop().toLowerCase();
	}


	saveFile(file, opt) {
		if (!fs.existsSync(this.basedir)) throw new Error('STORAGE_DIR_FAILD');
		let path = this.basedir + '/' + this.dir;
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path, { recursive: true, mode: 0o777 });
		}

		let name = opt.name;
		let ext = this.getExt(file.originalname);
		if (opt.prefix) name = opt.prefix + name;

		//	if (fs.existsSync(filename)) fs.unlinkSync(filename);
		try {
			fs.writeFileSync(path + '/' + name, file.buffer);
		} catch (er) {
			console.log(er);
			throw new Error('STORAGE_FAILD');
		}

		return {name, ext};
	}

	mkpath(name){
		return this.dir + '/' + name;
	}
	normalizepath(path) {
		return String(path).replace( /^\/+/g, '').replace( /\.\/+/g, '').replace( /^\/+/g, '');
	}




	delete(fname) {
		let path = this.basedir + '/' + this.dir + '/' + fname;

		if (!fs.existsSync(path)) return false;

		fs.unlinkSync(path);

		return true;
	}

	download(res, fname) {
		let path = this.basedir + '/' + this.normalizepath(fname);
console.log(path);
		if (!fs.existsSync(path)) throw new Error('NOT_FOUND');

		res.download(path);
	}


}

module.exports.FileStorage = FileStorage;






