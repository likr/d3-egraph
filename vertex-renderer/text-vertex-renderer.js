const d3 = require('d3')
const accessor = require('egraph/utils/accessor')
const vertexFunction = require('../vertex-function')

const render = ({vertexColor, vertexScale, vertexText}) => {
  return (selection) => {
    selection.each(function () {
      const element = d3.select(this)
      if (element.select('rect').empty()) {
        element.attr({
          transform: ({px, py}) => `translate(${px},${py})`
        })
        element.append('rect')
          .attr({
            x: ({width}) => -width / 2,
            y: ({height}) => -height / 2,
            width: ({width}) => width,
            height: ({height}) => height,
            rx: 1,
            ry: 1,
            stroke: 'black',
            fill: vertexFunction(vertexColor)
          })
        element.append('text')
          .attr({
            fill: 'black',
            'text-anchor': 'middle',
            'dominant-baseline': 'central',
            'stroke-opacity': 1
          })
      }
    })

    selection.attr({
      transform: ({x, y}) => `translate(${x},${y})`
    })
    selection.select('rect')
      .attr({
        x: ({width}) => -width / 2,
        y: ({height}) => -height / 2,
        width: ({width}) => width,
        height: ({height}) => height,
        fill: vertexFunction(vertexColor)
      })
    selection.select('text')
      .text(vertexFunction(vertexText))
      .attr({
        'font-size': (d, i) => vertexFunction(vertexScale)(d, i) * 12 + 'pt'
      })
  }
}

const calcSize = (g, vertexScale, vertexText) => {
  const tmpSvg = d3.select('body').append('svg')
  const text = tmpSvg.append('text')
  const sizes = {}
  for (const u of g.vertices()) {
    const d = g.vertex(u)
    const s = vertexText({u, d})
    const bbox = text.text(s).node().getBBox()
    const scale = vertexScale({d, u})
    sizes[u] = {
      width: bbox.width * scale,
      height: bbox.height * scale
    }
  }
  tmpSvg.remove()
  return sizes
}

const privates = new WeakMap()

class TextVertexRenderer {
  constructor () {
    privates.set(this, {
      vertexColor: () => 'none',
      vertexScale: () => 1,
      vertexText: ({d}) => d.text
    })
  }

  render () {
    return render({
      vertexColor: this.vertexColor(),
      vertexScale: this.vertexScale(),
      vertexText: this.vertexText()
    })
  }

  calcSize (g) {
    return calcSize(g, this.vertexScale(), this.vertexText())
  }

  vertexColor () {
    return accessor(this, privates, 'vertexColor', arguments)
  }

  vertexScale () {
    return accessor(this, privates, 'vertexScale', arguments)
  }

  vertexText () {
    return accessor(this, privates, 'vertexText', arguments)
  }
}

module.exports = TextVertexRenderer
