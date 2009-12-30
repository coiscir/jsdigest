/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  MD5 (c) 1992 Ronald L. Rivest
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function MD5(self) {
  'Copyright (c) 1992 Ronald L. Rivest';
  
  function rotl(x, n) {
    return ((x << n) | (x >>> (32 - n)));
  }
  
  function merge(input) {
    var i, j, l, output = [];
    for (i = 0, j = 0, l = input.length; j < l; i += 1, j = (i * 4)) {
      output[i] = ((input[j]) & 0xff) |
        ((input[j + 1] <<  8) & 0xff00) |
        ((input[j + 2] << 16) & 0xff0000) |
        ((input[j + 3] << 24) & 0xff000000);
    }
    return output;
  }
  
  function split(input) {
    var i, l, output = [];
    for (i = 0, l = input.length; i < l; i += 1) {
      output.push((input[i] >>  0) & 0xff);
      output.push((input[i] >>  8) & 0xff);
      output.push((input[i] >> 16) & 0xff);
      output.push((input[i] >> 24) & 0xff);
    }
    return output;
  }
  
  // define hash function
  
  function main(data) {
    var a, b, c, d, i, l, t, tmp, x,
      bytes, bitHi, bitLo,
      padlen, padding = [0x80],
      hash = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476],
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
      ];
    
    function func(t, x, y, z) {
      switch (Math.floor(t / 16)) {
      case 0:
        return (x & y) | ((~x) & z);
      case 1:
        return (x & z) | (y & (~z));
      case 2:
        return (x ^ y ^ z);
      case 3:
        return (y ^ (x | (~z)));
      }
    }
    
    function shift(t) {
      switch (Math.floor(t / 16)) {
      case 0:
        return [7, 12, 17, 22][t % 4];
      case 1:
        return [5,  9, 14, 20][t % 4];
      case 2:
        return [4, 11, 16, 23][t % 4];
      case 3:
        return [6, 10, 15, 21][t % 4];
      }
    }
    
    function calc(t, a, b, c, d, x, ac) {
      return rotl((a + func(t, b, c, d) + x + ac), shift(t)) + b;
    }
    
    // use bit-length to pad data
    bytes = data.length;
    bitLo = (bytes * 8) & 0xffffffff;
    bitHi = (bytes * 8 / Math.pow(2, 32)) & 0xffffffff;
    
    padlen = ((bytes % 64) < 56 ? 56 : 120) - (bytes % 64);
    while (padding.length < padlen) {
      padding.push(0x0);
    }
    
    x = merge(data.concat(padding)).concat([bitLo, bitHi]);
    
    // update hash
    for (i = 0, l = x.length; i < l; i += 16) {
      a = hash[0];
      b = hash[1];
      c = hash[2];
      d = hash[3];
      
      for (t = 0; t < 64; t += 1) {
        a = calc(t, a, b, c, d, x[i + X[t]], AC[t]);
        
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
    
    return self.Encoder(split(hash));
  }
  
  // expose hash function
  
  self.fn.md5 = function md5(data, hkey) {
    data = self.Encoder.ready(data);
    hkey = self.Encoder.ready(hkey);
    
    if (self.isInput(hkey)) {
      return self.hmac(main, data, hkey, 64);
    } else {
      return main(data);
    }
  };
  
}(Digest));
