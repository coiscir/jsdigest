/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  Define Global Object
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function () {
  
  this.Digest = new function Digest() {
    this.Version = '<%= version %>';
    this.fn = this.constructor.prototype;
    
    this.configure = function configure(fn, cfg) {
      if ('function' === typeof fn) {
        var block = cfg.block || 0,  // block size in bytes
            curri = cfg.curri || 0,  // arguments index to insert data
            curry = cfg.curry || []; // unfinished arguments array
        
        fn.block = block;
        fn.curry = function (data) {
          var args = [].concat(curry);
          args[curri] = data;
          return fn.apply(null, args);
        };
      }
    };
  }();
  
}());
