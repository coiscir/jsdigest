// Define Digest Singleton
var self = new function Digest() {
  this.Version = '@VERSION';
  this.fn = this.constructor.prototype;
}();
