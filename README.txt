## High Level Overview ##

Every little widget is modularized into two main parts: Parsers and Renderers. They can be mixed and matched but not all parsers will work with all renderers.

In the folder called ParsersAndRenderers you can find all the different parser and renderer implementations.

Each implementation needs to export three functions:
1) Parsing Function
2) Rendering Function
3) Error Function

# Example code from the AST visualz code.
module.exports = {
	parseAST : parseAST,
	drawErrorAST : drawErrorAST,
	renderAST : renderAST
}


In the main app.js file which renderer / parser / errorfuntion combination is going to be used is decided by the following three variables:

var activeParseFunction = fdg.parseSimpleFDG;
var activeRenderFunction = fdg.renderFDG;
var activeErrorFunction = fdg.drawErrorFDG;

In this case, for example, the user will see the FDG (force directed graph) parser, renderer and error handling.

If one decides to mix and match different components, setting these "active" variables is the way to go.

## Bundling ##

In order to bundle the javascript files and get access to Node modules in the browser we use the browserify (http://browserify.org/) library.

If you make changes to any of the files and/or add new widgets you need to bundle them by calling:
browserify app.js  ParsersAndRenderers/yourparser.js ParsersAndRenderers/otherparser.js > bundle.js

## Watchify ##
I recommend using Watchify to automatically call browserify whenever a chance is made.

watchify pathtracing-app.js ParsersAndRenderers/fdg.js ParsersAndRenderers/ast.js raytracing/glUtils.js raytracing/sylvester.src.js  ParsersAndRenderers/pathtracing.js -o pathtracing-bundle.js
