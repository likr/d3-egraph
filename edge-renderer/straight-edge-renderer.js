const d3 = require('d3')
const accessor = require('egraph/lib/utils/accessor')
const edgeFunction = require('../edge-function')
const startFrom = require('../svg/path/start-from')
const lineTo = require('../svg/path/line-to')

const svgPath = (points) => {
  let d = `${startFrom(points[0])}`
  for (let i = 1; i < points.length; ++i) {
    d += lineTo(points[i])
  }
  return d
}

const render = ({edgeColor, edgeOpacity}) => {
  return (selection) => {
    selection.each(function (data) {
      const element = d3.select(this)
      if (element.selectAll('path').empty()) {
        element
          .append('path')
          .attr({
            d: d => svgPath(d.ppoints),
            stroke: edgeFunction(edgeColor),
            opacity: edgeFunction(edgeOpacity),
            fill: 'none'
          })
      }
      if (data.ppoints.length < data.points.length) {
        for (let i = data.ppoints.length; i < data.points.length; ++i) {
          data.ppoints.unshift(data.ppoints[0])
        }
        element.selectAll('path')
          .attr('d', d => svgPath(d.ppoints))
      }
    })

    selection.selectAll('path')
      .attr({
        d: d => svgPath(d.points),
        stroke: edgeFunction(edgeColor),
        opacity: edgeFunction(edgeOpacity)
      })
  }
}

const privates = new WeakMap()

class StraightEdgeRenderer {
  constructor () {
    privates.set(this, {
      edgeColor: () => '#000',
      edgeOpacity: () => 1
    })
  }

  render () {
    return render({
      edgeColor: this.edgeColor(),
      edgeOpacity: this.edgeOpacity()
    })
  }

  edgeColor () {
    return accessor(this, privates, 'edgeColor', arguments)
  }

  edgeOpacity () {
    return accessor(this, privates, 'edgeOpacity', arguments)
  }
}

module.exports = StraightEdgeRenderer
