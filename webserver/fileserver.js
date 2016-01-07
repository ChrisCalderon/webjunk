var http = require('http') // for the http server loop
var fs = require('fs') // for reading files and checking for changes
var url = require('url') // for parsing urls into relevant parts
var zlib = require('zlib') // for compression

var HOST = 'localhost'
var PORT = 80
var pathRoutes = { // for pretty urls
  '/index' : 'index.html',
  '/'      : 'index.html',
}
var media_types = { // for setting headers properly
  '.css' : 'text/css',
  '.gif' : 'image/gif',
  '.html': 'text/html',
  '.jpg' : 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png' : 'image/png',
  '.js'  : 'application/javascript',
  '.txt' : 'text/plain',
}

var update_on_change = function(filename, cache, updater){
  fs.watch(filename, function(event, filename){
    if(event == 'change'){
      console.log('Got change in ' + filename + '.')
      fs.readFile(filename, function(err, data){
	if(err)
	  throw err
	if(updater)
	  cache[filename] = updater(data)
	else
	  cache[filename] = data
      })
    }
  })
}

// initializer must be a synchronous function.
// it is used to create the first entry in the cache
// for the given filename.
// updater must be an asynchronous function.
// it is used to asynchronously update the cache when
// the specified file is changed.
var cache_get = function(cache, filename, initializer, updater){
  if(!(filename in cache)){
    data = fs.readFileSync(filename)
    if(initializer)
      cache[filename] = initializer(data)
    else
      cache[filename] = data
    update_on_change(filename, cache, updater)
  }
  return cache[filename]
}

var files = {}
var get_file = function(filename){
  return cache_get(
    files,
    filename,
    function(data){
      console.log('First time caching ' + filename + '.')
      return data
    },
    function(data){
      console.log(filename + ' changed, updating cache.')
      return data
    }
  )
}

var compressed = {} 
var compress = function(data){
  return zlib.gzip(data, function(err, result){
    if(err) throw err
    return result
  })
}
var get_compressed_file = function(filename){
  return cache_get(
    compressed,
    filename,
    function(data){
      console.log('First time caching and compressing ' + filename + '.')
      return zlib.gzipSync(data)
    },
    function(data){
      console.log(filename + ' changed, recompressing.')
      return compress(data)
    }
  )
}

var fileServe = function(pathRoutes){
  return function(request, response){
    var uri = url.parse(request.url).pathname // pathname example: /index.html
    if (uri in pathRoutes)
      var filename = pathRoutes[uri]
    else
      var filename = uri.slice(1)
    // filename example: index.html
    // if we can access filename...
    fs.access(filename, fs.F_OK, function(err){
      response.setHeader('Server', 'fileserver.js')
      if(err){
	console.log('error: got request for ' + filename)
	response.statusCode = 404
	response.setHeader('Content-Type', 'text/html')
	response.setHeader('Content-Encoding', 'gzip')
	response.end(get_compressed_file('error404.html'))
      } else{
	console.log('got request for ' + filename)
	var extension = filename.slice(filename.lastIndexOf('.'))
	var media_type = media_types[extension]
	response.setHeader('Content-Type', media_type)
	
	if(media_type.startsWith('text') || media_type == "application/javascript"){
	  response.setHeader('Content-Encoding', 'gzip')
	  response.end(get_compressed_file(filename))
	}
	else{
	  response.end(get_file(filename))
	}
      }
    })
  }
}

var server = http.createServer(fileServe(pathRoutes))
server.listen(PORT, HOST)
