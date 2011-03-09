function Encoder( buffer ) {
  
  // Encoder as a function
  if ( !( this instanceof Encoder ) ) {
    return new Encoder( buffer );
  }
  
  
  // raw output
  this.raw = function () {
    return buffer.slice();
  };
  
  
  // RFC-4648 - Base-16
  function encodeBase16( chars ) {
    var i,
        length = buffer.length,
        out = '';
    
    for ( i = 0; i < length; i++ ) {
      out += chars[ ( buffer[i] >> 4 ) & 0xf ] || '?';
      out += chars[ ( buffer[i] >> 0 ) & 0xf ] || '?';
    }
    
    return out;
  }
  
  // 0-9 a-f (lower)
  this.hex = function () {
    return encodeBase16( '0123456789abcdef'.split('') );
  };
  
  // 0-9 A-F (upper)
  this.base16 = function () {
    return encodeBase16( '0123456789ABCDEF'.split('') );
  };
  
  
  // RFC-4648 - Base-32
  function encodeBase32( chars ) {
    var i,
        length = buffer.length,
        out = '',
        rem = null;
    
    for ( i = 0; i < length; i++ ) {
      switch ( i % 5 ) {
        case 0:
          // 00000000 xxxxx000
          out += chars[ ( ( buffer[i] >> 3 ) & 0x1f ) | 0x0 ] || '?';
          rem = ( buffer[i] & 0x07 ) << 2;
          break;
        case 1:
          // 00000rrr xxyyyyy0
          out += chars[ ( ( buffer[i] >> 6 ) & 0x03 ) | rem ] || '?';
          out += chars[ ( ( buffer[i] >> 1 ) & 0x1f ) | 0x0 ] || '?';
          rem = ( buffer[i] & 0x01 ) << 4;
          break;
        case 2:
          // 0000000r xxxx0000
          out += chars[ ( ( buffer[i] >> 4 ) & 0x0f ) | rem ] || '?';
          rem = ( buffer[i] & 0x0f ) << 1;
          break;
        case 3:
          // 0000rrrr xyyyyy00
          out += chars[ ( ( buffer[i] >> 7 ) & 0x01 ) | rem ] || '?';
          out += chars[ ( ( buffer[i] >> 2 ) & 0x1f ) | 0x0 ] || '?';
          rem = ( buffer[i] & 0x03 ) << 3;
          break;
        case 4:
          // 000000rr xxxyyyyy
          out += chars[ ( ( buffer[i] >> 5 ) & 0x07 ) | rem ] || '?';
          out += chars[ ( ( buffer[i] >> 0 ) & 0x1f ) | 0x0 ] || '?';
          rem = null;
      }
    }
    
    // append remainder
    if ( null != rem ) {
      out += chars[ rem ] || '?';
    }
    
    // append padding
    while ( ( out.length % 8 ) > 0 ) {
      out += '=';
    }
    
    return out;
  }
  
  // A-Z 2-7 (upper)
  this.base32 = function () {
    return encodeBase32( 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split('') );
  };
  
  // 0-9 a-v (lower)
  this.base32hex = function () {
    return encodeBase32( '0123456789abcdefghijklmnopqrstuv'.split('') );
  };
  
  
  // RFC-4648 - Base-64
  function encodeBase64( chars ) {
    var i,
        length = buffer.length,
        out = '',
        rem = null;
    
    for ( i = 0; i < length; i++ ) {
      switch (i % 3) {
        case 0:
          // 00000000 xxxxxx00
          out += chars[ ( ( buffer[i] >> 2 ) & 0x3f ) | 0x0 ] || '?';
          rem = ( buffer[i] & 0x03 ) << 4;
          break;
        case 1:
          // 000000rr xxxx0000
          out += chars[ (  (buffer[i] >> 4 ) & 0x0f ) | rem ] || '?';
          rem = ( buffer[i] & 0x0f ) << 2;
          break;
        case 2:
          // 0000rrrr xxyyyyyy
          out += chars[ ( ( buffer[i] >> 6 ) & 0x03 ) | rem ] || '?';
          out += chars[ ( ( buffer[i] >> 0 ) & 0x3f ) | 0x0 ] || '?';
          rem = null;
          break;
      }
    }
    
    // append remainder
    
    // append remainder
    if ( null != rem ) {
      out += chars[ rem ] || '?';
    }
    
    // append padding
    while ( ( out.length % 4 ) > 0 ) {
      out += '=';
    }
    
    return out;
  }
  
  // A-Z a-z 0-9 + /
  this.base64 = function () {
    return encodeBase64(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('')
    );
  };
  
  // A-Z a-z 0-9 - _ (url/filename safe)
  this.base64url = function () {
    return encodeBase64(
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'.split('')
    );
  };
}

self.Encoder = Encoder;
