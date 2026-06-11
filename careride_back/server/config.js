const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const ROOT_PATH = path.dirname(path.dirname(require.main.filename));

const env = (key, fallback = "") => (process.env[key] !== undefined ? process.env[key] : fallback);
const envInt = (key, fallback) => {
	const val = process.env[key];
	return val !== undefined && val !== "" ? parseInt(val, 10) : fallback;
};

class Config {
	NODE_ENV = env("NODE_ENV", "development");
	ROOT_PATH = ROOT_PATH;
	SERVER_PORT = envInt("SERVER_PORT", 3001);
	SERVER_LINK = env("SERVER_LINK", "http://localhost:3001");
	CLIENT_APP_URL = env("CLIENT_APP_URL", "http://localhost:3000");
	ADMIN_NOTIFY_EMAIL = env("ADMIN_NOTIFY_EMAIL", "");
	DEBUG = envInt("DEBUG", 1);
	CORS_ORIGIN = env(
		"CORS_ORIGIN",
		"http://localhost:3001,http://localhost:3002,http://localhost:8080,http://localhost:4200,http://localhost,https://*.devtunnels.ms"
	);
	ORDER_COMMISSION = envInt("ORDER_COMMISSION", 10);

	DB_HOST = env("DB_HOST", "localhost");
	DB_USER = env("DB_USER", "root");
	DB_PASSWORD = env("DB_PASSWORD", "");
	DB_DATABASE = env("DB_DATABASE", "careride_db");

	JWT_SECRET = env("JWT_SECRET");

	TIME_ZONE = env("TIME_ZONE", "Europe/Kiev");

	MAILER = {
		MAIL_HOST: env("MAIL_HOST", "smtp.gmail.com"),
		MAIL_PORT: envInt("MAIL_PORT", 465),
		MAIL_SECURE: envInt("MAIL_SECURE", 1),
		MAIL_USER: env("MAIL_USER"),
		MAIL_PASS: env("MAIL_PASS"),
		MAIL_FROM: env("MAIL_FROM", "care"),
		MAIL_LOG: envInt("MAIL_LOG", 1),
		TEST_MODE: envInt("MAIL_TEST_MODE", 0),
	};

	FEEDBACK_MAIL_TO = env("FEEDBACK_MAIL_TO", "");

	PAYMENTS = {
		STRIPE: {
			public_key: env("STRIPE_PUBLIC_KEY"),
			secret_key: env("STRIPE_SECRET_KEY"),
			endpointSecret: env("STRIPE_ENDPOINT_SECRET"),
			acc_endpointSecret: env("STRIPE_ACC_ENDPOINT_SECRET"),
		},
	};

	AMAZON_AWS = {
		apiVersion: env("AWS_API_VERSION", "2010-03-31"),
		SNS: {
			region: env("AWS_SNS_REGION", "ap-northeast-1"),
			accessKeyId: env("AWS_SNS_ACCESS_KEY_ID"),
			secretAccessKey: env("AWS_SNS_SECRET_ACCESS_KEY"),
		},
		S3: {
			region: env("AWS_S3_REGION", "ap-northeast-1"),
			accessKeyId: env("AWS_S3_ACCESS_KEY_ID"),
			secretAccessKey: env("AWS_S3_SECRET_ACCESS_KEY"),
		},
		SES: {
			region: env("AWS_SES_REGION", env("AWS_SNS_REGION", "ap-northeast-1")),
			accessKeyId: env("AWS_SES_ACCESS_KEY_ID", env("AWS_SNS_ACCESS_KEY_ID")),
			secretAccessKey: env("AWS_SES_SECRET_ACCESS_KEY", env("AWS_SNS_SECRET_ACCESS_KEY")),
			fromAddress: env("AWS_SES_FROM", "Support@careride.com"),
		},
	};

	GOOGLE_CLIENT_ID = env("GOOGLE_CLIENT_ID");
	GOOGLE_CLIENT_SECRET = env("GOOGLE_CLIENT_SECRET");

	FACEBOOK_APP_ID = env("FACEBOOK_APP_ID");
	FACEBOOK_APP_SECRET = env("FACEBOOK_APP_SECRET");

	RECAPTCHA_SECRET_KEY = env("RECAPTCHA_SECRET_KEY");

	setVar(name, value) {
		this[name] = value;
	}
}

const config = new Config();

process.env.NODE_ENV = config.NODE_ENV;
process.env.TZ = config.TIME_ZONE;
process.env.DB_HOST = config.DB_HOST;
process.env.DB_USER = config.DB_USER;
process.env.DB_PASSWORD = config.DB_PASSWORD;
process.env.DB_DATABASE = config.DB_DATABASE;

module.exports = config;
