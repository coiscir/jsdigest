// SHA-1 (c) 2006 The Internet Society
(function () {
  var merge = mergeMost_32,
      split = splitMost_32,
      rotl = rotl_32,
      
      DIGEST = 160,
      BLOCK = 64,
      K = [ 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6 ],
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
      
  function sha1( data ) {
    var a, b, c, d, e, i, l, r, t, tmp, w, x,
        bytes = data.length,
        padding = [ 0x80 ],
        hash = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0 ];
    
    padding.length = ( ( bytes % 64 ) < 56 ? 56 : 120 ) - ( bytes % 64 );
    
    x = merge( data.concat( padding ) ).concat([
      ( bytes * 8 / Math.pow( 2, 32 ) ) | 0x0,
      ( bytes * 8 ) | 0x0
    ]);
    
    // update hash
    for ( i = 0, w = [], l = x.length; i < l; i += 16 ) {
      a = hash[0];
      b = hash[1];
      c = hash[2];
      d = hash[3];
      e = hash[4];
      
      for ( t = 0; t < 80; t += 1 ) {
        if ( t < 16 ) {
          w[t] = x[ i + t ];
        } else {
          w[t] = rotl( w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16], 1 );
        }
        
        r = Math.floor( t / 20 );
        tmp = rotl( a, 5 ) + F[r]( b, c, d ) + e + w[t] + K[r];
        e = d;
        d = c;
        c = rotl( b, 30 );
        b = a;
        a = tmp;
      }
      
      hash[0] += a;
      hash[1] += b;
      hash[2] += c;
      hash[3] += d;
      hash[4] += e;
    }
    
    return split( hash );
  }
  
  self.sha1 = factorMAC( hmac, sha1, DIGEST, BLOCK );
  
}());
