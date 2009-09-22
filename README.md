jsDigest
===

A Message Digest module for JavaScript.

### Features ###

 * **Cross-Browser Support** -- Internet Explorer 5.5, Firefox 2, Chrome 2, Opera 9

 * **Namespacing** -- jsDigest is contained within a single global object -- `Digest`.

 * **Simplicity** -- Hash data in a single line, choosing both hash function and output format -- `Digest.md5('abc').hex()`

 * **Unicode Support** -- jsDigest functions assume UTF-8 encoding for messages. ANSI encoding, alternatively.

 * **64-Bit Support** -- Includes 64-bit algorithms, including SHA-512 and SHA-384.


### Origin ###

jsDigest was inspired by the desire to understand hash functions and their implementations.


Supports
---

### Hash Functions ###

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

    Digest.hash(data [, utf8]).output()
    Digest.mac(hash, data, key [, utf8]).output()

#### Examples ####

    // MD4('message'), UTF-8 encoded, Hex output
    Digest.md4('message').hex();

    // SHA-1('message'), ANSI encoded, Base-16 output
    Digest.sha1('message', false).base16();

    // HMAC-MD5('message', 'secret key'), UTF-8 encoded, Base-64 output
    Digest.hmac(Digest.md5, 'message', 'secret key'). base64();


----

Copyright (c) 2009 Jonathan Lonowski  
jsDigest is released under the MIT License
