Error.prototype.toString = function () {
  return 'Error: ' + this.message;
};

function log(message) {
  document.getElementById('results').innerHTML +=
    '<li>' + String(message) + '&nbsp;</li>';
}

function space() {
  log('');
}

function section(header) {
  space();
  log(header);
  space();
}

function timed(ms) {
  log('' + (ms / 1000).toFixed(3) + ' s');
}

function test(expect, trial, message) {
  var result, passed,
    pass = '<span class="pass">PASS</span>',
    fail = '<span class="fail">FAIL</span>';
  
  try {
    result = 'function' === typeof trial ? trial() : trial;
  } catch (e) {
    result = e;
  }
  
  passed = expect === result ||
    ('string' === typeof expect && expect === typeof result) ||
    ('function' === typeof expect && result instanceof expect);
  
  log((passed ? pass : fail) + ': ' + message.replace(/ /g, '&nbsp;') + ' {' + result + '}');
}
