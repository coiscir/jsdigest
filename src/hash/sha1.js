// SHA-1 (c) 2006 The Internet Society
(function () {
  'Copyright (c) 2006 The Internet Society';
  
  function merge(input) {
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
  
  function split(input) {
    var i, l, output = [];
    for (i = 0, l = input.length; i < l; i += 1) {
      output.push((input[i] >> 24) & 0xff);
      output.push((input[i] >> 16) & 0xff);
      output.push((input[i] >>  8) & 0xff);
      output.push((input[i] >>  0) & 0xff);
    }
    return output;
  }
  
  // define hash function
  
  function main(data) {
    var a, b, c, d, e, i, l, t, tmp, w, x,
      bytes, bitHi, bitLo,
      padlen, padding = [0x80],
      hash = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
    
    function func(t, b, c, d) {
      switch (Math.floor(t / 20)) {
      case 0:
        return (b & c) | ((~b) & d);
      case 1:
        return (b ^ c ^ d);
      case 2:
        return (b & c) | (b & d) | (c & d);
      case 3:
        return (b ^ c ^ d);
      }
    }
    
    function konst(t) {
      switch (Math.floor(t / 20)) {
      case 0:
        return 0x5a827999;
      case 1:
        return 0x6ed9eba1;
      case 2:
        return 0x8f1bbcdc;
      case 3:
        return 0xca62c1d6;
      }
    }
    
    // use bit-length to pad data
    bytes = data.length;
    bitLo = (bytes * 8) & 0xffffffff;
    bitHi = (bytes * 8 / Math.pow(2, 32)) & 0xffffffff;
    
    padlen = ((bytes % 64) < 56 ? 56 : 120) - (bytes % 64);
    while (padding.length < padlen) {
      padding.push(0x0);
    }
    
    x = merge(data.concat(padding)).concat([bitHi, bitLo]);
    
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
        
        tmp = (rotl_32(a, 5) + func(t, b, c, d) + e + w[t] + konst(t));
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
    
    return self.Encoder(split(hash));
  }
  
  // expose hash function
  
  self.fn.sha1 = function sha1(data, hkey) {
    data = self.Encoder.ready(data);
    hkey = self.Encoder.ready(hkey);
    
    if (self.isInput(hkey)) {
      return self.hmac(main, data, hkey, 64);
    } else {
      return main(data);
    }
  };
  
}());
