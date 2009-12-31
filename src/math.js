// UInt/ULong Operations
function $gt(x, y) { // uint > uint
  var
    a = (x >> 16) & 0xffff,
    b = (y >> 16) & 0xffff;
  return (a > b) || ((a === b) && ((x & 0xffff) > (y & 0xffff)));
}

function $lt(x, y) { // uint < uint
  var
    a = (x >> 16) & 0xffff,
    b = (y >> 16) & 0xffff;
  return (a < b) || ((a === b) && ((x & 0xffff) < (y & 0xffff)));
}

function ulong(x) {
  return [(x[0] | 0x0), (x[1] | 0x0)];
}

function and(x, y) {
  return [x[0] & y[0], x[1] & y[1]];
}

function or(x, y) {
  return [x[0] | y[0], x[1] | y[1]];
}

function xor(x, y) {
  return [x[0] ^ y[0], x[1] ^ y[1]];
}

function not(x) {
  return [~x[0], ~x[1]];
}

function shl(x, n) {
  var
    a = x[0] | 0x0,
    b = x[1] | 0x0;
  if (n >= 32) {
    return [(b << (n - 32)), 0x0];
  } else {
    return [((a << n) | (b >>> (32 - n))), (b << n)];
  }
}

function shr(x, n) {
  var
    a = x[0] | 0x0,
    b = x[1] | 0x0;
  if (n >= 32) {
    return [0x0, (a >>> (n - 32))];
  } else {
    return [(a >>> n), ((a << (32 - n)) | (b >>> n))];
  }
}

function rotl(x, n) {
  return or(shr(x, (64 - n)), shl(x, n));
}

function rotr(x, n) {
  return or(shr(x, n), shl(x, (64 - n)));
}

function add(x, y) {
  var
    b = x[1] + y[1],
    a = x[0] + y[0] + ($lt(b, x[1]) ? 0x1 : 0x0);
  return [a, b];
}

function subt(x, y) {
  var
    b = x[1] - y[1],
    a = x[0] - y[0] - ($gt(b, x[1]) ? 0x1 : 0x0);
  return [a, b];
}

function mult(x, y) {
  var i, a = [0x0, 0x0];
  for (i = 0; i < 64; i += 1) {
    if (shr(y, i)[1] & 0x1) {
      a = add(a, shl(x, i));
    }
  }
  return a;
}

self.ulong = ulong;
self.and = and;
self.or = or;
self.xor = xor;
self.not = not;
self.shl = shl;
self.shr = shr;
self.rotl = rotl;
self.rotr = rotr;
self.add = add;
self.subt = subt;
self.mult = mult;
