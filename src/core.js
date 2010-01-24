// Define Digest Singleton
var self = new function Digest() {
  this.Version = '@VERSION';
  this.fn = this.constructor.prototype;
  
  // Array and String Converting
  function isArray(array) {
    return Object.prototype.toString.call(array) === "[object Array]";
  }
  
  function isString(string) {
    return 'string' === typeof string;
  }
  
  function isInput(input) {
    return isArray(input) || isString(input) || input instanceof self.Encoder;
  }
  
  function atos(array) {
    if (isArray(array)) {
      for (var i = 0, l = array.length, string = ''; i < l; i += 1) {
        string += String.fromCharCode(array[i]);
      }
      return string;
    }
    
    if (isString(array)) {
      return array.valueOf();
    }
  }
  
  function stoa(string) {
    if (isString(string)) {
      for (var i = 0, l = string.length, array = []; i < l; i += 1) {
        array.push(string.charCodeAt(i));
      }
      return array;
    }
    
    if (isArray(string)) {
      return string.valueOf();
    }
  }
  
  // expose functions
  this.isArray = isArray;
  this.isString = isString;
  this.isInput = isInput;
  this.atos = atos;
  this.stoa = stoa;
  
}();

function crop(size, hash, righty) {
  var length = Math.floor((size + 7) / 8),
      remain = size % 8;
  
  if (righty) {
    hash = hash.slice(hash.length - length);
  } else {
    hash = hash.slice(0, length);
  }
  
  if (remain > 0) {
    hash[length - 1] &= (0xff << (8 - remain)) & 0xff;
  }
  
  return hash;
}
