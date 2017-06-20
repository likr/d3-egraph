const d3 = require('d3')
const edgeRenderer = require('./curved-edge-renderer.js')

const multipleEdgeRenderer = ({ltor}) => {
  const color = d3.scale.category20()
  const edgeColor = (d, i) => color(i)
  return (selection) => {
    selection.each(function (data) {
      const element = d3.select(this)
      const bindSelection = element.selectAll('g.sub-edge')
        .data(data.participants.map(() => data))

      bindSelection.enter()
        .append('g')
        .classed('sub-edge', true)

      bindSelection.exit()
        .remove()
    })

    selection
      .attr('transform', function () {
        const t = -(d3.select(this).selectAll('g.sub-edge').size() - 1) / 2
        return `translate(${ltor ? 0 : t},${ltor ? t : 0})`
      })
      .selectAll('g.sub-edge')
      .call(edgeRenderer({edgeColor, ltor}))
      .attr('transform', (_, i) => `translate(${ltor ? 0 : i},${ltor ? i : 0})`)
  }
}

module.exports = multipleEdgeRenderer
