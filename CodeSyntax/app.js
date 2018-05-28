var fdg = require('./ParsersAndRenderers/fdg.js');
var ast = require('./ParsersAndRenderers/ast.js');


var simpleParseString = "hat_1 = brown\nhat_2 = brown\nhead_1 = teal\nhead_2 = teal\nchin = teal\n\nhat_1 -> hat_2\nhead_1 -> chin\nchin -> head_2\nhead_1 -> hat_1\nhat_2 -> head_2\n\nbody = blue\nbelly = blue\narm_l = blue\narm_r = blue\nhand_l = teal\nhand_r = teal\n\nchin -> body\nbody -> belly\nbody -> arm_l\nbody -> arm_r\narm_r -> hand_r\narm_l -> hand_l\n\npelvis = red\nleg_r = red\nleg_l = red\nfoot_l = teal\nfoot_r = teal\n\nbelly -> pelvis\npelvis -> leg_r\npelvis -> leg_l\nleg_l -> foot_l\nleg_r -> foot_r\n"

var JSONParseString = '{\n	  "nodes": [\n	    {"id": "Head_1",   "color": "brown"},\n	    {"id": "Head_2",      "color": "brown"},\n	    {"id": "Head_3",  "color": "brown"},\n	    {"id": "Face_1", "color": "teal"},\n	    {"id": "Face_2", "color": "teal"},\n	    {"id": "Chin", "color": "teal"},\n\n	    {"id": "Body", "color": "blue"},\n	    {"id": "Belly", "color": "blue"},\n	    {"id": "Arm_L", "color": "blue"},\n	    {"id": "Arm_R", "color": "blue"},\n	    {"id": "Hand_L", "color": "teal"},\n	    {"id": "Hand_R", "color": "teal"},\n\n	    {"id": "Pelvis", "color": "red"},\n	    {"id": "Leg_R", "color": "red"},\n	    {"id": "Leg_L", "color": "red"},\n	    {"id": "Foot_R", "color": "teal"},\n	    {"id": "Foot_L", "color": "teal"}\n	 ],\n	  "links": [\n	    {"source": "Head_1", "target": "Head_2", "value": 10},\n	    {"source": "Head_2", "target": "Head_3", "value": 10},\n	    {"source": "Face_1", "target": "Head_1", "value": 10},\n	    {"source": "Face_2", "target": "Head_3", "value": 10},\n	    {"source": "Face_2", "target": "Chin", "value": 10},\n	    {"source": "Face_1", "target": "Chin", "value": 10},\n\n	    {"source": "Chin", "target": "Body", "value": 10},\n	    {"source": "Body", "target": "Belly", "value": 10},\n	    {"source": "Body", "target": "Arm_L", "value": 10},\n	    {"source": "Body", "target": "Arm_R", "value": 10},\n	    {"source": "Hand_R", "target": "Arm_R", "value": 10},\n	    {"source": "Hand_L", "target": "Arm_L", "value": 10},\n\n	    {"source": "Belly", "target": "Pelvis", "value": 10},\n	    {"source": "Pelvis", "target": "Leg_L", "value": 10},\n	    {"source": "Pelvis", "target": "Leg_R", "value": 10},\n	    {"source": "Foot_R", "target": "Leg_R", "value": 10},\n	    {"source": "Foot_L", "target": "Leg_L", "value": 10}\n	  ]\n	}\n'

console.log("Who whatches the wathitfy?")

var ASTstring = 'var x = 5\nif(x < 10){\n	x += 1\n    var b = "My Value"\n}\ntest(b)\n'
// Code mirror part
var placeHolderText = JSONParseString;

var isJSON = false;

var isAST = false;
var activeParseFunction = fdg.parseSimpleFDG;
var activeRenderFunction = fdg.renderFDG;
var activeErrorFunction = fdg.drawErrorFDG;


var parentElement = parentElement = document.getElementById('drawArea');
var dimensions = [parentElement.clientWidth, parentElement.clientHeight];



if (localStorage['FDGtext'] !== undefined){
	placeHolderText = localStorage['FDGtext'];
}

var myCodeMirror = CodeMirror(document.getElementById("codeeditor"), {
	value : placeHolderText,
	theme: "monokai",
	lineNumbers: true,
});

parseAndRender();

myCodeMirror.on("change", function(){
	localStorage['FDGtext'] = myCodeMirror.getValue();
	parseAndRender();
});


function Parse(parseFunction, text){
	var graph = parseFunction(text);
	return graph;
}

function Render(renderFunction, graph){
	renderFunction(graph);
}

function RenderError(errorFunction, graph){
	errorFunction(graph);
}


d3.select('#toggleParserButton').on('click', function(){
	isJSON = !isJSON;
	console.log("clicked")
	if(isJSON){
		var elem = document.getElementById('toggleParserButton');
		elem.innerHTML = "switch to SimpleParse"
		localStorage['FDGtext'] = JSONParseString;
		myCodeMirror.setValue(JSONParseString);
		activeParseFunction = fdg.parseJSONFDG;
	}else{
		var elem = document.getElementById('toggleParserButton');
		elem.innerHTML = "switch to JSON parsing"
		localStorage['FDGtext'] = simpleParseString;
		myCodeMirror.setValue(simpleParseString);
		activeParseFunction = fdg.parseSimpleFDG;
	}
	parseAndRender();
});

