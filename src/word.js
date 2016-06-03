// Least Significant Byte, 32-bit
function mergeLeast_32( input ) {
  var i,
      length = input.length,
      output = [];

  for ( i = 0; i < length; i += 4 ) {
    output.push(
      ( ( input[ i + 0 ] & 0xff ) <<  0 ) |
      ( ( input[ i + 1 ] & 0xff ) <<  8 ) |
      ( ( input[ i + 2 ] & 0xff ) << 16 ) |
      ( ( input[ i + 3 ] & 0xff ) << 24 )
    );
  }

  return output;
}

function splitLeast_32( input ) {
  var i,
      length = input.length,
      output = [];

  for ( i = 0; i < length; i += 1 ) {
    output.push( ( input[i] >>  0 ) & 0xff );
    output.push( ( input[i] >>  8 ) & 0xff );
    output.push( ( input[i] >> 16 ) & 0xff );
    output.push( ( input[i] >> 24 ) & 0xff );
  }

  return output;
}

// Most Significant Byte, 32-bit
function mergeMost_32( input ) {
  var i,
      length = input.length,
      output = [];

  for ( i = 0; i < length; i += 4 ) {
    output.push(
      ( ( input[ i + 0 ] & 0xff ) << 24 ) |
      ( ( input[ i + 1 ] & 0xff ) << 16 ) |
      ( ( input[ i + 2 ] & 0xff ) <<  8 ) |
      ( ( input[ i + 3 ] & 0xff ) <<  0 )
    );
  }

  return output;
}

function splitMost_32( input ) {
  var i,
      length = input.length,
      output = [];

  for ( i = 0; i < length; i += 1 ) {
    output.push( ( input[i] >> 24 ) & 0xff );
    output.push( ( input[i] >> 16 ) & 0xff );
    output.push( ( input[i] >>  8 ) & 0xff );
    output.push( ( input[i] >>  0 ) & 0xff );
  }

  return output;
}

// Least Significant Byte, 64-bit
function mergeLeast_64( input ) {
  var i,
      length = input.length,
      output = [];

  for ( i = 0; i < length; i += 8 ) {
    output.push([
      ( ( input[ i + 4 ] & 0xff ) <<  0 ) |
      ( ( input[ i + 5 ] & 0xff ) <<  8 ) |
      ( ( input[ i + 6 ] & 0xff ) << 16 ) |
      ( ( input[ i + 7 ] & 0xff ) << 24 ),
      ( ( input[ i + 0 ] & 0xff ) <<  0 ) |
      ( ( input[ i + 1 ] & 0xff ) <<  8 ) |
      ( ( input[ i + 2 ] & 0xff ) << 16 ) |
      ( ( input[ i + 3 ] & 0xff ) << 24 )
    ]);
  }

  return output;
}

function splitLeast_64( input ) {
  var i,
      length = input.length,
      output = [];

  for ( i = 0; i < length; i += 1 ) {
    output.push( ( input[i][1] >>  0 ) & 0xff );
    output.push( ( input[i][1] >>  8 ) & 0xff );
    output.push( ( input[i][1] >> 16 ) & 0xff );
    output.push( ( input[i][1] >> 24 ) & 0xff );
    output.push( ( input[i][0] >>  0 ) & 0xff );
    output.push( ( input[i][0] >>  8 ) & 0xff );
    output.push( ( input[i][0] >> 16 ) & 0xff );
    output.push( ( input[i][0] >> 24 ) & 0xff );
  }

  return output;
}

// Most Significant Byte, 64-bit
function mergeMost_64( input ) {
  var i,
      length = input.length,
      output = [];

  for ( i = 0; i < length; i += 8 ) {
    output.push([
      ( ( input[ i + 0 ] & 0xff ) << 24 ) |
      ( ( input[ i + 1 ] & 0xff ) << 16 ) |
      ( ( input[ i + 2 ] & 0xff ) <<  8 ) |
      ( ( input[ i + 3 ] & 0xff ) <<  0 ),
      ( ( input[ i + 4 ] & 0xff ) << 24 ) |
      ( ( input[ i + 5 ] & 0xff ) << 16 ) |
      ( ( input[ i + 6 ] & 0xff ) <<  8 ) |
      ( ( input[ i + 7 ] & 0xff ) <<  0 )
    ]);
  }
  
  return output;
}

function splitMost_64( input ) {
  var i,
      length = input.length,
      output = [];

  for ( i = 0; i < length; i += 1 ) {
    output.push( ( input[i][0] >> 24 ) & 0xff );
    output.push( ( input[i][0] >> 16 ) & 0xff );
    output.push( ( input[i][0] >>  8 ) & 0xff );
    output.push( ( input[i][0] >>  0 ) & 0xff );
    output.push( ( input[i][1] >> 24 ) & 0xff );
    output.push( ( input[i][1] >> 16 ) & 0xff );
    output.push( ( input[i][1] >>  8 ) & 0xff );
    output.push( ( input[i][1] >>  0 ) & 0xff );
  }

  return output;
}
