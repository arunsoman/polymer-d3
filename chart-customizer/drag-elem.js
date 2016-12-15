PolymerD3.dragElem = {
  initDragSettings: function(svg, settings, config) {

    /* == Helper Functions == */
    // function to access properties from settings
    let _getSettingsProp = function(prop) {
      return PolymerD3.utilities.searchArr(settings, function(elem) {
        return elem.input == prop;
      })
    };

    /* == Configuration Cooking == */
    if (!config) {
      config = {
        areaRect: {},
        innerRect: {}
      };
    }
    let scale = config.scale || .3;
    let width = _getSettingsProp('width').selectedValue * scale;
    let height = _getSettingsProp('height').selectedValue * scale;
    let rectFillOpacity = config.areaRect.opacity || .8;
    let marginLeft = _getSettingsProp('marginLeft').selectedValue * scale;
    let marginTop = _getSettingsProp('marginTop').selectedValue * scale;

    /* == Operation== */
    // clears SVG
    svg.html('');

    // creates area group
    let areaG = svg.append('g')
      .data([{
        x: width / 2,
        y: height / 2
      }]);

    // create area rectangle
    let areaRect = this._drawRect(areaG, {
      width: width,
      height: height,
      scalability: this.DRAG_CONSTANTS.BOTH,
      fillOpacity: rectFillOpacity
    });

    // make area rectangle scalable
    this._makeScalable(areaRect, areaG, {
      scalability: this.DRAG_CONSTANTS.BOTH,
      scale: scale
    });

    // inner rectangle
    let innerG = areaG.append('g').data([{
      x: width / 4,
      y: height / 4
    }]);
    let innerRect = this._drawRect(innerG, {
      width: width / 2,
      height: height / 2,
      x: marginLeft + (width * scale) / 2,
      y: marginTop + (height * scale) / 2,
      scalability: this.DRAG_CONSTANTS.BOTH,
      fillOpacity: rectFillOpacity
    });
    this._makeScalable(innerRect, innerG, {
      scalability: this.DRAG_CONSTANTS.BOTH,
      scale: scale
    });

  },

  // function to draw a rectangle with given config
  _drawRect: function(parent, config) {
    let x = config.x || 0;
    let y = config.y || 0;
    let dragrect = parent.append('rect')
      .attr('id', 'active')
      .attr('x', function(d) {
        return d.x + x;
      })
      .attr('y', function(d) {
        return d.y + y;
      })
      .attr('height', config.height)
      .attr('width', config.width)
      .attr('scalability', config.scalability)
      .attr('fill-opacity', config.fillOpacity);
    return dragrect;
  },

  // function to make a given rectangle inside a group scalable as per given config
  _makeScalable: function(rectangle, group, config) {
    let me = this;
    let dragbarw = config.dragbarw == null ? 20 : settings.dragbarw;
    let scale = config.scale || .3;
    let rectDiamensions = rectangle[0][0].getBBox();
    let height = rectDiamensions.height;
    let width = rectDiamensions.width;

    let parentDiamensions = this.boxDiamiensions();

    let isXChecked = (config.scalability == this.DRAG_CONSTANTS.BOTH || config.scalability == this.DRAG_CONSTANTS.VERTICAL) ? true : false;
    let isYChecked = (config.scalability == this.DRAG_CONSTANTS.BOTH || config.scalability == this.DRAG_CONSTANTS.HORIZONTAL) ? true : false;

    // scale behaviours
    let scaleright = d3.behavior.drag()
      .origin(Object)
      .on('drag', rScaleResize);

    let scaleleft = d3.behavior.drag()
      .origin(Object)
      .on('drag', lScaleResize);

    let scaletop = d3.behavior.drag()
      .origin(Object)
      .on('drag', tScaleResize);

    let scalebottom = d3.behavior.drag()
      .origin(Object)
      .on('drag', bScaleResize);

    // scale bars
    var scaleBarleft = group.append('rect')
      .attr('x', function(d) {
        return d.x - (dragbarw / 2);
      })
      .attr('y', function(d) {
        return d.y + (dragbarw / 2);
      })
      .attr('height', height - dragbarw)
      .attr('id', 'scaleleft')
      .attr('width', dragbarw)
      .attr('fill', 'lightblue')
      .attr('fill-opacity', 0)
      .attr('cursor', 'ew-resize')
      .call(scaleleft);

    var scaleBarright = group.append('rect')
      .attr('x', function(d) {
        return d.x + width - (dragbarw / 2);
      })
      .attr('y', function(d) {
        return d.y + (dragbarw / 2);
      })
      .attr('id', 'scaleright')
      .attr('height', height - dragbarw)
      .attr('width', dragbarw)
      .attr('fill', 'lightblue')
      .attr('fill-opacity', 0)
      .attr('cursor', 'ew-resize')
      .call(scaleright);

    var scaleBartop = group.append('rect')
      .attr('x', function(d) {
        return d.x + (dragbarw / 2);
      })
      .attr('y', function(d) {
        return d.y - (dragbarw / 2);
      })
      .attr('height', dragbarw)
      .attr('id', 'scaleleft')
      .attr('width', width - dragbarw)
      .attr('fill', 'lightgreen')
      .attr('fill-opacity', 0)
      .attr('cursor', 'ns-resize')
      .call(scaletop);

    var scaleBarbottom = group.append('rect')
      .attr('x', function(d) {
        return d.x + (dragbarw / 2);
      })
      .attr('y', function(d) {
        return d.y + height - (dragbarw / 2);
      })
      .attr('id', 'scaleright')
      .attr('height', dragbarw)
      .attr('width', width - dragbarw)
      .attr('fill', 'lightgreen')
      .attr('fill-opacity', 0)
      .attr('cursor', 'ns-resize')
      .call(scalebottom);

    function lScaleResize(d) {
      if (isXChecked) {
        var oldx = d.x;
        //Max x on the right is x + width - dragbarw
        //Max x on the left is 0 - (dragbarw/2)
        d.x = Math.max(0, Math.min(d.x + width - (dragbarw / 2), d3.event.x));
        width = width + (oldx - d.x);
        scaleBarleft
          .attr('x', function(d) {
            return d.x - (dragbarw / 2);
          });

        rectangle
          .attr('x', function(d) {
            return d.x;
          })
          .attr('width', width);

        scaleBartop
          .attr('x', function(d) {
            return d.x + (dragbarw / 2);
          })
          .attr('width', width - dragbarw)
        scaleBarbottom
          .attr('x', function(d) {
            return d.x + (dragbarw / 2);
          })
          .attr('width', width - dragbarw)
        reflectChange({
          x: d.x + (dragbarw / 2),
          y: d.y,
          height: height,
          width: width
        });
      }
    }

    function rScaleResize(d) {
      if (isXChecked) {
        //Max x on the left is x - width
        //Max x on the right is width of screen + (dragbarw/2)
        var dragx = Math.max(d.x + (dragbarw / 2), Math.min(parentDiamensions.width, d.x + width + d3.event.dx));

        //recalculate width
        width = dragx - d.x;

        //move the right drag handle
        scaleBarright
          .attr('x', function(d) {
            return dragx - (dragbarw / 2)
          });

        //resize the drag rectangle
        //as we are only resizing from the right, the x coordinate does not need to change
        rectangle
          .attr('width', width);
        scaleBartop
          .attr('width', width - dragbarw)
        scaleBarbottom
          .attr('width', width - dragbarw)
        reflectChange({
          x: d.x + (dragbarw / 2),
          y: d.y,
          height: height,
          width: width
        });
      }
    }

    function tScaleResize(d) {

      if (isYChecked) {
        var oldy = d.y;
        //Max x on the right is x + width - dragbarw
        //Max x on the left is 0 - (dragbarw/2)
        d.y = Math.max(0, Math.min(d.y + height - (dragbarw / 2), d3.event.y));
        height = height + (oldy - d.y);
        scaleBartop
          .attr('y', function(d) {
            return d.y - (dragbarw / 2);
          });

        rectangle
          .attr('y', function(d) {
            return d.y;
          })
          .attr('height', height);

        scaleBarleft
          .attr('y', function(d) {
            return d.y + (dragbarw / 2);
          })
          .attr('height', height - dragbarw);
        scaleBarright
          .attr('y', function(d) {
            return d.y + (dragbarw / 2);
          })
          .attr('height', height - dragbarw);
        reflectChange({
          x: d.x,
          y: d.y - (dragbarw / 2),
          height: height,
          width: width
        });
      }
    }

    function bScaleResize(d) {
      if (isYChecked) {
        //Max x on the left is x - width
        //Max x on the right is width of screen + (dragbarw/2)
        var dragy = Math.max(d.y + (dragbarw / 2), Math.min(parentDiamensions.height, d.y + height + d3.event.dy));

        //recalculate width
        height = dragy - d.y;

        //move the right drag handle
        scaleBarbottom
          .attr('y', function(d) {
            return dragy - (dragbarw / 2)
          });

        //resize the drag rectangle
        //as we are only resizing from the right, the x coordinate does not need to change
        rectangle
          .attr('height', height);
        scaleBarleft
          .attr('height', height - dragbarw);
        scaleBarright
          .attr('height', height - dragbarw);
        reflectChange({
          x: d.x,
          y: d.y,
          height: height,
          width: width
        });
      }
    }

    function reflectChange(d) {
      me.$['mouse-pointer'].innerHTML = 'x: ' + Math.round(d.x) +
        ',y: ' + Math.round(d.y) +
        ',h: ' + Math.round(d.height / scale) +
        ',w: ' + Math.round(d.width / scale);
    }

    return {
      rectangle,
      scaleBarleft,
      scaleBarright,
      scaleBartop,
      scaleBarbottom
    }
  },

  DRAG_CONSTANTS: {
    HORIZONTAL: 1,
    VERTICAL: 2,
    BOTH: 3
  },

  boxDiamiensions: function() {
    return {
      height: this.clientHeight,
      width: this.clientWidth
    }
  }
};