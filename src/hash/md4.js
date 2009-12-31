// MD4 (c) 1990 Ronald L. Rivest
(function () {
  'Copyright (c) 1990 Ronald L. Rivest';
  
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
        0, 1, 2,  3, 4,  5, 6,  7, 8, 9, 10, 11, 12, 13, 14, 15, // Round 1
        0, 4, 8, 12, 1,  5, 9, 13, 2, 6, 10, 14,  3,  7, 11, 15, // Round 2
        0, 8, 4, 12, 2, 10, 6, 14, 1, 9,  5, 13,  3, 11,  7, 15  // Round 3
      ];
    
    function func(t, x, y, z) {
      switch (Math.floor(t / 16)) {
      case 0:
        return (x & y) | ((~x) & z);
      case 1:
        return (x & y) | (x & z) | (y & z);
      case 2:
        return (x ^ y ^ z);
      }
    }
    
    function konst(t) {
      switch (Math.floor(t / 16)) {
      case 0:
        return 0x00000000;
      case 1:
        return 0x5a827999;
      case 2:
        return 0x6ed9eba1;
      }
    }
    
    function shift(t) {
      switch (Math.floor(t / 16)) {
      case 0:
        return [3, 7, 11, 19][t % 4];
      case 1:
        return [3, 5,  9, 13][t % 4];
      case 2:
        return [3, 9, 11, 15][t % 4];
      }
    }
    
    function calc(t, a, b, c, d, x) {
      return rotl_32((a + func(t, b, c, d) + x + konst(t)), shift(t));
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
      
      for (t = 0; t < 48; t += 1) {
        a = calc(t, a, b, c, d, x[i + X[t]]);
        
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
  
  self.fn.md4 = function md4(data, hkey) {
    data = self.Encoder.ready(data);
    hkey = self.Encoder.ready(hkey);
    
    if (self.isInput(hkey)) {
      return self.hmac(main, data, hkey, 64);
    } else {
      return main(data);
    }
  };
  
}());
