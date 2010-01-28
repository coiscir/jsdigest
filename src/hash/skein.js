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
