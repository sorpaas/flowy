var Flowy = require('./src/flowy.js');

Flowy.processor("permission", function(username, password) {
  if(username === "hello" && password === "world") {
    return true;
  } else {
    return false;
  }
});

Flowy.processor("output", function(wh) {
  return "Hello, world!";
});

Flowy.component("judger", {
  processor: "permission",
  ins: ["res:/login/username", "res:/login/password"]
});

Flowy.component("speaker", {
  processor: "output",
  ins: ["com:judger"],
  output_resource: ["/message"]
});

//Flowy.put("/login/username", "hello");
//Flowy.put("/login/password", "world");

//console.log(Flowy.get("/message"));

Flowy.listen(3000, function() {
  console.log('listening on port 3000');
});
