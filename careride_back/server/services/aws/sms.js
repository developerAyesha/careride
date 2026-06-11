const Config = require("../../config.js");
const path = require("path");
const logger = require('../winston').logger;
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const SNSCONFIG = Config.AMAZON_AWS.SNS;



module.exports.sendSms = async function(phone, msg) {

	const params = {
		Message: msg, /* required */
		PhoneNumber: phone2full(phone),       //E.164_PHONE_NUMBER
	};

	logger.info('sendSms', params );
	if (!SNSCONFIG.region || !SNSCONFIG.accessKeyId || !SNSCONFIG.secretAccessKey) {
		logger.warn('sendSms skipped: AWS SNS credentials not configured');
		return { ok: false, error: 'SNS_NOT_CONFIGURED' };
	}

	const snsClient = new SNSClient({
		region: SNSCONFIG.region,
		credentials: {
			accessKeyId: SNSCONFIG.accessKeyId,
			secretAccessKey: SNSCONFIG.secretAccessKey,
		}
	})
	try {
		const publish = await snsClient.send(new PublishCommand(params));
		logger.info('publish', publish);
		return { ok: true };
	} catch (e) {
		logger.error('sendSms failed', e);
		return { ok: false, error: e.message || String(e) };
	}
};

function phone2full(p) {
	return '+' + String(p);
}





