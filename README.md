jsDigest
===

Cryptographic Hash and MAC functions for JavaScript.


Syntax
---

    Digest.hash(data [, ansi]).output()
    Digest.mac(hash, key, data [, ansi]).output()

#### Examples ####

    var hash = Digest.md5('data').hex();
    var hmac = Digest.hmac(Digest.sha1, 'key', 'data').base64();
