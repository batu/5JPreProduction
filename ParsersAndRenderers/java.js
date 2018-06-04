var parseStringJava = '{"children":[{"children":[{"text":"+", "children":[{"children":[], "text":"5"},{"children":[], "text":"3"}]}], "text":"Expression"}], "text":"Program"}'

module.exports = {
  parse : parseJava,
  parseString: parseStringJava
}

var javaParser = require("java-parser")

function parseJava(text){
    console.log(javaParser.parse(text))
}
