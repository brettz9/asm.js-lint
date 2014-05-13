# asm.js-lint

asm.js lint plug-in for CodeMirror

#Installation

Except during development (for the sake of the test file), the plug-in does
not install CodeMirror (nor put it within `package.json`'s
[`peerDependencies`](http://blog.nodejs.org/2013/02/07/peer-dependencies/)
which would include CodeMirror in a subdirectory).

Since CodeMirror already has `node_modules` in its `.gitignore`, you can
safely run the install script while in the CodeMirror directory.

```
cd <CodeMirror path>
npm install asm.js-lint
```

Then in your HTML, along with `<codemirror>/addon/lint/lint.js` make
sure to add script tags for `<asm.js-lint>/dist/asm-lint-helper.compiled.js`
and `<asm.js-lint>/lib/asm-lint.js`.

Note that if you install from the repo instead of npm, you will have to
[browserify](http://browserify.org/):

```
cd <asm.js-lint directory>
browserify src/asm-lint-helper.js -o dist/asm-lint-helper.compiled.js
```
