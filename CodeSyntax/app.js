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
	evaluateYAMLtoD3();
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

// D3 Part
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

evaluateYAMLtoD3();


