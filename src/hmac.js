/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  HMAC - keyed-Hash Message Authentication Code
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function HMAC(self) {
  
  self.fn.hmac = function hmac(hash, data, hkey, block) {
    var i, akey, ipad, opad;
    
    data = self.Encoder(data).trunc();
    hkey = self.Encoder(hkey).trunc();
    
    if (hkey.length > block) {
      akey = hash(hkey).trunc();
    } else {
      akey = self.Encoder(hkey).trunc();
    }
    
    for (i = 0, ipad = [], opad = []; i < block; i += 1) {
      ipad[i] = (akey[i] || 0x00) ^ 0x36;
      opad[i] = (akey[i] || 0x00) ^ 0x5c;
    }
    
    return hash(opad.concat(hash(ipad.concat(data)).trunc()));
  };
  
}(Digest));
