// Skein 1.3 (c) 2010 Bruce Schneier, et al.
(function () {
  var merge = mergeLeast_64,
      split = splitLeast_64,
      
      PARITY = [ 0x1BD11BDA, 0xA9FC1A22 ],
      
      TWEAK = {
        KEY:         0x00,
        CONFIG:      0x04,
        PERSONALIZE: 0x08,
        PUBLICKEY:   0x10,
        NONCE:       0x14,
        MESSAGE:     0x30,
        OUT:         0x3F
      },
      
      VARS = {
        256: {
          bytes: 32,
          words: 4,
          rounds: 72,
          permute: [ 0, 3, 2, 1 ],
          rotate: [
            [ 14, 16 ],
            [ 52, 57 ],
            [ 23, 40 ],
            [  5, 37 ],
            [ 25, 33 ],
            [ 46, 12 ],
            [ 58, 22 ],
            [ 32, 32 ]
          ]
        },
        
        512: {
          bytes: 64,
          words: 8,
          rounds: 72,
          permute: [ 2, 1, 4, 7, 6, 5, 0, 3 ],
          rotate: [
            [ 46, 36, 19, 37 ],
            [ 33, 27, 14, 42 ],
            [ 17, 49, 36, 39 ],
            [ 44,  9, 54, 56 ],
            [ 39, 30, 34, 24 ],
            [ 13, 50, 10, 17 ],
            [ 25, 29, 39, 43 ],
            [  8, 35, 56, 22 ]
          ]
        },
        
        1024: {
          bytes: 128,
          words: 16,
          rounds: 80,
          permute: [ 0, 9, 2, 13, 6, 11, 4, 15, 10, 7, 12, 3, 14, 5, 8, 1 ],
          rotate: [
            [ 24, 13,  8, 47,  8, 17, 22, 37 ],
            [ 38, 19, 10, 55, 49, 18, 23, 52 ],
            [ 33,  4, 51, 13, 34, 41, 59, 17 ],
            [  5, 20, 48, 41, 47, 28, 16, 25 ],
            [ 41,  9, 37, 31, 12, 47, 44, 30 ],
            [ 16, 34, 56, 51,  4, 53, 42, 41 ],
            [ 31, 44, 47, 46, 19, 42, 44, 25 ],
            [  9, 48, 35, 52, 23, 31, 37, 20 ]
          ]
        }
      };
  
  function tweaker( pos, type, first, finish ) {
    var a = pos | 0x0,
        b = ( pos / Math.pow( 2, 32 ) ) | 0x0,
        c = ( pos / Math.pow( 2, 64 ) ) | 0x0,
        d = ( ( finish && 0x80 ) | ( first && 0x40 ) | type ) << 24;
    
    return split( [ [b, a], [d, c] ] );
  }
  
  function mix0( x, y ) {
    return add( x, y );
  }
  
  function mix1( x, y, r ) {
    return xor( rotl( y, r ), x );
  }
  
  function threefish( key, tweak, plain, vars ) {
    var i, j, r, s, mixer, sched, chain,
        words   = +vars.words,
        rounds  = +vars.rounds,
        rotate  = vars.rotate,
        permute = vars.permute;
    
    key   = merge( key );
    tweak = merge( tweak );
    plain = merge( plain );
    
    key[ words ] = ulong( PARITY );
    for ( i = 0; i < words; i++ ) {
      key[ words ] = xor( key[ words ], key[ i ] );
    }
    
    tweak[ 2 ] = xor( tweak[ 0 ], tweak[ 1 ] );
    
    for ( r = 0, s = 0; r < rounds; r++ ) {
      mixer = plain.slice();
      
      if ( 0 == ( r % 4 ) ) {
        sched = [];
        
        for ( i = 0; i <= words; i++ ) {
          sched[ i ] = key[ (s + i) % (words + 1) ];
        }
        
        sched[ words - 3 ] = add( sched[ words - 3 ], tweak[ s % 3 ] );
        sched[ words - 2 ] = add( sched[ words - 2 ], tweak[ (s + 1) % 3 ] );
        sched[ words - 1 ] = add( sched[ words - 1 ], [ 0, s ] );
        
        for ( i = 0; i < words; i++ ) {
          mixer[ i ] = add( mixer[ i ], sched[ i ] );
        }
        
        s++;
      }
      
      for ( i = 0; i < ( words / 2 ); i++ ) {
        j = 2 * i;
        mixer[ j + 0 ] = mix0( mixer[ j + 0 ], mixer[ j + 1 ] );
        mixer[ j + 1 ] = mix1( mixer[ j + 0 ], mixer[ j + 1 ], rotate[ r % 8 ][ i ] );
      }
      
      for ( i = 0; i < words; i++ ) {
        plain[ i ] = mixer[ permute[ i ] ];
      }
    }
    
    for ( chain = [], i = 0; i < words; i++ ) {
      chain[ i ] = add( plain[ i ], key[ (s + i) % (words + 1) ] );
    }
    chain[ words - 3 ] = add( chain[ words - 3 ], tweak[ s % 3 ] );
    chain[ words - 2 ] = add( chain[ words - 2 ], tweak[ (s + 1) % 3 ] );
    chain[ words - 1 ] = add( chain[ words - 1 ], [ 0, s ] );
    
    return split( chain );
  }
  
  function ubi( chain, message, type, vars ) {
    var i, k, l, pos, tweak, first, finish,
        bytes   = vars.bytes,
        count   = message.length,
        blocks  = [];
    
    message.length += count == 0 ? bytes :
      bytes - ( ( count % bytes ) || bytes );
    
    while ( message.length > 0 ) {
      blocks.push( message.slice( 0, bytes ) );
      message = message.slice( bytes );
    }
    
    for ( k = 0, l = blocks.length; k < l; k++ ) {
      pos = bytes * ( k + 1 );
      first = k === 0;
      finish = k === ( l - 1 );
      
      tweak = tweaker( Math.min( count, pos ), type, first, finish );
      chain = threefish( chain, tweak, blocks[k], vars );
      
      for ( i = 0; i < chain.length; i++ ) {
        chain[i] ^= blocks[k][i];
      }
    }
    
    return chain.slice( 0, bytes );
  }

  function skein( digest, size, data, key ) {
    var config, chain,
        out     = [ 0, 0, 0, 0, 0, 0, 0, 0 ],
        output  = +size || digest,
        vars    = VARS[digest],
        bytes   = vars.bytes;
    
    chain = [];
    chain.length = bytes;
    
    config = [];
    config.push( 0x53, 0x48, 0x41, 0x33 ); // Schema: "SHA3"
    config.push( 0x01, 0x00, 0x00, 0x00 ); // Version / Reserved
    config = config.concat( split( [ [ 0, output ] ] ) );
    config.length = 32;
    
    if ( key )
      chain = ubi( chain, key, TWEAK.KEY, vars );
    chain = ubi( chain, config, TWEAK.CONFIG, vars );
    chain = ubi( chain, data, TWEAK.MESSAGE, vars );
    return ubi( chain, out, TWEAK.OUT, vars );
  }
  
  function calculate( digest, size, data, key ) {
    if ( 'number' !== typeof size ) {
      key = data;
      data = size;
      size = digest;
    }
    
    var result = skein( digest, size, toBuffer(data),
      key == null ? null : toBuffer(key)
    );
    
    return Encoder( crop( size, result, false ) );
  };
  
  self.skein256 = function ( size, data, key ) {
    return calculate( 256, size, data, key );
  };
  
  self.skein512 = function ( size, data, key ) {
    return calculate( 512, size, data, key );
  };
  
  self.skein1024 = function ( size, data, key ) {
    return calculate( 1024, size, data, key );
  };
}());
