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

self.isArray = isArray;
self.isString = isString;
self.isInput = isInput;
self.atos = atos;
self.stoa = stoa;