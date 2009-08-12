/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  64-bit Unsigned Intergers
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function () {
  
  function uint(x) {
    return x | 0x0;
  }
  
  function ulong(x) {
    return [uint(x[0]), uint(x[1])];
  }
  
  /* uint functions */
  
  function uint_gt(x, y) {
    var a, b;
    a = (x >> 16) & 0xffff;
    b = (y >> 16) & 0xffff;
    return (a > b) || ((a === b) && ((x & 0xffff) > (y & 0xffff)));
  }
  
  function uint_lt(x, y) {
    var a, b;
    a = (x >> 16) & 0xffff;
    b = (y >> 16) & 0xffff;
    return (a < b) || ((a === b) && ((x & 0xffff) < (y & 0xffff)));
  }
  
  /* ulong functions */
  
  function ulong_and(x, y) {
    return [x[0] & y[0], x[1] & y[1]];
  }
  
  function ulong_or(x, y) {
    return [x[0] | y[0], x[1] | y[1]];
  }
  
  function ulong_xor(x, y) {
    return [x[0] ^ y[0], x[1] ^ y[1]];
  }
  
  function ulong_not(x, y) {
    return [~x[0], ~x[1]];
  }
  
  function ulong_shl(x, n) {
    var a = uint(x[0]),
        b = uint(x[1]),
        c = n >= 32 ? (b << (n - 32)) :
            n === 0 ? a : ((a << n) | (b >>> (32 - n))),
        d = n >= 32 ? 0x0 : (b << n);
    return ulong([c, d]);
  }
  
  function ulong_shr(x, n) {
    var a = uint(x[0]),
        b = uint(x[1]),
        c = n >= 32 ? 0x0 : (a >>> n),
        d = n >= 32 ? (a >>> (n - 32)) :
            n === 0 ? b : ((a << (32 - n)) | (b >>> n));
    return ulong([c, d]);
  }
  
  function ulong_rotl(x, n) {
    return ulong_or(ulong_shr(x, (64 - n)), ulong_shl(x, n));
  }
  
  function ulong_rotr(x, n) {
    return ulong_or(ulong_shr(x, n), ulong_shl(x, (64 - n)));
  }
  
  function ulong_add(x, y) {
    x = ulong(x);
    y = ulong(y);
    var b = x[1] + y[1],
        a = x[0] + y[0] + (uint_lt(b, x[1]) ? 0x1 : 0x0);
    return ulong([a, b]);
  }
  
  function ulong_subt(x, y) {
    x = ulong(x);
    y = ulong(y);
    var b = x[1] - y[1],
        a = x[0] - y[1] - (uint_gt(b, x[1]) ? 0x1 : 0x0);
    return ulong([a, b]);
  }
  
  function ulong_mult(x, y) {
    var i, a = ulong([0x0, 0x0]);
    for (i = 0; i < 64; i += 1) {
      if (ulong_shr(y, i)[1] & 0x1) {
        a = ulong_add(a, ulong_shl(x, i));
      }
    }
    return ulong(a);
  }
  
  /* expose */
  
  this.Digest.ulong = {
    ulong : ulong,
    and   : ulong_and,
    or    : ulong_or,
    xor   : ulong_xor,
    not   : ulong_not,
    rotl  : ulong_rotl,
    rotr  : ulong_rotr,
    shl   : ulong_shl,
    shr   : ulong_shr,
    add   : ulong_add,
    subt  : ulong_subt,
    mult  : ulong_mult
  };
  
}());
