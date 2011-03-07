// MD4 (c) 1990 Ronald L. Rivest
(function () {
  var merge = mergeLeast_32,
      split = splitLeast_32,
      rotl = rotl_32,
      
      DIGEST = 128,
      BLOCK = 64,
      K = [ 0x00000000, 0x5a827999, 0x6ed9eba1 ],
      S = [
        [ 3, 7, 11, 19 ],
        [ 3, 5,  9, 13 ],
        [ 3, 9, 11, 15 ]
      ],
      X = [
        0, 1, 2,  3, 4,  5, 6,  7, 8, 9, 10, 11, 12, 13, 14, 15, // Round 1
        0, 4, 8, 12, 1,  5, 9, 13, 2, 6, 10, 14,  3,  7, 11, 15, // Round 2
        0, 8, 4, 12, 2, 10, 6, 14, 1, 9,  5, 13,  3, 11,  7, 15  // Round 3
      ],
      F = [
        function ( x, y, z ) {
          return ( x & y ) | ( (~x) & z);
        },
        function ( x, y, z ) {
          return ( x & y) | (x & z) | (y & z);
        },
        function ( x, y, z ) {
          return ( x ^ y ^ z);
        }
      ];

  function md4( data ) {
    var a, b, c, d, i, l, r, t, x, tmp,
        bytes = data.length,
        padding = [ 0x80 ],
        hash = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476 ];
    
    padding.length = ( ( bytes % 64 ) < 56 ? 56 : 120 ) - ( bytes % 64 );
    
    x = merge( data.concat( padding ) ).concat([
      ( bytes * 8 ) | 0x0,
      ( bytes * 8 / Math.pow( 2, 32 ) ) | 0x0
    ]);
    
    for ( i = 0, l = x.length; i < l; i += 16 ) {
      a = hash[0];
      b = hash[1];
      c = hash[2];
      d = hash[3];
      
      for ( t = 0; t < 48; t++ ) {
        r = Math.floor( t / 16 );
        a = rotl_32(
          a + F[r]( b, c, d ) + x[ i + X[t] ] + K[r],
          S[r][ t % 4 ]
        );
        
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
    
    return split( hash );
  }
  
  self.md4 = factorMAC( hmac, md4, DIGEST, BLOCK );
}());
