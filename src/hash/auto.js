(function () {

  self.ripemd = function ( size, data, key ) {
    if ( 'number' !== typeof size ) {
      key = data;
      data = size;
      size = 160;
    }
    
    if ( size <= 128 ) {
      return self.ripemd128( size, data, key );
    } else {
      return self.ripemd160( size, data, key );
    }
  };

  self.sha = function ( size, data, key ) {
    if ( 'number' !== typeof size ) {
      key = data;
      data = size;
      size = 512;
    }
    
    if ( size <= 160 ) {
      return self.sha1( size, data, key );
    } else {
      return self.sha2( size, data, key );
    }
  };

  self.sha2 = function ( size, data, key ) {
    if ( 'number' !== typeof size ) {
      key = data;
      data = size;
      size = 512;
    }
    
    if ( size <= 224 ) {
      return self.sha224( size, data, key );
    } else if ( size <= 256 ) {
      return self.sha256( size, data, key );
    } else if ( size <= 384 ) {
      return self.sha384( size, data, key );
    } else {
      return self.sha512( size, data, key );
    }
  };

  self.skein = function ( size, data, key ) {
    if ( 'number' !== typeof size ) {
      key = data;
      data = size;
      size = 1024;
    }
    
    if ( size <= 256 ) {
      return self.skein256( size, data, key );
    } else if ( size <= 512 ) {
      return self.skein512( size, data, key );
    } else {
      return self.skein1024( size, data, key );
    }
  };

})();
