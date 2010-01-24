jsDigest
===

A Message Digest module for JavaScript. (IE 5.5+, FF 2+, Chrome 2+, Opera 9+)


Supports
---

#### Hash Functions ####

* **MD4**
* **MD5**
* **MD6** (PAR, SEQ)
* **RIPEMD-160** (128)
* **SHA-1**
* **SHA-224**
* **SHA-256**
* **SHA-384** 
* **SHA-512**
* **Skein** (256, 512, 1024)

#### Input Encoding ####

* **UTF-8**

#### Output (RFC 4648) Encoding ####

* **Base-16** / Hex
* **Base-32** (Hex)
* **Base-64** (URL)


Usage
---

HMAC-Keyed Hash Functions:

    * Digest.md4
    * Digest.md5
    * Digest.ripemd128
    * Digest.ripemd160
    * Digest.sha1
    * Digest.sha224
    * Digest.sha256
    * Digest.sha384
    * Digest.sha512

Keyed Hash Functions:

    * Digest.md6par
    * Digest.md6seq
    * Digest.skein256
    * Digest.shein512
    * Digest.shein1024

Outputs:

    * hex         # { 0-9 a-f }
    * base16      # { 0-9 A-F }
    * base32      # { A-Z 2-7 }
    * base32hex   # { 0-9 a-v }
    * base64      # { A-Z a-z 0-9 + / }
    * base64url   # { A-Z a-z 0-9 - _ }

### Syntax ###

    Digest.hash([size], data, [key]).output();

### Arguments ###

`size` (`Number`) (_optional_)

The length of the output digest in bits.

`data` (`String`, `Array`)

The input to be hashed by the specified algorithm.

`key` (`String`, `Array`) (_optional_)

An optional passphrase for keyed encryption.  
This is the HMAC key for algorithms that aren't already keyed.


### Key vs. No Key ###

While most functions operate differently with and without a key, MD6 does not.  
In its case, a 0-length key will always be substituted when no key is given.


### String vs. Array ###

Internally, all hash functions operate on Arrays rather than Strings.

To convert between the 2, jsDigest includes a function for each direction:

* `Digest.atos` for Array to String.
* `Digest.stoa` for String to Array.

However, 8-bit algorithms cannot work with JavaScript's 16-bit character codes.  
So, each input must be converted to a **byte array** before hashing.

The exact conversion used depends on the input's original type:

* Strings are **UTF-8 encoded** by their character codes.
* Arrays are considered **ready** and elements are **truncated** to bytes.

So, don't want UTF-8 encoding? Use `stoa` to counter:

    Digest.hash(Digest.stoa('message')).output();


### Examples ###

    # Non-Keyed Algorithms
    Digest.md4('message').base16();
    Digest.sha256('message').hex();
    
    # HMAC-Keyed Algorithms
    Digest.md5('message', 'passphrase').base32hex();
    Digest.sha512('message', 'passphrase').base32();
    
    # Variable-Length Algorithms
    Digest.md6par(256, 'message', 'passphrase').base64url();
    Digest.md6seq(512, 'message', 'passphrase').base64();
    
    # Odd Bit-Length
    Digest.skein1024(1001, 'message', 'passphrase').hex();
    Digest.skein256(99, 'message', 'passphrase').base16();
    
    # Prevent UTF-8 encoding with `stoa` or byte arrays directly
    Digest.md5(Digest.stoa('message')).base16();
    Digest.sha1([0x0F, 0x4B, 0x87, 0xC3]).hex();


Building jsDigest
----

Building jsDigest requires:

 * A copy of the [**jsDigest** source tree](http://github.com/coiscir/jsdigest)
 * [**Ruby 1.8** or later](http://ruby-lang.org/)
 * [**Rake 0.8.7** or later](http://rake.rubyforge.org/)
 * [**Packr 3.1.0** or later](http://rubyforge.org/projects/packr/)

From within the source tree:

 * `rake build` - Compiles full and minified distributables.


License
----

jsDigest is released under the terms of the MIT License.
