module.exports = {
	parseJSON : parseJSONFDG,
	parseSimple : parseSimpleFDG,
	catchError : drawErrorFDG,
	render : renderFDG
}


var fill = '#3AA';
var stroke = '#FFF';
var text = '#FFF';
var line = '#CCC';
var margin = 30;
var fontSize = 18;
var nodeFont = { 'font-size': fontSize,
								 'font-family': 'Arial, Helvetica, sans-serif',
								 'fill': text };


function parseJSONFDG(text){
	var graph = JSON.parse(text)
	return graph
}

function parseSimpleFDG(text){
	var graph = {"nodes":[],
							 "links":[]};
	var lines = text.split("\n")
	for(var i = 0; i < lines.length; i++){
		if(lines[i].indexOf("=") >=0){
			elements = lines[i].split("=").map(function(item) {
				return item.trim();
			});
			var node = {};
			node["id"] = elements[0];
			node["color"] = elements[1];
			if(elements[0] && elements[1]){
				graph.nodes.push(node);
			}
		}else if(lines[i].indexOf("->") >=0){
			elements = lines[i].split("->").map(function(item) {
				return item.trim();
			});
			var node = {};
			node["source"] = elements[0];
			node["target"] = elements[1];
			node["value"] = 10;
			if(elements[0] && elements[1]){
				graph.links.push(node);
			}
		}
	}
	return graph
}


function drawErrorFDG(ast){

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

function renderFDG(graph){

	var container = "#drawArea"

	d3.select(container)
		.select("svg")
		.remove()

	var svg = d3.select(container).append("svg");

	svg_witdh = 640;
	svg_height = 640;

	svg.attr("width", svg_witdh);
	svg.attr("height", svg_height);

	var simulation = d3.forceSimulation()
	    .force("link", d3.forceLink().id(function(d) { return d.id; }))
	    .force("charge", d3.forceManyBody())
	    .force("center", d3.forceCenter(svg_witdh / 2, svg_height / 2));

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", 10)
      .attr("fill", function(d) {
				return d.color;
			})
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  node.append("title")
      .text(function(d) { return d.id; });

try{
  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);
}catch(TypeError){
	simulation.stop()
}
	function dragstarted(d) {
	  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	  d.fx = d.x;
	  d.fy = d.y;
	}

	function dragged(d) {
	  d.fx = d3.event.x;
	  d.fy = d3.event.y;
	}

	function dragended(d) {
	  if (!d3.event.active) simulation.alphaTarget(0);
	  d.fx = null;
	  d.fy = null;
	}


  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }
}