d3.select('#toggleParseRenderGroup').on('click', function(){
	isAST = !isAST;

	var elem = document.getElementById('toggleParseRenderGroup');
	if(isAST){
		elem.innerHTML = "switch to FDG"
		activeParseFunction = ast.parseAST;
		activeRenderFunction = ast.renderAST;
		activeErrorFunction = ast.drawErrorAST;
		localStorage['FDGtext'] = ASTstring;
		myCodeMirror.setValue(ASTstring);
		document.getElementById('toggleParserButton').disabled = true;
	}else{
		elem.innerHTML = "switch to AST"
		document.getElementById('toggleParserButton').disabled = false;
		if(isJSON){
			localStorage['FDGtext'] = JSONParseString;
			myCodeMirror.setValue(JSONParseString);
			activeParseFunction = fdg.parseJSONFDG;
		}else{
			localStorage['FDGtext'] = JSONParseString;
			myCodeMirror.setValue(JSONParseString);
			activeParseFunction = fdg.parseJSONFDG;
		}
		activeRenderFunction = fdg.renderFDG;
		activeErrorFunction = fdg.drawErrorFDG;
	}

	parseAndRender();
});

function parseAndRender(){
	code_text = myCodeMirror.getValue();
	var parseError = false;
	var graph = {"nodes":[],
	"links":[]};

	try {
		var graph = Parse(activeParseFunction, code_text)
	} catch (e) {
		parseError = true;
		graph = {'errorMessage': e.message, 'errorObject': e};
	}

	// https://javascriptstore.com/2017/10/15/visualize-ast-javascript/
	// declares a tree layout and assigns the size
	if (!parseError && graph.length != 0) {
		Render(activeRenderFunction, graph)
	}else{
		console.log(graph["errorMessage"])
		RenderError(activeErrorFunction, graph);
	}
}


d3.select('#saveButton').on('click', function(){
	var svg = d3.select('svg')
	var svgString = getSVGString(svg.node());
	svgString2Image( svgString, svg_witdh, svg_height, 'png', save ); // passes Blob and filesize String to the callback

	function save( dataBlob, filesize ){
		saveAs( dataBlob, 'D3 vis exported to PNG.png' ); // FileSaver.js function
	}
});


// Below are the functions that handle actual exporting:
// getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
function getSVGString( svgNode ) {
	svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
	var cssStyleText = getCSSStyles( svgNode );
	appendCSS( cssStyleText, svgNode );

	var serializer = new XMLSerializer();
	var svgString = serializer.serializeToString(svgNode);
	svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
	svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

	return svgString;

	function getCSSStyles( parentElement ) {
		var selectorTextArr = [];

		// Add Parent element Id and Classes to the list
		selectorTextArr.push( '#'+parentElement.id );
		for (var c = 0; c < parentElement.classList.length; c++)
		if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
		selectorTextArr.push( '.'+parentElement.classList[c] );

		// Add Children element Ids and Classes to the list
		var nodes = parentElement.getElementsByTagName("*");
		for (var i = 0; i < nodes.length; i++) {
			var id = nodes[i].id;
			if ( !contains('#'+id, selectorTextArr) )
			selectorTextArr.push( '#'+id );

			var classes = nodes[i].classList;
			for (var c = 0; c < classes.length; c++)
			if ( !contains('.'+classes[c], selectorTextArr) )
			selectorTextArr.push( '.'+classes[c] );
		}

		// Extract CSS Rules
		var extractedCSSText = "";
		for (var i = 0; i < document.styleSheets.length; i++) {
			var s = document.styleSheets[i];

			try {
				if(!s.cssRules) continue;
			} catch( e ) {
				if(e.name !== 'SecurityError') throw e; // for Firefox
				continue;
			}

			var cssRules = s.cssRules;
			for (var r = 0; r < cssRules.length; r++) {
				if ( contains( cssRules[r].selectorText, selectorTextArr ) )
				extractedCSSText += cssRules[r].cssText;
			}
		}


		return extractedCSSText;

		function contains(str,arr) {
			return arr.indexOf( str ) === -1 ? false : true;
		}

	}

	function appendCSS( cssText, element ) {
		var styleElement = document.createElement("style");
		styleElement.setAttribute("type","text/css");
		styleElement.innerHTML = cssText;
		var refNode = element.hasChildNodes() ? element.children[0] : null;
		element.insertBefore( styleElement, refNode );
	}
}


function svgString2Image( svgString, width, height, format, callback ) {
	var format = format ? format : 'png';

	var imgsrc = 'data:image/svg+xml;base64,'+ btoa( unescape( encodeURIComponent( svgString ) ) ); // Convert SVG string to data URL

	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");

	canvas.width = width;
	canvas.height = height;

	var image = new Image();
	image.onload = function() {
		//context.clearRect ( 0, 0, width, height );
		context.fillStyle = "white";
		context.fillRect(0, 0, width, height);
		context.drawImage(image, 0, 0, width, height);

		canvas.toBlob( function(blob) {
			var filesize = Math.round( blob.length/1024 ) + ' KB';
			if ( callback ) callback( blob, filesize );
		});


	};

	image.src = imgsrc;
}
