// Finalizing
function crop(size, hash, righty) {
  var length = Math.floor((size + 7) / 8),
      remain = size % 8;
  
  if (righty) {
    hash = hash.slice(hash.length - length);
  } else {
    hash = hash.slice(0, length);
  }
  
  if (remain > 0) {
    hash[length - 1] &= (0xff << (8 - remain)) & 0xff;
  }
  
  return hash;
}
