/**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  Define Global Object
**~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~**/

(function Global(self) {
  
  self.Digest = new function Digest() {
    this.Version = '<%= version %>';
    this.fn = this.constructor.prototype;
  }();
  
}(this));
