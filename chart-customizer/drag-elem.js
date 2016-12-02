PolymerD3.dragElem = {
  initDragSettings: function(svg) {
    var w = 750,
      h = 450,
      r = 120;

    var isXChecked = true,
      isYChecked = true;

    var width = 300,
      height = 200,
      dragbarw = 20;

    var drag = d3.behavior.drag()
      .origin(Object)
      .on("drag", dragmove);

    var dragright = d3.behavior.drag()
      .origin(Object)
      .on("drag", rdragresize);

    var dragleft = d3.behavior.drag()
      .origin(Object)
      .on("drag", ldragresize);

    var dragtop = d3.behavior.drag()
      .origin(Object)
      .on("drag", tdragresize);

    var dragbottom = d3.behavior.drag()
      .origin(Object)
      .on("drag", bdragresize);

    var newg = svg.append("g")
        .data([{x: width / 2, y: height / 2}]);

    var dragrect = newg.append("rect")
        .attr("id", "active")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("height", height)
        .attr("width", width)
        .attr("fill-opacity", .5)
        .attr("cursor", "move")
        .call(drag);

    var dragbarleft = newg.append("rect")
        .attr("x", function(d) { return d.x - (dragbarw/2); })
        .attr("y", function(d) { return d.y + (dragbarw/2); })
        .attr("height", height - dragbarw)
        .attr("id", "dragleft")
        .attr("width", dragbarw)
        .attr("fill", "lightblue")
        .attr("fill-opacity", .5)
        .attr("cursor", "ew-resize")
        .call(dragleft);

    var dragbarright = newg.append("rect")
        .attr("x", function(d) { return d.x + width - (dragbarw/2); })
        .attr("y", function(d) { return d.y + (dragbarw/2); })
        .attr("id", "dragright")
        .attr("height", height - dragbarw)
        .attr("width", dragbarw)
        .attr("fill", "lightblue")
        .attr("fill-opacity", .5)
        .attr("cursor", "ew-resize")
        .call(dragright);

    var dragbartop = newg.append("rect")
        .attr("x", function(d) { return d.x + (dragbarw/2); })
        .attr("y", function(d) { return d.y - (dragbarw/2); })
        .attr("height", dragbarw)
        .attr("id", "dragleft")
        .attr("width", width - dragbarw)
        .attr("fill", "lightgreen")
        .attr("fill-opacity", .5)
        .attr("cursor", "ns-resize")
        .call(dragtop);

    var dragbarbottom = newg.append("rect")
        .attr("x", function(d) { return d.x + (dragbarw/2); })
        .attr("y", function(d) { return d.y + height - (dragbarw/2); })
        .attr("id", "dragright")
        .attr("height", dragbarw)
        .attr("width", width - dragbarw)
        .attr("fill", "lightgreen")
        .attr("fill-opacity", .5)
        .attr("cursor", "ns-resize")
        .call(dragbottom);

    function dragmove(d) {
      if (isXChecked) {
        dragrect
          .attr("x", d.x = Math.max(0, Math.min(w - width, d3.event.x)))
        dragbarleft
          .attr("x", function(d) { return d.x - (dragbarw/2); })
        dragbarright
          .attr("x", function(d) { return d.x + width - (dragbarw/2); })
        dragbartop
          .attr("x", function(d) { return d.x + (dragbarw/2); })
        dragbarbottom
          .attr("x", function(d) { return d.x + (dragbarw/2); })
      }
      if (isYChecked) {
        dragrect
          .attr("y", d.y = Math.max(0, Math.min(h - height, d3.event.y)));
        dragbarleft
          .attr("y", function(d) { return d.y + (dragbarw/2); });
        dragbarright
          .attr("y", function(d) { return d.y + (dragbarw/2); });
        dragbartop
          .attr("y", function(d) { return d.y - (dragbarw/2); });
        dragbarbottom
          .attr("y", function(d) { return d.y + height - (dragbarw/2); });
      }
    }

    function ldragresize(d) {
       if (isXChecked) {
        var oldx = d.x;
       //Max x on the right is x + width - dragbarw
       //Max x on the left is 0 - (dragbarw/2)
        d.x = Math.max(0, Math.min(d.x + width - (dragbarw / 2), d3.event.x));
        width = width + (oldx - d.x);
        dragbarleft
        .attr("x", function(d) { return d.x - (dragbarw / 2); });

        dragrect
        .attr("x", function(d) { return d.x; })
        .attr("width", width);

       dragbartop
        .attr("x", function(d) { return d.x + (dragbarw/2); })
        .attr("width", width - dragbarw)
       dragbarbottom
        .attr("x", function(d) { return d.x + (dragbarw/2); })
        .attr("width", width - dragbarw)
      }
    }

    function rdragresize(d) {
       if (isXChecked) {
       //Max x on the left is x - width
       //Max x on the right is width of screen + (dragbarw/2)
       var dragx = Math.max(d.x + (dragbarw/2), Math.min(w, d.x + width + d3.event.dx));

       //recalculate width
       width = dragx - d.x;

       //move the right drag handle
       dragbarright
        .attr("x", function(d) { return dragx - (dragbarw/2) });

       //resize the drag rectangle
       //as we are only resizing from the right, the x coordinate does not need to change
       dragrect
        .attr("width", width);
       dragbartop
        .attr("width", width - dragbarw)
       dragbarbottom
        .attr("width", width - dragbarw)
      }
    }

    function tdragresize(d) {

       if (isYChecked) {
        var oldy = d.y;
       //Max x on the right is x + width - dragbarw
       //Max x on the left is 0 - (dragbarw/2)
        d.y = Math.max(0, Math.min(d.y + height - (dragbarw / 2), d3.event.y));
        height = height + (oldy - d.y);
        dragbartop
        .attr("y", function(d) { return d.y - (dragbarw / 2); });
        dragrect
        .attr("y", function(d) { return d.y; })
        .attr("height", height);

        dragbarleft
        .attr("y", function(d) { return d.y + (dragbarw/2); })
        .attr("height", height - dragbarw);
        dragbarright
        .attr("y", function(d) { return d.y + (dragbarw/2); })
        .attr("height", height - dragbarw);
      }
    }

    function bdragresize(d) {
       if (isYChecked) {
       //Max x on the left is x - width
       //Max x on the right is width of screen + (dragbarw/2)
       var dragy = Math.max(d.y + (dragbarw/2), Math.min(h, d.y + height + d3.event.dy));

       //recalculate width
       height = dragy - d.y;

       //move the right drag handle
       dragbarbottom
        .attr("y", function(d) { return dragy - (dragbarw/2) });

       //resize the drag rectangle
       //as we are only resizing from the right, the x coordinate does not need to change
       dragrect
        .attr("height", height);
       dragbarleft
        .attr("height", height - dragbarw);
       dragbarright
        .attr("height", height - dragbarw);
      }
    }
  }
};
