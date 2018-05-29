module.exports = {
	parse : parseAST,
	render : renderAST,
	catchError : drawErrorAST,
}

var Esprima = require("esprima")

var fill = '#3AA';
var stroke = '#FFF';
var text = '#FFF';
var line = '#CCC';
var margin = 30;
var fontSize = 18;
var nodeFont = { 'font-size': fontSize,
								 'font-family': 'Arial, Helvetica, sans-serif',
								 'fill': text };


function parseAST(text){
  var graph = Esprima.parse(text)
	return graph
}

function getMaxWidth(root_node){
	var currNodes = [root_node];
	var nextNodes = [];
	var maxWidth = 0;
	while( currNodes.length != 0) {
		console.log(currNodes);
		for(var i = 0; i < currNodes.length; i++){
			for(var j = 0; j < currNodes[i]["children"].length; j++){
				nextNodes.push(currNodes[i]["children"][j]);
			}
	 }
	 maxWidth = Math.max(nextNodes.length, maxWidth)
   currNodes = nextNodes
   nextNodes = []
	}
	return maxWidth;
}

function drawErrorAST(ast){

	var container = "#drawArea"

	var message = ast["errorMessage"]
	if(!message){
		message = "Start coding to see what the program sees!"
	}
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

function renderAST(ast) {

	function drawAddTextToD3Node(node, current_d3_node) {
		var renderableTitles = ["IfStatement", "WhileStatement"]
		var typesToSkip = ["VariableDeclaration", "BinaryExpression", "Identifier", "ExpressionStatement"]

		switch (node.type) {
			case 'CallExpression':
				current_d3_node["text"] = "Called " + node.callee.name;
				break;
			case 'VariableDeclarator':
				current_d3_node["text"] = node.id.name;
				break;
			case 'IfStatement':
				current_d3_node["text"] = "If";
				break;
			case 'WhileStatement':
				current_d3_node["text"] = "While";
				break;
			case 'Literal':
				current_d3_node["text"] = node["value"];
				break;
			case 'Program':
				current_d3_node["text"] = "Program"
				break;
			case 'ExpressionStatement':
				current_d3_node["text"] = "Expression"
				break;
			case 'FunctionDeclaration':
				current_d3_node["text"] = "Declare " + node.id.name;
				break;
			default:
				for (var prop in node) {
					if (node.hasOwnProperty(prop) && prop != 'type' &&
							typeof node[prop] != 'object') {
						current_d3_node["text"] = node[prop];
					}
				}
				break;
		}
	}

	function enumerateChildrenForD3Tree(ast, current_node) {

		// Find children of this node
		var children = [];
		// The order of these matters
		// eg in a while statement the test must come before the body
		var typesToSkip = ["VariableDeclaration", "BinaryExpression", "Identifier", "ExpressionStatement", "AssignmentExpression"]

		var possibleChildProperties = ['test',
																	 'body',
																	 'consequent',
																	 'alternate',
																	 'init',
																	 'declarations',
																	 'left',
																	 'right',
																	 'expression',
																	 'argument',
																	 'arguments'];

		for (var i = 0; i < possibleChildProperties.length; i++) {
			if (ast.hasOwnProperty(possibleChildProperties[i]) &&	ast[possibleChildProperties[i]] !== null){
				children = children.concat(ast[possibleChildProperties[i]]);

			}
		}

		for(var j = 0; j < children.length; j++){
			current_node["children"].push({"parent":current_node,
																		 "text":"",
																	 	 "children":[]})
		}
		// console.log(children)
		// console.log(current_node["children"])

		// Draw this node
		drawAddTextToD3Node(ast, current_node);

		for (var i = 0; i < current_node["children"].length; i++) {
			enumerateChildrenForD3Tree(children[i], current_node["children"][i]);
		}
	}

	// Send the root node in for enumeration

	container = "#drawArea"

	var scale = 1.5;
	// set the dimensions and margins of the diagram
	d3.select(container)
		.select("svg")
		.remove()

  var tree = {"parent":null,
							"children":[],
							"text":""}

	enumerateChildrenForD3Tree(ast, tree);
	tree = removeEmptyNodes(tree)
	tree = fixAssignment(tree)
	tree = fixElse(tree)
	drawD3fromTree(tree)
}

function removeEmptyNodes(node){
	if(!node["text"]){
		for (var i = 0; i < node["children"].length; i++) {
			node["children"][i]["parent"] = node["parent"]
			node["parent"]["children"].push(node["children"][i])
		}

		var index = node["parent"]["children"].indexOf(node);
		if (index > -1) {
			node["parent"]["children"].splice(index, 1);
			console.log(node["parent"]["children"])
		}
	}

	if(node["children"].length == 0){
		return node
	} else {
		for (var i = 0; i < node["children"].length; i++) {
			removeEmptyNodes(node["children"][i])
		}
	}
	return node
}

function fixAssignment(node){

	if(node.parent && (node.parent.text == "var")){
		console.log(node.parent.text)

		for (var i = 0; i < node["children"].length; i++) {
			node["children"][i]["parent"] = node["parent"]
			node["parent"]["children"].push(node["children"][i])
		}
		node["children"].splice(0, 1);
		console.log(node["parent"]["children"])

	}

	if(node["children"].length == 0){
		return node
	} else {
		for (var i = 0; i < node["children"].length; i++) {
			fixAssignment(node["children"][i])
		}
	}
	return node
}

function fixElse(node){

	if(node.parent && (node.parent.text == "If") && (node.text == "" ) ){
		console.log(node.parent.text);
		node.text = "Else";
	}

	if(node["children"].length == 0){
		return node
	} else {
		for (var i = 0; i < node["children"].length; i++) {
			fixElse(node["children"][i])
		}
	}
	return node
}

var svg_witdh;
var svg_height;
function drawD3fromTree(tree){
	var max_width = getMaxWidth(tree)
	var root = d3.hierarchy(tree)

	var radius = 45
	var y_margin = radius
	svg_witdh = max_width * 200;
	svg_height = root.height * 125 + radius
	var svg = d3.select(container).append("svg");
	svg.attr("width", svg_witdh);
	svg.attr("height", svg_height);


	var treeLayout = d3.tree();

	treeLayout.size([svg_witdh, svg_height - radius * 2]);
	treeLayout(root);


		var d3links = d3.select('svg')
			.selectAll('line.link')
			.data(root.links())
			.enter()
			.append('line')
			.classed('link', true)
			.attr('x1', function(d) {return d.source.x;})
			.attr('y1', function(d) {return (d.source.y + y_margin);})
			.attr('x2', function(d) {return d.target.x;})
			.attr('y2', function(d) {return (d.target.y + y_margin)})
			.attr("stroke", "black")
			.attr("store-width", 1)

	 var d3nodes = d3.select('svg')
			.selectAll('circle.node')
			.data(root.descendants())
			.enter()
			.append('circle')
				.classed('node', true)
				.attr('cx', function(d) {return d.x;})
				.attr('cy', function(d) {return (d.y + y_margin)})
				.attr('r', radius)
				.attr("fill", "#3AA")

		 var d3text = d3.select('svg')
			.selectAll('text.text')
			.data(root.descendants())
			.enter()
			.append("text")
				.attr("x", function(d) {return d.x;})
				.attr("y", function(d) {return (d.y + y_margin)})
				.attr("text-anchor", "middle")
				.text(function(d) {return d["data"]["text"]})
				.attr("font-family", nodeFont["font-family"])
				.attr('fill', nodeFont["fill"])
				.attr("font-size", nodeFont["font-sis"])


}
