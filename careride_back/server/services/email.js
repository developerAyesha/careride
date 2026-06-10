const nodemailer = require('nodemailer');
const winston = require('../services/winston').logger;
const appRoot = require('app-root-path');
const fs = require('fs');
const mailPath = appRoot + '/server/mails/';
const Config = require("../config.js");
const Sns = require('../services/aws/email');
const { dateFormat } = require('../utils/dateformat');


var transportOptions = {
	host: Config.MAILER.MAIL_HOST,
	port: Config.MAILER.MAIL_PORT,
	secure: !!Config.MAILER.MAIL_SECURE, // true for 465, false for other ports
	auth: {
		user: Config.MAILER.MAIL_USER,
		pass: Config.MAILER.MAIL_PASS,
	},
}
var isLog = Config.MAILER.MAIL_LOG;


async function send(msg) {

	msg.from = Config.MAILER.MAIL_FROM;

	let transporter = nodemailer.createTransport(transportOptions);

	if (isLog) {
		winston.info(msg);
	}
	if (Config.MAILER.TEST_MODE) return 'test-id';

	try {
		var info = await transporter.sendMail(msg);
	} catch (e) {
		winston.info(e);
	}
	winston.info("Message sent: %s", info.messageId);
	return info.messageId;
}

function renderBody(name, msg, vars) {
	const file = mailPath + name + '.html';
	var t = fs.readFileSync(file, 'utf8');
	if (!t) return;
	vars['site'] = Config.SERVER_LINK;

	for (var prop in vars) {
		t = t.replace('{' + prop + '}', vars[prop]);
		t = t.replace('{' + prop + '}', vars[prop]);
	}

	var a = t.indexOf("\n");
	msg.subject = t.substring(0, a).trim();
	msg.html = t.substr(a).trim();
}



async function sendActivationMail( email, vars ) {
	var msg = {
		to: email, // list of receivers
		subject: "", // Subject line
		html: "", // html body
	}
	renderBody('registration/index', msg, vars);


	await send(msg).catch(err => {
		winston.error(err.message);
	});

	return true;
}

async function sendResetMail( email, vars ) {
	var msg = {
		to: email, // list of receivers
		subject: "", // Subject line
		html: "", // html body
	}
	renderBody('reset/index', msg, vars);

	await send(msg).catch(err => {
		winston.error(err.message);
	});

	return true;
}

async function sendChangeEmailMail( email, vars ) {
	var msg = {
		to: email, // list of receivers
		subject: "", // Subject line
		html: "", // html body
	}
	renderBody('change_email', msg, vars);

	await send(msg).catch(err => {
		winston.error(err.message);
	});

	return true;
}


async function sendFeedbackMail( email, vars ) {
	var msg = {
		to: email, // list of receivers
		subject: "", // Subject line
		html: "", // html body
	}
	renderBody('feedback', msg, vars);


	await Sns.sendEmail(msg);

	return true;
}

async function sendNewOrderAdmin( opt ) {
	if (String(opt.email).indexOf('@') < 1) return;

	const msg = {
		to: opt.email, // list of receivers
		subject: '', // Subject line
		html: "", // html body
	}

	const client = opt.order.Client;
	await client.refresh();

	let rows = [];
	opt.vendors.forEach((v) => {
		rows.push('<tr><td>' + [
			v.v('company_name'),
			v.v('email'),
			v.v('login'),
			v.v('order')?.price,
			].join('</td><td>') +'</td></tr>')
	});

	const vars = {
		order_id: opt.order.id,
		client_full: [client.v('first_name'), client.v('second_name'), client.v('last_name') ].join(' '),
		client_phone: client.v('login'),
		client_email: client.v('email'),
		point_from: opt.order.v('pfrom_addr'),
		point_to: opt.order.v('pto_addr'),
		distance: opt.order.v('distance'),
		table_rows: rows.join(''),
		order_date: dateFormat(opt.order.getLocalOrderDate(), 'mm-dd-yyyy hh:MM TT'),
	};

	renderBody('orderadmin', msg, vars);

	await Sns.sendEmail(msg);

	return true;
}





module.exports = {
  renderBody,
  sendResetMail,
  sendActivationMail,
  sendFeedbackMail,
  sendChangeEmailMail,
  sendNewOrderAdmin,
};
