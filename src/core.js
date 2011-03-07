function isBuffer( obj ) {
  return '[object Array]' === Object.prototype.toString.call( obj );
}

function toBuffer( input ) {
  if ( isBuffer( input ) )
    return input;
  else
    return utf8( input );
}

function utf8( input ) {
  var i, code,
    length = input.length,
    result = [];
  
  for ( i = 0; i < length; i++ ) {
    code = input.charCodeAt(i);
    
    if ( code < 0x80 ) {
      result.push( code );
    } else if ( code < 0x800 ) {
      result.push( 0xc0 + ( ( code >> 6 ) & 0x1f ) );
      result.push( 0x80 + ( ( code >> 0 ) & 0x3f ) );
    } else {
      result.push( 0xe0 + ( ( code >> 12 ) & 0x0f ) );
      result.push( 0x80 + ( ( code >>  6 ) & 0x3f ) );
      result.push( 0x80 + ( ( code >>  0 ) & 0x3f ) );
    }
  }
  
  return result;
}

function crop( size, hash, righty ) {
  var length = Math.floor( ( size + 7 ) / 8 ),
      remain = size % 8;
  
  if ( righty ) {
    hash = hash.slice( hash.length - length );
  } else {
    hash = hash.slice( 0, length );
  }
  
  if ( remain > 0 ) {
    hash[ length - 1 ] &= ( 0xff << ( 8 - remain ) ) & 0xff;
  }
}
