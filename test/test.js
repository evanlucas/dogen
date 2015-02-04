var dogen = require('../')
  , assert = require('assert')
  , path = require('path')

describe('dogen', function() {
  describe('parse', function() {
    it('should return err if err reading file', function(done) {
      dogen.parse('blah.js', function(err) {
        assert.ok(err, 'Error should exist')
        done()
      })
    })

    it('should return err if err parsing', function(done) {
      dogen.parse(join('fixtures/invalid.js'), function(err) {
        assert.ok(err, 'Error should exist')
        done()
      })
    })

    it('should work with prototypes', function(done) {
      dogen.parse(join('fixtures/proto.js'), function(err, out) {
        if (err) return done(err)
        assert.ok(out, 'out should exist')
        assert.equal(out.names.length, 1)
        assert.equal(out.names[0], 'Blah')
        var p = out.functions[0]
        assert.equal(p.proto, 'Blah')
        assert.equal(p.func, 'biscuits')
        assert.ok(p.isPrototype)
        assert.equal(p.params.length, 2)
        assert.equal(p.params[0], 'id')
        assert.equal(out.module, 'Blah')
        done()
      })
    })

    it('should work with exports', function(done) {
      dogen.parse(join('fixtures/export.js'), function(err, out) {
        if (err) return done(err)
        assert.ok(out, 'out should exist')
        assert.equal(out.names.length, 0)
        assert.equal(out.module, null)
        assert.equal(out.functions.length, 1)
        var f = out.functions[0]
        assert.equal(f.proto, 'actions')
        assert.equal(f.func, 'getAction')
        assert.ok(!f.isPrototype)
        done()
      })
    })

    it('should work with shebangs', function(done) {
      dogen.parse(join('fixtures/shebang.js'), function(err, out) {
        if (err) return done(err)
        assert.ok(out, 'out should exist')
        assert.equal(out.names.length, 1)
        assert.equal(out.names[0], 'Blah')
        var p = out.functions[0]
        assert.equal(p.proto, 'Blah')
        assert.equal(p.func, 'biscuits')
        assert.ok(p.isPrototype)
        assert.equal(p.params.length, 2)
        assert.equal(p.params[0], 'id')
        assert.equal(out.module, 'Blah')
        done()
      })
    })

    it('should allow optional description', function(done) {
      dogen.parse(join('fixtures/desc.js'), function(err, out) {
        if (err) return done(err)
        assert.ok(out, 'out should exist')
        assert.equal(out.description, 'This is a test file')
        assert.equal(out.names.length, 1)
        assert.equal(out.names[0], 'Blah')
        var p = out.functions[0]
        assert.equal(p.proto, 'Blah')
        assert.equal(p.func, 'biscuits')
        assert.ok(p.isPrototype)
        assert.equal(p.params.length, 2)
        assert.equal(p.params[0], 'id')
        assert.equal(out.module, 'Blah')
        done()
      })
    })
  })

  describe('generate', function() {
    it('should return err if parse error', function(done) {
      dogen.generate('blah', 'blah', 'blah', function(err) {
        assert.ok(err, 'Error should exist')
        done()
      })
    })

    it('should return null, string on success', function(done) {
      var fp = join('fixtures/proto.js')
      dogen.generate(fp, 'proto.js', 'blah', function(err, out) {
        if (err) return done(err)
        assert.ok(out, 'out should exist')
        assert.equal(out, '\n# proto.js\n\nblah\n\n\n## ' +
          'Blah.prototype.biscuits(id, cb)\n')
        done()
      })
    })
  })
})

function join(p) {
  return path.join(__dirname, p)
}
