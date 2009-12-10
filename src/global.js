/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  Define Global Object and Core Utilities
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function JSD(self) {
  
  self.Digest = new function Digest() {
    this.Version = '<%= version %>';
    this.fn = this.constructor.prototype;
    
    this.convert = {
    
      isArray: function isArray(array) {
        return Object.prototype.toString.call(array) === "[object Array]";
      },
      
      isString: function isString(string) {
        return 'string' === typeof string;
      },
      
      atos: function atos(array) {
        if (this.isArray(array)) {
          for (var i = 0, l = array.length, string = ''; i < l; i += 1) {
            string += String.fromCharCode(array[i]);
          }
          return string;
        }
        
        if (this.isString(array)) {
          return array.valueOf();
        }
      },
      
      stoa: function stoa(string) {
        if (this.isString(string)) {
          for (var i = 0, l = string.length, array = []; i < l; i += 1) {
            array.push(string.charCodeAt(i));
          }
          return array;
        }
        
        if (this.isArray(string)) {
          return string.valueOf();
        }
      }
    };
    
  }();
  
}(this));
