/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  Character Encoder
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function () {
  
  this.Digest.Encoder = function Encoder(input) {
    
    // iterator, internal buffer
    var i, sequence = null,
      isUtf8 = /^(([\xe0-\xef][\x80-\xbf][\x80-\xbf])|([\xc0-\xdf][\x80-\xbf])|([\x00-\x7f]))+$/;
    
    // check type by structure using Function#apply
    function isArray(arr) {
      function fn() {}
      try {
        fn.apply(null, arr);
        return true && !!arr;
      } catch (e) {
        return false;
      }
    }
    
    function fromUtf8(str) {
      var i, code, arr;
      for (i = 0, arr = []; i < str.length; i += 1) {
        code = str.charCodeAt(i);
        if (code < 0x80) {
          arr.push(code);
        } else if ((code >= 0xc0) && (code <= 0xdf)) {
          code  = (str.charCodeAt(i + 0) & 0x1f) << 6;
          code |= (str.charCodeAt(i + 1) & 0x3f);
          arr.push(code);
          i += 1;
        } else if ((code >= 0xe0) && (code < 0xef)) {
          code  = (str.charCodeAt(i + 0) & 0x0f) << 12;
          code |= (str.charCodeAt(i + 1) & 0x3f) << 6;
          code |= (str.charCodeAt(i + 2) & 0x3f);
          arr.push(code);
          i += 2;
        } else {
          throw new Error('Cannot decode as UTF-8 (Index: ' + i + ')');
        }
      }
      return arr;
    }
    
    
    /** Constructors **/
    
    // accept cloning
    if (input instanceof Digest.Encoder) {
      return new Digest.Encoder(input.array());
    }
    
    // accept missing new keyword
    if (!(this instanceof Digest.Encoder)) {
      return new Digest.Encoder(input);
    }
    
    
    // handle constructor(Array)
    if (isArray(input)) {
      for (i = 0, sequence = []; i < input.length; i += 1) {
        if ('number' === typeof input[i]) {
          sequence[i] = input[i] & 0xffff;
        } else {
          throw new Error('Array element is not a Number (Index: ' + i + ')');
        }
      }
    }
    
    // handle constructor(String)
    if ('string' === typeof input) {
      if (isUtf8.test(input)) {
        sequence = fromUtf8(input);
      } else {
        for (i = 0, sequence = []; i < input.length; i += 1) {
          sequence.push(input.charCodeAt(i));
        }
      }
    }
    
    // handle invalid argument types
    if (null === sequence) {
      throw new Error('Encoder input is not an Array or String.');
    }
    
    
    /** Multi-byte outputs **/
    
    // 0x0000-0xffff
    this.array = function array() {
      return [].concat(sequence);
    };
    
    // \u0000-\uffff
    this.string = function string() {
      for (var i = 0, str = ''; i < sequence.length; i += 1) {
        str += String.fromCharCode(sequence[i]);
      }
      return str;
    };
    
    
    /** Single-byte outputs **/
    
    // 0x00-0xff, truncated
    this.single = function single() {
      for (var i = 0, arr = []; i < sequence.length; i += 1) {
        arr.push(sequence[i] & 0xff);
      }
      return arr;
    };
    
    // 0x00-0xff, [0xHHhh] => [0xHH, 0xhh]
    this.multi = function multi() {
      for (var i = 0, arr = []; i < sequence.length; i += 1) {
        arr.push((sequence[i] >> 8) & 0xff);
        arr.push((sequence[i] >> 0) & 0xff);
      }
      return arr;
    };
    
    // \x00-\xff, truncated
    this.ansi = function ansi() {
      for (var i = 0, str = ''; i < sequence.length; i += 1) {
        str += String.fromCharCode(sequence[i] & 0xff);
      }
      return str;
    };
    
    // \x00-\xff, UTF-8 encoded
    this.utf8 = function utf8() {
      for (var i = 0, code, str = ''; i < sequence.length; i += 1) {
        code = sequence[i];
        if (code < 0x80) {
          str += String.fromCharCode(code);
        } else if (code < 0x800) {
          str += String.fromCharCode(0xc0 + ((code >>  6) & 0x1f));
          str += String.fromCharCode(0x80 + ((code >>  0) & 0x3f));
        } else {
          str += String.fromCharCode(0xe0 + ((code >> 12) & 0x0f));
          str += String.fromCharCode(0x80 + ((code >>  6) & 0x3f));
          str += String.fromCharCode(0x80 + ((code >>  0) & 0x3f));
        }
      }
      return str;
    };
    
    
    /** RFC-4648 - Base-16 **/
    
    function toBase16(chars) {
      var i = 0, str = '',
        arr = chars.split('');
      
      for (; i < sequence.length; i += 1) {
        str += arr[(sequence[i] >> 4) & 0xf] || '?';
        str += arr[(sequence[i] >> 0) & 0xf] || '?';
      }
      return str;
    }
    
    // 0-9 a-f (lower)
    this.hex = function hex() {
      return toBase16('0123456789abcdef');
    };
    
    // 0-9 A-F (upper)
    this.base16 = function base16() {
      return toBase16('0123456789ABCDEF');
    };
    
    
    /** RFC-4648 - Base-32 **/
    
    function toBase32(chars) {
      var i = 0, str = '', rem = null,
        padlen = 8, padding = '=',
        arr = chars.split('');
      
      for (; i < sequence.length; i += 1) {
        switch (i % 5) {
        case 0:
          // 00000000 xxxxx000
          str += arr[((sequence[i] >> 3) & 0x1f) | 0x0] || '?';
          rem = (sequence[i] & 0x07) << 2;
          break;
        case 1:
          // 00000rrr xxyyyyy0
          str += arr[((sequence[i] >> 6) & 0x03) | rem] || '?';
          str += arr[((sequence[i] >> 1) & 0x1f) | 0x0] || '?';
          rem = (sequence[i] & 0x01) << 4;
          break;
        case 2:
          // 0000000r xxxx0000
          str += arr[((sequence[i] >> 4) & 0x0f) | rem] || '?';
          rem = (sequence[i] & 0x0f) << 1;
          break;
        case 3:
          // 0000rrrr xyyyyy00
          str += arr[((sequence[i] >> 7) & 0x01) | rem] || '?';
          str += arr[((sequence[i] >> 2) & 0x1f) | 0x0] || '?';
          rem = (sequence[i] & 0x03) << 3;
          break;
        case 4:
          // 000000rr xxxyyyyy
          str += arr[((sequence[i] >> 5) & 0x07) | rem] || '?';
          str += arr[((sequence[i] >> 0) & 0x1f) | 0x0] || '?';
          rem = null;
        }
      }
      
      // append remainder
      str += (null === rem) ? '' : (arr[rem] || '?');
      
      // append padding
      while (padlen > 0 && (str.length % padlen) > 0) {
        str += padding;
      }
      
      return str;
    }
    
    // A-Z 2-7 (upper)
    this.base32 = function base32() {
      return toBase32('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567');
    };
    
    // 0-9 a-v (lower)
    this.base32hex = function base32hex() {
      return toBase32('0123456789abcdefghijklmnopqrstuv');
    };
    
    
    /** RFC-4648 - Base-64 **/
    
    function toBase64(chars) {
      var i = 0, str = '', rem = null,
        padlen = 4, padding = '=',
        arr = chars.split('');
      
      for (; i < sequence.length; i += 1) {
        switch (i % 3) {
        case 0:
          // 00000000 xxxxxx00
          str += arr[((sequence[i] >> 2) & 0x3f) | 0x0] || '?';
          rem = (sequence[i] & 0x03) << 4;
          break;
        case 1:
          // 000000rr xxxx0000
          str += arr[((sequence[i] >> 4) & 0x0f) | rem] || '?';
          rem = (sequence[i] & 0x0f) << 2;
          break;
        case 2:
          // 0000rrrr xxyyyyyy
          str += arr[((sequence[i] >> 6) & 0x03) | rem] || '?';
          str += arr[((sequence[i] >> 0) & 0x3f) | 0x0] || '?';
          rem = null;
          break;
        }
      }
      
      // append remainder
      str += (null === rem) ? '' : (arr[rem] || '?');
      
      // append padding
      while (padlen > 0 && (str.length % padlen) > 0) {
        str += padding;
      }
      
      return str;
    }
    
    // A-Z a-z 0-9 + /
    this.base64 = function base64() {
      return toBase64('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/');
    };
    
    // A-Z a-z 0-9 - _ (url/filename safe)
    this.base64url = function base64url() {
      return toBase64('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_');
    };
    
    
    /** Overrides **/
    
    this.valueOf = function valueOf() {
      return this.array();
    };
    
    this.toString = function toString() {
      return this.string();
    };
    
  };
  
}());
