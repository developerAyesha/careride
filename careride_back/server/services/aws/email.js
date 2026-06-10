const Config = require("../../config.js");
const logger = require('../winston').logger;
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const SNSCONFIG = Config.AMAZON_AWS.SES;


const createSendEmailCommand = (params) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: [
      ],
      ToAddresses: [
        params.to,
      ],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: params.html,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: params.subject,
      },
    },
    Source: params.from,
    ReplyToAddresses: [
      /* more items */
    ],
  });
};

module.exports.sendEmail = async function(params) {
  params.from = SNSCONFIG.fromAddress;

  const sendEmailCommand = createSendEmailCommand(params);

  logger.info('sendSms', params );
  if (!SNSCONFIG.region || !SNSCONFIG.accessKeyId || !SNSCONFIG.secretAccessKey) {
    return;
  }

  const sesClient = new SESClient({
    region: SNSCONFIG.region,
      credentials: {
        accessKeyId: SNSCONFIG.accessKeyId,
        secretAccessKey: SNSCONFIG.secretAccessKey,
      }
    });

  let publish;
  try {
    publish = await sesClient.send(sendEmailCommand);
  } catch (e) {
    logger.error("Failed to send email.", e);
    return e;
  }

  logger.info('publish', publish);

  return true;
};






