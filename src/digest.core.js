/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  Define Global Object
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function () {
  
  this.Digest = new function Digest() {
    this.Version = '<%= version %>';
    this.fn = this.constructor.prototype;
    
    this.configure = function configure(fn, cfg) {
      if ('function' === typeof fn) {
        fn.block = Number(cfg.block) || 0;
        
        var curry = cfg.curry || [];
        fn.curry = function (data) {
          return fn.apply(null, [data].concat(curry));
        };
      }
    };
  }();
  
}());
