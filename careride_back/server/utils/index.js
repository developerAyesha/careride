const { pickBy } = require('lodash');

exports.formQuery = (obj) => pickBy(obj, v => v !== undefined);