const Config = require('../config');
const DB = require('../models/db.model');
const Sms = require('../models/sms');
const mailer = require('./email');
const logger = require('./winston').logger;
const { dateFormat } = require('../utils/dateformat');

const TABLE_VND = 'order_vendor';

function clientAppUrl(path) {
	const base = String(Config.CLIENT_APP_URL || Config.SERVER_LINK).replace(/\/$/, '');
	return base + path;
}

function paymentUrl(orderId) {
	return clientAppUrl('/ride/step-5?order_id=' + orderId);
}

function logResult(event, channel, recipient, result, err) {
	const ok = result && result.ok !== false && !err;
	const payload = { event, channel, recipient, ok };
	if (!ok) payload.error = (err && err.message) || (result && result.error) || 'UNKNOWN';
	if (ok) {
		logger.info('notify', payload);
	} else {
		logger.warn('notify failed', payload);
	}
}

async function sendSmsTo(phone, templateName, vars, event) {
	if (!phone) return;
	try {
		const msg = mailer.renderSms(templateName, vars);
		if (!msg) throw new Error('SMS_TEMPLATE_EMPTY');
		await Sms.sendSms(phone, msg);
		logResult(event, 'sms', phone, { ok: true });
	} catch (e) {
		logResult(event, 'sms', phone, { ok: false }, e);
	}
}

async function sendEmailTo(email, templateName, vars, event) {
	if (!email || String(email).indexOf('@') < 1) return;
	try {
		const result = await mailer.sendTemplateSes(email, templateName, vars);
		if (result && result.ok === false) throw new Error(result.error || 'SES_FAILED');
		logResult(event, 'email', email, result || { ok: true });
	} catch (e) {
		logResult(event, 'email', email, { ok: false }, e);
	}
}

function fullName(user) {
	return [user.v('first_name'), user.v('second_name'), user.v('last_name')].filter(Boolean).join(' ').trim();
}

async function buildOrderVars(order) {
	const client = order.Client;
	await client.refresh();

	let vendorName = '';
	if (order.Fields.vendor_id > 0) {
		const vendor = order.Vendor;
		if (await vendor.refresh()) {
			vendorName = vendor.v('company_name') || fullName(vendor);
		}
	}

	return {
		order_id: order.id,
		client_name: fullName(client) || 'Customer',
		client_phone: client.v('login'),
		client_email: client.v('email'),
		point_from: order.v('pfrom_addr'),
		point_to: order.v('pto_addr'),
		distance: order.v('distance'),
		price: order.v('price'),
		order_date: dateFormat(order.getLocalOrderDate(), 'mm-dd-yyyy hh:MM TT'),
		vendor_name: vendorName,
		payment_url: paymentUrl(order.id),
		site: Config.CLIENT_APP_URL || Config.SERVER_LINK,
	};
}

async function getVendorIds(order) {
	const ids = [];
	if (order.Fields.vendor_id > 0) {
		ids.push(order.Fields.vendor_id);
	} else {
		const rows = await DB.knex(TABLE_VND).where({ order_id: order.Fields.id }).select();
		for (const v of rows) ids.push(v.vendor_id);
	}
	return ids;
}

async function getVendors(order, opts) {
	const ids = await getVendorIds(order);
	if (!ids.length) return [];

	const filters = { page: 0, onpage: 100, id: ids };
	if (opts && opts.fillServices) {
		filters.fillServices = 1;
		filters.order = order;
	}
	const vendorlist = await DB.Vendor.getList(filters);
	return vendorlist.items || [];
}

async function getAdminEmail() {
	if (Config.ADMIN_NOTIFY_EMAIL && String(Config.ADMIN_NOTIFY_EMAIL).indexOf('@') > 0) {
		return Config.ADMIN_NOTIFY_EMAIL;
	}
	try {
		const staff = await DB.Staff.getUserById(1);
		return staff.v('email') || '';
	} catch (e) {
		return '';
	}
}

async function orderSubmitted(order) {
	const vars = await buildOrderVars(order);
	const client = order.Client;
	await client.refresh();

	await sendSmsTo(client.v('login'), 'booking_submitted', vars, 'order_submitted');
	await sendEmailTo(client.v('email'), 'order_client_confirm', vars, 'order_submitted');
}

async function vendorMatched(order) {
	const vars = await buildOrderVars(order);
	const vendors = await getVendors(order, { fillServices: true });

	for (const vendor of vendors) {
		const vvars = Object.assign({}, vars, {
			vendor_name: vendor.v('company_name') || fullName(vendor),
			price: vendor.v('order')?.price || vars.price,
		});
		await sendSmsTo(vendor.v('login'), 'vendor_new_order', vvars, 'vendor_matched');
		await sendEmailTo(vendor.v('email'), 'order_vendor_alert', vvars, 'vendor_matched');
	}
}

