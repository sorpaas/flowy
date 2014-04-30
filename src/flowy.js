var express = require('express');
var app = express();

var processors = {};
function processor(name, func) {
  processors[name] = func;
}

var components = [];
function component(name, com) {
  components[name] = com;
}

var resources = {};
function put(key, value) {
  resources[key] = value;
  for(var com_key in components) {
    for(var i in components[com_key].ins) {
      if(components[com_key].ins[i] === "res:" + key) {
        process_component(com_key, components[com_key]);
      }
    }
  }
}
function get(key) {
  if(is_mounted(key)) {
    var mount_path;
    var remaining_path;
    
    for(var provider_name in providers) {
      if(key.startsWith(provider_name)) {
        mount_path = provider_name;
        remaining_path = key.substring(mount_path.length, key.length - 1);
        break;
      }
    }
    
    return providers[mount_path](remaining_path);
  }
  return resources[key];
}

var providers = {};
function mount(path, provider) {
  if(is_mounted(path)){
    throw 'already mounted';
  }
  providers[path] = provider;
}

function unmont(path) {
  providers[path] = null;
}

//---

function is_mounted(path) {
  for(var provider_name in providers) {
    if(path.startsWith(provider_name) {
      return true;
    }
  }
  return false;
}

function get_in(key) {
  var arr = key.split(":");

  var source = arr[0];
  var loc = arr[1];

  if(source === "res") {
    return get(loc);
  } else {
    return components[loc].result;
  }
}

function process_component(name, com) {
  var processor_name = com.processor;
  var in_arrs = com.ins;
  var in_values = [];

  for(var i in in_arrs) {
    value = get_in(in_arrs[i]);
    if(value) {
      in_values[in_values.length] = value;
    } else {
      return;
    }
  }

  var processor = processors[processor_name];
  var result = processor.apply(this, in_values);
  com.result = result;

  if(com.output_resource) {
    var out_res = com.output_resource;
    put(out_res, com.result);
  }

  for(var com_key in components) {
    for(var i in components[com_key].ins) {
      if(components[com_key].ins[i] === "com:" + name) {
        process_component(com_key, components[com_key]);
      }
    }
  }
}

//---

function debug() {
  console.log(processors);
  console.log(components);
  console.log(resources);
}

//---

function listen(port, done) {
  app.use(function(req, res, next){
    if (req.is('application/json')) {
      req.text = '';
      req.setEncoding('utf8');
      req.on('data', function(chunk){ req.text += chunk });
      req.on('end', function() {
        req.body = JSON.parse(req.text);
        next();
      });
    } else {
      next();
    }
  });

  app.get('*', function(req, res) {
    var key = req.url;
    res.send(get(key));
  });
  app.post('*', function(req, res) {
    var key = req.url;
    var value = req.body;
    put(key, value);
    res.send({result: 'ok'});
  })
  app.listen(port, done);
}

//---

module.exports = {
  processor: processor,
  component: component,
  put: put,
  get: get,
  debug: debug,
  listen: listen,
  mount: mount,
  unmount: unmount
}
