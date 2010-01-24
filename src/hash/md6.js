// MD6 r2009-04-15 (c) 2009 Ronald L. Rivest, et al.
(function () {
  'Copyright (c) 2009 Ronald L. Rivest, et al.';
  
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
