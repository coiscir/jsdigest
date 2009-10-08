jsDigest
===

A Message Digest module for JavaScript. (IE 5.5+, FF 2+, Chrome 2+, Opera 9+)


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

    Digest.hash(data, [utf8=true]).output()
    
    Digest.mac(hash, data, key, [utf8=true]).output()

### Examples ###

    Digest.md4('message').hex();
    Digest.sha1('message').base16();
    Digest.sha256('message').base32();
    Digest.sha512('message').base64url();
    
    Digest.hmac(Digest.md5, 'message', 'passphrase').hex();

### UTF-8 or ANSI ###

    Digest.md5('\u20AC').hex() <=>
    Digest.md5('\xE2\x82\xAC', false).hex()


More Support
---

### Hash Functions ###

 * MD6 (PAR, SEQ)
 * Skein (256, 512, 1024)

***Note**: These functions cannot be used with MACs.*


More Syntax
---

    Digest.hash(len, data, [utf8=true]).output()
    
    Digest.hash(len, data, key, [utf8=true]).output()

### Examples ###

    Digest.skein512(384, 'message').hex();
    Digest.skein512(512, 'message').base32();
    
    Digest.md6par(224, 'message', 'passphrase').base16();
    Digest.md6seq(512, 'message', 'passphrase').base64url();


Building
----

Building jsDigest requires:

 * A copy of the [**jsDigest** source tree](http://github.com/coiscir/jsdigest)
 * [**Ruby 1.8** or later](http://ruby-lang.org/)
 * [**Rake 0.8.7** or later](http://rake.rubyforge.org/)
 * [**jsmin 1.0.1** or later](http://rubyforge.org/projects/riposte/)

From within the source tree:

 * `rake build` - Compiles full and minified distributables.
 * `rake release` - Compiles versioned distributables.


Credits
----

Copyright (c) 2009 Jonathan Lonowski  
jsDigest is released under the MIT License
