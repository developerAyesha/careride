
function INET6_HEX(t) {
  t = String(t);
  if (t.indexOf('.') > -1) return INET4_HEX(t);
  return t.split(':').map(to4).join('');
}

function INET4_HEX(t) {
  return t.split('.').map(tohex2).join('');
}

function to4(t) {
  t = '0000'+t;
  return t = t.substring(t.length - 4);
}

function tohex2(t) {
  t = Number(t).toString(16);
  if (t.length < 2) {
    t = '0' + t;
  }
  return t;
}

function HEX_INET6(t) {
  if (t.length == 8) return HEX_INET4(t);
  return t.match(/.{4}/g).join(':');
}

function HEX_INET4(t) {
  return parseInt(t.substr(0,2), 16) + '.' + parseInt(t.substr(2,2), 16) + '.' + parseInt(t.substr(4,2), 16) + '.' + parseInt(t.substr(6,2), 16);
}



module.exports = {
  INET6_HEX,
  HEX_INET6,
};