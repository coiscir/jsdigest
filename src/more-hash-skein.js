/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  Skein 1.2 (c) 2009 Bruce Schneier, et al.
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function () {
  
  function skein(digest, len, data, utf8) {
    if (!(0 < len && len <= digest)) {
      throw new Error('Digest len is out of range (0 < len <= ' + digest + ')');
    }
    if ('string' !== typeof data) {
      throw new Error('Data must be a String');
    }
    
    function add(x, y) {
      return Digest.ulong.add(x, y);
    }
    function xor(x, y) {
      return Digest.ulong.xor(x, y);
    }
    function rotl(x, n) {
      return Digest.ulong.rotl(x, n);
    }
    
    function merge(input) {
      var i, j, output = [];
      for (i = 0, j = 0; j < input.length; i += 1, j = (i * 8)) {
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
    
    function split(input) {
      var i, output = [];
      for (i = 0; i < input.length; i += 1) {
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
    
    function tweak(pos, type, fst, fin) {
      var int0, int1, int2, int3;
      int3 = pos | 0x0;
      int2 = (pos / Math.pow(2, 32)) | 0x0;
      int1 = (pos / Math.pow(2, 64)) | 0x0;
      int0 = ((fin && 0x80) | (fst && 0x40) | type) << 24;
      return split([[int2, int3], [int0, int1]]);
    }
    tweak.KEY = 0x00;
    tweak.CONFIG = 0x04;
    tweak.PERSONALIZE = 0x08;
    tweak.PUBLICKEY = 0x10;
    tweak.NONCE = 0x14;
    tweak.MESSAGE = 0x30;
    tweak.OUT = 0x3F;
    
    // Encode inputs unless disabled
    if (false !== utf8) {
      data = Digest.Encoder(data).utf8();
    }
    
    var CONST, C, G, K, No, Nb, Nr, Nw, PI, R,
      Km = [0x55555555, 0x55555555];
      
    CONST = {
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
    
    // establish Skein "constants" in scope
    No = len;
    Nb = CONST[digest].Nb;
    Nr = CONST[digest].Nr;
    Nw = CONST[digest].Nw;
    PI = CONST[digest].PI;
    R  = CONST[digest].R;
    
    function mix0(x, y) {
      return add(x, y);
    }
    function mix1(x, y, r) {
      return xor(rotl(y, r), x);
    }
    
    function threefish(K, T, P) {
      var c, d, e, i, j, k, ks, t, p, s, v;
      k = merge(K);
      t = merge(T);
      p = merge(P);
      v = [].concat(p);
      
      // extended key
      k[Nw] = Km;
      for (i = 0; i < Nw; i += 1) {
        k[Nw] = xor(k[Nw], k[i]);
      }
      
      // extended tweak
      t[2] = xor(t[0], t[1]);
      
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
          
          ks[Nw - 3] = add(ks[Nw - 3], t[s % 3]);
          ks[Nw - 2] = add(ks[Nw - 2], t[(s + 1) % 3]);
          ks[Nw - 1] = add(ks[Nw - 1], [0, s]);
          
          // include ks in e
          for (i = 0; i < Nw; i += 1) {
            e[i] = add(e[i], ks[i]);
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
        c[i] = add(v[i], k[(s + i) % (Nw + 1)]);
      }
      c[Nw - 3] = add(c[Nw - 3], t[s % 3]);
      c[Nw - 2] = add(c[Nw - 2], t[(s + 1) % 3]);
      c[Nw - 1] = add(c[Nw - 1], [0, s]);
      
      return split(c);
    }
    
    function ubi(G, M, type) {
      var i, k, K, H, N, fst, fin, pos;
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
      for (k = 0, pos = 0; k < K.length; k += 1) {
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
    
    // cut hash to len, reducing last byte when ((len % 8) != 0)
    function cut(G) {
      var H, L, R;
      L = Math.floor((No + 7) / 8);
      R = No % 8;
      H = G.slice(0, L);
      
      if (R > 0) {
        H[L - 1] &= (0xff << (8 - R));
      }
      
      return H;
    }
    
    // build initial chain value (key)
    K = [];
    while (K.length < Nb) {
      K.push(0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0);
    }
    
    // build config byte array
    C = [];
    C.push(0x53, 0x48, 0x41, 0x33); // Schema: "SHA3"
    C.push(0x01, 0x00, 0x00, 0x00); // Version / Reserved
    C = C.concat(split([[0, No]])); // Output length
    C.push(0x00, 0x00, 0x00, 0x00); // Tree / Reserved
    C.push(0x00, 0x00, 0x00, 0x00); // Reserved
    C.push(0x00, 0x00, 0x00, 0x00);
    C.push(0x00, 0x00, 0x00, 0x00);
    
    // process blocks
    G = ubi(K, C, tweak.CONFIG);
    G = ubi(G, Digest.Encoder(data).single(), tweak.MESSAGE);
    G = ubi(G, [0, 0, 0, 0, 0, 0, 0, 0], tweak.OUT);
    
    return Digest.Encoder(cut(G));
  }
  
  this.Digest.skein256 = function skein256(len, data, utf8) {
    return skein(256, len, data, utf8);
  };
  
  this.Digest.skein512 = function skein512(len, data, utf8) {
    return skein(512, len, data, utf8);
  };
  
  this.Digest.skein1024 = function skein1024(len, data, utf8) {
    return skein(1024, len, data, utf8);
  };
  
}());
