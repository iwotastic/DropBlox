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

var iteratorCode = 0;
var blockSpecs = [
  {
    title: "Alert %s",
    type: "action",
    code: function(args) { return "alert(" + args[0] + ");"; }
  },
  {
    title: "Show copy box %s",
    type: "action",
    code: function(args) { return "prompt(\"Copy this text:\"," + args[0] + ");"; }
  },
  {
    title: "Define variable %e",
    type: "variable",
    code: function(args) { return "var " + args[0] + ";"; }
  },
  {
    title: "Set %e to %s",
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
    title: "End",
    type: "control",
    code: function(args) { return "}"; }
  }
]
function getJS() {
  var blocks = document.getElementById("script").children;
  var code = ""
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    blockSpec = blockSpecs[block.getAttribute("data-block-id")];
    var blockSpecTitle = blockSpec.title;
    var isField = false;
    var buffer = "";
    var parts = [];
    for (var c = 0; c < blockSpecTitle.length; c++) {
      var char = blockSpecTitle.charAt(c);
      if (isField) {
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
        if (char === "%") {
          parts.push({
            type: "title",
            value: buffer
          })
          buffer = ""
          isField = true;
        }else{
          buffer += char;
        }
      }
    }
    parts.push({
      type: "title",
      value: buffer
    })
    var args = [];
    for (var b = 0; b < parts.length; b++) {
      var part = parts[b];
      if (part.type === "string") {
        args.push("\"" + block.children[b].value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\[\[(.*)\]\]/, function(m, v) {
          return "\"+ent_" + v.replace(/[^a-zA-Z_$\-]/g, "___Unknown___") + "+\"";
        }) + "\"")
      }else if (part.type === "entity") {
        args.push("ent_" + block.children[b].value.replace(/[^a-zA-Z_$\-]/g, "___Unknown___"))
      }else if (part.type === "number") {
        args.push(parseFloat(block.children[b].value))
      }
    }
    code += blockSpec.code(args);
  }
  return code;
}
for (var i = 0; i < blockSpecs.length; i++) {
  var blockSpecTitle = blockSpecs[i].title;
  var isField = false;
  var buffer = "";
  var parts = [];
  for (var c = 0; c < blockSpecTitle.length; c++) {
    var char = blockSpecTitle.charAt(c);
    if (isField) {
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
      if (char === "%") {
        parts.push({
          type: "title",
          value: buffer
        })
        buffer = ""
        isField = true;
      }else{
        buffer += char;
      }
    }
  }
  parts.push({
    type: "title",
    value: buffer
  })
  var blockDiv = document.createElement("div");
  blockDiv.setAttribute("data-block-id", i);
  blockDiv.className = "block " + blockSpecs[i].type;
  for (var p = 0; p < parts.length; p++) {
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
  document.getElementById("library").appendChild(blockDiv);
}
document.getElementById("run").addEventListener("click", function(){
  var code = getJS();
  try {
    eval(code);
  } catch (err) {
    alert(err.message);
  }
});
document.getElementById("getJS").addEventListener("click", function(){
  prompt("The JavaScript for this project is:", getJS());
});
var dragger = dragula({
  containers: [document.getElementById("library"), document.getElementById("script")],
  copy: function (el, source) {
    return source === document.getElementById("library")
  },
  accepts: function (el, target) {
    return target !== document.getElementById("library")
  },
  removeOnSpill: true
});
