/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  Character Encoder
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function () {
  
  this.Digest.Encoder = function Encoder(input) {
    
    // iterator, internal buffer
    var i, sequence = null;
    
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
      for (i = 0, sequence = []; i < input.length; i += 1) {
        sequence.push(input.charCodeAt(i));
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
    this.unicode = function unicode() {
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
    
    
    /** Overrides **/
    
    this.valueOf = function valueOf() {
      return this.array();
    };
    
    this.toString = function toString() {
      return this.string();
    };
    
  };
  
}());
