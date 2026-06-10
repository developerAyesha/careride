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
		return;
	}

	const snsClient = new SNSClient({
		region: SNSCONFIG.region,
		credentials: {
			accessKeyId: SNSCONFIG.accessKeyId,
			secretAccessKey: SNSCONFIG.secretAccessKey,
		}
	})
	const publish = await snsClient.send(new PublishCommand(params));

	logger.info('publish', publish);

	return true;
};

function phone2full(p) {
	return '+' + String(p);
}





