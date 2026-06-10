const DB = require("./db.model");

DB.User = require("./user");


DB.Staff = require("./staff");
DB.Vendor = require("./vendor");
DB.Driver = require("./driver");
DB.User = require("./user");
DB.Car = require("./car");
DB.Order = require("./order");
DB.OrderPreset = require("./orderpreset");
DB.Payment = require("./payment");


DB.City = require("./city");
DB.Region = require("./region");

DB.Throttle = require("./throttle");



module.exports = DB;
