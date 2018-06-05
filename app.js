var fdg = require('./ParsersAndRenderers/fdg.js');
var ast = require('./ParsersAndRenderers/ast.js');
var yaml = require('./ParsersAndRenderers/yaml.js');
var java = require('./ParsersAndRenderers/java.js');
var pathtracing = require('./ParsersAndRenderers/pathtracing.js');
var intermediate = require('./ParsersAndRenderers/intermediate.js');

// Code mirror part
var placeHolderText = pathtracing.pareString;

var isJSON = false;

var isAST = false;
var activeParseFunction;
var activeRenderFunction;
var activeErrorFunction;

var parentElement = parentElement = document.getElementById('drawArea');
var dimensions = [parentElement.clientWidth, parentElement.clientHeight];

d3.select('#parser').on('change',parserUpdate);
d3.select('#renderer').on('change',rendererUpdate);
d3.select('#comboSelection').on('change',comboUpdate);


if (localStorage['FDGtext'] !== undefined){
	placeHolderText = localStorage['FDGtext'];
}

var myCodeMirror = CodeMirror(document.getElementById("codeeditor"), {
	value : placeHolderText,
	theme: "monokai",
	lineNumbers: true,
});



myCodeMirror.on("change", function(){
	localStorage['FDGtext'] = myCodeMirror.getValue();
	parseAndRender();
});

Start();

function Start(){
	if(location.hash){
		updateFromHashFragment();
	}else{
		comboUpdate();
	}
}

function parseAndRender(){
	code_text = myCodeMirror.getValue();
	var parseError = false;
	var graph;
	//java.parse(code_text)

	// console.log(yaml.parse(code_text))
	d3.select("#drawArea")
		.select("svg")
		.remove()
	try {
		graph = Parse(activeParseFunction, code_text)
	} catch (e) {
		parseError = true;
		graph = {'errorMessage': e.message, 'errorObject': e};
	}

	try{
		if (!parseError && graph !== undefined && graph.length != 0) {
			Render(activeRenderFunction, graph)
		}else{
				console.log(graph["errorMessage"])
				RenderError(activeErrorFunction, graph);
		}
	}
	catch(e){
		drawDefaultError(e);
	}
	updateHashFragment();
}


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

function comboUpdate(){

		var comboSelectionValue = d3.select('#comboSelection').node().value;
		switch(comboSelectionValue) {
    case "FDG_S":
				changeDropDownValue("parser", "SIMPLE");
				changeDropDownValue("renderer", "FDG");
				break;
    case "FDG_J":
				changeDropDownValue("parser", "JSON");
				changeDropDownValue("renderer", "FDG");
        break;
		case "AST":
				changeDropDownValue("parser", "AST");
				changeDropDownValue("renderer", "AST");
				break;
		case "PATHTRACING":
				changeDropDownValue("parser", "PATHTRACING");
				changeDropDownValue("renderer", "PATHTRACING");
				break;
			}
		rendererUpdate();
		parserUpdate();
		parseAndRender();
}

function parserUpdate(){
		var parserValue = d3.select('#parser').node().value;
		console.log(parserValue)
		switch(parserValue) {
    case "SIMPLE":
        activeParseFunction = fdg.parseSimple;
				localStorage['FDGtext'] = fdg.parseStringSimple;
				myCodeMirror.setValue(fdg.parseStringSimple);
				break;
		case "YAML":
	      activeParseFunction = yaml.parse;
				localStorage['FDGtext'] = yaml.parseString;
				myCodeMirror.setValue(yaml.parseString);
				break;
    case "JSON":
        activeParseFunction = fdg.parseJSON;
				localStorage['FDGtext'] = fdg.parseStringJSON;
				myCodeMirror.setValue(fdg.parseStringJSON);
        break;
		case "AST":
				activeParseFunction = ast.parse;
				localStorage['FDGtext'] = ast.parseString;
				myCodeMirror.setValue(ast.parseString);
				break;
		case "PATHTRACING":
				activeParseFunction = pathtracing.parse;
				localStorage['FDGtext'] = pathtracing.parseString;
				myCodeMirror.setValue(pathtracing.parseString);
				break;
			}
		parseAndRender();
}

