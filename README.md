# dogen

Generate basic documentation by parsing the AST

## Install

```
$ npm install dogen
```

## Tests

```
$ npm test
```

## API

### dogen.generate(filepath, filename, desc, cb)

Generates markdown for the given _filepath_

Ex.

```js
// file index.js
var fs = require('fs')
module.exports = Blah

function Blah() {}

Blah.prototype.biscuits = function(id, cb) {}
// EOF

dogen.generate('./index.js', 'Blah', 'test framework', function(err, out) {
  console.log(out)
  // will generate
  /*
    # proto.js
    
    blah
    
    
    ## Blah.prototype.biscuits(id, cb)
  
  */
})
```
