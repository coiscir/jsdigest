/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  HMAC - keyed-Hash Message Authentication Code
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function () {
  
  this.Digest.fn.hmac = function hmac(hash, hkey, data, ansi) {
    var i, akey, ipad, opad;
    
    // verify arguments
    if ('function' !== typeof hash) {
      throw new Error('Hash must be a function');
    }
    if ('string' !== typeof hkey) {
      throw new Error('Key must be a string');
    }
    if ('string' !== typeof data) {
      throw new Error('Data must be a string');
    }
    
    // verify hash configuration
    if (!(hash.block > 0 && 'function' === typeof hash.curry)) {
      throw new Error('Hash function is not properly configured');
    }
    
    // single-byte encode data, either UTF-8 or truncated
    data = Digest.Encoder(data)[true === ansi ? 'ansi' : 'utf8']();
    
    // prepare akey
    if (hkey.length > hash.block) {
      akey = hash.curry(hkey).single();
    } else {
      akey = Digest.Encoder(hkey).single();
    }
    
    // fill padding
    for (i = 0, ipad = [], opad = []; i < hash.block; i += 1) {
      ipad[i] = (akey[i] || 0x00) ^ 0x36;
      opad[i] = (akey[i] || 0x00) ^ 0x5c;
    }
    
    // finalize padding
    ipad = Digest.Encoder(ipad).ansi();
    opad = Digest.Encoder(opad).ansi();
    
    // finish
    return hash.curry(opad + hash.curry(ipad + data).ansi());
  };
  
}());