function rendererUpdate(){
		var rendererValue = d3.select('#renderer').node().value;

		switch(rendererValue) {
    case "FDG": // FDG
        activeRenderFunction = fdg.render;
				activeErrorFunction = fdg.catchError;
				enableD3View();
        break;
    case "AST": // AST
        activeRenderFunction = ast.render;
				activeErrorFunction = ast.catchError;
				enableD3View();
        break;
		case "PATHTRACING": // Pathtracing
				activeRenderFunction = pathtracing.render;
				enablePathtracingView();
				break;
			}
		parseAndRender();
}

function enablePathtracingView(){
		d3.select('#main').style("display", "block");
		d3.select('#drawArea').style("display", "none");
}

function enableD3View(){
	d3.select('#main').style("display", "none");
	d3.select('#drawArea').style("display", "block");
}


function updateHashFragment(){
	var hash_string = ""
	var rendererValue = d3.select('#renderer').node().value;
	var parserValue = d3.select('#parser').node().value;

	hash_string += parserValue;
	hash_string += "_"
	hash_string += rendererValue;

	location.hash = hash_string;
}


function updateFromHashFragment(){
		var hash_string = location.hash;
		var splitted = hash_string.split("_")
		var parser_id = splitted[0].slice(1)
		var renderer_id = splitted[1]
		console.log(parser_id)
		console.log(renderer_id)

		changeDropDownValue("parser", parser_id);
		changeDropDownValue("renderer", renderer_id);

		rendererUpdate();
		parserUpdate();
		parseAndRender();
}
d3.select('#saveButton').on('click', function(){
	var svg = d3.select('svg')
	var svgString = getSVGString(svg.node());
	svgString2Image( svgString, svg_witdh, svg_height, 'png', save ); // passes Blob and filesize String to the callback

	function save( dataBlob, filesize ){
		saveAs( dataBlob, 'D3 vis exported to PNG.png' ); // FileSaver.js function
	}
});


function changeDropDownValue(element_id, value){
	var ddl = document.getElementById(element_id);
	var opts = ddl.options.length;
	for (var i=0; i<opts; i++){
	    if (ddl.options[i].value == value){
	        ddl.options[i].selected = true;
	        break;
	    }
		}
}




function drawDefaultError(error){
	var fill = '#3AA';
	var stroke = '#FFF';
	var text = '#FFF';
	var line = '#CCC';
	var margin = 30;
	var fontSize = 18;
	var nodeFont = { 'font-size': fontSize,
									 'font-family': 'Arial, Helvetica, sans-serif',
									 'fill': text };

	var container = "#drawArea"

	console.error(error);
	var	message = "There is a mismatch between the Parser and Interpreter!"

	d3.select(container)
		.select("svg")
		.remove()

	var svg = d3.select(container).append("svg");

	var svg_witdh = 1000
	var svg_height = 1000

	svg.attr("width", svg_witdh);
	svg.attr("height", svg_height);

	d3.select('svg')
		.append('rect')
			.classed('node', true)
			.attr('x', svg_witdh / 2 - 300)
			.attr('y', svg_height / 4 - 100)
			.attr('height', 200)
			.attr('width', 600)
			.attr("fill", "#3AA")

	d3.select('svg')
		.append("text")
			.attr("x", svg_witdh / 2)
			.attr("y", svg_height / 4)
			.attr("text-anchor", "middle")
			.text(function(text) {return message})
			.attr("font-family", nodeFont["font-family"])
			.attr('fill', nodeFont["fill"])
			.attr("font-size", nodeFont["font-sis"])

}
