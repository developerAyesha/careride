const path = require("path");
const ROOT_PATH = path.dirname(path.dirname(require.main.filename));


class Config {
    NODE_ENV = 'development';
    ROOT_PATH = ROOT_PATH;
    SERVER_PORT = 3000;
    SERVER_LINK = 'https://careride.iskytest.com';
    DEBUG = 1;
    CORS_ORIGIN = "http://localhost:3000,http://localhost,http://localhost:8080,https://careride.iskytest.com";

    DB_HOST = 'mysql-careride';
    DB_USER = '';
    DB_PASSWORD = '';
    DB_DATABASE = '';

    JWT_SECRET = '';

    TIME_ZONE = 'UTC';   // Europe/Kiev

    MAILER = {
        MAIL_HOST: 'smtp.gmail.com',
        MAIL_PORT: 465,
        MAIL_SECURE: 1,
        MAIL_USER: 'support@bitok.biz',
        MAIL_PASS: '',
        MAIL_FROM: '',
        MAIL_LOG: 1,
        TEST_MODE: 1,   // true=no real send, false= real mode
    };

    FEEDBACK_MAIL_TO = 'lnrznch@gmail.com';

    ORDER_COMMISSION = 15;
    ORDER_EXPIRED_NEW = 900 ;//900=15min  180=3min
    ORDER_EXPIRED_PAY = 900 ;//900=15min


    PAYMENTS = {
        STRIPE: {
            public_key: '',
            secret_key: '',
            endpointSecret: '',//'whsec_...',
            acc_endpointSecret: '',   //for connected accounts
        },
    };

    AMAZON_AWS = {
        apiVersion: '2010-03-31',
        SNS: {
            region: 'us-west-1',
            accessKeyId: '',
            secretAccessKey: '',
        },
        SES: {
            region: 'us-west-1',
            accessKeyId: '',
            secretAccessKey: '',
            fromAddress: 'Support@careride.com',
        },
        S3: {
            region: 'us-west-1',
            accessKeyId: '',
            secretAccessKey: '',
        },
    };



    GOOGLE_CLIENT_ID= '';
    GOOGLE_CLIENT_SECRET= '';

    FACEBOOK_APP_ID= '';
    FACEBOOK_APP_SECRET= '';

    RECAPTCHA_SECRET_KEY = '';




    setVar(name, value) {
        this[name] = value;
    }

}


const config = new Config();

process.env.NODE_ENV = config.NODE_ENV;
process.env.TZ = config.TIME_ZONE;

module.exports = config;
