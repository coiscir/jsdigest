/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  Define Global Object and Core Utilities
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function JSD(self) {
  
  self.Digest = new function Digest() {
    this.Version = '<%= version %>';
    this.fn = this.constructor.prototype;
    
    
    /* Array and String Converting */
    
    function isArray(array) {
      return Object.prototype.toString.call(array) === "[object Array]";
    }
    
    function isString(string) {
      return 'string' === typeof string;
    }
    
    function atos(array) {
      if (isArray(array)) {
        for (var i = 0, l = array.length, string = ''; i < l; i += 1) {
          string += String.fromCharCode(array[i]);
        }
        return string;
      }
      
      if (isString(array)) {
        return array.valueOf();
      }
    }
    
    function stoa(string) {
      if (isString(string)) {
        for (var i = 0, l = string.length, array = []; i < l; i += 1) {
          array.push(string.charCodeAt(i));
        }
        return array;
      }
      
      if (isArray(string)) {
        return string.valueOf();
      }
    }
    
    // expose functions
    this.isArray = isArray;
    this.isString = isString;
    this.atos = atos;
    this.stoa = stoa;
    
    
    /* Ensure Unsigned Int and Long Values */
    
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
    
    // expose functions
    this.ulong = ulong;
    this.and = and;
    this.or = or;
    this.xor = xor;
    this.not = not;
    this.shl = shl;
    this.shr = shr;
    this.rotl = rotl;
    this.rotr = rotr;
    this.add = add;
    this.subt = subt;
    this.mult = mult;
    
  }();
  
}(this));
