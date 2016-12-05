PolymerD3.dragElem = {
  initDragSettings: function(svg, settings) {
    let w = 750;
    let h = 450;
    let r = 120;

    let me = this;
    // function to access properties
    let _getSettingsProp = function(prop) {
      return PolymerD3.utilities.searchArr(settings, function(elem) {
        return elem.input == prop;
      })
    };

    svg.html('');

    const scale = .3;

    const isXChecked = true;
    const isYChecked = true;

    let width = _getSettingsProp('width').selectedValue * scale;
    let height = _getSettingsProp('height').selectedValue * scale;

    const dragbarw = 20;

    // make the rectangle inside a specific group graggable
    // expects d3 wrapped elements
    function makeScalable(rectangle, group) {
      const diamensions = rectangle[0][0].getBBox();
      let height = diamensions.height;
      let width = diamensions.width;
      let x = diamensions.x;
      let y = diamensions.y;

      let dragHandles = {};

      var drag = d3.behavior.drag()
        .origin(Object)
        .on("drag", dragmove);

      let dragright = d3.behavior.drag()
        .origin(Object)
        .on('drag', rdragresize);

      let dragleft = d3.behavior.drag()
        .origin(Object)
        .on('drag', ldragresize);

      let dragtop = d3.behavior.drag()
        .origin(Object)
        .on('drag', tdragresize);

      let dragbottom = d3.behavior.drag()
        .origin(Object)
        .on('drag', bdragresize);

      let dragbarleft = newg.append('rect')
        .attr('x', function(d) { return 0 - (dragbarw/2); })
        // .attr('x', function(d) { return d.x - (dragbarw/2); })
        // .attr('y', function(d) { return d.y + (dragbarw/2); })
        .attr('y', function(d) { return 0 + (dragbarw/2); })
        .attr('height', height - dragbarw)
        .attr('id', 'dragleft')
        .attr('width', dragbarw)
        .attr('fill', 'lightblue')
        .attr('fill-opacity', .5)
        .attr('cursor', 'ew-resize')
        .call(dragleft);

      let dragbarright = newg.append('rect')
        .attr('x', function(d) { return 0 + width - (dragbarw/2); })
        // .attr('x', function(d) { return d.x + width - (dragbarw/2); })
        // .attr('y', function(d) { return d.y + (dragbarw/2); })
        .attr('y', function(d) { return 0 + (dragbarw/2); })
        .attr('id', 'dragright')
        .attr('height', height - dragbarw)
        .attr('width', dragbarw)
        .attr('fill', 'lightblue')
        .attr('fill-opacity', .5)
        .attr('cursor', 'ew-resize')
        .call(dragright);

      let dragbartop = newg.append('rect')
        .attr('x', function(d) { return 0 + (dragbarw/2); })
        // .attr('x', function(d) { return d.x + (dragbarw/2); })
        // .attr('y', function(d) { return d.y - (dragbarw/2); })
        .attr('y', function(d) { return 0 - (dragbarw/2); })
        .attr('height', dragbarw)
        .attr('id', 'dragleft')
        .attr('width', width - dragbarw)
        .attr('fill', 'lightgreen')
        .attr('fill-opacity', .5)
        .attr('cursor', 'ns-resize')
        .call(dragtop);

      let dragbarbottom = newg.append('rect')
        .attr('x', function(d) { return 0 + (dragbarw/2); })
        // .attr('x', function(d) { return d.x + (dragbarw/2); })
        // .attr('y', function(d) { return d.y + height - (dragbarw/2); })
        .attr('y', function(d) { return 0 + height - (dragbarw/2); })
        .attr('id', 'dragright')
        .attr('height', dragbarw)
        .attr('width', width - dragbarw)
        .attr('fill', 'lightgreen')
        .attr('fill-opacity', .5)
        .attr('cursor', 'ns-resize')
        .call(dragbottom);

      function dragmove(d) {
        let x = d.x;
        let y = d.y;
        if (d.orientation == me.DRAG_CONSTANTS.BOTH || d.orientation == me.DRAG_CONSTANTS.HORIZONTAL) {
          x = d3.event.x;
          // group
          //   .attr('x', d.x = Math.max(0, Math.min(w - width, d3.event.x)))
          // dragbarleft
          //   .attr('x', function(d) { return d.x - (dragbarw/2); })
          // dragbarright
          //   .attr('x', function(d) { return d.x + width - (dragbarw/2); })
          // dragbartop
          //   .attr('x', function(d) { return d.x + (dragbarw/2); })
          // dragbarbottom
          //   .attr('x', function(d) { return d.x + (dragbarw/2); })
        }
        if (d.orientation == me.DRAG_CONSTANTS.BOTH || d.orientation == me.DRAG_CONSTANTS.VERTICAL) {
          y = d3.event.y;
          // group
          //   .attr('y', d.y = Math.max(0, Math.min(h - height, d3.event.y)));
          // dragbarleft
          //   .attr('y', function(d) { return d.y + (dragbarw/2); });
          // dragbarright
          //   .attr('y', function(d) { return d.y + (dragbarw/2); });
          // dragbartop
          //   .attr('y', function(d) { return d.y - (dragbarw/2); });
          // dragbarbottom
          //   .attr('y', function(d) { return d.y + height - (dragbarw/2); });
        }
        group.attr("transform", "translate(" + x + "," + y + ")");
      }

      function ldragresize(d) {
        let oldx = d.x;
       //Max x on the right is x + width - dragbarw
       //Max x on the left is 0 - (dragbarw/2)
        d.x = Math.max(0, Math.min(d.x + width - (dragbarw / 2), d3.event.x));
        width = width + (oldx - d.x);
        dragbarleft
        .attr('x', function(d) { return d.x - (dragbarw / 2); });

        rectangle
        .attr('x', function(d) { return d.x; })
        .attr('width', width);

       dragbartop
        .attr('x', function(d) { return d.x + (dragbarw/2); })
        .attr('width', width - dragbarw)
       dragbarbottom
        .attr('x', function(d) { return d.x + (dragbarw/2); })
        .attr('width', width - dragbarw)
      }

      function rdragresize(d) {
       //Max x on the left is x - width
       //Max x on the right is width of screen + (dragbarw/2)
       let dragx = Math.max(d.x + (dragbarw/2), Math.min(w, d.x + width + d3.event.dx));

       //recalculate width
       width = dragx - d.x;

       //move the right drag handle
       dragbarright
        .attr('x', function(d) { return dragx - (dragbarw/2) });

       //resize the drag rectangle
       //as we are only resizing from the right, the x coordinate does not need to change
       rectangle
        .attr('width', width);
       dragbartop
        .attr('width', width - dragbarw)
       dragbarbottom
        .attr('width', width - dragbarw)
      }

      function tdragresize(d) {
        let oldy = d.y;
        //Max x on the right is x + width - dragbarw
        //Max x on the left is 0 - (dragbarw/2)
        d.y = Math.max(0, Math.min(d.y + height - (dragbarw / 2), d3.event.y));
        height = height + (oldy - d.y);
        dragbartop
        .attr('y', function(d) { return d.y - (dragbarw / 2); });
        rectangle
        .attr('y', function(d) { return d.y; })
        .attr('height', height);

        dragbarleft
        .attr('y', function(d) { return d.y + (dragbarw/2); })
        .attr('height', height - dragbarw);
        dragbarright
        .attr('y', function(d) { return d.y + (dragbarw/2); })
        .attr('height', height - dragbarw);
      }

      function bdragresize(d) {
        //Max x on the left is x - width
        //Max x on the right is width of screen + (dragbarw/2)
        let dragy = Math.max(d.y + (dragbarw/2), Math.min(h, d.y + height + d3.event.dy));

        //recalculate width
        height = dragy - d.y;

        //move the right drag handle
        dragbarbottom
          .attr('y', function(d) { return dragy - (dragbarw/2) });

        //resize the drag rectangle
        //as we are only resizing from the right, the x coordinate does not need to change
        rectangle
          .attr('height', height);
        dragbarleft
          .attr('height', height - dragbarw);
        dragbarright
          .attr('height', height - dragbarw);
      }

      group.attr("cursor", "move")
        .call(drag);

      rectangle[0][0].__data__.orientation = rectangle.attr('orientation');
      rectangle[0][0].__data__.scalability = rectangle.attr('scalability');

      return {
        dragbarbottom,
        dragbarleft,
        dragbarright,
        dragbartop,
        rectangle
      };
    }

    function drag(group, orientation) {

    }

    let newg = svg.append('g')
        .data([{x: width / 2, y: height / 2}]);

    let dragrect = newg.append('rect')
        .attr('id', 'active')
        .attr('x', function(d) { return 0; })
        // .attr('x', function(d) { return d.x; })
        // .attr('y', function(d) { return d.y; })
        .attr('y', function(d) { return 0; })
        .attr('height', height)
        .attr('width', width)
        .attr('orientation', this.DRAG_CONSTANTS.BOTH)
        .attr('scalability', this.DRAG_CONSTANTS.BOTH)
        .attr('fill-opacity', .5);

    makeScalable(dragrect, newg);
  },
  DRAG_CONSTANTS: {
    HORIZONTAL: 1,
    VERTICAL: 2,
    BOTH: 3
  }
};
