/* eslint-env mocha */

const jsdom = require('mocha-jsdom')
const assert = require('power-assert')

describe('Renderer', () => {
  jsdom()

  it('render', () => {
    const d3 = require('d3')
    const Graph = require('egraph/lib/graph')
    const Renderer = require('../renderer')

    const renderer = new Renderer()
    const graph = new Graph()
    graph.addVertex(0, {})
    graph.addVertex(1, {})
    graph.addVertex(2, {})
    graph.addEdge(0, 1)
    graph.addEdge(0, 2)
    graph.addEdge(1, 2)

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    d3.select(svg)
      .datum(graph)
      .call(renderer.render())

    assert.equal(svg.querySelectorAll('g.vertex').length, 3)
    assert.equal(svg.querySelectorAll('g.edge').length, 3)
  })
})
