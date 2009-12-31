// Least Significant Byte, 32-bit
function merge_LSB_32(input) {
  var i, j, l, output = [];
  for (i = 0, j = 0, l = input.length; j < l; i += 1, j = (i * 4)) {
    output[i] = ((input[j]) & 0xff) |
      ((input[j + 1] <<  8) & 0xff00) |
      ((input[j + 2] << 16) & 0xff0000) |
      ((input[j + 3] << 24) & 0xff000000);
  }
  return output;
}

function split_LSB_32(input) {
  var i, l, output = [];
  for (i = 0, l = input.length; i < l; i += 1) {
    output.push((input[i] >>  0) & 0xff);
    output.push((input[i] >>  8) & 0xff);
    output.push((input[i] >> 16) & 0xff);
    output.push((input[i] >> 24) & 0xff);
  }
  return output;
}

// Most Significant Byte, 32-bit
function merge_MSB_32(input) {
  var i, j, l, output = [];
  for (i = 0, j = 0, l = input.length; j < l; i += 1, j = (i * 4)) {
    output[i] = 
      ((input[j + 0] & 0xff) << 24) |
      ((input[j + 1] & 0xff) << 16) |
      ((input[j + 2] & 0xff) <<  8) |
      ((input[j + 3] & 0xff) <<  0);
  }
  return output;
}

function split_MSB_32(input) {
  var i, l, output = [];
  for (i = 0, l = input.length; i < l; i += 1) {
    output.push((input[i] >> 24) & 0xff);
    output.push((input[i] >> 16) & 0xff);
    output.push((input[i] >>  8) & 0xff);
    output.push((input[i] >>  0) & 0xff);
  }
  return output;
}

// Least Significant Byte, 64-bit
function merge_LSB_64(input) {
  var i, j, l, output = [];
  for (i = 0, j = 0, l = input.length; j < l; i += 1, j = (i * 8)) {
    output[i] = [
      ((input[j + 4] & 0xff) <<  0) |
      ((input[j + 5] & 0xff) <<  8) |
      ((input[j + 6] & 0xff) << 16) |
      ((input[j + 7] & 0xff) << 24),
      ((input[j + 0] & 0xff) <<  0) |
      ((input[j + 1] & 0xff) <<  8) |
      ((input[j + 2] & 0xff) << 16) |
      ((input[j + 3] & 0xff) << 24)
    ];
  }
  return output;
}

function split_LSB_64(input) {
  var i, l, output = [];
  for (i = 0, l = input.length; i < l; i += 1) {
    output.push((input[i][1] >>  0) & 0xff);
    output.push((input[i][1] >>  8) & 0xff);
    output.push((input[i][1] >> 16) & 0xff);
    output.push((input[i][1] >> 24) & 0xff);
    output.push((input[i][0] >>  0) & 0xff);
    output.push((input[i][0] >>  8) & 0xff);
    output.push((input[i][0] >> 16) & 0xff);
    output.push((input[i][0] >> 24) & 0xff);
  }
  return output;
}

// Most Significant Byte, 64-bit
function merge_MSB_64(input) {
  var i, j, l, output = [];
  for (i = 0, j = 0, l = input.length; j < l; i += 1, j = (i * 8)) {
    output[i] = [
      ((input[j + 0] & 0xff) << 24) |
      ((input[j + 1] & 0xff) << 16) |
      ((input[j + 2] & 0xff) <<  8) |
      ((input[j + 3] & 0xff) <<  0),
      ((input[j + 4] & 0xff) << 24) |
      ((input[j + 5] & 0xff) << 16) |
      ((input[j + 6] & 0xff) <<  8) |
      ((input[j + 7] & 0xff) <<  0)
    ];
  }
  return output;
}

function split_MSB_64(input) {
  var i, l, output = [];
  for (i = 0, l = input.length; i < l; i += 1) {
    output.push((input[i][0] >> 24) & 0xff);
    output.push((input[i][0] >> 16) & 0xff);
    output.push((input[i][0] >>  8) & 0xff);
    output.push((input[i][0] >>  0) & 0xff);
    output.push((input[i][1] >> 24) & 0xff);
    output.push((input[i][1] >> 16) & 0xff);
    output.push((input[i][1] >>  8) & 0xff);
    output.push((input[i][1] >>  0) & 0xff);
  }
  return output;
}
