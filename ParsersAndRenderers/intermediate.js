module.exports = {
	renderIntermediate : renderIntermediate
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
function renderIntermediate(text){

	var container = "#drawArea"
  console.log(text)
	var message = text;
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
