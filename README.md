jsDigest
===

jsDigest enables the use of Cryptographic Hash Functions in JavaScript, aimed to offer the following attributes:

 * **Simplicity** -- Using the core syntax of `Digest.hash(data).output()`, simply choose a hash function, give it your data, and choose an output format.

 * **Namespacing** -- Containing all of jsDigest within the `Digest` object, grealy reducing the number of globals and the potential for conflicts.

 * **64-Bit Support** -- Including SHA-512 and SHA-384.


### Origin ###

jsDigest was inspired by the desire to understand hash functions and their implementations.


Supports
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


----

Copyright (c) 2009 Jonathan Lonowski  
jsDigest is released under the MIT License
