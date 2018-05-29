var fdg = require('./ParsersAndRenderers/fdg.js');
var ast = require('./ParsersAndRenderers/ast.js');
var pathtracing = require('./ParsersAndRenderers/pathtracing.js');
var intermediate = require('./ParsersAndRenderers/intermediate.js');


// TODO: put these into the modules.
var simpleParseString = "hat_1 = brown\nhat_2 = brown\nhead_1 = teal\nhead_2 = teal\nchin = teal\n\nhat_1 -> hat_2\nhead_1 -> chin\nchin -> head_2\nhead_1 -> hat_1\nhat_2 -> head_2\n\nbody = blue\nbelly = blue\narm_l = blue\narm_r = blue\nhand_l = teal\nhand_r = teal\n\nchin -> body\nbody -> belly\nbody -> arm_l\nbody -> arm_r\narm_r -> hand_r\narm_l -> hand_l\n\npelvis = red\nleg_r = red\nleg_l = red\nfoot_l = teal\nfoot_r = teal\n\nbelly -> pelvis\npelvis -> leg_r\npelvis -> leg_l\nleg_l -> foot_l\nleg_r -> foot_r\n"

var JSONParseString = '{\n	  "nodes": [\n	    {"id": "Head_1",   "color": "brown"},\n	    {"id": "Head_2",      "color": "brown"},\n	    {"id": "Head_3",  "color": "brown"},\n	    {"id": "Face_1", "color": "teal"},\n	    {"id": "Face_2", "color": "teal"},\n	    {"id": "Chin", "color": "teal"},\n\n	    {"id": "Body", "color": "blue"},\n	    {"id": "Belly", "color": "blue"},\n	    {"id": "Arm_L", "color": "blue"},\n	    {"id": "Arm_R", "color": "blue"},\n	    {"id": "Hand_L", "color": "teal"},\n	    {"id": "Hand_R", "color": "teal"},\n\n	    {"id": "Pelvis", "color": "red"},\n	    {"id": "Leg_R", "color": "red"},\n	    {"id": "Leg_L", "color": "red"},\n	    {"id": "Foot_R", "color": "teal"},\n	    {"id": "Foot_L", "color": "teal"}\n	 ],\n	  "links": [\n	    {"source": "Head_1", "target": "Head_2", "value": 10},\n	    {"source": "Head_2", "target": "Head_3", "value": 10},\n	    {"source": "Face_1", "target": "Head_1", "value": 10},\n	    {"source": "Face_2", "target": "Head_3", "value": 10},\n	    {"source": "Face_2", "target": "Chin", "value": 10},\n	    {"source": "Face_1", "target": "Chin", "value": 10},\n\n	    {"source": "Chin", "target": "Body", "value": 10},\n	    {"source": "Body", "target": "Belly", "value": 10},\n	    {"source": "Body", "target": "Arm_L", "value": 10},\n	    {"source": "Body", "target": "Arm_R", "value": 10},\n	    {"source": "Hand_R", "target": "Arm_R", "value": 10},\n	    {"source": "Hand_L", "target": "Arm_L", "value": 10},\n\n	    {"source": "Belly", "target": "Pelvis", "value": 10},\n	    {"source": "Pelvis", "target": "Leg_L", "value": 10},\n	    {"source": "Pelvis", "target": "Leg_R", "value": 10},\n	    {"source": "Foot_R", "target": "Leg_R", "value": 10},\n	    {"source": "Foot_L", "target": "Leg_L", "value": 10}\n	  ]\n	}\n'

console.log("Who whatches the wathitfy?")

var ASTstring = 'var x = 5\nif(x < 10){\n	x += 1\n    var b = "My Value"\n}\ntest(b)\n'

var pathtracingString = "sphere 0 0 0 2\nsphere -5 5 0 1.5\nsphere 5 5 0 1.5\ncube -5 -5 0 1\ncube -2.5 -6 0 1\ncube 0 -7 0 1\ncube 2.5 -6 0 1\ncube 5 -5 0 1"

// Code mirror part
var placeHolderText = pathtracingString;

var isJSON = false;

var isAST = false;
var activeParseFunction = fdg.parse;
var activeRenderFunction = fdg.render;
var activeErrorFunction = fdg.catchError;


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

rendererUpdate()
parserUpdate()
parseAndRender();

myCodeMirror.on("change", function(){
	localStorage['FDGtext'] = myCodeMirror.getValue();
	parseAndRender();
});


function parseAndRender(){
	code_text = myCodeMirror.getValue();
	var parseError = false;
	var graph;

	try {
		graph = Parse(activeParseFunction, code_text)
	} catch (e) {
		parseError = true;
		graph = {'errorMessage': e.message, 'errorObject': e};
	}

	if (!parseError && graph !== undefined && graph.length != 0) {
		Render(activeRenderFunction, graph)
	}else{
		console.log(graph["errorMessage"])
		RenderError(activeErrorFunction, graph);
	}
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
		parserUpdate();
		rendererUpdate();
		parseAndRender();
}

function parserUpdate(){
		var parserValue = d3.select('#parser').node().value;
		switch(parserValue) {
    case "SIMPLE":
        activeParseFunction = fdg.parseSimple;
				localStorage['FDGtext'] = simpleParseString;
				myCodeMirror.setValue(simpleParseString);
				break;
    case "JSON":
        activeParseFunction = fdg.parseJSON;
				localStorage['FDGtext'] = JSONParseString;
				myCodeMirror.setValue(JSONParseString);
        break;
		case "AST":
				activeParseFunction = ast.parse;
				localStorage['FDGtext'] = ASTstring;
				myCodeMirror.setValue(ASTstring);
				break;
		case "PATHTRACING":
				activeParseFunction = pathtracing.parse;
				localStorage['FDGtext'] = pathtracingString;
				myCodeMirror.setValue(pathtracingString);
				break;
			}
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
}

function enablePathtracingView(){
		d3.select('#main').style("display", "block");
		d3.select('#drawArea').style("display", "none");
		console.log("enable pathtrace view");
}

function enableD3View(){
	d3.select('#main').style("display", "none");
	d3.select('#drawArea').style("display", "block");
	console.log("enable pathtrace view");
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
