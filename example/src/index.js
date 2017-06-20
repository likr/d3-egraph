require('babel-polyfill')
const querystring = require('querystring')
const d3 = require('d3')
const Graph = require('egraph/graph')
const katz = require('egraph/network/centrality/katz')
const newman = require('egraph/network/community/newman')
const transformers = require('egraph/transformer')
const Renderer = require('../../renderer')

const parseHash = () => {
  const params = querystring.parse(window.location.hash.substr(2))
  params.threshold = +params.threshold || 0
  params.x = +params.x || 0
  params.y = +params.y || 0
  params.scale = +params.scale || 1
  params.init = !!params.init
  return params
}

const updateHash = (args) => {
  window.location.hash = `?${querystring.stringify(args)}`
}

class Filter {
  setValues (values) {
    const vertices = Object.keys(values)
    this.threshold = 0
    this.length = vertices.length
    this.order = {}
    vertices.sort((u, v) => values[u] - values[v])
    for (let i = 0; i < this.length; ++i) {
      this.order[vertices[i]] = i + 1
    }
    return this
  }

  call (u) {
    return this.order[u] >= this.threshold * this.length
  }
}

const cutoff = (s, length) => {
  if (s.length <= length) {
    return s
  }
  return s.substr(0, length - 1) + '...'
}

const color = d3.scaleOrdinal(d3.schemeCategory20)
const vertexScale = d3.scaleLinear()
  .range([1, 2])
const filter = new Filter()

const renderer = new Renderer()
  .transformer(new transformers.PipeTransformer(
    new transformers.CopyTransformer(),
    new transformers.CoarseGrainingTransformer()
      .vertexVisibility(({u}) => filter.call(u)),
    new transformers.IsmTransformer()
  ))
renderer.layouter()
  .edgeWidth(() => 2)
  .layerMargin(200)
  .vertexMargin(3)
  .edgeMargin(3)
  .ltor(true)
renderer.layouter()
  .layerAssignment()
  .repeat(5)
renderer.vertexRenderer()
  .vertexColor(({d}) => color(d.community))
  .vertexScale(({d}) => vertexScale(d.centrality))
  .vertexText(({d}) => cutoff(d.text, 20))
renderer.edgeRenderer()
  .edgeColor(({ud, vd}) => ud.community === vd.community ? color(ud.community) : '#ccc')
  .edgeOpacity(() => 1)

d3.json('data/graph.json', (data) => {
  const params = parseHash()

  const g = new Graph()
  for (const {u, d} of data.vertices) {
    g.addVertex(u, d)
  }
  for (const {u, v, d} of data.edges) {
    g.addEdge(u, v, d)
  }

  const centralities = katz(g)
  const communities = newman(g)
  for (const u of g.vertices()) {
    const d = g.vertex(u)
    color(communities[u])
    d.community = communities[u]
    d.centrality = centralities[u]
  }
  filter.setValues(centralities)
  vertexScale.domain(d3.extent(g.vertices(), u => centralities[u]))

  const sizes = renderer.vertexRenderer().calcSize(g)
  for (const u of g.vertices()) {
    const d = g.vertex(u)
    d.width = sizes[u].width
    d.height = sizes[u].height
  }

  const zoom = d3.zoom()
    .scaleExtent([0.1, 1])
    .on('zoom', () => {
      const transform = d3.event.transform
      updateHash({
        threshold: params.threshold,
        x: transform.x,
        y: transform.y,
        scale: transform.k
      })
    })

  const wrapper = d3.select('#screen-wrapper').node()
  const selection = d3.select('#screen')
    .attr('width', wrapper.clientWidth)
    .attr('height', wrapper.clientHeight)
    .datum(g)
    .call(zoom)
    .call(zoom.transform, d3.zoomIdentity.translate(params.x, params.y).scale(params.scale))

  d3.select('#threshold')
    .on('input', function () {
      d3.select('#threshold-value').text(`${((1 - +this.value) * 100).toFixed()}%`)
    })
    .on('change', function () {
      updateHash({
        threshold: +this.value,
        x: params.x,
        y: params.y,
        scale: params.scale
      })
    })

  d3.select(window)
    .on('resize', () => {
      selection
        .attr('width', wrapper.clientWidth)
        .attr('height', wrapper.clientHeight)
    })

  d3.select(window)
    .on('hashchange', () => {
      const {threshold, x, y, scale, init} = parseHash()
      if (init || threshold !== params.threshold) {
        d3.select('#threshold').node().value = threshold
        d3.select('#threshold-value').text(`${((1 - threshold) * 100).toFixed()}%`)
        filter.threshold = threshold
        selection
          .transition()
          .duration(1000)
          .delay(500)
          .call(renderer.render())
        params.threshold = threshold
      }
      if (init || x !== params.x || y !== params.y || scale !== params.scale) {
        selection.select('g.contents')
          .attr('transform', `translate(${x},${y})scale(${scale})`)
        params.x = x
        params.y = y
        params.scale = scale
      }
      if (init) {
        updateHash({
          threshold: params.threshold,
          x: params.x,
          y: params.y,
          scale: params.scale
        })
      }
    })

  updateHash({
    threshold: params.threshold,
    x: params.x,
    y: params.y,
    scale: params.scale,
    init: 1
  })
})
