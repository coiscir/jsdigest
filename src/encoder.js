/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  Character Encoder
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function ENC(self) {
  
  self.Encoder = function Encoder(input) {
    
    var i, l, buffer,
      isUtf8 = /^(([\xe0-\xef][\x80-\xbf][\x80-\xbf])|([\xc0-\xdf][\x80-\xbf])|([\x00-\x7f]))+$/;
    
    
    /** Constructors **/
    
    // Encoder as a function
    if (!(this instanceof self.Encoder)) {
      return new Digest.Encoder(input);
    }
    
    // new Encoder(Encoder)
    if (input instanceof self.Encoder) {
      return new self.Encoder(input.array());
    }
    
    // new Encoder(Array) || new Encoder(String)
    buffer = self.convert.stoa(input);
    
    if ('undefined' === typeof buffer) {
      throw new Error('Encoder input must be a string or an array.');
    } else {
      // ensure all Numbers are unsigned 16-bit
      for (i = 0, l = buffer.length; i < l; i += 1) {
        if ('number' === typeof buffer[i]) {
          buffer[i] &= 0xffff;
        } else {
          throw new Error('Array elements must be Numbers (index: ' + i + ')');
        }
      }
    }
    
    
    /*****************/
    /** Core Output **/
    /*****************/
    
    this.array = function array() {
      return [].concat(buffer);
    };
    
    this.string = function string() {
      return self.convert.atos(buffer);
    };
    
    this.valueOf = this.array;
    this.toString = this.string;
    
    
    /** Input Encodings **/
    
    this.split = function split() {
      for (var i = 0, l = buffer.length, result = []; i < l; i += 1) {
        result.push((buffer[i] >> 8) & 0xff);
        result.push((buffer[i] >> 0) & 0xff);
      }
      return result;
    };
    
    this.trunc = function trunc() {
      for (var i = 0, l = buffer.length, result = []; i < l; i += 1) {
        result.push(buffer[i] & 0xff);
      }
      return result;
    };
    
    this.utf8 = function utf8() {
      if (isUtf8.test(this.string())) {
        return this.trunc();
      }
      
      for (var i = 0, l = buffer.length, code, result = []; i < l; i += 1) {
        code = buffer[i];
        if (code < 0x80) {
          result.push(code);
        } else if (code < 0x800) {
          result.push(0xc0 + ((code >>  6) & 0x1f));
          result.push(0x80 + ((code >>  0) & 0x3f));
        } else {
          result.push(0xe0 + ((code >> 12) & 0x0f));
          result.push(0x80 + ((code >>  6) & 0x3f));
          result.push(0x80 + ((code >>  0) & 0x3f));
        }
      }
      return result;
    };
    
    
    /**********************/
    /** Output Encodings **/
    /**********************/
    
    /** RFC-4648 - Base-16 **/
    
    function toBase16(chars) {
      var i, l,
        out = '';
      
      for (i = 0, l = buffer.length; i < l; i += 1) {
        out += chars[(buffer[i] >> 4) & 0xf] || '?';
        out += chars[(buffer[i] >> 0) & 0xf] || '?';
      }
      return out;
    }
    
    // 0-9 a-f (lower)
    this.hex = function hex() {
      return toBase16('0123456789abcdef'.split(''));
    };
    
    // 0-9 A-F (upper)
    this.base16 = function base16() {
      return toBase16('0123456789ABCDEF'.split(''));
    };
    
    /** RFC-4648 - Base-32 **/
    
    function toBase32(chars) {
      var i, l,
        out = '', rem = null,
        padlen = 8, padding = '=';
      
      for (i = 0, l = buffer.length; i < l; i += 1) {
        switch (i % 5) {
        case 0:
          // 00000000 xxxxx000
          out += chars[((buffer[i] >> 3) & 0x1f) | 0x0] || '?';
          rem = (buffer[i] & 0x07) << 2;
          break;
        case 1:
          // 00000rrr xxyyyyy0
          out += chars[((buffer[i] >> 6) & 0x03) | rem] || '?';
          out += chars[((buffer[i] >> 1) & 0x1f) | 0x0] || '?';
          rem = (buffer[i] & 0x01) << 4;
          break;
        case 2:
          // 0000000r xxxx0000
          out += chars[((buffer[i] >> 4) & 0x0f) | rem] || '?';
          rem = (buffer[i] & 0x0f) << 1;
          break;
        case 3:
          // 0000rrrr xyyyyy00
          out += chars[((buffer[i] >> 7) & 0x01) | rem] || '?';
          out += chars[((buffer[i] >> 2) & 0x1f) | 0x0] || '?';
          rem = (buffer[i] & 0x03) << 3;
          break;
        case 4:
          // 000000rr xxxyyyyy
          out += chars[((buffer[i] >> 5) & 0x07) | rem] || '?';
          out += chars[((buffer[i] >> 0) & 0x1f) | 0x0] || '?';
          rem = null;
        }
      }
      
      // append remainder
      out += (null === rem) ? '' : (chars[rem] || '?');
      
      // append padding
      while (padlen > 0 && (out.length % padlen) > 0) {
        out += padding;
      }
      
      return out;
    }
    
    // A-Z 2-7 (upper)
    this.base32 = function base32() {
      return toBase32('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split(''));
    };
    
    // 0-9 a-v (lower)
    this.base32hex = function base32hex() {
      return toBase32('0123456789abcdefghijklmnopqrstuv'.split(''));
    };
    
    /** RFC-4648 - Base-64 **/
    
    function toBase64(chars) {
      var i, l,
        out = '', rem = null,
        padlen = 4, padding = '=';
      
      for (i = 0, l = buffer.length; i < l; i += 1) {
        switch (i % 3) {
        case 0:
          // 00000000 xxxxxx00
          out += chars[((buffer[i] >> 2) & 0x3f) | 0x0] || '?';
          rem = (buffer[i] & 0x03) << 4;
          break;
        case 1:
          // 000000rr xxxx0000
          out += chars[((buffer[i] >> 4) & 0x0f) | rem] || '?';
          rem = (buffer[i] & 0x0f) << 2;
          break;
        case 2:
          // 0000rrrr xxyyyyyy
          out += chars[((buffer[i] >> 6) & 0x03) | rem] || '?';
          out += chars[((buffer[i] >> 0) & 0x3f) | 0x0] || '?';
          rem = null;
          break;
        }
      }
      
      // append remainder
      out += (null === rem) ? '' : (chars[rem] || '?');
      
      // append padding
      while (padlen > 0 && (out.length % padlen) > 0) {
        out += padding;
      }
      
      return out;
    }
    
    // A-Z a-z 0-9 + /
    this.base64 = function base64() {
      return toBase64('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/');
    };
    
    // A-Z a-z 0-9 - _ (url/filename safe)
    this.base64url = function base64url() {
      return toBase64('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_');
    };
    
  };
  
}(Digest));
