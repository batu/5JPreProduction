var Esprima = require("esprima")

// Code mirror part
var placeHolderText = "circle: 5";

if (localStorage['text'] !== undefined){
	placeHolderText = localStorage['text'];
}

var myCodeMirror = CodeMirror(document.getElementById("codeeditor"), {
	value : placeHolderText,
	theme: "monokai",
	lineNumbers: true,
});

myCodeMirror.on("change", function(){
	localStorage['text'] = myCodeMirror.getValue();
	//evaluateYAMLtoD3();
	evaluateASTtoD3();
});

function evaluateYAMLtoD3(){
	value = myCodeMirror.getValue();
	yaml = YAML.eval(value);
	errors = YAML.getErrors();
	if (Object.keys(yaml).length === 0 && yaml.constructor === Object){
		console.log("CANT PARSE YAML!");
	}else{
		var indentedJsonString = JSON.stringify(yaml, null, 4);
		var indentedJson = JSON.parse(indentedJsonString);

		var num_circles = indentedJson.circle;
		if (num_circles > 1000){
			num_circles = 1000;
		}
		var nodes = [];
		for(i = 0; i < num_circles; i++){
			nodes.push(
				{x: 30 + i * 30,
					y: 30 + Math.floor(Math.random() * Math.floor(100))
				}
			);
		}
		d3Draw(nodes);
	}
}


function evaluateASTtoD3(){
	console.log("Yeah")
	code_text = myCodeMirror.getValue();
	var ast = Esprima.parse(code_text);
	
	// COPYING CODE FROM https://javascriptstore.com/2017/10/15/visualize-ast-javascript/
	// declares a tree layout and assigns the size
	var margin = {top: 40, right: 90, bottom: 50, left: 90},
            width = 660 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;
	

	var treemap = d3.tree()
	   .size([width, height]);

	// assigns the data to a hierarchy using parent-child relationships
	var nodes = d3.hierarchy(ast);

	// maps the node data to the tree layout
	nodes = treemap(nodes);

	var svg = d3.select("#graph").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom),
	 g = svg.append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

	var link = svg.selectAll(".link")
	.data(nodes.descendants().slice(1))
	.enter().append("path")
	.attr("class", "link")
	.attr("d", function (d) {
		  return "M" + d.x + "," + d.y
		  + "C" + d.x + "," + (d.y + d.parent.y) / 2
		  + " " + d.parent.x + "," + (d.y + d.parent.y) / 2
		  + " " + d.parent.x + "," + d.parent.y;
	});

	var node = g.selectAll(".node")
			.data(nodes.descendants())
			.enter().append("g")
			.attr("class", function (d) {
				return "node" +
					(d.children ? " node--internal" : " node--leaf");
			})
			.attr("transform", function (d) {
				return "translate(" + d.x + "," + d.y + ")";
			});

	node.append("circle")
		.attr("r", 10);

	node.append("text")
	.attr({
	   "dy": ".35em",
	   "y": function (d) {
				return d.children ? -20 : 20;
		}})
		.text(function (d) {
		   return d.data.type;
		});
}


// D3 Part

function circles(){
	var vis = d3.select("#graph")
	.append("svg")
	.attr("width", 2000).attr("height", 200);

	function d3Draw(nodes){
		vis.selectAll("*").remove();
		vis.selectAll("circle.nodes")
		.data(nodes)
		.enter()
		.append("svg:circle")
		.attr("cx", function(d) { return d.x; })
		.attr("cy", function(d) { return d.y; })
		.attr("r", "10px")
		.attr("fill", "black");
	}

	evaluateASTtoD3();
}

//evaluateYAMLtoD3();