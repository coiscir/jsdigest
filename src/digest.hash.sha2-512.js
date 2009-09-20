/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  SHA (c) 2006 The Internet Society
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function () {
  
  function sha2(data, hash, part) {
    var a, b, c, d, e, f, g, h, i, t, tmp1, tmp2, w, x,
      bytes, bitHi, bitLo,
      padlen, padding,
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
    
    function ulong(x) {
      return Digest.ulong.ulong(x);
    }
    function add(x, y) {
      return Digest.ulong.add(x, y);
    }
    function and(x, y) {
      return Digest.ulong.and(x, y);
    }
    function xor(x, y) {
      return Digest.ulong.xor(x, y);
    }
    function not(x) {
      return Digest.ulong.not(x);
    }
    function rotr(x, n) {
      return Digest.ulong.rotr(x, n);
    }
    function shr(x, n) {
      return Digest.ulong.shr(x, n);
    }
    
    function merge(input) {
      var i, j, output = [];
      for (i = 0, j = 0; j < input.length; i += 1, j = (i * 8)) {
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
    
    function split(input) {
      var i, output = [];
      for (i = 0; i < input.length; i += 1) {
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
    
    function bSig0(x) {
      return xor(xor(rotr(x, 28), rotr(x, 34)), rotr(x, 39));
    }
    function bSig1(x) {
      return xor(xor(rotr(x, 14), rotr(x, 18)), rotr(x, 41));
    }
    function sSig0(x) {
      return xor(xor(rotr(x,  1), rotr(x,  8)), shr(x, 7));
    }
    function sSig1(x) {
      return xor(xor(rotr(x, 19), rotr(x, 61)), shr(x, 6));
    }
    
    function ch(x, y, z) {
      return xor(and(x, y), and(not(x), z));
    }
    function maj(x, y, z) {
      return xor(xor(and(x, y), and(x, z)), and(y, z));
    }
    
    // pad data
    bytes = data.length;
    
    padding = '\x80';
    padlen = ((bytes % 128) < 112 ? 112 : 240) - (bytes % 128);
    while (padding.length < padlen) {
      padding += '\x00';
    }
    
    bitLo = ulong([
      bytes * 8 / Math.pow(2, 32),
      bytes * 8
    ]);
    bytes = bytes / Math.pow(2, 32) / Math.pow(2, 32);
    bitHi = ulong([
      bytes * 8 / Math.pow(2, 32),
      bytes * 8
    ]);
    
    data += padding;
    x = merge(Digest.Encoder(data).single()).concat([bitHi, bitLo]);
    
    for (i = 0; i < x.length; i += 16) {
      a = ulong(hash[0]);
      b = ulong(hash[1]);
      c = ulong(hash[2]);
      d = ulong(hash[3]);
      e = ulong(hash[4]);
      f = ulong(hash[5]);
      g = ulong(hash[6]);
      h = ulong(hash[7]);
      
      for (w = [], t = 0; t < 80; t += 1) {
        if (t < 16) {
          w[t] = ulong(x[i + t]);
        } else {
          w[t] = add(add(sSig1(w[t - 2]), w[t - 7]), add(sSig0(w[t - 15]), w[t - 16]));
        }
        
        tmp1 = add(add(add(h, bSig1(e)), ch(e, f, g)), add(K[t], w[t]));
        tmp2 = add(bSig0(a), maj(a, b, c));
        h = ulong(g);
        g = ulong(f);
        f = ulong(e);
        e = add(d, tmp1);
        d = ulong(c);
        c = ulong(b);
        b = ulong(a);
        a = add(tmp1, tmp2);
      }
      
      hash[0] = add(hash[0], a);
      hash[1] = add(hash[1], b);
      hash[2] = add(hash[2], c);
      hash[3] = add(hash[3], d);
      hash[4] = add(hash[4], e);
      hash[5] = add(hash[5], f);
      hash[6] = add(hash[6], g);
      hash[7] = add(hash[7], h);
    }
    
    return Digest.Encoder(split(hash.slice(0, part)));
  }
  
  this.Digest.fn.sha384 = function sha384(data, utf8) {
    if ('string' !== typeof data) {
      throw new Error('Data must be a String');
    }
    
    // single-byte encode data, either UTF-8 or truncated
    if (false !== utf8) data = Digest.Encoder(data).utf8();
    
    var HASH = [
      [0xcbbb9d5d, 0xc1059ed8], [0x629a292a, 0x367cd507],
      [0x9159015a, 0x3070dd17], [0x152fecd8, 0xf70e5939],
      [0x67332667, 0xffc00b31], [0x8eb44a87, 0x68581511],
      [0xdb0c2e0d, 0x64f98fa7], [0x47b5481d, 0xbefa4fa4]
    ];
    
    return sha2(data, HASH, 6);
  };
  
  this.Digest.fn.sha512 = function sha512(data, utf8) {
    if ('string' !== typeof data) {
      throw new Error('Data must be a String');
    }
    
    // single-byte encode data, either UTF-8 or truncated
    if (false !== utf8) data = Digest.Encoder(data).utf8();
    
    var HASH = [
      [0x6a09e667, 0xf3bcc908], [0xbb67ae85, 0x84caa73b],
      [0x3c6ef372, 0xfe94f82b], [0xa54ff53a, 0x5f1d36f1],
      [0x510e527f, 0xade682d1], [0x9b05688c, 0x2b3e6c1f],
      [0x1f83d9ab, 0xfb41bd6b], [0x5be0cd19, 0x137e2179]
    ];
    
    return sha2(data, HASH, 8);
  };
  
  // MAC configurations
  this.Digest.configure(this.Digest.fn.sha384, {block: 128, curry: [false]});
  this.Digest.configure(this.Digest.fn.sha512, {block: 128, curry: [false]});
  
}());
