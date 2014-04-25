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
  return resources[key];
}

//---

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
}

module.exports = {
  processor: processor,
  component: component,
  put: put,
  get: get,
  debug: debug
}