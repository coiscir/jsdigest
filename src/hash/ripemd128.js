// RIPEMD-128 (c) 1996 Hans Dobbertin, Antoon Bosselaers, and Bart Preneel
(function () {
  'Copyright (c) 1996 Hans Dobbertin, Antoon Bosselaers, and Bart Preneel';
  
  function main(data) {
    var aa, bb, cc, dd, aaa, bbb, ccc, ddd, i, l, r, rr, t, tmp, x,
      bytes, bitHi, bitLo,
      padlen, padding = [0x80],
      hash = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476],
      S = [
        11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8, // round 1
        +7,  6,  8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12, // round 2
        11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5, // round 3
        11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12, // round 4
        +8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6, // parallel round 1
        +9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11, // parallel round 2
        +9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5, // parallel round 3
        15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8  // parallel round 4
      ],
      X = [
        +0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, // round 1
        +7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8, // round 2
        +3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12, // round 3
        +1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2, // round 4
        +5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12, // parallel round 1
        +6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2, // parallel round 2
        15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13, // parallel round 3
        +8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14  // parallel round 4
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
        aa = rotl_32((aa + F[r](bb, cc, dd) + x[i + X[t]] + K[r]), S[t]);
        
        tmp = dd;
        dd = cc;
        cc = bb;
        bb = aa;
        aa = tmp;
      }
      
      for (; t < 128; t += 1) {
        r = Math.floor(t / 16);
        rr = Math.floor((63 - (t % 64)) / 16);
        aaa = rotl_32((aaa + F[rr](bbb, ccc, ddd) + x[i + X[t]] + K[r]), S[t]);
        
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
    
    return self.Encoder(split_LSB_32(hash));
  }
  
  // expose hash function
  
  self.fn.ripemd128 = function ripemd128(data, hkey) {
    data = self.Encoder.ready(data);
    hkey = self.Encoder.ready(hkey);
    
    if (self.isInput(hkey)) {
      return self.hmac(main, data, hkey, 64);
    } else {
      return main(data);
    }
  };
  
}());