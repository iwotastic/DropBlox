/*
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

var iteratorCode = 0; // UID For Repeat Loops
/*
Block Spefifications:
Key to properties:
  title - Display name for block use these modifiers to add input:
    %s - string
    %e - entity - variable
    %n - number - float
  type - Tells DropBlox how to color blocks (see style.css)
  code - function that takes one array argument and returns a string contaning the JavaScript run for that block
*/
var blockSpecs = [
  {
    title: "Alert %s",
    type: "action",
    code: function(args) { return "alert(" + args[0] + ");"; }
  },
  {
    title: "Show Copy Box %s",
    type: "action",
    code: function(args) { return "prompt(\"Copy this text:\"," + args[0] + ");"; }
  },
  {
    title: "Ask %s And Set %e To Result",
    type: "action",
    code: function(args) { return args[1] + "=prompt(" + args[0] + ");"; }
  },
  {
    title: "Define Variable %e",
    type: "variable",
    code: function(args) { return "var " + args[0] + ";"; }
  },
  {
    title: "Set %e To %s",
    type: "variable",
    code: function(args) { return args[0] + "=" + args[1] + ";"; }
  },
  {
    title: "Repeat %n Times",
    type: "control",
    code: function(args) {
      i++;
      return "for(var i" + iteratorCode + "=0;i" + iteratorCode + "<" + args[0] + ";i" + iteratorCode + "++){";
    }
  },
  {
    title: "If %s Equals %s Then",
    type: "control",
    code: function(args) {
      return "if(" + args[0] + " == " + args[1] + "){";
    }
  },
  {
    title: "Else If %s Equals %s Then",
    type: "control",
    code: function(args) {
      return "}else if(" + args[0] + " == " + args[1] + "){";
    }
  },
  {
    title: "Else",
    type: "control",
    code: function(args) {
      return "}else{";
    }
  },
  {
    title: "While %s Equals %s Do",
    type: "control",
    code: function(args) {
      return "while(" + args[0] + "==" + args[1] + "){";
    }
  },
  {
    title: "Show Comfimation %s, If Yes Do",
    type: "control",
    code: function(args) {
      return "if(confirm(" + args[0] + ")){";
    }
  },
  {
    title: "End",
    type: "control",
    code: function(args) { return "}"; }
  }
]
/*
  This function parses through the blocks and returns the entire JS needed to run the current project.
*/
function getJS() {
  var blocks = document.getElementById("script").children; // Get all of the "block" elements
  var code = ""; // A buffer to store the JS code
  for (var i = 0; i < blocks.length; i++) { // Loop through the "block" elements
    var block = blocks[i];
    var blockSpec = blockSpecs[block.getAttribute("data-block-id")]; // Get the blockSpec for the current block
    var blockSpecTitle = blockSpec.title;
    var isField = false;
    var buffer = "";
    var parts = []; // Place to hold all of the block parts
    for (var c = 0; c < blockSpecTitle.length; c++) {
      var char = blockSpecTitle.charAt(c);
      if (isField) { // Check the field type
        if (char === "s") {
          parts.push({
            type: "string"
          })
        }else if (char === "e") {
          parts.push({
            type: "entity"
          })
        }else if (char === "n") {
          parts.push({
            type: "number"
          })
        }
        isField = false;
      }else{
        if (char === "%") { // We got ourselves a field let's handle it
          parts.push({
            type: "title",
            value: buffer
          })
          buffer = ""
          isField = true;
        }else{ // Add to the buffer
          buffer += char;
        }
      }
    }
    parts.push({ // Add the final title (probably could get rid of this)
      type: "title",
      value: buffer
    })
    var args = []; // Place to hold user provided arguments
    for (var b = 0; b < parts.length; b++) {
      var part = parts[b];
      if (part.type === "string") {
        args.push("\"" + block.children[b].value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\[\[(.*)\]\]/, function(m, v) {
          // This function is cool, it allows you to embed variables in string inputs :)
          return "\"+ent_" + v.replace(/[^a-zA-Z_$\-]/g, "___Unknown___") + "+\"";
        }) + "\"")
      }else if (part.type === "entity") {
        args.push("ent_" + block.children[b].value.replace(/[^a-zA-Z_$\-]/g, "___Unknown___")) // Entity inputs with added saftey feature
      }else if (part.type === "number") {
        args.push(parseFloat(block.children[b].value))
      }
    }
    code += blockSpec.code(args);
  }
  return code;
}
for (var i = 0; i < blockSpecs.length; i++) { // Loop through blockSpecs and add blocks to library
  var blockSpecTitle = blockSpecs[i].title;
  var isField = false;
  var buffer = "";
  var parts = [];
  for (var c = 0; c < blockSpecTitle.length; c++) {
    var char = blockSpecTitle.charAt(c);
    if (isField) { // Check the field type
      if (char === "s") {
        parts.push({
          type: "string"
        })
      }else if (char === "e") {
        parts.push({
          type: "entity"
        })
      }else if (char === "n") {
        parts.push({
          type: "number"
        })
      }
      isField = false;
    }else{
      if (char === "%") { // We got ourselves a field let's handle it
        parts.push({
          type: "title",
          value: buffer
        })
        buffer = ""
        isField = true;
      }else{ // Add to the buffer
        buffer += char;
      }
    }
  }
  parts.push({ // Add the final title
    type: "title",
    value: buffer
  })
  var blockDiv = document.createElement("div"); // Create <div> representing block
  blockDiv.setAttribute("data-block-id", i); // Set block-id (this is important when parsing)
  blockDiv.className = "block " + blockSpecs[i].type; // Set class
  for (var p = 0; p < parts.length; p++) { // Add ALL the fields (insert "ALL THE" meme here)
    var part = parts[p];
    if (part.type === "title") {
      var title = document.createElement("span");
      title.textContent = part.value
      blockDiv.appendChild(title)
    }else if (part.type === "string") {
      var input = document.createElement("input");
      input.className = "string";
      blockDiv.appendChild(input);
    }else if (part.type === "entity") {
      var input = document.createElement("input");
      input.className = "entity";
      blockDiv.appendChild(input);
    }else if (part.type === "number") {
      var input = document.createElement("input");
      input.className = "number";
      blockDiv.appendChild(input);
    }
  }
  document.getElementById("library").appendChild(blockDiv); // Append finished block to the library
}
document.getElementById("run").addEventListener("click", function(){
  // Run user's code
  var code = getJS();
  try {
    // DropBlox isn't perfect, the user's code could error so let's handle that
    eval(code);
  } catch (err) {
    alert(err.message);
  }
});
document.getElementById("getJS").addEventListener("click", function(){
  // Give the user their unreadable code. :P
  var code = getJS()
  var scriptName = prompt("What you you like to name the JavaScript file?")
  if (scriptName) {
    var downloader = document.createElement("a")
    downloader.href = "data:text/javascript," + encodeURI(code)
    downloader.style.display = "none"
    downloader.download = scriptName + ".js"
    document.body.appendChild(downloader)
    downloader.click()
  }
});
document.getElementById("saveScript").addEventListener("click", function(){
  var scriptHTML = "";
  var blocks = document.getElementById("script").children;
  Array.from(blocks).forEach(block => {
    var blockSpec = blockSpecs[Number(block.getAttribute("data-block-id"))];
    var blockSpecTitle = blockSpec.title;
    var isField = false;
    var buffer = "";
    var parts = [];
    for (var c = 0; c < blockSpecTitle.length; c++) {
      var char = blockSpecTitle.charAt(c);
      if (isField) { // Check the field type
        if (char === "s") {
          parts.push({
            type: "string"
          })
        }else if (char === "e") {
          parts.push({
            type: "entity"
          })
        }else if (char === "n") {
          parts.push({
            type: "number"
          })
        }
        isField = false;
      }else{
        if (char === "%") { // We got ourselves a field let's handle it
          parts.push({
            type: "title",
            value: buffer
          })
          buffer = ""
          isField = true;
        }else{ // Add to the buffer
          buffer += char;
        }
      }
    }
    parts.push({ // Add the final title
      type: "title",
      value: buffer
    })
    scriptHTML += "<div data-block-id=\"" + block.getAttribute("data-block-id") + "\" class=\"block " + blockSpec.type + "\">"
    for (var p = 0; p < parts.length; p++) { // Add ALL the fields (insert "ALL THE" meme here)
      var part = parts[p];
      if (part.type === "title") {
        scriptHTML += "<span>" + part.value + "</span>"
      }else if (part.type === "string") {
        scriptHTML += "<input class=\"string\" value=\"" + block.children[p].value + "\">"
      }else if (part.type === "entity") {
        scriptHTML += "<input class=\"entity\" value=\"" + block.children[p].value + "\">"
      }else if (part.type === "number") {
        scriptHTML += "<input class=\"number\" value=\"" + block.children[p].value + "\">"
      }
    }
    scriptHTML += "</div>"
  })
  var currentScriptsRaw = localStorage.scripts || "{}"
  var currentScripts = JSON.parse(currentScriptsRaw)
  var scriptName = prompt("What would you like to name this script?")
  currentScripts[scriptName] = scriptHTML
  localStorage.scripts = JSON.stringify(currentScripts)
});
document.getElementById("loadScript").addEventListener("click", function(){
  if (localStorage.scripts) {
    var currentScripts = JSON.parse(localStorage.scripts)
    var scriptName = prompt("What script would you like to load?")
    if (currentScripts[scriptName]) {
      document.getElementById("script").innerHTML = currentScripts[scriptName]
    }else{
      alert("Sorry, no script stored.")
    }
  }else{
    alert("Sorry, no scripts found.")
  }
});
document.getElementById("about").addEventListener("click", function(){
  // Take the user to this repo
  location.assign("https://github.com/iwotastic/DropBlox")
});
var dragger = dragula({ // Initialize Dragula (bevacqua/dragula)
  containers: [document.getElementById("library"), document.getElementById("script")],
  copy: function (el, source) {
    return source === document.getElementById("library")
  },
  accepts: function (el, target) {
    return target !== document.getElementById("library")
  },
  removeOnSpill: true
});
