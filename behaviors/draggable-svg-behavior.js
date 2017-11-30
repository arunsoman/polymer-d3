PolymerD3.draggableSvgBehavior = {
  // makes a d3 wrapped svg element draggable inside specified parent
  registerDraggable: function(svgElem) {
    const id = svgElem.attr('id');
    if (!id) { // id is for persisting data
      console.warn('draggable element must have id attribute');
      return false;
    }
    const drag = d3.behavior.drag()
      .on('drag', function(d, i) {
        console.log(d);
        d.x += d3.event.dx
        d.y += d3.event.dy
        // d3.select(this).attr('transform', function(d,i){
        //   return 'translate(' + [ d.x, d.y ] + ')'
        // });
      });

    const transform = d3.transform(svgElem.attr('transform')).translate;

    if (!this._draggableSvgs[id] || !this._draggableSvgs[id].translate) {
      // if svgElem isn't present in _draggableSvgs, create new
      this._draggableSvgs[id] = {
        translate: {
          x: transform[0],
          y: transform[1]
        }
        // to be later extended into rotate and so
      };
    }

    this._moveSvg(svgElem, this._draggableSvgs[id].translate);

    let data = svgElem.data() || {};
    data['_draggableSvg'] = this._draggableSvgs[id];

    svgElem.data(data);
    svgElem.call(drag);
  },

  properties: {
    _draggableSvgs: {
      type: Object,
      value: function() {
        return {};
      }
    }
  },

  _moveSvg: function(d3WrappedSvg, position) {
    d3WrappedSvg.attr('transform', 'translate(' + [position.x, position.y] + ')');
  }
}
