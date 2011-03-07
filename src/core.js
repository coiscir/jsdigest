/**!
 *  jsDigest v<%= @version %> (<%= @release %>)
 *  http://github.com/coiscir/jsdigest/
 *
 *  Copyright (c) 2010 Jonathan Lonowski
 *  Released and distributed under the MIT License.
**/

(function () { "use strict";

var self = { Version: '<%= @version %>' };


<%= import 'math' %>


/* Export */

if ( 'undefined' === typeof exports )
  this.Digest = self;
else
  module.exports = self;

})();
