var parseSringYAML = '{"children":[{"children":[{"text":"+", "children":[{"children":[], "text":"5"},{"children":[], "text":"3"}]}], "text":"Expression"}], "text":"Program"}'

module.exports = {
  parse : parseYAML,
  parseString: parseSringYAML
}

var yaml = require('js-yaml');


function parseYAML(text){
	var graph = yaml.safeLoad(text);
	return graph
}
