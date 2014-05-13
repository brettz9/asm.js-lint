// Depends on asm global from asm-lint-helper.js
var asm; // Define this to avoid strict errors in compiled helper to be supplied above
(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.registerHelper("lint", "javascript", function(text) {
  var found = [];
  try {
    var results = asm.validate(text);
  }
  catch (e) {
    var err = e.stack && e.stack.match(/ValidationError: ([^\n]*)\n/),
        msg = (err && err[1]) || e.stack;
    if (e.loc) {
        var start = e.loc.start, end = e.loc.end;
        found.push({
          from: CodeMirror.Pos(start.line - 1, start.column),
          to: CodeMirror.Pos(end.line - 1, end.column),
          message: msg
        });
    }
    else {
      found.push({
        from: CodeMirror.Pos(1, 1),
        to: CodeMirror.Pos(1, 1),
        message: msg
      });
    }
  }
  return found;
});

});
