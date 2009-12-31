// UInt Operations
function gt_32(x, y) {
  var
    a = (x >> 16) & 0xffff,
    b = (y >> 16) & 0xffff;
  return (a > b) || ((a === b) && ((x & 0xffff) > (y & 0xffff)));
}

function lt_32(x, y) {
  var
    a = (x >> 16) & 0xffff,
    b = (y >> 16) & 0xffff;
  return (a < b) || ((a === b) && ((x & 0xffff) < (y & 0xffff)));
}

function rotl_32(x, n) {
  return ((x >>> (32 - n)) | (x << n));
}

function rotr_32(x, n) {
  return ((x >>> n) | (x << (32 - n)));
}

// ULong Operations
function ulong(x) {
  return [(x[0] | 0x0), (x[1] | 0x0)];
}

function and_64(x, y) {
  return [x[0] & y[0], x[1] & y[1]];
}

function or_64(x, y) {
  return [x[0] | y[0], x[1] | y[1]];
}

function xor_64(x, y) {
  return [x[0] ^ y[0], x[1] ^ y[1]];
}

function not_64(x) {
  return [~x[0], ~x[1]];
}

function shl_64(x, n) {
  var
    a = x[0] | 0x0,
    b = x[1] | 0x0;
  if (n >= 32) {
    return [(b << (n - 32)), 0x0];
  } else {
    return [((a << n) | (b >>> (32 - n))), (b << n)];
  }
}

function shr_64(x, n) {
  var
    a = x[0] | 0x0,
    b = x[1] | 0x0;
  if (n >= 32) {
    return [0x0, (a >>> (n - 32))];
  } else {
    return [(a >>> n), ((a << (32 - n)) | (b >>> n))];
  }
}

function rotl_64(x, n) {
  return or_64(shr_64(x, (64 - n)), shl_64(x, n));
}

function rotr_64(x, n) {
  return or_64(shr_64(x, n), shl_64(x, (64 - n)));
}

function add_64(x, y) {
  var
    b = x[1] + y[1],
    a = x[0] + y[0] + (lt_32(b, x[1]) ? 0x1 : 0x0);
  return [a, b];
}

function subt_64(x, y) {
  var
    b = x[1] - y[1],
    a = x[0] - y[0] - (gt_32(b, x[1]) ? 0x1 : 0x0);
  return [a, b];
}

function mult_64(x, y) {
  var i, a = [0x0, 0x0];
  for (i = 0; i < 64; i += 1) {
    if (shr_64(y, i)[1] & 0x1) {
      a = add_64(a, shl_64(x, i));
    }
  }
  return a;
}

self.ulong = ulong;
self.and  = and_64;
self.or   = or_64;
self.xor  = xor_64;
self.not  = not_64;
self.shl  = shl_64;
self.shr  = shr_64;
self.rotl = rotl_64;
self.rotr = rotr_64;
self.add  = add_64;
self.subt = subt_64;
self.mult = mult_64;
