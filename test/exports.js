var digest = require('../');
var expect = require('chai').expect;

suite('Exports', function () {

  test('Digest', function () {

    expect(digest)
      .to.be.ok
      .to.be.an('object')
      .to.have.property('version');

  });

});
