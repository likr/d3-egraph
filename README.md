# d3-egraph
Graph drawing library

# Example

```javascript
var d3 = require('d3')
var Graph = require('egraph/graph')
var Renderer = require('d3-egraph')

var renderer = new Renderer()
var graph = new Graph()
graph.addVertex(0, {text: 'A', width: 50, height: 20})
graph.addVertex(1, {text: 'B', width: 50, height: 20})
graph.addVertex(2, {text: 'C', width: 50, height: 20})
graph.addEdge(0, 1)
graph.addEdge(0, 2)
graph.addEdge(1, 2)

d3.select('svg')
  .datum(graph)
  .call(renderer.render())
```
