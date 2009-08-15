/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  SHA-1 (c) 2006 The Internet Society
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function () {
  
  this.Digest.fn.sha1 = function sha1(data, ansi) {
    if ('string' !== typeof data) {
      throw new Error('Data must be a String');
    }
    
    var a, b, c, d, e, i, t, tmp, w, x,
      bytes, bitHi, bitLo,
      padlen, padding,
      hash = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
    
    function rotl(x, n) {
      return ((x << n) | (x >>> (32 - n)));
    }
    
    function merge(input) {
      var i, j, output = [];
      for (i = 0, j = 0; j < input.length; i += 1, j = (i * 4)) {
        output[i] = 
          ((input[j + 0] & 0xff) << 24) |
          ((input[j + 1] & 0xff) << 16) |
          ((input[j + 2] & 0xff) <<  8) |
          ((input[j + 3] & 0xff) <<  0);
      }
      return output;
    }
    
    function split(input) {
      var i, output = [];
      for (i = 0; i < input.length; i += 1) {
        output.push((input[i] >> 24) & 0xff);
        output.push((input[i] >> 16) & 0xff);
        output.push((input[i] >>  8) & 0xff);
        output.push((input[i] >>  0) & 0xff);
      }
      return output;
    }
    
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
    
    // single-byte encode data, either UTF-8 or truncated
    data = Digest.Encoder(data)[true === ansi ? 'ansi' : 'utf8']();
    
    // pad data
    bytes = data.length;
    bitLo = (bytes * 8) & 0xffffffff;
    bitHi = (bytes * 8 / Math.pow(2, 32)) & 0xffffffff;
    
    padding = '\x80';
    padlen = ((bytes % 64) < 56 ? 56 : 120) - (bytes % 64);
    while (padding.length < padlen) {
      padding += '\x00';
    }
    
    data += padding;
    x = merge(Digest.Encoder(data).single()).concat([bitHi, bitLo]);
    
    // update hash
    for (i = 0, w = []; i < x.length; i += 16) {
      a = hash[0];
      b = hash[1];
      c = hash[2];
      d = hash[3];
      e = hash[4];
      
      for (t = 0; t < 80; t += 1) {
        if (t < 16) {
          w[t] = x[i + t];
        } else {
          w[t] = rotl((w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16]), 1);
        }
        
        tmp = (rotl(a, 5) + func(t, b, c, d) + e + w[t] + konst(t));
        e = d;
        d = c;
        c = rotl(b, 30);
        b = a;
        a = tmp;
      }
      
      hash[0] += a;
      hash[1] += b;
      hash[2] += c;
      hash[3] += d;
      hash[4] += e;
    }
    
    return Digest.Encoder(split(hash));
  };
  
  // MAC configuration
  this.Digest.configure(this.Digest.fn.sha1, {block: 64, curry: [true]});
  
}());
