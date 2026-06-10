const Config = require("../../config.js");

const paylogger = require('../winston').paylogger;
const Models = require("../../models");
const Stripe = require("stripe")(Config.PAYMENTS.STRIPE.secret_key);

// Replace this endpoint secret with your endpoint's unique secret
// If you are testing with the CLI, find the secret by running 'stripe listen'
// If you are using an endpoint defined with the API or dashboard, look in your webhook settings
// at https://dashboard.stripe.com/webhooks
// endpoint Secret  like  'whsec_...'



module.exports.getPublicKey = function() {
	return Config.PAYMENTS.STRIPE.public_key;
}


module.exports.createPaymentIntent = async function(par) {
	paylogger.info('STRIPE_API: PaymentIntent ', par);
	try {
		const opt = {
			amount: par.amount,
			currency: par.currency,
			payment_method_types: ['card'],
			capture_method: 'manual',
			//automatic_payment_methods: {enabled: true,},
		};
		let paymentIntent = {};
		let out = {pk: Config.PAYMENTS.STRIPE.public_key};
		if (par.stripeAccount) {
			if (par.application_fee_amount) opt.application_fee_amount = par.application_fee_amount;
			paymentIntent = await Stripe.paymentIntents.create(opt, {stripeAccount: par.stripeAccount});
			out.acc = par.stripeAccount;
		} else {
			paymentIntent = await Stripe.paymentIntents.create(opt);
		}

		out.clientSecret = paymentIntent.client_secret;

		return out;
	} catch (er) {
		paylogger.error('PAY_API_ERROR: ', er);
		throw new Error('PAY_API_ERROR: ' + er.message);
	}
};

module.exports.capturePaymentIntent = async function(par) {
	paylogger.info('STRIPE_API: capture ', par);
	const opt = {};
	if (par.amount_to_capture) {
		opt.amount_to_capture = par.amount_to_capture;
	}

	try {
		let paymentIntent = {};
		if (par.stripeAccount) {
			paymentIntent = await Stripe.paymentIntents.capture(par.pi, opt, {stripeAccount: par.stripeAccount} );
		} else {
			paymentIntent = await Stripe.paymentIntents.capture(par.pi, opt);
		}

		return true;
	} catch (er) {
		paylogger.error('PAY_API_ERROR: ', er);
		if (er.code == 'payment_intent_unexpected_state') return true;
		throw new Error('PAY_API_ERROR');   //TODO may be not error 
	}
};

module.exports.cancelPaymentIntent = async function(par) {
	paylogger.info('STRIPE_API: cancel ', par);

	try {
		let paymentIntent;
		if (par.stripeAccount) {
			paymentIntent = await Stripe.paymentIntents.cancel(par.pi, {stripeAccount: par.stripeAccount});
		} else {
			paymentIntent = await Stripe.paymentIntents.cancel(par.pi);
		}

		return true;
	} catch (er) {
		if (er.code == 'payment_intent_unexpected_state') return true;
		paylogger.error('PAY_API_ERROR: ', er);
		throw new Error('PAY_API_ERROR');
	}
};



module.exports.accountCreate = async function(par) {
	paylogger.info('STRIPE_API: accountCreate ', par);

	try {
		const opts = {
			type: 'express',
			business_type: 'individual',
			country: 'US',
			capabilities: {card_payments: {requested: true}, transfers: {requested: true}},
		};

		if (par.email) opts.email = par.email;
		if (par.company_name) opts.company = {name: par.company_name};
		if (par.phone) opts.company.phone = par.phone;

		const account = await Stripe.accounts.create(opts);
		return account;
	} catch (er) {
		paylogger.error('PAY_API_ERROR: ', er);
		throw new Error('PAY_API_ERROR');
	}
};
module.exports.accountLinksCreate = async function(par) {
	paylogger.info('STRIPE_API: accountLinksCreate ', par);

	try {
		const opts = {
			type: 'account_onboarding',
			account: par.account,
			refresh_url: Config.SERVER_LINK + '/vendor/orders/available',
			return_url: Config.SERVER_LINK + '/vendor/orders/available',
		};

		const accountLink = await Stripe.accountLinks.create(opts);
		return accountLink;
	} catch (er) {
		paylogger.error('PAY_API_ERROR: ', er);
		throw new Error('PAY_API_ERROR');
	}
};

module.exports.accountRetrieve = async function(par) {
	paylogger.info('STRIPE_API: accountRetrieve ', par);

	try {
		const account = await Stripe.accounts.retrieve(par.account);
console.log(account);
		return account;
	} catch (er) {
		paylogger.error('PAY_API_ERROR: ', er);
		throw new Error('PAY_API_ERROR');
	}
};

module.exports.accountDelete = async function(par) {
	paylogger.info('STRIPE_API: accountDelete ', par);

	try {
		const deleted = await Stripe.accounts.del(par.account);
		paylogger.error('PAY_API_ERROR: ', deleted);
		return deleted;
	} catch (er) {
		paylogger.error('PAY_API_ERROR: ', er);
		throw new Error('PAY_API_ERROR');
	}
};






module.exports.webhook = async function(request, params) {
	let event = request.body;
	let out = {};

	paylogger.info('webhook: '+ JSON.stringify(event) );

	let endpointSecret = Config.PAYMENTS.STRIPE.endpointSecret;
	if (params.mode && (params.mode === 'connect') ) {
		endpointSecret = Config.PAYMENTS.STRIPE.acc_endpointSecret;
	}


	// Only verify the event if you have an endpoint secret defined.
	// Otherwise use the basic event deserialized with JSON.parse
	if (endpointSecret) {
		// Get the signature sent by Stripe
		const signature = request.headers['stripe-signature'];
		try {
			event = Stripe.webhooks.constructEvent(request.rawBody, signature, endpointSecret);
		} catch (err) {
			paylogger.error('PAY_API_ERROR: signature verification failed' + err.message);
			throw new Error('PAY_API_ERROR: signature verification failed');    // response.sendStatus(400);
		}
	}

	// Handle the event
	switch (event.type) {
		case 'payment_intent.succeeded':
			var paymentIntent = event.data.object;
			out.pi = paymentIntent.id;
			out.event = 'PAY_OK';
			out.detail = {
				id: event.id,
				created: event.created,
			}
			// handlePaymentIntentSucceeded(paymentIntent);
			break;
		case 'payment_intent.amount_capturable_updated':
			var paymentIntent = event.data.object;
			out.pi = paymentIntent.id;
			out.event = 'HOLD_OK';
			break;
		case 'payment_method.attached':
			let paymentMethod = event.data.object;
			// Then define and call a method to handle the successful attachment of a PaymentMethod.
			// handlePaymentMethodAttached(paymentMethod);
			break;
		case 'account.updated':
			// check the state of the 'details_submitted' parameter on their account 
			// charges_enabled: false,   If the account isn�t fully onboarded, provide UI prompts to allow the user to continue onboarding later
			var account = event.data.object;
			out.acc = account.id;
			if (account.charges_enabled) {
				out.event = 'ACCOUNT_COMPLETE';
			}
			break;
		default:
			// Unexpected event type
			paylogger.info(`Unhandled event type ${event.type}.`);
		}

	// Return a 200 response to acknowledge receipt of the event
	return out;
};

