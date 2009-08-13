jsDigest
===

Cryptographic Hash and MAC functions for JavaScript.


Functions
---

### Hash Algorithms ###

 * MD4
 * MD5
 * SHA-1
 * SHA-256, SHA-224
 * SHA-512, SHA-384

### MAC ###

 * HMAC

### RFC 4648 Encoding ###

 * Base-16, Hex
 * Base-32, Base-32 Hex
 * Base-64, Base-64 URL


Syntax
---

    Digest.hash(data [, ansi]).output()
    Digest.mac(hash, key, data [, ansi]).output()

#### Examples ####

    var hash = Digest.md5('data').hex();
    var hmac = Digest.hmac(Digest.sha1, 'key', 'data').base64();
