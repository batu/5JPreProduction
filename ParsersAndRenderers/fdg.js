var simpleParseString = "hat_1 = brown\nhat_2 = brown\nhead_1 = teal\nhead_2 = teal\nchin = teal\n\nhat_1 -> hat_2\nhead_1 -> chin\nchin -> head_2\nhead_1 -> hat_1\nhat_2 -> head_2\n\nbody = blue\nbelly = blue\narm_l = blue\narm_r = blue\nhand_l = teal\nhand_r = teal\n\nchin -> body\nbody -> belly\nbody -> arm_l\nbody -> arm_r\narm_r -> hand_r\narm_l -> hand_l\n\npelvis = red\nleg_r = red\nleg_l = red\nfoot_l = teal\nfoot_r = teal\n\nbelly -> pelvis\npelvis -> leg_r\npelvis -> leg_l\nleg_l -> foot_l\nleg_r -> foot_r\n"

var JSONParseString = '{\n	  "nodes": [\n	    {"id": "Head_1",   "color": "brown"},\n	    {"id": "Head_2",      "color": "brown"},\n	    {"id": "Head_3",  "color": "brown"},\n	    {"id": "Face_1", "color": "teal"},\n	    {"id": "Face_2", "color": "teal"},\n	    {"id": "Chin", "color": "teal"},\n\n	    {"id": "Body", "color": "blue"},\n	    {"id": "Belly", "color": "blue"},\n	    {"id": "Arm_L", "color": "blue"},\n	    {"id": "Arm_R", "color": "blue"},\n	    {"id": "Hand_L", "color": "teal"},\n	    {"id": "Hand_R", "color": "teal"},\n\n	    {"id": "Pelvis", "color": "red"},\n	    {"id": "Leg_R", "color": "red"},\n	    {"id": "Leg_L", "color": "red"},\n	    {"id": "Foot_R", "color": "teal"},\n	    {"id": "Foot_L", "color": "teal"}\n	 ],\n	  "links": [\n	    {"source": "Head_1", "target": "Head_2", "value": 10},\n	    {"source": "Head_2", "target": "Head_3", "value": 10},\n	    {"source": "Face_1", "target": "Head_1", "value": 10},\n	    {"source": "Face_2", "target": "Head_3", "value": 10},\n	    {"source": "Face_2", "target": "Chin", "value": 10},\n	    {"source": "Face_1", "target": "Chin", "value": 10},\n\n	    {"source": "Chin", "target": "Body", "value": 10},\n	    {"source": "Body", "target": "Belly", "value": 10},\n	    {"source": "Body", "target": "Arm_L", "value": 10},\n	    {"source": "Body", "target": "Arm_R", "value": 10},\n	    {"source": "Hand_R", "target": "Arm_R", "value": 10},\n	    {"source": "Hand_L", "target": "Arm_L", "value": 10},\n\n	    {"source": "Belly", "target": "Pelvis", "value": 10, "label":"text"},\n	    {"source": "Pelvis", "target": "Leg_L", "value": 10},\n	    {"source": "Pelvis", "target": "Leg_R", "value": 10},\n	    {"source": "Foot_R", "target": "Leg_R", "value": 10},\n	    {"source": "Foot_L", "target": "Leg_L", "value": 10}\n	  ]\n	}\n'

module.exports = {
	parseJSON : parseJSONFDG,
	parseSimple : parseSimpleFDG,
	catchError : drawErrorFDG,
	render : renderFDG,
	parseStringSimple: simpleParseString,
	parseStringJSON : JSONParseString
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

	var	textElements = svg.append('g')
		  .selectAll('text')
		  .data(graph.links)
		  .enter().append('text')
	    .text(d => d.label)
			.attr('class', "label-text")

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

		textElements
    .attr("x", function(d) { console.log(d);
			return (d.source.x + d.target.x) / 2 })
    .attr("y", function(d) {return (d.source.y + d.target.y) / 2 })
  }
}
