import d3 from 'd3';
import IdentityTransformer from 'egraph/lib/transformer/identity';
import SugiyamaLayouter from 'egraph/lib/layouter/sugiyama';
import accessor from 'egraph/lib/utils/accessor';
import verticesRenderer from './vertices-renderer';
import edgesRenderer from './edges-renderer';
import TextVertexRenderer from './vertex-renderer/text-vertex-renderer';
import CurvedEdgeRenderer from './edge-renderer/curved-edge-renderer';

let nextId = 0;
const uniqueIds = new Map();
const uniqueId = (u) => {
  if (uniqueIds.has(u)) {
    return uniqueIds.get(u);
  }
  uniqueIds.set(u, nextId);
  return nextId++;
};

const render = ({transformer, layouter, vertexRenderer, edgeRenderer}) => {
  return (selection) => {
    selection.each(function (gOrig) {
      const g = transformer.transform(gOrig),
            positions = layouter.layout(g),
            element = d3.select(this);

      let contentsSelection = element.selectAll('g.contents');
      if (contentsSelection.empty()) {
        contentsSelection = element.append('g')
          .classed('contents', true);
      }
      let edgesSelection = element.selectAll('g.edges');
      if (edgesSelection.empty()) {
        edgesSelection = contentsSelection.append('g')
          .classed('edges', true)
          .datum({});
      }
      let verticesSelection = element.selectAll('g.vertices');
      if (verticesSelection.empty()) {
        verticesSelection = contentsSelection.append('g')
          .classed('vertices', true)
          .datum({});
      }

      const vertices = verticesSelection.datum(),
            edges = edgesSelection.datum(),
            activeVertices = new Set(),
            activeEdges = new Set();

      for (const u of g.vertices()) {
        const key = uniqueId(u),
          d = g.vertex(u);
        if (vertices[key] === undefined) {
          vertices[key] = {
            key,
            x: 0,
            y: 0,
            data: d
          };
        }
        vertices[key].g = g;
        vertices[key].px = vertices[key].x;
        vertices[key].py = vertices[key].y;
        vertices[key].x = positions.vertices[u].x;
        vertices[key].y = positions.vertices[u].y;
        vertices[key].width = positions.vertices[u].width;
        vertices[key].height = positions.vertices[u].height;
        activeVertices.add(key);
      }

      for (const [u, v] of g.edges()) {
        const uKey = uniqueId(u),
          vKey = uniqueId(v),
          key = `${uKey}:${vKey}`;
        if (edges[key] === undefined) {
          edges[key] = {
            key,
            source: vertices[uKey],
            target: vertices[vKey],
            points: [[vertices[uKey].px, vertices[uKey].py], [vertices[uKey].px, vertices[uKey].py], [vertices[vKey].px, vertices[vKey].py], [vertices[vKey].px, vertices[vKey].py]],
            data: g.edge(u, v)
          };
        }
        edges[key].g = g;
        edges[key].ppoints = edges[key].points;
        edges[key].points = positions.edges[u][v].points;
        edges[key].width = positions.edges[u][v].width;
        activeEdges.add(key);
      }

      for (const key in vertices) {
        if (!activeVertices.has(+key)) {
          delete vertices[key];
        }
      }
      for (const key in edges) {
        if (!activeEdges.has(key)) {
          delete edges[key];
        }
      }
    });

    selection.selectAll('g.edges')
      .call(edgesRenderer(edgeRenderer));
    selection.selectAll('g.vertices')
      .call(verticesRenderer(vertexRenderer));
  };
};

const privates = new WeakMap();

class Renderer {
  constructor() {
    privates.set(this, {
      transformer: new IdentityTransformer(),
      layouter: new SugiyamaLayouter()
        .layerMargin(200)
        .vertexMargin(3)
        .edgeMargin(3),
      vertexRenderer: new TextVertexRenderer(),
      edgeRenderer: new CurvedEdgeRenderer()
    });
  }

  render() {
    return render({
      transformer: this.transformer(),
      layouter: this.layouter(),
      vertexRenderer: this.vertexRenderer(),
      edgeRenderer: this.edgeRenderer()
    });
  }

  transformer() {
    return accessor(this, privates, 'transformer', arguments);
  }

  layouter() {
    return accessor(this, privates, 'layouter', arguments);
  }

  vertexRenderer() {
    return accessor(this, privates, 'vertexRenderer', arguments);
  }

  edgeRenderer() {
    return accessor(this, privates, 'edgeRenderer', arguments);
  }
}

export default Renderer;
