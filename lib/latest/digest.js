/**
 *  jsDigest v1.2.1 (2010-02-02 00:46:12 -0600)
 *  http://github.com/coiscir/jsdigest/
 *
 *  Copyright (c) 2010 Jonathan Lonowski
 *  Released and distributed under the MIT License.
**/

"use strict";

(function (host) {
  host = host || this;

  // Define Digest Singleton
  var self = new function Digest() {
    this.Version = '1.2.1';
    this.fn = this.constructor.prototype;
    
    // Array and String Converting
    function isArray(array) {
      return Object.prototype.toString.call(array) === "[object Array]";
    }
    
    function isString(string) {
      return 'string' === typeof string;
    }
    
    function isInput(input) {
      return isArray(input) || isString(input) || input instanceof self.Encoder;
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
    this.isInput = isInput;
    this.atos = atos;
    this.stoa = stoa;
    
  }();
  
  function crop(size, hash, righty) {
    var length = Math.floor((size + 7) / 8),
        remain = size % 8;
    
    if (righty) {
      hash = hash.slice(hash.length - length);
    } else {
      hash = hash.slice(0, length);
    }
    
    if (remain > 0) {
      hash[length - 1] &= (0xff << (8 - remain)) & 0xff;
    }
    
    return hash;
  }

  // Character Encoder
  self.Encoder = function Encoder(input) {
    
    var i, l, buffer,
      isUtf8 = /^(([\xe0-\xef][\x80-\xbf][\x80-\xbf])|([\xc0-\xdf][\x80-\xbf])|([\x00-\x7f]))+$/;
    
    // Encoder as a function
    if (!(this instanceof self.Encoder)) {
      return new self.Encoder(input);
    }
    
    // new Encoder(Encoder)
    if (input instanceof self.Encoder) {
      return new self.Encoder(input.array());
    }
    
    // new Encoder(Array) || new Encoder(String)
    buffer = self.stoa(input);
    
    if ('undefined' === typeof buffer) {
      throw new Error('Encoder input must be a string or an array.');
    } else {
      // ensure all Numbers are unsigned 16-bit
      for (i = 0, l = buffer.length; i < l; i += 1) {
        if ('number' === typeof buffer[i]) {
          buffer[i] &= 0xffff;
        } else {
          throw new Error('Array elements must be Numbers (index: ' + i + ')');
        }
      }
    }
    
    // Core Output
    this.array = function array() {
      return [].concat(buffer);
    };
    
    this.string = function string() {
      return self.atos(buffer);
    };
    
    this.valueOf = this.array;
    this.toString = this.string;
    
    // Input Encodings
    this.split = function split() {
      for (var i = 0, l = buffer.length, result = []; i < l; i += 1) {
        result.push((buffer[i] >> 8) & 0xff);
        result.push((buffer[i] >> 0) & 0xff);
      }
      return result;
    };
    
    this.trunc = function trunc() {
      for (var i = 0, l = buffer.length, result = []; i < l; i += 1) {
        result.push(buffer[i] & 0xff);
      }
      return result;
    };
    
    this.utf8 = function utf8() {
      if (isUtf8.test(this.string())) {
        return this.trunc();
      }
      
      for (var i = 0, l = buffer.length, code, result = []; i < l; i += 1) {
        code = buffer[i];
        if (code < 0x80) {
          result.push(code);
        } else if (code < 0x800) {
          result.push(0xc0 + ((code >>  6) & 0x1f));
          result.push(0x80 + ((code >>  0) & 0x3f));
        } else {
          result.push(0xe0 + ((code >> 12) & 0x0f));
          result.push(0x80 + ((code >>  6) & 0x3f));
          result.push(0x80 + ((code >>  0) & 0x3f));
        }
      }
      return result;
    };
    
    // RFC-4648 - Base-16
    function toBase16(chars) {
      var i, l,
        out = '';
      
      for (i = 0, l = buffer.length; i < l; i += 1) {
        out += chars[(buffer[i] >> 4) & 0xf] || '?';
        out += chars[(buffer[i] >> 0) & 0xf] || '?';
      }
      return out;
    }
    
    // 0-9 a-f (lower)
    this.hex = function hex() {
      return toBase16('0123456789abcdef'.split(''));
    };
    
    // 0-9 A-F (upper)
    this.base16 = function base16() {
      return toBase16('0123456789ABCDEF'.split(''));
    };
    
    // RFC-4648 - Base-32
    function toBase32(chars) {
      var i, l,
        out = '', rem = null,
        padlen = 8, padding = '=';
      
      for (i = 0, l = buffer.length; i < l; i += 1) {
        switch (i % 5) {
        case 0:
          // 00000000 xxxxx000
          out += chars[((buffer[i] >> 3) & 0x1f) | 0x0] || '?';
          rem = (buffer[i] & 0x07) << 2;
          break;
        case 1:
          // 00000rrr xxyyyyy0
          out += chars[((buffer[i] >> 6) & 0x03) | rem] || '?';
          out += chars[((buffer[i] >> 1) & 0x1f) | 0x0] || '?';
          rem = (buffer[i] & 0x01) << 4;
          break;
        case 2:
          // 0000000r xxxx0000
          out += chars[((buffer[i] >> 4) & 0x0f) | rem] || '?';
          rem = (buffer[i] & 0x0f) << 1;
          break;
        case 3:
          // 0000rrrr xyyyyy00
          out += chars[((buffer[i] >> 7) & 0x01) | rem] || '?';
          out += chars[((buffer[i] >> 2) & 0x1f) | 0x0] || '?';
          rem = (buffer[i] & 0x03) << 3;
          break;
        case 4:
          // 000000rr xxxyyyyy
          out += chars[((buffer[i] >> 5) & 0x07) | rem] || '?';
          out += chars[((buffer[i] >> 0) & 0x1f) | 0x0] || '?';
          rem = null;
        }
      }
      
      // append remainder
      out += (null === rem) ? '' : (chars[rem] || '?');
      
      // append padding
      while (padlen > 0 && (out.length % padlen) > 0) {
        out += padding;
      }
      
      return out;
    }
    
    // A-Z 2-7 (upper)
    this.base32 = function base32() {
      return toBase32('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split(''));
    };
    
    // 0-9 a-v (lower)
    this.base32hex = function base32hex() {
      return toBase32('0123456789abcdefghijklmnopqrstuv'.split(''));
    };
    
    // RFC-4648 - Base-64
    function toBase64(chars) {
      var i, l,
        out = '', rem = null,
        padlen = 4, padding = '=';
      
      for (i = 0, l = buffer.length; i < l; i += 1) {
        switch (i % 3) {
        case 0:
          // 00000000 xxxxxx00
          out += chars[((buffer[i] >> 2) & 0x3f) | 0x0] || '?';
          rem = (buffer[i] & 0x03) << 4;
          break;
        case 1:
          // 000000rr xxxx0000
          out += chars[((buffer[i] >> 4) & 0x0f) | rem] || '?';
          rem = (buffer[i] & 0x0f) << 2;
          break;
        case 2:
          // 0000rrrr xxyyyyyy
          out += chars[((buffer[i] >> 6) & 0x03) | rem] || '?';
          out += chars[((buffer[i] >> 0) & 0x3f) | 0x0] || '?';
          rem = null;
          break;
        }
      }
      
      // append remainder
      out += (null === rem) ? '' : (chars[rem] || '?');
      
      // append padding
      while (padlen > 0 && (out.length % padlen) > 0) {
        out += padding;
      }
      
      return out;
    }
    
    // A-Z a-z 0-9 + /
    this.base64 = function base64() {
      return toBase64('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split(''));
    };
    
    // A-Z a-z 0-9 - _ (url/filename safe)
    this.base64url = function base64url() {
      return toBase64('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split(''));
    };
    
  };
  
  // Ready an input for hashing
  self.Encoder.ready = function ready(input) {
    if (self.isInput(input)) {
      if (self.isString(input)) {
        return self.Encoder(input).utf8();
      } else {
        return self.Encoder(input).trunc();
      }
    }
  };

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

  // Least Significant Byte, 32-bit
  function merge_LSB_32(input) {
    var i, j, l, output = [];
    for (i = 0, j = 0, l = input.length; j < l; i += 1, j = (i * 4)) {
      output[i] = ((input[j]) & 0xff) |
        ((input[j + 1] <<  8) & 0xff00) |
        ((input[j + 2] << 16) & 0xff0000) |
        ((input[j + 3] << 24) & 0xff000000);
    }
    return output;
  }
  
  function split_LSB_32(input) {
    var i, l, output = [];
    for (i = 0, l = input.length; i < l; i += 1) {
      output.push((input[i] >>  0) & 0xff);
      output.push((input[i] >>  8) & 0xff);
      output.push((input[i] >> 16) & 0xff);
      output.push((input[i] >> 24) & 0xff);
    }
    return output;
  }
  
  // Most Significant Byte, 32-bit
  function merge_MSB_32(input) {
    var i, j, l, output = [];
    for (i = 0, j = 0, l = input.length; j < l; i += 1, j = (i * 4)) {
      output[i] = 
        ((input[j + 0] & 0xff) << 24) |
        ((input[j + 1] & 0xff) << 16) |
        ((input[j + 2] & 0xff) <<  8) |
        ((input[j + 3] & 0xff) <<  0);
    }
    return output;
  }
  
  function split_MSB_32(input) {
    var i, l, output = [];
    for (i = 0, l = input.length; i < l; i += 1) {
      output.push((input[i] >> 24) & 0xff);
      output.push((input[i] >> 16) & 0xff);
      output.push((input[i] >>  8) & 0xff);
      output.push((input[i] >>  0) & 0xff);
    }
    return output;
  }
  
  // Least Significant Byte, 64-bit
  function merge_LSB_64(input) {
    var i, j, l, output = [];
    for (i = 0, j = 0, l = input.length; j < l; i += 1, j = (i * 8)) {
      output[i] = [
        ((input[j + 4] & 0xff) <<  0) |
        ((input[j + 5] & 0xff) <<  8) |
        ((input[j + 6] & 0xff) << 16) |
        ((input[j + 7] & 0xff) << 24),
        ((input[j + 0] & 0xff) <<  0) |
        ((input[j + 1] & 0xff) <<  8) |
        ((input[j + 2] & 0xff) << 16) |
        ((input[j + 3] & 0xff) << 24)
      ];
    }
    return output;
  }
  
  function split_LSB_64(input) {
    var i, l, output = [];
    for (i = 0, l = input.length; i < l; i += 1) {
      output.push((input[i][1] >>  0) & 0xff);
      output.push((input[i][1] >>  8) & 0xff);
      output.push((input[i][1] >> 16) & 0xff);
      output.push((input[i][1] >> 24) & 0xff);
      output.push((input[i][0] >>  0) & 0xff);
      output.push((input[i][0] >>  8) & 0xff);
      output.push((input[i][0] >> 16) & 0xff);
      output.push((input[i][0] >> 24) & 0xff);
    }
    return output;
  }
  
  // Most Significant Byte, 64-bit
  function merge_MSB_64(input) {
    var i, j, l, output = [];
    for (i = 0, j = 0, l = input.length; j < l; i += 1, j = (i * 8)) {
      output[i] = [
        ((input[j + 0] & 0xff) << 24) |
        ((input[j + 1] & 0xff) << 16) |
        ((input[j + 2] & 0xff) <<  8) |
        ((input[j + 3] & 0xff) <<  0),
        ((input[j + 4] & 0xff) << 24) |
        ((input[j + 5] & 0xff) << 16) |
        ((input[j + 6] & 0xff) <<  8) |
        ((input[j + 7] & 0xff) <<  0)
      ];
    }
    return output;
  }
  
  function split_MSB_64(input) {
    var i, l, output = [];
    for (i = 0, l = input.length; i < l; i += 1) {
      output.push((input[i][0] >> 24) & 0xff);
      output.push((input[i][0] >> 16) & 0xff);
      output.push((input[i][0] >>  8) & 0xff);
      output.push((input[i][0] >>  0) & 0xff);
      output.push((input[i][1] >> 24) & 0xff);
      output.push((input[i][1] >> 16) & 0xff);
      output.push((input[i][1] >>  8) & 0xff);
      output.push((input[i][1] >>  0) & 0xff);
    }
    return output;
  }

  // HMAC - keyed-Hash Message Authentication Code
  function hmac(hash, size, digest, data, hkey, block) {
    var i, akey, ipad, opad;
    
    if (hkey.length > block) {
      akey = hash(digest, hkey).trunc();
    } else {
      akey = self.Encoder(hkey).trunc();
    }
    
    for (i = 0, ipad = [], opad = []; i < block; i += 1) {
      ipad[i] = (akey[i] || 0x00) ^ 0x36;
      opad[i] = (akey[i] || 0x00) ^ 0x5c;
    }
    
    return hash(size, opad.concat(hash(digest, ipad.concat(data)).trunc()));
  }

  // MD4 (c) 1990 Ronald L. Rivest
  (function () {
    function main(size, data) {
      var a, b, c, d, i, l, r, t, tmp, x,
        bytes, bitHi, bitLo,
        padlen, padding = [0x80],
        hash = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476],
        K = [0x00000000, 0x5a827999, 0x6ed9eba1],
        S = [ [3, 7, 11, 19], [3, 5, 9, 13], [3, 9, 11, 15] ],
        X = [
          0, 1, 2,  3, 4,  5, 6,  7, 8, 9, 10, 11, 12, 13, 14, 15, // Round 1
          0, 4, 8, 12, 1,  5, 9, 13, 2, 6, 10, 14,  3,  7, 11, 15, // Round 2
          0, 8, 4, 12, 2, 10, 6, 14, 1, 9,  5, 13,  3, 11,  7, 15  // Round 3
        ],
        F = [
          function (x, y, z) {
            return (x & y) | ((~x) & z);
          },
          function (x, y, z) {
            return (x & y) | (x & z) | (y & z);
          },
          function (x, y, z) {
            return (x ^ y ^ z);
          }
        ];
      
      // use bit-length to pad data
      bytes = data.length;
      bitLo = (bytes * 8) & 0xffffffff;
      bitHi = (bytes * 8 / Math.pow(2, 32)) & 0xffffffff;
      
      padlen = ((bytes % 64) < 56 ? 56 : 120) - (bytes % 64);
      while (padding.length < padlen) {
        padding.push(0x0);
      }
      
      x = merge_LSB_32(data.concat(padding)).concat([bitLo, bitHi]);
      
      // update hash
      for (i = 0, l = x.length; i < l; i += 16) {
        a = hash[0];
        b = hash[1];
        c = hash[2];
        d = hash[3];
        
        for (t = 0; t < 48; t += 1) {
          r = Math.floor(t / 16);
          a = rotl_32((a + F[r](b, c, d) + x[i + X[t]] + K[r]), S[r][t % 4]);
          
          tmp = d;
          d = c;
          c = b;
          b = a;
          a = tmp;
        }
        
        hash[0] += a;
        hash[1] += b;
        hash[2] += c;
        hash[3] += d;
      }
      
      return self.Encoder(crop(size, split_LSB_32(hash), false));
    }
    
    // expose hash function
    
    self.fn.md4 = function md4(size, data, hkey) {
      var digest = 128;
      
      // allow size to be optional
      if ('number' !== typeof size.valueOf()) {
        hkey = data;
        data = size;
        size = digest;
      }
      
      size = (0 < size && size <= digest) ? size : digest;
      data = self.Encoder.ready(data);
      hkey = self.Encoder.ready(hkey);
      
      if (self.isInput(hkey)) {
        return hmac(main, size, digest, data, hkey, 64);
      } else {
        return main(size, data);
      }
    };
    
  }());

  // MD5 (c) 1992 Ronald L. Rivest
  (function () {
    function main(size, data) {
      var a, b, c, d, i, l, r, t, tmp, x,
        bytes, bitHi, bitLo,
        padlen, padding = [0x80],
        hash = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476],
        S = [ [7, 12, 17, 22], [5, 9, 14, 20], [4, 11, 16, 23], [6, 10, 15, 21] ],
        X = [
          0, 1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, // Round 1
          1, 6, 11,  0,  5, 10, 15,  4,  9, 14,  3,  8, 13,  2,  7, 12, // Round 2
          5, 8, 11, 14,  1,  4,  7, 10, 13,  0,  3,  6,  9, 12, 15,  2, // Round 3
          0, 7, 14,  5, 12,  3, 10,  1,  8, 15,  6, 13,  4, 11,  2,  9  // Round 4
        ],
        AC = [
          0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, // Round 1
          0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
          0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
          0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
          0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, // Round 2
          0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
          0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
          0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
          0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, // Round 3
          0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
          0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
          0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
          0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, // Round 4
          0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
          0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
          0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
        ],
        F = [
          function (x, y, z) {
            return (x & y) | ((~x) & z);
          },
          function (x, y, z) {
            return (x & z) | (y & (~z));
          },
          function (x, y, z) {
            return (x ^ y ^ z);
          },
          function (x, y, z) {
            return (y ^ (x | (~z)));
          }
        ];
      
      // use bit-length to pad data
      bytes = data.length;
      bitLo = (bytes * 8) & 0xffffffff;
      bitHi = (bytes * 8 / Math.pow(2, 32)) & 0xffffffff;
      
      padlen = ((bytes % 64) < 56 ? 56 : 120) - (bytes % 64);
      while (padding.length < padlen) {
        padding.push(0x0);
      }
      
      x = merge_LSB_32(data.concat(padding)).concat([bitLo, bitHi]);
      
      // update hash
      for (i = 0, l = x.length; i < l; i += 16) {
        a = hash[0];
        b = hash[1];
        c = hash[2];
        d = hash[3];
        
        for (t = 0; t < 64; t += 1) {
          r = Math.floor(t / 16);
          a = rotl_32((a + F[r](b, c, d) + x[i + X[t]] + AC[t]), S[r][t % 4]) + b;
          
          tmp = d;
          d = c;
          c = b;
          b = a;
          a = tmp;
        }
        
        hash[0] += a;
        hash[1] += b;
        hash[2] += c;
        hash[3] += d;
      }
      
      return self.Encoder(crop(size, split_LSB_32(hash), false));
    }
    
    // expose hash function
    
    self.fn.md5 = function md5(size, data, hkey) {
      var digest = 128;
      
      // allow size to be optional
      if ('number' !== typeof size.valueOf()) {
        hkey = data;
        data = size;
        size = digest;
      }
      
      size = (0 < size && size <= digest) ? size : digest;
      data = self.Encoder.ready(data);
      hkey = self.Encoder.ready(hkey);
      
      if (self.isInput(hkey)) {
        return hmac(main, size, digest, data, hkey, 64);
      } else {
        return main(size, data);
      }
    };
    
  }());

  // MD6 r2009-04-15 (c) 2009 Ronald L. Rivest, et al.
  (function () {
    function main(size, data, key, levels) {
      var b, c, n, d, M, K, k, r, L, ell, S0, Sm, Q, t, rs, ls;
      
      // block sizes in bytes
      b = 512; // (64 * 64 / 8) = input block
      c = 128; // (16 * 64 / 8) = compressed block
      
      // word sizes
      n = 89; // words passed to f()
      
      // required arguments, digest length and message
      d = size; // digest length
      M = data; // single-byte character codes
      
      // prepare key and key length
      K = key.slice(0, 64);
      k = K.length;
      
      // pad K
      while (K.length < 64) {
        K.push(0x00);
      }
      
      // finalize K
      K = merge_MSB_64(K);
      
      // calculate default rounds, min 80 with key
      r = Math.max((k ? 80 : 0), (40 + (d / 4)));
      
      // levels, max and "current"
      L = levels;
      ell = 0;
      
      // round constants
      S0 = [0x01234567, 0x89abcdef]; // S round 0
      Sm = [0x7311c281, 0x2425cfa0]; // S mask
      
      // 15 word constant
      Q = [
        [0x7311c281, 0x2425cfa0], [0x64322864, 0x34aac8e7], [0xb60450e9, 0xef68b7c1],
        [0xe8fb2390, 0x8d9f06f1], [0xdd2e76cb, 0xa691e5bf], [0x0cd0d63b, 0x2c30bc41],
        [0x1f8ccf68, 0x23058f8a], [0x54e5ed5b, 0x88e3775d], [0x4ad12aae, 0x0a6d6031],
        [0x3e7f16bb, 0x88222e0d], [0x8af8671d, 0x3fb50c2c], [0x995ad117, 0x8bd25c31],
        [0xc878c1dd, 0x04c4b633], [0x3b72066c, 0x7a1552ac], [0x0d6f3522, 0x631effcb]
      ];
      
      // tap position and shift constant lists for f()
      t = [17, 18, 21, 31, 67, 89];
      rs = [10,  5, 13, 10, 11, 12,  2,  7, 14, 15,  7, 13, 11, 7, 6, 12];
      ls = [11, 24,  9, 16, 15,  9, 27, 15,  6,  2, 29,  8, 15, 5, 31, 9];
      
      // main compression function
      function f(N) {
        var i, j, s, x, S = [].concat(S0), A = [].concat(N);
        
        for (j = 0, i = n; j < r; j += 1, i += 16) {
          for (s = 0; s < 16; s += 1) {
            x = [].concat(S);
            x = xor_64(x, A[i + s - t[5]]);
            x = xor_64(x, A[i + s - t[0]]);
            x = xor_64(x, and_64(A[i + s - t[1]], A[i + s - t[2]]));
            x = xor_64(x, and_64(A[i + s - t[3]], A[i + s - t[4]]));
            x = xor_64(x, shr_64(x, rs[s]));
            A[i + s] = xor_64(x, shl_64(x, ls[s]));
          }
          
          S = xor_64(xor_64(shl_64(S, 1), shr_64(S, (64 - 1))), and_64(S, Sm));
        }
        
        return A.slice(A.length - 16);
      }
      
      // "middle-man" -- prepare U and V for f()
      function mid(B, C, i, p, z) {
        var U, V;
        
        U = [
          (
            ((ell & 0xff) << 24) |
            ((i / Math.pow(2, 32)) & 0xffffff)
          ),
          (i & 0xffffffff)
        ];
        
        V = [
          (
            ((r & 0xfff)  << 16) |
            ((L & 0xff)   <<  8) |
            ((z & 0xf)    <<  4) |
            ((p & 0xf000) >> 12)
          ),
          (
            ((p & 0xfff) << 20) |
            ((k & 0xff)  << 12) |
            ((d & 0xfff))
          )
        ];
        
        return f([].concat(Q, K, [U, V], C, B));
      }
      
      // parallel compression
      function par(M) {
        var i, l, p, z, P = 0, B = [], C = [];
        z = (M.length > b ? 0 : 1);
        
        // pad and finalize message
        while ((M.length < 1) || ((M.length % b) > 0)) {
          M.push(0x00);
          P += 8;
        }
        M = merge_MSB_64(M);
        
        // split M into B(b) blocks
        while (M.length > 0) {
          B.push(M.slice(0, (b / 8)));
          M = M.slice(b / 8);
        }
        
        // compress B blocks into C
        for (i = 0, p = 0, l = B.length; i < l; i += 1, p = 0) {
          p = (i === (B.length - 1)) ? P : 0;
          C = C.concat(mid(B[i], [], i, p, z));
        }
        
        return split_MSB_64(C);
      }
      
      // sequential compression
      function seq(M) {
        var i, l, p, z, P = 0, B = [], C = [
          [0x0, 0x0], [0x0, 0x0], [0x0, 0x0], [0x0, 0x0],
          [0x0, 0x0], [0x0, 0x0], [0x0, 0x0], [0x0, 0x0],
          [0x0, 0x0], [0x0, 0x0], [0x0, 0x0], [0x0, 0x0],
          [0x0, 0x0], [0x0, 0x0], [0x0, 0x0], [0x0, 0x0]
        ];
        
        // pad message
        while ((M.length < 1) || ((M.length % (b - c)) > 0)) {
          M.push(0x00);
          P += 8;
        }
        M = merge_MSB_64(M);
        
        // split M into B(b-c) blocks
        while (M.length > 0) {
          B.push(M.slice(0, ((b - c) / 8)));
          M = M.slice((b - c) / 8);
        }
        
        // cycle through B, updating C
        for (i = 0, p = 0, l = B.length; i < l; i += 1, p = 0) {
          p = (i === (B.length - 1)) ? P : 0;
          z = (i === (B.length - 1)) ? 1 : 0;
          C = mid(B[i], C, i, p, z);
        }
        
        return split_MSB_64(C);
      }
      
      // level iteration
      do {
        ell += 1;
        M = ell > L ? seq(M) : par(M);
      } while (M.length !== c);
      
      return self.Encoder(crop(d, M, true));
    }
    
    // expose hash function
    
    self.fn.md6par = function md6par(size, data, key) {
      var digest = 512;
      
      // allow size to be optional
      if ('number' !== typeof size.valueOf()) {
        key = data;
        data = size;
        size = digest;
      }
      
      size = (0 < size && size <= digest) ? size : digest;
      data = self.Encoder.ready(data);
      key  = self.Encoder.ready(key) || []; // key is required for main()
      
      return main(size, data, key, 64);
    };
    
    self.fn.md6seq = function md6seq(size, data, key) {
      var digest = 512;
      
      // allow size to be optional
      if ('number' !== typeof size.valueOf()) {
        key = data;
        data = size;
        size = digest;
      }
      
      size = (0 < size && size <= digest) ? size : digest;
      data = self.Encoder.ready(data);
      key  = self.Encoder.ready(key) || []; // key is required for main()
      
      return main(size, data, key, 0);
    };
    
  }());

  // RIPEMD-128 (c) 1996 Hans Dobbertin, Antoon Bosselaers, and Bart Preneel
  (function () {
    function main(size, data) {
      var aa, bb, cc, dd, aaa, bbb, ccc, ddd, i, l, r, rr, t, tmp, x,
        bytes, bitHi, bitLo,
        padlen, padding = [0x80],
        hash = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476],
        S = [
          [11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8], // round 1
          [ 7,  6,  8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12], // round 2
          [11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5], // round 3
          [11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12], // round 4
          [ 8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6], // parallel round 1
          [ 9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11], // parallel round 2
          [ 9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5], // parallel round 3
          [15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8]  // parallel round 4
        ],
        X = [
          [ 0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15], // round 1
          [ 7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8], // round 2
          [ 3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12], // round 3
          [ 1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2], // round 4
          [ 5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12], // parallel round 1
          [ 6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2], // parallel round 2
          [15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13], // parallel round 3
          [ 8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14]  // parallel round 4
        ],
        K = [
          0x00000000, // FF
          0x5a827999, // GG
          0x6ed9eba1, // HH
          0x8f1bbcdc, // II
          0x50a28be6, // III
          0x5c4dd124, // HHH
          0x6d703ef3, // GGG
          0x00000000  // FFF
        ],
        F = [
          function (x, y, z) {
            return (x ^ y ^ z);
          },
          function (x, y, z) {
            return (x & y) | ((~x) & z);
          },
          function (x, y, z) {
            return (x | (~y)) ^ z;
          },
          function (x, y, z) {
            return (x & z) | (y & (~z));
          }
        ];
      
      // use bit-length to pad data
      bytes = data.length;
      bitLo = (bytes * 8) & 0xffffffff;
      bitHi = (bytes * 8 / Math.pow(2, 32)) & 0xffffffff;
      
      padlen = ((bytes % 64) < 56 ? 56 : 120) - (bytes % 64);
      while (padding.length < padlen) {
        padding.push(0x0);
      }
      
      x = merge_LSB_32(data.concat(padding)).concat([bitLo, bitHi]);
      
      // update hash
      for (i = 0, t = 0, l = x.length; i < l; i += 16, t = 0) {
        aa = aaa = hash[0];
        bb = bbb = hash[1];
        cc = ccc = hash[2];
        dd = ddd = hash[3];
        
        for (; t < 64; t += 1) {
          r = Math.floor(t / 16);
          aa = rotl_32((aa + F[r](bb, cc, dd) + x[i + X[r][t % 16]] + K[r]), S[r][t % 16]);
          
          tmp = dd;
          dd = cc;
          cc = bb;
          bb = aa;
          aa = tmp;
        }
        
        for (; t < 128; t += 1) {
          r = Math.floor(t / 16);
          rr = Math.floor((63 - (t % 64)) / 16);
          aaa = rotl_32((aaa + F[rr](bbb, ccc, ddd) + x[i + X[r][t % 16]] + K[r]), S[r][t % 16]);
          
          tmp = ddd;
          ddd = ccc;
          ccc = bbb;
          bbb = aaa;
          aaa = tmp;
        }
        
        ddd     = hash[1] + cc + ddd;
        hash[1] = hash[2] + dd + aaa;
        hash[2] = hash[3] + aa + bbb;
        hash[3] = hash[0] + bb + ccc;
        hash[0] = ddd;
      }
      
      return self.Encoder(crop(size, split_LSB_32(hash), false));
    }
    
    // expose hash function
    
    self.fn.ripemd128 = function ripemd128(size, data, hkey) {
      var digest = 128;
      
      // allow size to be optional
      if ('number' !== typeof size.valueOf()) {
        hkey = data;
        data = size;
        size = digest;
      }
      
      size = (0 < size && size <= digest) ? size : digest;
      data = self.Encoder.ready(data);
      hkey = self.Encoder.ready(hkey);
      
      if (self.isInput(hkey)) {
        return hmac(main, size, digest, data, hkey, 64);
      } else {
        return main(size, data);
      }
    };
    
  }());

  // RIPEMD-160 (c) 1996 Hans Dobbertin, Antoon Bosselaers, and Bart Preneel
  (function () {
    function main(size, data) {
      var aa, bb, cc, dd, ee, aaa, bbb, ccc, ddd, eee, i, l, r, rr, t, tmp, x,
        bytes, bitHi, bitLo,
        padlen, padding = [0x80],
        hash = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0],
        S = [
          [11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8], // round 1
          [ 7,  6,  8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12], // round 2
          [11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5], // round 3
          [11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12], // round 4
          [ 9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6], // round 5
          [ 8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6], // parallel round 1
          [ 9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11], // parallel round 2
          [ 9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5], // parallel round 3
          [15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8], // parallel round 4
          [ 8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11]  // parallel round 5
        ],
        X = [
          [ 0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15], // round 1
          [ 7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8], // round 2
          [ 3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12], // round 3
          [ 1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2], // round 4
          [ 4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13], // round 5
          [ 5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12], // parallel round 1
          [ 6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2], // parallel round 2
          [15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13], // parallel round 3
          [ 8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14], // parallel round 4
          [12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11]  // parallel round 5
        ],
        K = [
          0x00000000, // FF
          0x5a827999, // GG
          0x6ed9eba1, // HH
          0x8f1bbcdc, // II
          0xa953fd4e, // JJ
          0x50a28be6, // JJJ
          0x5c4dd124, // III
          0x6d703ef3, // HHH
          0x7a6d76e9, // GGG
          0x00000000  // FFF
        ],
        F = [
          function (x, y, z) {
            return (x ^ y ^ z);
          },
          function (x, y, z) {
            return (x & y) | ((~x) & z);
          },
          function (x, y, z) {
            return (x | (~y)) ^ z;
          },
          function (x, y, z) {
            return (x & z) | (y & (~z));
          },
          function (x, y, z) {
            return (x ^ (y | (~z)));
          }
        ];
      
      // use bit-length to pad data
      bytes = data.length;
      bitLo = (bytes * 8) & 0xffffffff;
      bitHi = (bytes * 8 / Math.pow(2, 32)) & 0xffffffff;
      
      padlen = ((bytes % 64) < 56 ? 56 : 120) - (bytes % 64);
      while (padding.length < padlen) {
        padding.push(0x0);
      }
      
      x = merge_LSB_32(data.concat(padding)).concat([bitLo, bitHi]);
      
      // update hash
      for (i = 0, t = 0, l = x.length; i < l; i += 16, t = 0) {
        aa = aaa = hash[0];
        bb = bbb = hash[1];
        cc = ccc = hash[2];
        dd = ddd = hash[3];
        ee = eee = hash[4];
        
        for (; t < 80; t += 1) {
          r = Math.floor(t / 16);
          aa = rotl_32((aa + F[r](bb, cc, dd) + x[i + X[r][t % 16]] + K[r]), S[r][t % 16]) + ee;
          
          tmp = ee;
          ee = dd;
          dd = rotl_32(cc, 10);
          cc = bb;
          bb = aa;
          aa = tmp;
        }
        
        for (; t < 160; t += 1) {
          r = Math.floor(t / 16);
          rr = Math.floor((79 - (t % 80)) / 16);
          aaa = rotl_32((aaa + F[rr](bbb, ccc, ddd) + x[i + X[r][t % 16]] + K[r]), S[r][t % 16]) + eee;
          
          tmp = eee;
          eee = ddd;
          ddd = rotl_32(ccc, 10);
          ccc = bbb;
          bbb = aaa;
          aaa = tmp;
        }
        
        ddd     = hash[1] + cc + ddd;
        hash[1] = hash[2] + dd + eee;
        hash[2] = hash[3] + ee + aaa;
        hash[3] = hash[4] + aa + bbb;
        hash[4] = hash[0] + bb + ccc;
        hash[0] = ddd;
      }
      
      return self.Encoder(crop(size, split_LSB_32(hash), false));
    }
    
    // expose hash function
    
    self.fn.ripemd160 = function ripemd160(size, data, hkey) {
      var digest = 160;
      
      // allow size to be optional
      if ('number' !== typeof size.valueOf()) {
        hkey = data;
        data = size;
        size = digest;
      }
      
      size = (0 < size && size <= digest) ? size : digest;
      data = self.Encoder.ready(data);
      hkey = self.Encoder.ready(hkey);
      
      if (self.isInput(hkey)) {
        return hmac(main, size, digest, data, hkey, 64);
      } else {
        return main(size, data);
      }
    };
    
  }());

  // SHA-1 (c) 2006 The Internet Society
  (function () {
    function main(size, data) {
      var a, b, c, d, e, i, l, r, t, tmp, w, x,
        bytes, bitHi, bitLo,
        padlen, padding = [0x80],
        hash = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0],
        K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6],
        F = [
          function (b, c, d) {
            return (b & c) | ((~b) & d);
          },
          function (b, c, d) {
            return (b ^ c ^ d);
          },
          function (b, c, d) {
            return (b & c) | (b & d) | (c & d);
          },
          function (b, c, d) {
            return (b ^ c ^ d);
          }
        ];
      
      // use bit-length to pad data
      bytes = data.length;
      bitLo = (bytes * 8) & 0xffffffff;
      bitHi = (bytes * 8 / Math.pow(2, 32)) & 0xffffffff;
      
      padlen = ((bytes % 64) < 56 ? 56 : 120) - (bytes % 64);
      while (padding.length < padlen) {
        padding.push(0x0);
      }
      
      x = merge_MSB_32(data.concat(padding)).concat([bitHi, bitLo]);
      
      // update hash
      for (i = 0, w = [], l = x.length; i < l; i += 16) {
        a = hash[0];
        b = hash[1];
        c = hash[2];
        d = hash[3];
        e = hash[4];
        
        for (t = 0; t < 80; t += 1) {
          if (t < 16) {
            w[t] = x[i + t];
          } else {
            w[t] = rotl_32((w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16]), 1);
          }
          
          r = Math.floor(t / 20);
          tmp = (rotl_32(a, 5) + F[r](b, c, d) + e + w[t] + K[r]);
          e = d;
          d = c;
          c = rotl_32(b, 30);
          b = a;
          a = tmp;
        }
        
        hash[0] += a;
        hash[1] += b;
        hash[2] += c;
        hash[3] += d;
        hash[4] += e;
      }
      
      return self.Encoder(crop(size, split_MSB_32(hash), false));
    }
    
    // expose hash function
    
    self.fn.sha1 = function sha1(size, data, hkey) {
      var digest = 160;
      
      // allow size to be optional
      if ('number' !== typeof size.valueOf()) {
        hkey = data;
        data = size;
        size = digest;
      }
      
      size = (0 < size && size <= digest) ? size : digest;
      data = self.Encoder.ready(data);
      hkey = self.Encoder.ready(hkey);
      
      if (self.isInput(hkey)) {
        return hmac(main, size, digest, data, hkey, 64);
      } else {
        return main(size, data);
      }
    };
    
  }());

  // SHA-2 256 (c) 2006 The Internet Society
  (function () {
    function main(digest, size, data) {
      var a, b, c, d, e, f, g, h, i, l, t, tmp1, tmp2, w, x,
        bytes, bitHi, bitLo,
        padlen, padding = [0x80],
        part = Math.ceil(digest / 32),
        hash = ({
          224: [
            0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
            0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4
          ],
          256: [
            0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
            0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
          ]
        })[digest],
        K = [
          0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
          0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
          0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
          0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
          0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
          0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
          0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
          0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
          0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
          0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
          0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
          0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
          0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
          0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
          0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
          0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];
      
      function bSig0(x) {
        return rotr_32(x,  2) ^ rotr_32(x, 13) ^ rotr_32(x, 22);
      }
      function bSig1(x) {
        return rotr_32(x,  6) ^ rotr_32(x, 11) ^ rotr_32(x, 25);
      }
      function sSig0(x) {
        return rotr_32(x,  7) ^ rotr_32(x, 18) ^ (x >>> 3);
      }
      function sSig1(x) {
        return rotr_32(x, 17) ^ rotr_32(x, 19) ^ (x >>> 10);
      }
      
      function ch(x, y, z) {
        return (x & y) ^ ((~x) & z);
      }
      function maj(x, y, z) {
        return (x & y) ^ (x & z) ^ (y & z);
      }
      
      // use bit-length to pad data
      bytes = data.length;
      bitLo = (bytes * 8) & 0xffffffff;
      bitHi = (bytes * 8 / Math.pow(2, 32)) & 0xffffffff;
      
      padlen = ((bytes % 64) < 56 ? 56 : 120) - (bytes % 64);
      while (padding.length < padlen) {
        padding.push(0x0);
      }
      
      x = merge_MSB_32(data.concat(padding)).concat([bitHi, bitLo]);
      
      // update hash
      for (i = 0, w = [], l = x.length; i < l; i += 16) {
        a = hash[0] | 0x0;
        b = hash[1] | 0x0;
        c = hash[2] | 0x0;
        d = hash[3] | 0x0;
        e = hash[4] | 0x0;
        f = hash[5] | 0x0;
        g = hash[6] | 0x0;
        h = hash[7] | 0x0;
        
        for (t = 0; t < 64; t += 1) {
          if (t < 16) {
            w[t] = x[i + t];
          } else {
            w[t] = sSig1(w[t - 2]) + w[t - 7] + sSig0(w[t - 15]) + w[t - 16];
          }
          
          tmp1 = h + bSig1(e) + ch(e, f, g) + K[t] + w[t];
          tmp2 = bSig0(a) + maj(a, b, c);
          h = g;
          g = f;
          f = e;
          e = d + tmp1;
          d = c;
          c = b;
          b = a;
          a = tmp1 + tmp2;
        }
        
        hash[0] += a;
        hash[1] += b;
        hash[2] += c;
        hash[3] += d;
        hash[4] += e;
        hash[5] += f;
        hash[6] += g;
        hash[7] += h;
      }
      
      return self.Encoder(crop(size, split_MSB_32(hash.slice(0, part)), false));
    }
    
    function main224(size, data) {
      return main(224, size, data);
    }
    
    function main256(size, data) {
      return main(256, size, data);
    }
    
    // expose hash function
    
    self.fn.sha224 = function sha224(size, data, hkey) {
      var digest = 224;
      
      // allow size to be optional
      if ('number' !== typeof size.valueOf()) {
        hkey = data;
        data = size;
        size = digest;
      }
      
      size = (0 < size && size <= digest) ? size : digest;
      data = self.Encoder.ready(data);
      hkey = self.Encoder.ready(hkey);
      
      if (self.isInput(hkey)) {
        return hmac(main224, size, digest, data, hkey, 64);
      } else {
        return main224(size, data);
      }
    };
    
    self.fn.sha256 = function sha256(size, data, hkey) {
      var digest = 256;
      
      // allow size to be optional
      if ('number' !== typeof size.valueOf()) {
        hkey = data;
        data = size;
        size = digest;
      }
      
      size = (0 < size && size <= digest) ? size : digest;
      data = self.Encoder.ready(data);
      hkey = self.Encoder.ready(hkey);
      
      if (self.isInput(hkey)) {
        return hmac(main256, size, digest, data, hkey, 64);
      } else {
        return main256(size, data);
      }
    };
    
  }());

  // SHA-2 512 (c) 2006 The Internet Society
  (function () {
    function main(digest, size, data) {
      var a, b, c, d, e, f, g, h, i, l, t, tmp1, tmp2, w, x,
        bytes, bitHi, bitLo,
        padlen, padding = [0x80],
        part = Math.ceil(digest / 64),
        hash = ({
          384: [
            [0xcbbb9d5d, 0xc1059ed8], [0x629a292a, 0x367cd507],
            [0x9159015a, 0x3070dd17], [0x152fecd8, 0xf70e5939],
            [0x67332667, 0xffc00b31], [0x8eb44a87, 0x68581511],
            [0xdb0c2e0d, 0x64f98fa7], [0x47b5481d, 0xbefa4fa4]
          ],
          512: [
            [0x6a09e667, 0xf3bcc908], [0xbb67ae85, 0x84caa73b],
            [0x3c6ef372, 0xfe94f82b], [0xa54ff53a, 0x5f1d36f1],
            [0x510e527f, 0xade682d1], [0x9b05688c, 0x2b3e6c1f],
            [0x1f83d9ab, 0xfb41bd6b], [0x5be0cd19, 0x137e2179]
          ]
        })[digest],
        K = [
          [0x428a2f98, 0xd728ae22], [0x71374491, 0x23ef65cd],
          [0xb5c0fbcf, 0xec4d3b2f], [0xe9b5dba5, 0x8189dbbc],
          [0x3956c25b, 0xf348b538], [0x59f111f1, 0xb605d019],
          [0x923f82a4, 0xaf194f9b], [0xab1c5ed5, 0xda6d8118],
          [0xd807aa98, 0xa3030242], [0x12835b01, 0x45706fbe],
          [0x243185be, 0x4ee4b28c], [0x550c7dc3, 0xd5ffb4e2],
          [0x72be5d74, 0xf27b896f], [0x80deb1fe, 0x3b1696b1],
          [0x9bdc06a7, 0x25c71235], [0xc19bf174, 0xcf692694],
          [0xe49b69c1, 0x9ef14ad2], [0xefbe4786, 0x384f25e3],
          [0x0fc19dc6, 0x8b8cd5b5], [0x240ca1cc, 0x77ac9c65],
          [0x2de92c6f, 0x592b0275], [0x4a7484aa, 0x6ea6e483],
          [0x5cb0a9dc, 0xbd41fbd4], [0x76f988da, 0x831153b5],
          [0x983e5152, 0xee66dfab], [0xa831c66d, 0x2db43210],
          [0xb00327c8, 0x98fb213f], [0xbf597fc7, 0xbeef0ee4],
          [0xc6e00bf3, 0x3da88fc2], [0xd5a79147, 0x930aa725],
          [0x06ca6351, 0xe003826f], [0x14292967, 0x0a0e6e70],
          [0x27b70a85, 0x46d22ffc], [0x2e1b2138, 0x5c26c926],
          [0x4d2c6dfc, 0x5ac42aed], [0x53380d13, 0x9d95b3df],
          [0x650a7354, 0x8baf63de], [0x766a0abb, 0x3c77b2a8],
          [0x81c2c92e, 0x47edaee6], [0x92722c85, 0x1482353b],
          [0xa2bfe8a1, 0x4cf10364], [0xa81a664b, 0xbc423001],
          [0xc24b8b70, 0xd0f89791], [0xc76c51a3, 0x0654be30],
          [0xd192e819, 0xd6ef5218], [0xd6990624, 0x5565a910],
          [0xf40e3585, 0x5771202a], [0x106aa070, 0x32bbd1b8],
          [0x19a4c116, 0xb8d2d0c8], [0x1e376c08, 0x5141ab53],
          [0x2748774c, 0xdf8eeb99], [0x34b0bcb5, 0xe19b48a8],
          [0x391c0cb3, 0xc5c95a63], [0x4ed8aa4a, 0xe3418acb],
          [0x5b9cca4f, 0x7763e373], [0x682e6ff3, 0xd6b2b8a3],
          [0x748f82ee, 0x5defb2fc], [0x78a5636f, 0x43172f60],
          [0x84c87814, 0xa1f0ab72], [0x8cc70208, 0x1a6439ec],
          [0x90befffa, 0x23631e28], [0xa4506ceb, 0xde82bde9],
          [0xbef9a3f7, 0xb2c67915], [0xc67178f2, 0xe372532b],
          [0xca273ece, 0xea26619c], [0xd186b8c7, 0x21c0c207],
          [0xeada7dd6, 0xcde0eb1e], [0xf57d4f7f, 0xee6ed178],
          [0x06f067aa, 0x72176fba], [0x0a637dc5, 0xa2c898a6],
          [0x113f9804, 0xbef90dae], [0x1b710b35, 0x131c471b],
          [0x28db77f5, 0x23047d84], [0x32caab7b, 0x40c72493],
          [0x3c9ebe0a, 0x15c9bebc], [0x431d67c4, 0x9c100d4c],
          [0x4cc5d4be, 0xcb3e42b6], [0x597f299c, 0xfc657e2a],
          [0x5fcb6fab, 0x3ad6faec], [0x6c44198c, 0x4a475817]
        ];
      
      function bSig0(x) {
        return xor_64(xor_64(rotr_64(x, 28), rotr_64(x, 34)), rotr_64(x, 39));
      }
      function bSig1(x) {
        return xor_64(xor_64(rotr_64(x, 14), rotr_64(x, 18)), rotr_64(x, 41));
      }
      function sSig0(x) {
        return xor_64(xor_64(rotr_64(x,  1), rotr_64(x,  8)), shr_64(x, 7));
      }
      function sSig1(x) {
        return xor_64(xor_64(rotr_64(x, 19), rotr_64(x, 61)), shr_64(x, 6));
      }
      
      function ch(x, y, z) {
        return xor_64(and_64(x, y), and_64(not_64(x), z));
      }
      function maj(x, y, z) {
        return xor_64(xor_64(and_64(x, y), and_64(x, z)), and_64(y, z));
      }
      
      // use bit-length to pad data
      bytes = data.length;
      bitHi = ulong([
        bytes * 8 / Math.pow(2, 96),
        bytes * 8 / Math.pow(2, 64)
      ]);
      bitLo = ulong([
        bytes * 8 / Math.pow(2, 32),
        bytes * 8
      ]);
      
      padlen = ((bytes % 128) < 112 ? 112 : 240) - (bytes % 128);
      while (padding.length < padlen) {
        padding.push(0x0);
      }
      
      x = merge_MSB_64(data.concat(padding)).concat([bitHi, bitLo]);
      
      // update hash
      for (i = 0, l = x.length; i < l; i += 16) {
        a = [].concat(hash[0]);
        b = [].concat(hash[1]);
        c = [].concat(hash[2]);
        d = [].concat(hash[3]);
        e = [].concat(hash[4]);
        f = [].concat(hash[5]);
        g = [].concat(hash[6]);
        h = [].concat(hash[7]);
        
        for (w = [], t = 0; t < 80; t += 1) {
          if (t < 16) {
            w[t] = [].concat(x[i + t]);
          } else {
            w[t] = add_64(add_64(sSig1(w[t - 2]), w[t - 7]), add_64(sSig0(w[t - 15]), w[t - 16]));
          }
          
          tmp1 = add_64(add_64(add_64(h, bSig1(e)), ch(e, f, g)), add_64(K[t], w[t]));
          tmp2 = add_64(bSig0(a), maj(a, b, c));
          h = ulong(g);
          g = ulong(f);
          f = ulong(e);
          e = add_64(d, tmp1);
          d = ulong(c);
          c = ulong(b);
          b = ulong(a);
          a = add_64(tmp1, tmp2);
        }
        
        hash[0] = add_64(hash[0], a);
        hash[1] = add_64(hash[1], b);
        hash[2] = add_64(hash[2], c);
        hash[3] = add_64(hash[3], d);
        hash[4] = add_64(hash[4], e);
        hash[5] = add_64(hash[5], f);
        hash[6] = add_64(hash[6], g);
        hash[7] = add_64(hash[7], h);
      }
      
      return self.Encoder(crop(size, split_MSB_64(hash.slice(0, part)), false));
    }
    
    function main384(size, data) {
      return main(384, size, data);
    }
    
    function main512(size, data) {
      return main(512, size, data);
    }
    
    // expose hash function
    
    self.fn.sha384 = function sha384(size, data, hkey) {
      var digest = 384;
      
      // allow size to be optional
      if ('number' !== typeof size.valueOf()) {
        hkey = data;
        data = size;
        size = digest;
      }
      
      size = (0 < size && size <= digest) ? size : digest;
      data = self.Encoder.ready(data);
      hkey = self.Encoder.ready(hkey);
      
      if (self.isInput(hkey)) {
        return hmac(main384, size, digest, data, hkey, 128);
      } else {
        return main384(size, data);
      }
    };
    
    self.fn.sha512 = function sha512(size, data, hkey) {
      var digest = 512;
      
      // allow size to be optional
      if ('number' !== typeof size.valueOf()) {
        hkey = data;
        data = size;
        size = digest;
      }
      
      size = (0 < size && size <= digest) ? size : digest;
      data = self.Encoder.ready(data);
      hkey = self.Encoder.ready(hkey);
      
      if (self.isInput(hkey)) {
        return hmac(main512, size, digest, data, hkey, 128);
      } else {
        return main512(size, data);
      }
    };
    
  }());

  // Skein 1.2 (c) 2009 Bruce Schneier, et al.
  (function SKEIN() {
    var CONST = {
      256 : {
        Nb: 32,
        Nr: 72,
        Nw:  4,
        PI: [0, 3, 2, 1],
        R : [
          [14, 16],
          [52, 57],
          [23, 40],
          [ 5, 37],
          [25, 33],
          [46, 12],
          [58, 22],
          [32, 32]
        ]
      },
      512 : {
        Nb: 64,
        Nr: 72,
        Nw:  8,
        PI: [2, 1, 4, 7, 6, 5, 0, 3],
        R : [
          [46, 36, 19, 37],
          [33, 27, 14, 42],
          [17, 49, 36, 39],
          [44,  9, 54, 56],
          [39, 30, 34, 24],
          [13, 50, 10, 17],
          [25, 29, 39, 43],
          [ 8, 35, 56, 22]
        ]
      },
      1024: {
        Nb: 128,
        Nr:  80,
        Nw:  16,
        PI: [0, 9, 2, 13, 6, 11, 4, 15, 10, 7, 12, 3, 14, 5, 8, 1],
        R : [
          [24, 13,  8, 47,  8, 17, 22, 37],
          [38, 19, 10, 55, 49, 18, 23, 52],
          [33,  4, 51, 13, 34, 41, 59, 17],
          [ 5, 20, 48, 41, 47, 28, 16, 25],
          [41,  9, 37, 31, 12, 47, 44, 30],
          [16, 34, 56, 51,  4, 53, 42, 41],
          [31, 44, 47, 46, 19, 42, 44, 25],
          [ 9, 48, 35, 52, 23, 31, 37, 20]
        ]
      }
    };
    
    function tweak(pos, type, fst, fin) {
      var int0, int1, int2, int3;
      int3 = pos | 0x0;
      int2 = (pos / Math.pow(2, 32)) | 0x0;
      int1 = (pos / Math.pow(2, 64)) | 0x0;
      int0 = ((fin && 0x80) | (fst && 0x40) | type) << 24;
      return split_LSB_64([[int2, int3], [int0, int1]]);
    }
    tweak.KEY = 0x00;
    tweak.CONFIG = 0x04;
    tweak.PERSONALIZE = 0x08;
    tweak.PUBLICKEY = 0x10;
    tweak.NONCE = 0x14;
    tweak.MESSAGE = 0x30;
    tweak.OUT = 0x3F;
    
    // define hash function
    
    function skein(digest, size, data, key) {
      var C, G, No, Nb, Nr, Nw, PI, R,
        Km = [0x55555555, 0x55555555];
      
      // establish Skein "constants" in scope
      No = size;
      Nb = CONST[digest].Nb;
      Nr = CONST[digest].Nr;
      Nw = CONST[digest].Nw;
      PI = CONST[digest].PI.slice(0);
      R  = CONST[digest].R.slice(0);
      
      function mix0(x, y) {
        return add_64(x, y);
      }
      function mix1(x, y, r) {
        return xor_64(rotl_64(y, r), x);
      }
      
      function threefish(K, T, P) {
        var c, d, e, i, j, k, ks, t, p, s, v;
        k = merge_LSB_64(K);
        t = merge_LSB_64(T);
        p = merge_LSB_64(P);
        v = [].concat(p);
        
        // extended key
        k[Nw] = Km;
        for (i = 0; i < Nw; i += 1) {
          k[Nw] = xor_64(k[Nw], k[i]);
        }
        
        // extended tweak
        t[2] = xor_64(t[0], t[1]);
        
        // execute hash rounds
        for (d = 0, s = 0; d < Nr; d += 1) {
          e = [].concat(v);
          
          // key schedule
          if (0 === (d % 4)) {
            ks = [];
            
            // rotate k into ks
            for (i = 0; i <= Nw; i += 1) {
              ks[i] = k[(s + i) % (Nw + 1)];
            }
            
            ks[Nw - 3] = add_64(ks[Nw - 3], t[s % 3]);
            ks[Nw - 2] = add_64(ks[Nw - 2], t[(s + 1) % 3]);
            ks[Nw - 1] = add_64(ks[Nw - 1], [0, s]);
            
            // include ks in e
            for (i = 0; i < Nw; i += 1) {
              e[i] = add_64(e[i], ks[i]);
            }
            
            // increment for next key schedule
            s += 1;
          }
          
          // MIX
          for (j = 0; j < (Nw / 2); j += 1) {
            e[2 * j + 0] = mix0(e[2 * j + 0], e[2 * j + 1]);
            e[2 * j + 1] = mix1(e[2 * j + 0], e[2 * j + 1], R[d % 8][j]);
          }
          
          // Permute
          for (i = 0; i < Nw; i += 1) {
            v[i] = e[PI[i]];
          }
        }
        
        // final key schedule
        for (c = [], i = 0; i < Nw; i += 1) {
          c[i] = add_64(v[i], k[(s + i) % (Nw + 1)]);
        }
        c[Nw - 3] = add_64(c[Nw - 3], t[s % 3]);
        c[Nw - 2] = add_64(c[Nw - 2], t[(s + 1) % 3]);
        c[Nw - 1] = add_64(c[Nw - 1], [0, s]);
        
        return split_LSB_64(c);
      }
      
      function ubi(G, M, type) {
        var i, k, l, K, H, N, fst, fin, pos;
        K = [];
        H = [].concat(G);
        M = [].concat(M);
        N = M.length;
        
        // pad message
        while ((M.length < 1) || (M.length % Nb) > 0) {
          M.push(0x00);
        }
        
        // split M into Nb blocks (K)
        while (M.length > 0) {
          K.push(M.slice(0, Nb));
          M = M.slice(Nb);
        }
        
        // cycle through each block in the message
        for (k = 0, pos = 0, l = K.length; k < l; k += 1) {
          pos += Nb;
          fst = k === 0;
          fin = k === (K.length - 1);
          
          // process block, creating a new tweak
          H = threefish(H, tweak(Math.min(N, pos), type, fst, fin), K[k]);
          
          for (i = 0; i < H.length; i += 1) {
            H[i] ^= K[k][i];
          }
        }
        
        return H;
      }
      
      // build initial chain value (key)
      G = [];
      G.length = Nb;
      
      // build config byte array
      C = [];
      C.push(0x53, 0x48, 0x41, 0x33); // Schema: "SHA3"
      C.push(0x01, 0x00, 0x00, 0x00); // Version / Reserved
      C = C.concat(split_LSB_64([[0, No]])); // Output length
      C.length = 32;
      
      // process blocks
      if (key) {
        G = ubi(G, key, tweak.KEY);
      }
      G = ubi(G, C, tweak.CONFIG);
      G = ubi(G, data, tweak.MESSAGE);
      G = ubi(G, [0, 0, 0, 0, 0, 0, 0, 0], tweak.OUT);
      
      return self.Encoder(crop(No, G, false));
    }
    
    // expose hash function
    
    self.fn.skein256 = function skein256(size, data, key) {
      var digest = 256;
      
      // allow size to be optional
      if ('number' !== typeof size.valueOf()) {
        key = data;
        data = size;
        size = digest;
      }
      
      size = (0 < size && size <= digest) ? size : digest;
      data = self.Encoder.ready(data);
      key  = self.Encoder.ready(key);
      
      return skein(digest, size, data, key);
    };
    
    self.fn.skein512 = function skein512(size, data, key) {
      var digest = 512;
      
      // allow size to be optional
      if ('number' !== typeof size.valueOf()) {
        key = data;
        data = size;
        size = digest;
      }
      
      size = (0 < size && size <= digest) ? size : digest;
      data = self.Encoder.ready(data);
      key  = self.Encoder.ready(key);
      
      return skein(digest, size, data, key);
    };
    
    self.fn.skein1024 = function skein1024(size, data, key) {
      var digest = 1024;
      
      // allow size to be optional
      if ('number' !== typeof size.valueOf()) {
        key = data;
        data = size;
        size = digest;
      }
      
      size = (0 < size && size <= digest) ? size : digest;
      data = self.Encoder.ready(data);
      key  = self.Encoder.ready(key);
      
      return skein(digest, size, data, key);
    };
    
  }());

  // Expose Digest
  host.Digest = self;

}());
