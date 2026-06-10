const dateFns = require('date-fns');

const currentDate = () => dateFns.format(Date.now());

const isExpired = expDate => dateFns.differenceInHours(expDate, Date.now()) <= 0;

const premiumMonth = mons => {
  return dateFns.addMonths(Date.now(), mons || 1);
  }

module.exports = {
  isExpired,
  premiumMonth,
  currentDate
};
