const Config = require("./config.js");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require('cors');
const path = require("path");
const logger = require("morgan");
const LogSys = require('./services/winston').logger;
const cron = require('node-cron');
const { CustomError } = require('./utils/errors');
const asyncHandler = require('./utils/asyncHandler');
const { validate, ValidationError, Joi } = require('express-validation');
const withSession = require('./middlewares/session');
const Models = require("./models");


delete process.env.BROWSER;

const app = express();
const port = Config.SERVER_PORT || 3000;

const isDev = Config.NODE_ENV === 'development';

var globalAny = global;
globalAny.appRoot = process.cwd();


app.disable('x-powered-by');
app.use(bodyParser.json({
  limit: '6mb',
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}));
app.use(bodyParser.urlencoded({ extended: true , limit: '2MB', parameterLimit:100}));
app.use(cookieParser());
app.use(logger('dev'));

const _corsAllowed = (Config.CORS_ORIGIN || '').split(',').map(s => s.trim());
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    // exact match
    if (_corsAllowed.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    // wildcard match: *.devtunnels.ms and similar
    const wildcardMatch = _corsAllowed.some(pattern => {
      if (!pattern.startsWith('https://*.')) return false;
      const suffix = pattern.slice('https://*.'.length);
      return origin.startsWith('https://') && origin.endsWith('.' + suffix);
    });
    if (wildcardMatch) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.options('*', (req, res) => {
//  res.header("Access-Control-Allow-Origin", "*");
//  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
//  res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Credentials", true);
  res.send();
});

//app.use('/static', express.static(path.join(__dirname, '../static'), { maxAge: 2678400000 }));



if (isDev) {
  const swaggerUi = require("swagger-ui-express")
  const swaggerDoc = require('../api-docs/swagger.js');
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc.Doc, { explorer: true }) );
}


app.use('/api', withSession);




app.use('/api/admin', require('./routes/admin'));
app.use('/api/vendor', require('./routes/vendor'));
app.use('/api/client', require('./routes/client'));
app.use('/api/driver', require('./routes/driver'));
app.use('/api/order', require('./routes/order'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/pay', require('./routes/pay'));


app.use('/api/system', require('./routes/system'));






app.use(function(err, req, res, next) {
  const ret = {result:0, error:'error'};

  if (err instanceof ValidationError) {
    console.error('[ValidationError]', JSON.stringify(err.details));
    ret.detail = '';
    if (Array.isArray(err.details)) {
      if (err.details[0]) {
        const fields = Object.keys(err.details[0]);
        ret.detail = err.details[0][fields[0]];
      }
    } else if (err.details && typeof err.details === 'object') {
      const fields = Object.keys(err.details);
      if (fields[0]) ret.detail = Array.isArray(err.details[fields[0]]) ? err.details[fields[0]][0]?.message : err.details[fields[0]];
    }
    return res.status(err.statusCode).json(ret);
  }
  if (err instanceof CustomError) {
    ret.error = err.message;
    return res.status(err.status).json(ret);
  }

  return res.status(500).json(err);
});


app.get('/', function (req, res) {
  res.status(200).send('');
})

app.get('/health', function (req, res) {
  res.status(200).json({ status: 'ok', message: 'Backend is working fine' });
})

app.listen(port, function(){
  console.log("Server is listening "+ port +" port");
});

