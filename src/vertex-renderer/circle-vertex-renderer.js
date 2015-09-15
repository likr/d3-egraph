import d3 from 'd3';
import accessor from 'egraph/lib/utils/accessor';
import vertexFunction from '../vertex-function';

const render = ({vertexColor, r}) => {
  return (selection) => {
    selection.each(function () {
      const element = d3.select(this);
      if (element.select('circle').empty()) {
        element.append('circle')
          .attr({
            cx: d => d.px,
            cy: d => d.py,
            r: r,
            stroke: 'black',
            fill: vertexFunction(vertexColor)
          });
      }
    });

    selection.select('circle')
      .attr({
        cx: d => d.x,
        cy: d => d.y,
        r: r,
        fill: vertexFunction(vertexColor)
      });
  };
};

const privates = new WeakMap();

class CircleVertexRenderer {
  constructor() {
    privates.set(this, {
      vertexColor: () => 'none',
      r: 5
    });
  }

  render() {
    return render({
      vertexColor: this.vertexColor(),
      r: this.r()
    });
  }

  vertexColor() {
    return accessor(this, privates, 'vertexColor', arguments);
  }

  r() {
    return accessor(this, privates, 'r', arguments);
  }
}

export default CircleVertexRenderer;
