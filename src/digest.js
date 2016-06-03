/**!
 *  jsDigest v<%= @version %> (<%= @release %>)
 *  http://github.com/coiscir/jsdigest/
 *
 *  Copyright (c) 2009-2016 Jonathan Lonowski
 *  Released and distributed under the MIT License.
**/

/* umdjs - returnExportsGlobal */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('jsdigest', function () {
      return (root.Digest = factory());
    });
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Digest = factory();
  }
})(this, function () {

'use strict';

var self = { Version: '<%= @version %>' };

<%= import 'core', 'encoder', 'math', 'word', 'hash/*' %>

return self;

});