async function notifyAdmin(order) {
	const vendors = await getVendors(order, { fillServices: true });
	const email = await getAdminEmail();
	if (!email) {
		logger.warn('notify admin skipped: no admin email configured');
		return;
	}
	try {
		const result = await mailer.sendNewOrderAdmin({ order, vendors, email });
		if (result && result.ok === false) throw new Error(result.error || 'ADMIN_EMAIL_FAILED');
		logResult('order_admin', 'email', email, result || { ok: true });
	} catch (e) {
		logResult('order_admin', 'email', email, { ok: false }, e);
	}
}

async function vendorAssigned(order) {
	const vars = await buildOrderVars(order);
	const client = order.Client;
	await client.refresh();

	await sendSmsTo(client.v('login'), 'vendor_assigned_client', vars, 'vendor_assigned');
	await sendEmailTo(client.v('email'), 'order_assigned', vars, 'vendor_assigned');

	const vendor = order.Vendor;
	if (await vendor.refresh()) {
		const vvars = Object.assign({}, vars, {
			vendor_name: vendor.v('company_name') || fullName(vendor),
		});
		await sendSmsTo(vendor.v('login'), 'vendor_assigned_vendor', vvars, 'vendor_assigned');
	}
}

async function paymentLinkSent(order) {
	const vars = await buildOrderVars(order);
	const client = order.Client;
	await client.refresh();

	await sendSmsTo(client.v('login'), 'payment_link', vars, 'payment_link');
	await sendEmailTo(client.v('email'), 'order_payment_link', vars, 'payment_link');
}

async function paymentReceived(order) {
	const vars = await buildOrderVars(order);
	const client = order.Client;
	await client.refresh();

	await sendSmsTo(client.v('login'), 'payment_ok', vars, 'payment_received');
	await sendEmailTo(client.v('email'), 'order_payment_success', vars, 'payment_received');
}

async function paymentFailed(order, reason) {
	const vars = await buildOrderVars(order);
	vars.fail_reason = reason || 'Payment could not be processed';
	const client = order.Client;
	await client.refresh();

	await sendSmsTo(client.v('login'), 'payment_fail', vars, 'payment_failed');
	await sendEmailTo(client.v('email'), 'order_payment_failed', vars, 'payment_failed');
}

async function rideConfirmed(order) {
	const vars = await buildOrderVars(order);
	const client = order.Client;
	await client.refresh();

	const clientVars = Object.assign({}, vars, { recipient_name: vars.client_name });
	await sendSmsTo(client.v('login'), 'ride_confirmed', vars, 'ride_confirmed');
	await sendEmailTo(client.v('email'), 'order_confirmed', clientVars, 'ride_confirmed');

	if (order.Fields.vendor_id > 0) {
		const vendor = order.Vendor;
		if (await vendor.refresh()) {
			const vvars = Object.assign({}, vars, {
				recipient_name: vendor.v('company_name') || fullName(vendor),
			});
			await sendSmsTo(vendor.v('login'), 'ride_confirmed', vars, 'ride_confirmed');
			await sendEmailTo(vendor.v('email'), 'order_confirmed', vvars, 'ride_confirmed');
		}
	}
}

async function rideCancelled(order, par) {
	const vars = await buildOrderVars(order);
	const by = (par && par.by) || 'system';
	const reason = (par && par.reason) || order.v('reason') || '';

	const byLabels = { client: ' by the client', vendor: ' by the provider', admin: ' by CareRide support' };
	vars.cancel_by_text = byLabels[by] || '';
	vars.cancel_reason_block = reason
		? '<p><strong>Reason:</strong> ' + String(reason).replace(/</g, '&lt;') + '</p>'
		: '';

	const client = order.Client;
	await client.refresh();

	const clientVars = Object.assign({}, vars, { recipient_name: vars.client_name });
	await sendSmsTo(client.v('login'), 'ride_cancelled', vars, 'ride_cancelled');
	await sendEmailTo(client.v('email'), 'order_cancelled', clientVars, 'ride_cancelled');

	if (order.Fields.vendor_id > 0) {
		const vendor = order.Vendor;
		if (await vendor.refresh()) {
			const vvars = Object.assign({}, vars, {
				recipient_name: vendor.v('company_name') || fullName(vendor),
			});
			await sendSmsTo(vendor.v('login'), 'ride_cancelled', vars, 'ride_cancelled');
			await sendEmailTo(vendor.v('email'), 'order_cancelled', vvars, 'ride_cancelled');
		}
	}

	const adminEmail = await getAdminEmail();
	if (adminEmail) {
		const avars = Object.assign({}, vars, { recipient_name: 'Admin' });
		await sendEmailTo(adminEmail, 'order_cancelled', avars, 'ride_cancelled');
	}
}

async function safe(fn, ...args) {
	try {
		await fn(...args);
	} catch (e) {
		logger.error('notify.safe error: ' + (e.message || e));
	}
}

module.exports = {
	safe,
	orderSubmitted,
	vendorMatched,
	notifyAdmin,
	vendorAssigned,
	paymentLinkSent,
	paymentReceived,
	paymentFailed,
	rideConfirmed,
	rideCancelled,
};
