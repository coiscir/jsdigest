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
