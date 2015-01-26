var fs = require('fs')
  , aparse = require('acorn').parse
  , dogen = exports

dogen.generate = function(filepath, filename, desc, cb) {
  dogen.parse(filepath, function(err, contents) {
    if (err) return cb(err)
    var out = writeHead(1, filename)
    if (desc) {
      out += '\n' + desc + '\n\n'
    }
    var protos = contents.functions
    var len = protos.length
    for (var i=0; i<len; i++) {
      var p = protos[i]
      var name = p.proto + '.'
      if (p.isPrototype) {
        name += 'prototype.'
      }
      name += p.func
      name += '(' + p.params.join(', ') + ')'
      out += writeHead(2, name)
    }

    return cb(null, out)
  })
}

dogen.parse = function(file, cb) {
  fs.readFile(file, 'utf8', function(err, contents) {
    if (err) return cb(err)
    // strip shebang if exists
    if (contents && contents[0] === '#' && contents[1] === '!') {
      var idx = contents.indexOf('\n')
      contents = contents.substr(idx, contents.length)
    }
    var err
    try {
      var out = aparse(contents, {
        ecmaVersion: 5
      , strictSemicolons: false
      , allowTrailingCommas: true
      })
    }
    catch (_) {
      err = _
    }
    if (err) return cb(err)
    var body = out.body
    var protos = findTopLevelFunctions(body)
    return cb(null, protos)
  })
}

function parsePrototypes(body) {
  var out = {
    protos: []
  , module: null
  }
  if (!body.length) return out
  body = body.reduce(function(set, item) {
    if (!isExpressionStatement(item)) {
      return set
    }
    var expression = item.expression
    if (!isAssignmentExpression(expression)) {
      return set
    }
    var left = expression.left
      , right = expression.right

    if (!isMemberExpression(left)) {
      return set
    }
    left = parseLeftProto(left)
    if (!left) return set
    if (left.module) {
      out.module = parseModule(right)
      return set
    } else {
      right = parseRightProto(right)
    }
    if (!right) return set
    left.params = right
    set.push(left)
    return set
  }, [])
  out.protos = body
  return out
}

function parseModule(node) {
  if (isIdentifier(node)) return node.name
  return node
}

function parseLeftProto(node) {
  if (!isMemberExpression(node)) {
    return false
  }
  var obj = node.object
  if (!isMemberExpression(obj)) {
    if (isIdentifier(obj)) {
      if (obj.name === 'module'
        && node.property
        && node.property.name === 'exports') {
        return {
          module: true
        }
      }
    } else {
      return false
    }
  }

  var isExports = !obj.object

  var o2 = obj.object
  if (!isIdentifier(o2) && !isExports) {
    return false
  }
  var name = o2
    ? o2.name // Prototype name
    : obj.name
  var prop = o2
    ? obj.property
    : node.property

  if (!isIdentifier(prop)) {
    return false
  }
  var propType = prop.name
  var isProto = propType === 'prototype'
  var objProp = node.property
  if (!isIdentifier(objProp)) return false
  var func = objProp.name
  var out = {
    proto: name
  , func: func
  , isPrototype: isProto
  }
  return out
}

function parseRightProto(node) {
  if (!isFunctionExpression(node)) return false
  return getNodeParams(node)
}

function findTopLevelFunctions(body) {
  var out = []
  var len = body.length
  for (var i=0; i<len; i++) {
    var node = body[i]
    if (isFunctionDeclaration(node)) {
      var name = getFunctionName(node)
      out.push(name)
    }
  }
  var protos = parsePrototypes(body)
  return {
    names: out
  , module: protos.module
  , functions: protos.protos
  }
}

function isMemberExpression(node) {
  return node && node.type === 'MemberExpression'
}

function isExpressionStatement(node) {
  return node && node.type === 'ExpressionStatement'
}

function isAssignmentExpression(node) {
  return node && node.type === 'AssignmentExpression'
}

function isFunctionDeclaration(node) {
  return node && node.type === 'FunctionDeclaration'
}

function isFunctionExpression(node) {
  return node && node.type === 'FunctionExpression'
}

function isIdentifier(node) {
  return node && node.type === 'Identifier'
}

function getFunctionName(node) {
  return node.id && node.id.name
}

function getNodeParams(node) {
  if (!node) return []
  if (!node.params || !node.params.length) return []
  return node.params.reduce(function(set, item) {
    if (item.type === 'Identifier') {
      set.push(item.name)
    }
    return set
  }, [])
}

function writeHead(level, content) {
  var str = '\n'
  for (var i=0; i<level; i++) {
    str += '#'
  }
  str += ' ' + content + '\n'
  return str
}
