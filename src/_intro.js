/*
  <%= pkg.name %> v<%= pkg.version %> (<%= grunt.template.today('UTC:ddd, mmm dd yyyy HH:MM:ss Z') %>)
  <%= pkg.homepage %>

  Copyright (c) 2009, <%= grunt.template.today('yyyy') %> <%= pkg.author.name %>
  Released and distributed under the <%= pkg.license %> license.
*/

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Digest = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var exports = { version: '<%= pkg.version %>' };
