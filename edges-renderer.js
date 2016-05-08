const d3 = require('d3')

const edgesRenderer = (edgeRenderer) => {
  return (selection) => {
    selection.each(function (data) {
      const element = d3.select(this)
      const bindSelection = element.selectAll('g.edge')
        .data(Object.keys(data).map(key => data[key]), (d) => d.key)

      bindSelection.enter()
        .append('g')
        .classed('edge', true)

      bindSelection.exit()
        .remove()
    })

    selection.selectAll('g.edge')
      .call(edgeRenderer.render())
  }
}

module.exports = edgesRenderer
